import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const listCompetitions = async (req: Request, res: Response) => {
    console.log('🔵 [listCompetitions] Request received');
    try {
        console.log('🟢 [listCompetitions] Querying Supabase...');
        const { data: competitions, error } = await supabase
            .from('Competition')
            .select('id, name, status, nickname, modality:Modality(id, name)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('🔴 [listCompetitions] Supabase error:', error);
            throw error;
        }

        console.log(`✅ [listCompetitions] Got ${competitions?.length || 0} competitions`);

        // Simplificado: retornar direto sem counts
        const result = (competitions || []).map(comp => ({
            ...comp,
            _count: { registrations: 0, matches: 0 }
        }));

        console.log('📤 [listCompetitions] Sending response...');
        res.status(200).json(result);
        console.log('✅ [listCompetitions] Response sent');
    } catch (error: any) {
        console.error('🔴 [listCompetitions] FATAL ERROR:', error.message);
        res.status(500).json({ error: 'Failed to list competitions' });
    }
};
