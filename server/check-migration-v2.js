const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function checkSchema() {
    console.log('🔍 Checking Team table schema via RPC or raw query...');

    // Since we don't have direct SQL access via client without RPC,
    // and we can't query information_schema directly via Postgrest easily (unless exposed),
    // we will try to INSERT a dummy team with null championship_id.
    // If it fails with "violates not-null constraint", then migration is missing.

    // We need a valid organization_id. Let's fetch one.
    const { data: orgs } = await supabase.from('Organization').select('id').limit(1);
    if (!orgs || orgs.length === 0) {
        console.log('⚠️ No organizations found. Cannot test insert.');
        return;
    }

    const orgId = orgs[0].id;
    console.log(`Found organization ID: ${orgId}. Attempting insert...`);

    try {
        const { data, error } = await supabase
            .from('Team')
            .insert([{
                organization_id: orgId,
                championship_id: null, // This is what we want to test
                category: 'TEST_MIGRATION_CHECK'
            }])
            .select();

        if (error) {
            console.error('❌ Insert failed:', error.message);
            if (error.message.includes('null value in column "championship_id"')) {
                console.log('🚨 CONCLUSION: Migration NOT applied. Column is NOT NULL.');
            } else {
                console.log('❓ Insert failed for another reason.');
            }
        } else {
            console.log('✅ Insert successful! Migration IS applied.');
            // Cleanup
            await supabase.from('Team').delete().eq('id', data[0].id);
            console.log('🧹 Cleaned up test record.');
        }
    } catch (e) {
        console.error('Exception:', e);
    }
}

checkSchema();
