
import { supabaseAdmin } from '../config/supabase';

async function listCompetitions() {
    console.log('Listing competitions...');
    if (!supabaseAdmin) return;

    const { data: competitions, error } = await supabaseAdmin
        .from('Competition')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error listing competitions:', error);
        return;
    }

    console.log('Competitions:', competitions);
}

listCompetitions();
