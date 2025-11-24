const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function quickAdminSetup() {
    console.log('🔧 Setup Rápido do Admin\n');

    const supabaseAdmin = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
    );

    const adminEmail = 'admin@sistema.com';
    const adminPassword = 'Admin@123';

    console.log('1️⃣ Verificando usuário existente...\n');

    // Listar usuários
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    console.log(`Encontrados ${users.length} usuários:`);
    users.forEach(u => console.log(`   - ${u.email}`));

    // Verificar se admin já existe
    const adminExists = users.find(u => u.email === adminEmail);

    if (adminExists) {
        console.log(`\n✅ Admin já existe: ${adminEmail}`);
        console.log(`   Use a senha que você configurou anteriormente`);
        console.log(`   Ou delete e recrie com: admin@sistema.com / Admin@123\n`);
        return;
    }

    console.log('\n2️⃣ Criando usuário admin...\n');

    // Criar no auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
            full_name: 'Administrador',
            role: 'ADMIN'
        }
    });

    if (authError) {
        console.log('❌ Erro:', authError.message);
        return;
    }

    console.log(`✅ Criado em auth.users: ${authData.user.id}`);

    // Criar perfil na tabela User (SEM password_hash!)
    const { error: profileError } = await supabaseAdmin
        .from('User')
        .insert({
            id: authData.user.id,
            email: adminEmail,
            cpf: '00000000000',
            full_name: 'Administrador',
            role: 'ADMIN',
            rf_status: 'VALID'
        });

    if (profileError) {
        console.log('❌ Erro ao criar perfil:', profileError.message);
        console.log('\n💡 Dica: Execute este SQL no Supabase:');
        console.log('   ALTER TABLE "User" ALTER COLUMN "password_hash" DROP NOT NULL;\n');
        return;
    }

    console.log('✅ Perfil criado na tabela User');

    console.log('\n' + '='.repeat(60));
    console.log('✅ ADMIN CRIADO COM SUCESSO!');
    console.log('='.repeat(60));
    console.log(`Email: ${adminEmail}`);
    console.log(`Senha: ${adminPassword}`);
    console.log('='.repeat(60));
}

quickAdminSetup().catch(console.error);
