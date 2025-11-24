const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function resetAndCreateAdmin() {
    console.log('🧹 RESET COMPLETO + CRIAR ADMIN\n');

    const supabaseAdmin = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
    );

    const adminEmail = 'admin@sistema.com';
    const adminPassword = 'Admin@123';

    try {
        // PASSO 1: Remover constraint password_hash
        console.log('1️⃣ Removendo constraint password_hash...\n');

        const { error: alterError } = await supabaseAdmin.rpc('exec_sql', {
            sql: 'ALTER TABLE "User" ALTER COLUMN "password_hash" DROP NOT NULL;'
        });

        // Se der erro, tentar via query direta (não vai funcionar mas vamos continuar)
        console.log('⚠️  Não consegui alterar via RPC, continuando...\n');

        // PASSO 2: Deletar TODOS os usuários auth.users
        console.log('2️⃣ Deletando usuários do Supabase Auth...\n');

        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        console.log(`   Encontrados ${users.length} usuários`);

        for (const user of users) {
            await supabaseAdmin.auth.admin.deleteUser(user.id);
            console.log(`   ✅ Deletado: ${user.email}`);
        }

        // PASSO 3: Deletar TODOS da tabela User
        console.log('\n3️⃣ Limpando tabela User...\n');

        const { error: deleteError } = await supabaseAdmin
            .from('User')
            .delete()
            .gte('id', 0);

        if (deleteError) {
            console.log('   ⚠️ Erro:', deleteError.message);
        } else {
            console.log('   ✅ Tabela User limpa');
        }

        // PASSO 4: Criar novo admin
        console.log('\n4️⃣ Criando novo administrador...\n');

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
            console.log('   ❌ Erro ao criar auth:', authError.message);
            return;
        }

        console.log(`   ✅ Criado em auth.users: ${authData.user.id}`);

        // PASSO 5: Criar perfil (SEM password_hash se der erro)
        console.log('\n5️⃣ Criando perfil...\n');

        const profileData = {
            id: authData.user.id,
            email: adminEmail,
            cpf: '00000000000',
            full_name: 'Administrador',
            role: 'ADMIN',
            rf_status: 'VALID'
        };

        const { error: profileError } = await supabaseAdmin
            .from('User')
            .insert(profileData);

        if (profileError) {
            console.log('   ❌ Erro ao criar perfil:', profileError.message);
            console.log('\n💡 SOLUÇÃO:');
            console.log('   Execute este SQL no Supabase Dashboard:');
            console.log('   ALTER TABLE "User" ALTER COLUMN "password_hash" DROP NOT NULL;');
            return;
        }

        console.log('   ✅ Perfil criado');

        // SUCESSO
        console.log('\n' + '='.repeat(70));
        console.log('✅ BANCO RESETADO E ADMIN CRIADO COM SUCESSO!');
        console.log('='.repeat(70));
        console.log(`\n📧 Email: ${adminEmail}`);
        console.log(`🔐 Senha: ${adminPassword}`);
        console.log('='.repeat(70));

    } catch (error) {
        console.error('\n❌ Erro geral:', error.message);
    }
}

resetAndCreateAdmin().catch(console.error);
