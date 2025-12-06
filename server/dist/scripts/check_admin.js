"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../config/supabase");
async function checkAdmin() {
    console.log('Checking for ADMIN users...');
    const { data: users, error } = await supabase_1.supabase
        .from('User')
        .select('email, role, id')
        .eq('role', 'ADMIN');
    if (error) {
        console.error('Error fetching users:', error);
        return;
    }
    if (users && users.length > 0) {
        console.log('Found ADMIN users:', users);
    }
    else {
        console.log('No ADMIN users found.');
    }
}
checkAdmin();
