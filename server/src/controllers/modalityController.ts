import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const listModalities = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('Modality')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error: any) {
        console.error('List Modalities Error:', error.message);
        res.status(500).json({ error: 'Failed to list modalities' });
    }
};
