"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listModalities = void 0;
const supabase_1 = require("../config/supabase");
const listModalities = async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from('Modality')
            .select('*')
            .order('name', { ascending: true });
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        console.error('List Modalities Error:', error.message);
        res.status(500).json({ error: 'Failed to list modalities' });
    }
};
exports.listModalities = listModalities;
