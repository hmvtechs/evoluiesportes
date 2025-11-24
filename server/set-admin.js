const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function promoteSpecificUser() {
    console.log('👑 Promover Usuário Específico a ADMIN\n');

    const supabaseAdmin = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
    );

    // Email do usuário que você quer promover
    const emailToPromote = 'admin@sistema.com';

    console.log(`🔍 Buscando usuário: ${emailToPromote}\n`);

    // Buscar usuário
    const { data: user, error: findError } = await supabaseAdmin
        .from('User')
        .select('id, email, full_name, role')
        .eq('email', emailToPromote)
        .single();

    if (findError || !user) {
        console.log(`❌ Usuário ${emailToPromote} não encontrado!`);
        console.log('\n📋 Usuários disponíveis:');

        const { data: allUsers } = await supabaseAdmin
            .from('User')
            .select('email, role')
            .limit(10);

        allUsers?.forEach(u => console.log(`   - ${u.email} (${u.role})`));
        return;
    }

    console.log(`✅ Encontrado: ${user.full_name} (${user.email})`);
    console.log(`   Role atual: ${user.role}`);

    if (user.role === 'ADMIN') {
        console.log('\n✅ Usuário JÁ é ADMIN!');
        return;
    }

    console.log('\n🔧 Promovendo a ADMIN...');

    // Promover a ADMIN
    const { error: updateError } = await supabaseAdmin
        .from('User')
        .update({ role: 'ADMIN' })
        .eq('id', user.id);

    if (updateError) {
        console.log(`❌ Erro ao promover:`, updateError.message);
        return;
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ ${user.email} PROMOVIDO A ADMIN!`);
    console.log('='.repeat(60));
    console.log('\n📝 Faça logout e login novamente para aplicar as mudanças.');
}

promoteSpecificUser().catch(console.error);
