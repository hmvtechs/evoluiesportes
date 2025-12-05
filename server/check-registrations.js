const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function checkRegistrations() {
    const competitionId = 9;
    console.log(`Checking registrations for competition ${competitionId}...`);

    const { data: competition, error } = await supabase
        .from('Competition')
        .select(`
            id,
            name,
            registrations:TeamRegistration(
                id,
                status,
                created_at,
                team:Team(
                    id,
                    category,
                    organization:Organization(id, name_official)
                )
            )
        `)
        .eq('id', competitionId)
        .single();

    if (error) {
        console.error('Error fetching competition:', error);
        return;
    }

    console.log(`Competition: ${competition.name}`);
    console.log(`Total Registrations: ${competition.registrations.length}`);

    competition.registrations.forEach(reg => {
        console.log(`- Reg ID: ${reg.id}, Status: ${reg.status}, Team ID: ${reg.team.id}, Org: ${reg.team.organization?.name_official} (ID: ${reg.team.organization?.id})`);
    });
}

checkRegistrations();
