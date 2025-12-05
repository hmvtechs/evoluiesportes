const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function createTestUser() {
    const email = 'test@test.com';
    const password = 'password123';

    console.log(`Creating user ${email}...`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: 'Test User',
                role: 'USER'
            }
        }
    });

    let userId;

    if (error) {
        console.log('User might already exist. Trying to login...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (loginError) {
            console.error('Login failed:', loginError.message);
            return;
        }
        userId = loginData.user.id;
    } else {
        userId = data.user.id;
    }

    console.log('User ID:', userId);

    // Ensure user exists in public.User table
    const { error: publicError } = await supabase
        .from('User')
        .upsert([{
            id: userId,
            email: email,
            full_name: 'Test User',
            role: 'ADMIN',
            cpf: '00000000000',
            password_hash: 'dummy_hash_for_test',
            updated_at: new Date().toISOString()
        }]);

    if (publicError) {
        console.error('Error syncing to public.User:', publicError.message);
    } else {
        console.log('✅ User synced to public.User table');
    }
}

createTestUser();
