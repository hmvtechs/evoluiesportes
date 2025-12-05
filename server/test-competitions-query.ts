// Test Supabase Competition queries directly
import { supabase } from './src/config/supabase';

async function testQueries() {
    console.log('='.repeat(60));
    console.log('Testing Supabase Competitions Queries');
    console.log('='.repeat(60));

    // Test 1: Simple select all competitions
    console.log('\n1. Testing simple Competition select...');
    const { data: comps1, error: err1 } = await supabase
        .from('Competition')
        .select('id, name, status');

    if (err1) {
        console.error('❌ Error:', err1);
    } else {
        console.log(`✅ Found ${comps1?.length || 0} competitions`);
        console.log(comps1);
    }

    // Test 2: Select with modality join
    console.log('\n2. Testing Competition with Modality join...');
    const { data: comps2, error: err2 } = await supabase
        .from('Competition')
        .select('*, modality:Modality(id, name)');

    if (err2) {
        console.error('❌ Error:', err2);
    } else {
        console.log(`✅ Found ${comps2?.length || 0} competitions with modality`);
        console.log(JSON.stringify(comps2, null, 2));
    }

    // Test 3: Count TeamRegistrations
    console.log('\n3. Testing TeamRegistration count...');
    const { count, error: err3 } = await supabase
        .from('TeamRegistration')
        .select('*', { count: 'exact', head: true });

    if (err3) {
        console.error('❌ Error:', err3);
    } else {
        console.log(`✅ Total TeamRegistrations: ${count}`);
    }

    // Test 4: Full list with counts (same as listCompetitions)
    console.log('\n4. Testing full listCompetitions logic...');
    try {
        const { data: competitions, error } = await supabase
            .from('Competition')
            .select('*, modality:Modality(id, name)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        console.log(`✅ Got ${competitions?.length || 0} competitions`);

        const competitionsWithCounts = await Promise.all(
            (competitions || []).map(async (comp) => {
                const [regResult, matchResult] = await Promise.all([
                    supabase.from('TeamRegistration').select('id', { count: 'exact', head: true }).eq('competition_id', comp.id),
                    supabase.from('GameMatch').select('id', { count: 'exact', head: true }).eq('competition_id', comp.id)
                ]);

                return {
                    ...comp,
                    _count: {
                        registrations: regResult.count || 0,
                        matches: matchResult.count || 0
                    }
                };
            })
        );

        console.log('✅ Final result with counts:');
        console.log(JSON.stringify(competitionsWithCounts, null, 2));
    } catch (error: any) {
        console.error('❌ Fatal error:', error.message);
        console.error(error);
    }

    console.log('\n' + '='.repeat(60));
    console.log('Test complete');
    console.log('='.repeat(60));
}

testQueries().then(() => process.exit(0)).catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
});
