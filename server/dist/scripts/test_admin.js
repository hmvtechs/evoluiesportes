"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../config/supabase");
console.log('Testing Supabase Admin...');
if (supabase_1.supabaseAdmin) {
    console.log('Supabase Admin is defined.');
}
else {
    console.error('Supabase Admin is NULL.');
}
