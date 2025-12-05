
import { supabaseAdmin } from '../config/supabase';

async function confirmUser() {
    const email = 'stafftest2@test.com';
    console.log(`Confirming user: ${email}...`);

    if (!supabaseAdmin) {
        console.error('Supabase Admin not configured');
        return;
    }

    console.log('Supabase Admin configured.');

    // 1. Get User ID from Database
    console.log(`Querying User table for email: ${email}`);
    const { data: dbUser, error: dbError } = await supabaseAdmin
        .from('User')
        .select('id')
        .eq('email', email)
        .single();

    if (dbError || !dbUser) {
        console.error('User not found in DB:', dbError);
        return;
    }

    console.log(`Found user ID: ${dbUser.id}`);

    // 2. Confirm in Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(dbUser.id, {
        email_confirm: true,
        user_metadata: { email_verified: true }
    });

    if (updateError) {
        console.error('Error confirming user:', updateError);
    } else {
        console.log('✅ User confirmed successfully.');
    }
}

confirmUser();
