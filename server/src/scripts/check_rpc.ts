
import { supabaseAdmin } from '../config/supabase';

async function checkRpc() {
    console.log('Checking for exec_sql function...');
    const { data, error } = await supabaseAdmin!.rpc('exec_sql', { sql: 'SELECT 1' });
    if (error) {
        console.log('exec_sql not found or error:', error.message);
    } else {
        console.log('exec_sql exists!');
    }
}

checkRpc();
