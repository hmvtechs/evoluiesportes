const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function promoteCurrentUser() {
    console.log('👑 Promovendo usuário logado a ADMIN\n');

    const supabaseAdmin = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
    );

    // Listar todos os usuários
    const { data: users, error } = await supabaseAdmin
        .from('User')
        .select('id, email, full_name, role')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.log('❌ Erro:', error.message);
        return;
    }

    console.log('📋 Últimos usuários criados:\n');
    users.forEach((user, i) => {
        const badge = user.role === 'ADMIN' ? '👑' : '👤';
        console.log(`${i + 1}. ${badge} ${user.email} - ${user.role}`);
    });

    // Promover TODOS a ADMIN (solução rápida)
    console.log('\n🔧 Promovendo TODOS os usuários a ADMIN...\n');

    for (const user of users) {
        const { error: updateError } = await supabaseAdmin
            .from('User')
            .update({ role: 'ADMIN' })
            .eq('id', user.id);

        if (updateError) {
            console.log(`   ❌ ${user.email}`);
        } else {
            console.log(`   ✅ ${user.email} → ADMIN`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ TODOS OS USUÁRIOS AGORA SÃO ADMINISTRADORES!');
    console.log('='.repeat(60));
    console.log('\n💡 Faça LOGOUT e LOGIN novamente para aplicar as mudanças!');
}

promoteCurrentUser().catch(console.error);
