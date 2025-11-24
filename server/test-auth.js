const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testAuth() {
    console.log('🔍 Testando Autenticação Supabase...\n');

    // Verificar env vars
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.log('❌ Variáveis de ambiente não configuradas!');
        console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? '✓' : '✗');
        console.log('   SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✓' : '✗');
        return;
    }

    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    );

    console.log('1️⃣ Verificando usuários na tabela User...\n');

    // Verificar tabela User
    const { data: users, error: usersError } = await supabase
        .from('User')
        .select('id, email, full_name')
        .limit(5);

    if (usersError) {
        console.log('❌ Erro ao buscar usuários:', usersError.message);
    } else {
        console.log(`✅ Encontrados ${users?.length || 0} usuários na tabela User:`);
        users?.forEach(u => {
            console.log(`   - ${u.email} (${u.full_name})`);
        });
    }

    console.log('\n2️⃣ Tentando criar usuário de teste...\n');

    // Tentar criar um usuário de teste
    const testEmail = 'admin@teste.com';
    const testPassword = 'Teste123!';

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
            data: {
                full_name: 'Admin Teste',
                role: 'ADMIN'
            }
        }
    });

    if (signUpError) {
        if (signUpError.message.includes('already registered')) {
            console.log(`⚠️ Usuário ${testEmail} já existe`);
        } else {
            console.log('❌ Erro ao criar usuário:', signUpError.message);
        }
    } else {
        console.log(`✅ Usuário criado: ${testEmail}`);
        console.log(`   Senha: ${testPassword}`);
        console.log(`   ID: ${signUpData.user?.id}`);
    }

    console.log('\n3️⃣ Testando login com usuário de teste...\n');

    // Tentar fazer login
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
    });

    if (signInError) {
        console.log('❌ Erro no login:', signInError.message);
        console.log('\n💡 Possíveis causas:');
        console.log('   1. Email não confirmado (verifique inbox ou desabilite confirmação no Supabase)');
        console.log('   2. Senha incorreta');
        console.log('   3. Usuário não existe em auth.users');
    } else {
        console.log('✅ Login bem sucedido!');
        console.log(`   Token: ${signInData.session?.access_token?.substring(0, 50)}...`);
        console.log(`   User ID: ${signInData.user?.id}`);
        console.log(`   Email: ${signInData.user?.email}`);
    }

    console.log('\n4️⃣ Verificando políticas de autenticação no Supabase...\n');
    console.log('📝 Acesse: https://app.supabase.com/');
    console.log('   → Seu projeto → Authentication → Providers');
    console.log('   → Verifique se "Email" está habilitado');
    console.log('   → Em "Email Auth" → Desabilite "Confirm email" para testes!');

    console.log('\n' + '='.repeat(60));
    console.log('RESUMO:');
    console.log('='.repeat(60));
    console.log(`Email de teste: ${testEmail}`);
    console.log(`Senha de teste: ${testPassword}`);
    console.log('\nUse estas credenciais para testar o login no frontend!');
}

testAuth().catch(console.error);
