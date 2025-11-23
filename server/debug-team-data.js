const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function debugCompetitionData() {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    );

    console.log('🔍 Investigando estrutura de dados dos times...\n');

    // 1. Pegar uma competição
    const { data: comps } = await supabase
        .from('Competition')
        .select('id, name')
        .limit(1);

    if (!comps || comps.length === 0) {
        console.log('❌ Nenhuma competição encontrada');
        return;
    }

    const compId = comps[0].id;
    console.log(`📋 Competição: ${comps[0].name} (ID: ${compId})\n`);

    // 2. Buscar times registrados COM relações
    console.log('1️⃣ Query COM relações (como está no código):');
    const { data: withRelations, error: err1 } = await supabase
        .from('TeamRegistration')
        .select(`
            *,
            team:Team(
                *,
                organization:Organization(*)
            ),
            group:Group(*)
        `)
        .eq('competition_id', compId);

    if (err1) {
        console.log('❌ Erro:', err1.message);
    } else {
        console.log(`✅ Encontrados: ${withRelations?.length || 0} times`);
        if (withRelations && withRelations.length > 0) {
            console.log('\n📦 Estrutura do primeiro time:');
            console.log(JSON.stringify(withRelations[0], null, 2));
        }
    }

    // 3. Ver o que o Team contém
    console.log('\n2️⃣ Verificando estrutura da tabela Team:');
    const { data: teams, error: err2 } = await supabase
        .from('Team')
        .select('*')
        .limit(1);

    if (err2) {
        console.log('❌ Erro:', err2.message);
    } else if (teams && teams.length > 0) {
        console.log('✅ Estrutura de Team:');
        console.log(JSON.stringify(teams[0], null, 2));
    }

    // 4. Ver o que Organization contém
    console.log('\n3️⃣ Verificando estrutura da tabela Organization:');
    const { data: orgs, error: err3 } = await supabase
        .from('Organization')
        .select('*')
        .limit(1);

    if (err3) {
        console.log('❌ Erro:', err3.message);
    } else if (orgs && orgs.length > 0) {
        console.log('✅ Estrutura de Organization:');
        console.log(JSON.stringify(orgs[0], null, 2));
    }

    // 5. Buscar GameMatch para ver como times aparecem lá
    console.log('\n4️⃣ Verificando como times aparecem em GameMatch:');
    const { data: matches, error: err4 } = await supabase
        .from('GameMatch')
        .select(`
            *,
            team_a:Team!GameMatch_team_a_id_fkey(
                id,
                organization:Organization(name_official)
            ),
            team_b:Team!GameMatch_team_b_id_fkey(
                id,
                organization:Organization(name_official)
            )
        `)
        .eq('competition_id', compId)
        .limit(1);

    if (err4) {
        console.log('❌ Erro:', err4.message);
    } else {
        console.log(`✅ Encontradas: ${matches?.length || 0} partidas`);
        if (matches && matches.length > 0) {
            console.log('\n📦 Estrutura da primeira partida:');
            console.log(JSON.stringify(matches[0], null, 2));
        }
    }
}

debugCompetitionData();
