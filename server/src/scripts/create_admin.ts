
import { supabase, supabaseAdmin } from '../config/supabase';

async function createAdmin() {
    const email = 'admin_test@test.com';
    const password = 'password123';
    const fullName = 'Admin Teste';

    console.log(`Creating admin user: ${email}...`);

    if (!supabaseAdmin) {
        console.error('Supabase Admin not configured (SUPABASE_SERVICE_KEY missing)');
        return;
    }

    // 1. Check if user exists
    const { data: existingUsers } = await supabaseAdmin!.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === email);

    let userId;

    if (existingUser) {
        console.log('User already exists, updating password and role...');
        userId = existingUser.id;
        const { error: updateError } = await supabaseAdmin!.auth.admin.updateUserById(userId, {
            password: password,
            email_confirm: true,
            user_metadata: { role: 'ADMIN', full_name: fullName }
        });
        if (updateError) {
            console.error('Error updating auth user:', updateError);
        } else {
            console.log('✅ Password and role updated in Auth.');
        }
    } else {
        console.log('Creating new user...');
        const { data: newUser, error: createError } = await supabaseAdmin!.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { role: 'ADMIN', full_name: fullName }
        });
        if (createError) {
            console.error('Error creating user:', createError);
            return;
        }
        userId = newUser.user.id;
    }

    if (userId) {
        console.log('User ID:', userId);

        // 2. Update/Insert into User table with ADMIN role
        const { error: dbError } = await supabase
            .from('User')
            .upsert({
                id: userId,
                email,
                full_name: fullName,
                role: 'ADMIN',
                rf_status: 'VALID'
            });

        if (dbError) {
            console.error('Error updating User table:', dbError);
        } else {
            console.log('✅ Admin user configured successfully in DB.');
        }
    }
}

createAdmin();
