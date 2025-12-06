"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../config/supabase");
async function listCompetitions() {
    console.log('Listing competitions...');
    if (!supabase_1.supabaseAdmin)
        return;
    const { data: competitions, error } = await supabase_1.supabaseAdmin
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
