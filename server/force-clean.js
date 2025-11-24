const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function forceCleanAllTables() {
    console.log('💣 LIMPEZA FORÇADA DE TODAS AS TABELAS\n');
    console.log('⚠️  ISTO VAI APAGAR TUDO!\n');

    const supabaseAdmin = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
    );

    const adminEmail = 'admin@sistema.com';
    const adminPassword = 'Admin@123';

    try {
        // PASSO 1: Deletar auth.users (todos!)
        console.log('1️⃣ Deletando TODOS os usuários do Supabase Auth...\n');

        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        console.log(`   Encontrados ${users.length} usuários\n`);

        for (const user of users) {
            await supabaseAdmin.auth.admin.deleteUser(user.id);
            console.log(`   ✅ ${user.email}`);
        }

        // PASSO 2: Deletar TODAS as tabelas na ordem correta
        console.log('\n2️⃣ Limpando TODAS as tabelas...\n');

        const tablesToClean = [
            'MatchEvent',
            'GameMatch',
            'AthleteInscription',
            'TeamRegistration',
            'Group',
            'Phase',
            'CompetitionVenue',
            'Competition',
            'Team',
            'Organization',
            'Booking',
            'Venue',
            'AthleteProfile',
            'User'
        ];

        for (const table of tablesToClean) {
            try {
                const { error, count } = await supabaseAdmin
                    .from(table)
                    .delete()
                    .gte('id', 0);

                if (error) {
                    console.log(`   ⚠️  ${table}: ${error.message}`);
                } else {
                    console.log(`   ✅ ${table}: Limpo`);
                }
            } catch (err) {
                console.log(`   ⚠️  ${table}: ${err.message}`);
            }
        }

        // PASSO 3: Criar novo admin
        console.log('\n3️⃣ Criando administrador único...\n');

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
            console.log('   ❌ Erro:', authError.message);
            return;
        }

        console.log(`   ✅ Auth criado: ${authData.user.id}`);

        // Criar perfil
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
            console.log('   ❌ Perfil:', profileError.message);
            console.log('\n💡 Execute no Supabase SQL Editor:');
            console.log('   ALTER TABLE "User" ALTER COLUMN "password_hash" DROP NOT NULL;');
            return;
        }

        console.log('   ✅ Perfil criado');

        // PASSO 4: Verificar
        console.log('\n4️⃣ Verificando...\n');

        const { count: userCount } = await supabaseAdmin
            .from('User')
            .select('*', { count: 'exact', head: true });

        const { count: compCount } = await supabaseAdmin
            .from('Competition')
            .select('*', { count: 'exact', head: true });

        console.log(`   Usuários: ${userCount}`);
        console.log(`   Competições: ${compCount}`);

        // SUCESSO
        console.log('\n' + '='.repeat(70));
        console.log('✅ BANCO COMPLETAMENTE LIMPO E ADMIN CRIADO!');
        console.log('='.repeat(70));
        console.log(`\n📧 Email: ${adminEmail}`);
        console.log(`🔐 Senha: ${adminPassword}`);
        console.log('\n💡 Faça login agora em: http://localhost:5173/login');
        console.log('='.repeat(70));

    } catch (error) {
        console.error('\n❌ Erro:', error.message);
    }
}

forceCleanAllTables().catch(console.error);
