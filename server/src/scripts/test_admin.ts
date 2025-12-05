
import { supabaseAdmin } from '../config/supabase';

console.log('Testing Supabase Admin...');
if (supabaseAdmin) {
    console.log('Supabase Admin is defined.');
} else {
    console.error('Supabase Admin is NULL.');
}
