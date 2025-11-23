const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function checkTables() {
    console.log('🔍 Verificando estrutura do banco no Supabase...\n');

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.log('❌ Credenciais do Supabase não configuradas no .env');
        process.exit(1);
    }

    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    );

    console.log('Testando diferentes nomes de tabela:\n');

    // Testar 'user'
    console.log('1️⃣ Testando tabela "user"...');
    const { data: userData, error: userError } = await supabase
        .from('user')
        .select('*')
        .limit(1);

    if (userError) {
        console.log('   ❌ Erro:', userError.message);
        console.log('   Código:', userError.code);
    } else {
        console.log('   ✅ Tabela "user" encontrada!');
        console.log('   Registros:', userData?.length || 0);
    }

    // Testar 'users'
    console.log('\n2️⃣ Testando tabela "users"...');
    const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1);

    if (usersError) {
        console.log('   ❌ Erro:', usersError.message);
        console.log('   Código:', usersError.code);
    } else {
        console.log('   ✅ Tabela "users" encontrada!');
        console.log('   Registros:', usersData?.length || 0);
    }

    // Testar 'User'
    console.log('\n3️⃣ Testando tabela "User"...');
    const { data: UserData, error: UserError } = await supabase
        .from('User')
        .select('*')
        .limit(1);

    if (UserError) {
        console.log('   ❌ Erro:', UserError.message);
        console.log('   Código:', UserError.code);
    } else {
        console.log('   ✅ Tabela "User" encontrada!');
        console.log('   Registros:', UserData?.length || 0);
    }

    console.log('\n' + '='.repeat(50));
    console.log('DIAGNÓSTICO:');
    console.log('='.repeat(50));

    if (!userError && !usersError && !UserError) {
        console.log('✅ Múltiplas tabelas encontradas - verifique qual usar');
    } else if (!userError) {
        console.log('✅ Use: .from("user")');
    } else if (!usersError) {
        console.log('✅ Use: .from("users")');
        console.log('⚠️  AÇÃO NECESSÁRIA: Altere todas as queries no código para usar "users"');
    } else if (!UserError) {
        console.log('✅ Use: .from("User")');
        console.log('⚠️  AÇÃO NECESSÁRIA: Altere todas as queries no código para usar "User"');
    } else {
        console.log('❌ Nenhuma tabela de usuários encontrada!');
        console.log('\n💡 Possíveis causas:');
        console.log('   1. A tabela ainda não foi criada no Supabase');
        console.log('   2. RLS (Row Level Security) está bloqueando o acesso');
        console.log('   3. As credenciais estão incorretas');
        console.log('\n📝 Próximos passos:');
        console.log('   1. Acesse: https://app.supabase.com/project/_/editor');
        console.log('   2. Verifique se a tabela existe');
        console.log('   3. Verifique as políticas RLS (Authentication → Policies)');
    }
}

checkTables();
