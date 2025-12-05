const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function checkSchema() {
    console.log('🔍 Checking Team table schema...');

    // We can't easily check schema via JS client without admin access or specific RPC
    // But we can try to insert a team with null championship_id and see if it fails

    const testOrgId = 1; // Assuming org 1 exists, if not we might fail on FK

    try {
        // Try to insert a dummy team with null championship_id
        // We'll use a transaction or delete it immediately if successful
        // Actually, just trying to insert is enough to test the constraint

        console.log('Attempting to insert Team with null championship_id...');

        const { data, error } = await supabase
            .from('Team')
            .insert([{
                organization_id: 99999, // Use a non-existent org to fail on FK, but pass NotNull check?
                // No, FK check happens after NotNull check usually.
                // Let's try to insert with a valid org if possible, or just see the error.
                // If we use invalid org, we get FK error. If we use null championship, we get NotNull error (if not migrated).

                // Let's try to find a valid org first
            }])
            .select();

        // Better approach: Introspection via Postgrest is not direct.
        // Let's just ask the user or assume it's the issue if logs show error.

        // Let's try to read the logs from the server process instead.

    } catch (e) {
        console.log(e);
    }
}

// Simpler: Just check if we can select from Team where championship_id is null
async function checkNullChampionship() {
    console.log('🔍 Checking for teams with null championship_id...');
    const { data, error } = await supabase
        .from('Team')
        .select('id, championship_id')
        .is('championship_id', null)
        .limit(1);

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Query successful. Data:', data);
        console.log('If query worked, the column likely exists. If data has items, nullable works.');
    }
}

checkNullChampionship();
