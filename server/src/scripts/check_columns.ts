
import { supabaseAdmin } from '../config/supabase';

async function checkColumns() {
    console.log('Checking Team columns...');
    if (!supabaseAdmin) return;

    // We can't list columns easily via API without a function.
    // But we can try to select the column and see if it errors.
    const { data, error } = await supabaseAdmin
        .from('Team')
        .select('coach_name')
        .limit(1);

    if (error) {
        console.error('Error selecting coach_name:', error);
    } else {
        console.log('✅ coach_name column exists and is accessible.');
    }
}

checkColumns();
