"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../config/supabase");
async function listModalities() {
    console.log('Listing modalities...');
    if (!supabase_1.supabaseAdmin)
        return;
    const { data: modalities, error } = await supabase_1.supabaseAdmin
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
