import { supabase } from '../config/supabase';

async function testSupabaseConnection() {
    console.log('\n=== TESTING SUPABASE CONNECTION ===\n');

    try {
        // Test 1: Simple query to check connection
        console.log('Test 1: Checking connection with a simple query...');
        const { data, error } = await supabase
            .from('User')
            .select('count')
            .limit(1);

        if (error) {
            console.error('❌ Connection test failed:', error.message);
            console.error('Error details:', JSON.stringify(error, null, 2));
        } else {
            console.log('✅ Connection successful!');
        }

        // Test 2: Try to sign up a test user
        console.log('\nTest 2: Testing Auth signup...');
        const testEmail = `test_${Date.now()}@example.com`;
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: testEmail,
            password: 'test1234'
        });

        if (authError) {
            console.error('❌ Auth signup failed:', authError.message);
            console.error('Error details:', JSON.stringify(authError, null, 2));
        } else {
            console.log('✅ Auth signup successful!');
            console.log('User ID:', authData.user?.id);

            // Clean up: delete the test user
            if (authData.user?.id) {
                await supabase.auth.admin.deleteUser(authData.user.id);
                console.log('✅ Test user cleaned up');
            }
        }

    } catch (error: any) {
        console.error('❌ Unexpected error:', error.message);
        console.error('Stack:', error.stack);
    }
}

testSupabaseConnection();
