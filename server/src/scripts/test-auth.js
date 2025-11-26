require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('\n=== TESTING SUPABASE AUTH (ignoring Edge Functions) ===\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
    try {
        // Test signup
        const testEmail = `test_${Date.now()}@example.com`;
        console.log('Attempting to sign up:', testEmail);

        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: 'Test1234!'
        });

        if (error) {
            console.error('❌ Signup failed:', error.message);
            console.error('Error details:', JSON.stringify(error, null, 2));
            return false;
        }

        console.log('✅ Signup successful!');
        console.log('User ID:', data.user?.id);

        // Cleanup
        if (data.user?.id) {
            console.log('\nCleaning up test user...');
            // Note: cleanup requires service_role key, skip for now
        }

        return true;
    } catch (err) {
        console.error('❌ Unexpected error:', err.message);
        return false;
    }
}

testAuth().then(success => {
    if (success) {
        console.log('\n✅ Auth is working! Edge Functions issue does not affect user registration.');
        console.log('You can proceed with registering users.');
    } else {
        console.log('\n❌ Auth is not working. Please check:');
        console.log('1. Supabase project status');
        console.log('2. API keys are correct');
        console.log('3. Network connectivity');
    }
    process.exit(success ? 0 : 1);
});
