// Simplified test - check each query independently
import { supabase } from './src/config/supabase';

async function test1_SimpleSelect() {
    console.log('\n🧪 Test 1: Simple SELECT from Competition');
    try {
        const { data, error } = await supabase
            .from('Competition')
            .select('id, name, status')
            .limit(10);

        if (error) {
            console.error('❌ Error:', error.message);
            return false;
        }
        console.log(`✅ Success! Found ${data?.length || 0} competitions`);
        if (data && data.length > 0) {
            console.log('Sample:', data[0]);
        }
        return true;
    } catch (e: any) {
        console.error('❌ Exception:', e.message);
        return false;
    }
}

async function test2_WithModalityJoin() {
    console.log('\n🧪 Test 2: SELECT with Modality JOIN');
    try {
        const { data, error } = await supabase
            .from('Competition')
            .select('id, name, modality:Modality(id, name)')
            .limit(5);

        if (error) {
            console.error('❌ Error:', error.message);
            return false;
        }
        console.log(`✅ Success! Found ${data?.length || 0} competitions with modality`);
        if (data && data.length > 0) {
            console.log('Sample:', JSON.stringify(data[0], null, 2));
        }
        return true;
    } catch (e: any) {
        console.error('❌ Exception:', e.message);
        return false;
    }
}

async function test3_CountQuery() {
    console.log('\n🧪 Test 3: Count TeamRegistrations');
    try {
        const { count, error } = await supabase
            .from('TeamRegistration')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('❌ Error:', error.message);
            return false;
        }
        console.log(`✅ Success! Total registrations: ${count}`);
        return true;
    } catch (e: any) {
        console.error('❌ Exception:', e.message);
        return false;
    }
}

async function test4_SingleCompetitionCount() {
    console.log('\n🧪 Test 4: Get registrations count for ONE competition');
    try {
        // First get a competition ID
        const { data: comps } = await supabase
            .from('Competition')
            .select('id')
            .limit(1);

        if (!comps || comps.length === 0) {
            console.log('⚠️  No competitions found to test');
            return true;
        }

        const compId = comps[0].id;
        console.log(`Testing with competition ID: ${compId}`);

        const { count, error } = await supabase
            .from('TeamRegistration')
            .select('id', { count: 'exact', head: true })
            .eq('competition_id', compId);

        if (error) {
            console.error('❌ Error:', error.message);
            return false;
        }
        console.log(`✅ Success! Competition ${compId} has ${count} registrations`);
        return true;
    } catch (e: any) {
        console.error('❌ Exception:', e.message);
        return false;
    }
}

async function runTests() {
    console.log('='.repeat(60));
    console.log('🚀 SUPABASE COMPETITION QUERIES TEST SUITE');
    console.log('='.repeat(60));

    const results = {
        test1: await test1_SimpleSelect(),
        test2: await test2_WithModalityJoin(),
        test3: await test3_CountQuery(),
        test4: await test4_SingleCompetitionCount()
    };

    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS:');
    console.log('='.repeat(60));
    Object.entries(results).forEach(([name, passed]) => {
        console.log(`${name}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    });

    const allPassed = Object.values(results).every(r => r);
    console.log('\n' + (allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'));
    console.log('='.repeat(60));
}

runTests()
    .then(() => {
        console.log('\n✅ Test suite completed');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n❌ Fatal error:', err);
        process.exit(1);
    });
