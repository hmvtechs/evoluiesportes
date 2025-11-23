const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔍 Verificando configuração do Supabase...\n');

// Verificar variáveis de ambiente
const checks = {
    'SUPABASE_URL': process.env.SUPABASE_URL,
    'SUPABASE_ANON_KEY': process.env.SUPABASE_ANON_KEY,
    'SUPABASE_SERVICE_KEY': process.env.SUPABASE_SERVICE_KEY
};

let allConfigured = true;
for (const [key, value] of Object.entries(checks)) {
    if (!value) {
        console.log(`❌ ${key}: NÃO CONFIGURADO`);
        allConfigured = false;
    } else {
        console.log(`✅ ${key}: Configurado (${value.substring(0, 20)}...)`);
    }
}

if (!allConfigured) {
    console.log('\n⚠️  Configure as variáveis faltantes no arquivo .env');
    process.exit(1);
}

// Testar conexão
async function testConnection() {
    try {
        console.log('\n🔌 Testando conexão com Supabase...');

        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );

        // Tentar uma query simples
        const { data, error } = await supabase
            .from('user')
            .select('count', { count: 'exact', head: true });

        if (error) {
            console.log('❌ Erro na consulta:', error.message);
            console.log('\n💡 Verifique se:');
            console.log('   1. As credenciais estão corretas');
            console.log('   2. A tabela "user" existe no Supabase');
            console.log('   3. As políticas RLS permitem acesso');
            process.exit(1);
        }

        console.log('✅ Conexão com Supabase funcionando!');
        console.log('✅ Tabela "user" acessível');
        console.log('\n🎉 Tudo pronto! O servidor pode ser iniciado.');
        process.exit(0);

    } catch (err) {
        console.log('❌ Erro ao conectar:', err.message);
        process.exit(1);
    }
}

if (allConfigured) {
    testConnection();
}
