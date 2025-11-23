import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('Testing Supabase connection...');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✓ Set' : '✗ Not set');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✓ Set' : '✗ Not set');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✓ Set' : '✗ Not set');

import { supabase } from './config/supabase';

async function testConnection() {
    try {
        console.log('\n=== Testing Supabase Query ===');
        const { data, error } = await supabase
            .from('user')
            .select('count')
            .limit(1);

        if (error) {
            console.error('✗ Supabase query failed:', error);
            process.exit(1);
        }

        console.log('✓ Supabase connection successful!');
        console.log('Data:', data);
        process.exit(0);
    } catch (err) {
        console.error('✗ Connection test failed:', err);
        process.exit(1);
    }
}

testConnection();
