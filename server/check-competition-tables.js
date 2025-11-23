const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function checkCompetitionTables() {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    );

    const tables = [
        'TeamRegistration',
        'Team',
        'Organization',
        'CompetitionVenue',
        'Venue',
        'Phase',
        'Group',
        'GameMatch',
        'Modality'
    ];

    console.log('🔍 Verificando tabelas relacionadas a competições...\n');

    for (const table of tables) {
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);

        if (error) {
            console.log(`❌ ${table}: ${error.message}`);
        } else {
            console.log(`✅ ${table}: OK`);
        }
    }
}

checkCompetitionTables();
