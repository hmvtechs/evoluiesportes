
import { supabase } from '../config/supabase';

async function checkAdmin() {
    console.log('Checking for ADMIN users...');
    const { data: users, error } = await supabase
        .from('User')
        .select('email, role, id')
        .eq('role', 'ADMIN');

    if (error) {
        console.error('Error fetching users:', error);
        return;
    }

    if (users && users.length > 0) {
        console.log('Found ADMIN users:', users);
    } else {
        console.log('No ADMIN users found.');
    }
}

checkAdmin();
