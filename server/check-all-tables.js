const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function checkAllTables() {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    );

    const tablesToCheck = [
        'user', 'User', 'users', 'Users',
        'competition', 'Competition', 'competitions', 'Competitions',
        'match', 'Match', 'matches', 'Matches',
        'venue', 'Venue', 'venues', 'Venues',
        'booking', 'Booking', 'bookings', 'Bookings',
        'modality', 'Modality', 'modalities', 'Modalities',
        'organization', 'Organization', 'organizations', 'Organizations',
        'competition_team', 'CompetitionTeam'
    ];

    console.log('🔍 Verificando tabelas no Supabase...\n');
    const foundTables = {};

    for (const table of tablesToCheck) {
        const { error } = await supabase
            .from(table)
            .select('*')
            .limit(1);

        if (!error) {
            const base = table.toLowerCase().replace(/s$/, '');
            if (!foundTables[base]) {
                foundTables[base] = table;
                console.log(`✅ ${table}`);
            }
        }
    }

    console.log('\n📋 RESUMO - Use estes nomes:');
    console.log('='.repeat(50));
    for (const [key, value] of Object.entries(foundTables)) {
        console.log(`${key.padEnd(20)} → .from('${value}')`);
    }
}

checkAllTables();
