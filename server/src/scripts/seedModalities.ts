import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { supabase } from '../config/supabase';

const modalities = [
    'Futebol',
    'Futsal',
    'Basquetebol',
    'Voleibol',
    'Handebol',
    'Atletismo',
    'Natação',
    'Tênis',
    'Judô',
    'Beach Tennis'
];

const seedModalities = async () => {
    try {
        console.log('🌱 Seeding Modalities...');

        const { data, error } = await supabase
            .from('Modality')
            .insert(modalities.map(name => ({ name })))
            .select();

        if (error) {
            if (error.code === '23505') { // Unique constraint violation
                console.log('⚠️ Modalities already exist, skipping...');
                return;
            }
            throw error;
        }

        console.log(`✅ Successfully seeded ${data?.length || 0} modalities`);
        console.log(data);

    } catch (error: any) {
        console.error('❌ Error seeding modalities:', error.message);
        process.exit(1);
    }
};

seedModalities();
