
import { supabaseAdmin } from '../config/supabase';

async function createCompetitionDirect() {
    console.log('Creating competition directly in DB...');

    if (!supabaseAdmin) {
        console.error('Supabase Admin not configured');
        return;
    }
    console.log('Supabase Admin configured.');

    // Create a local client WITHOUT curlFetch to avoid JSON issues
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    const competitionData = {
        name: 'Torneio Teste 2026',
        start_date: new Date('2026-01-01').toISOString(),
        end_date: new Date('2026-02-01').toISOString(),
        status: 'DRAFT',
        modality_id: 5,
        gender: 'MALE',
        updated_at: new Date().toISOString()
    };

    try {
        // Revert to supabaseAdmin which uses curlFetch
        const { data: competition, error } = await supabaseAdmin
            .from('Competition')
            .insert([competitionData]) // Pass as array
            .select()
            .single();

        if (error) {
            console.error('Error creating competition:', error);
            return;
        }

        console.log('✅ Competition created:', competition);
        console.log(`COMPETITION_ID: ${competition.id}`);

        const fs = require('fs');
        fs.writeFileSync('competition_id.txt', competition.id.toString());
    } catch (e: any) {
        console.error('EXCEPTION:', JSON.stringify(e, null, 2));
        console.error('Stack:', e.stack);
        process.exit(1);
    }
}

createCompetitionDirect();
