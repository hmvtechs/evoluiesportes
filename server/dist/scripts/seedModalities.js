"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const supabase_1 = require("../config/supabase");
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
        const { data, error } = await supabase_1.supabase
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
    }
    catch (error) {
        console.error('❌ Error seeding modalities:', error.message);
        process.exit(1);
    }
};
seedModalities();
