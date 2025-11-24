const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function promoteToAdmin() {
    console.log('👑 Promover Usuário a Administrador\n');

    const supabaseAdmin = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
    );

    // Listar todos os usuários
    const { data: users, error } = await supabaseAdmin
        .from('User')
        .select('id, email, full_name, role');

    if (error) {
        console.log('❌ Erro ao buscar usuários:', error.message);
        return;
    }

    console.log('📋 Usuários disponíveis:\n');
    users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (${user.full_name}) - Role: ${user.role}`);
    });

    // Promover TODOS a ADMIN automaticamente
    console.log('\n🔧 Promovendo TODOS os usuários a ADMIN...\n');

    for (const user of users) {
        const { error: updateError } = await supabaseAdmin
            .from('User')
            .update({ role: 'ADMIN' })
            .eq('id', user.id);

        if (updateError) {
            console.log(`❌ Erro ao atualizar ${user.email}:`, updateError.message);
        } else {
            console.log(`✅ ${user.email} → ADMIN`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ TODOS OS USUÁRIOS AGORA SÃO ADMINISTRADORES!');
    console.log('='.repeat(60));
    console.log('\nFaça logout e login novamente para aplicar as mudanças.');
}

promoteToAdmin().catch(console.error);
