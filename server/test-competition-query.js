const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testCompetitionQuery() {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    );

    console.log('🧪 Testando query de competição com times inscritos...\n');

    // Primeiro, listar competições disponíveis
    console.log('1. Listando competições:');
    const { data: competitions, error: compError } = await supabase
        .from('Competition')
        .select('id, name')
        .limit(5);

    if (compError) {
        console.log('❌ Erro ao listar competições:', compError.message);
        return;
    }

    if (!competitions || competitions.length === 0) {
        console.log('⚠️  Nenhuma competição encontrada');
        return;
    }

    console.log('✅ Competições encontradas:');
    competitions.forEach(c => console.log(`   - ID ${c.id}: ${c.name}`));

    // Pegar a primeira competição
    const compId = competitions[0].id;
    console.log(`\n2. Testando query completa para competição ID ${compId}:\n`);

    const { data: competition, error } = await supabase
        .from('Competition')
        .select(`
            *,
            modality:Modality(*),
            registrations:TeamRegistration(
                *,
                team:Team(*),
                group:Group(*)
            )
        `)
        .eq('id', compId)
        .single();

    if (error) {
        console.log('❌ Erro na query:', error.message);
        console.log('Detalhes:', error);

        // Tentar query mais simples
        console.log('\n3. Tentando query simplificada:');
        const { data: simple, error: simpleError } = await supabase
            .from('TeamRegistration')
            .select('*')
            .eq('competition_id', compId);

        if (simpleError) {
            console.log('❌ Erro na query simplificada:', simpleError.message);
        } else {
            console.log('✅ Times encontrados (simplificado):', simple?.length || 0);
            console.log(JSON.stringify(simple, null, 2));
        }
    } else {
        console.log('✅ Query executada com sucesso!');
        console.log(`   Times inscritos: ${competition.registrations?.length || 0}`);
        if (competition.registrations && competition.registrations.length > 0) {
            console.log('\nPrimeiro time:');
            console.log(JSON.stringify(competition.registrations[0], null, 2));
        }
    }
}

testCompetitionQuery();
