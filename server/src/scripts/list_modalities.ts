
import { supabaseAdmin } from '../config/supabase';

async function listModalities() {
    console.log('Listing modalities...');
    if (!supabaseAdmin) return;

    const { data: modalities, error } = await supabaseAdmin
        .from('Modality')
        .select('id, name')
        .limit(5);

    if (error) {
        console.error('Error listing modalities:', error);
        return;
    }

    console.log('Modalities:', modalities);
}

listModalities();
