"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
const seedAdmin = async () => {
    console.log('Seeding Admin User...');
    const email = 'admin@admin.com';
    const password = 'admin123'; // Default password (min 6 chars)
    try {
        // 1. Sign Up in Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: 'Administrador',
                    cpf: '00000000000'
                }
            }
        });
        let userId = authData.user?.id;
        if (authError) {
            console.log('Auth SignUp Error:', authError.message);
            // Try to sign in to get ID if user exists
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (signInData.user) {
                userId = signInData.user.id;
                console.log('Signed in successfully, ID:', userId);
            }
            else {
                console.error('Could not sign in:', signInError?.message);
            }
        }
        else {
            console.log('Auth User Created/Retrieved:', userId);
        }
        if (!userId) {
            console.error('Failed to get User ID. Cannot seed public table.');
            return;
        }
        // Upsert into public.User
        const { error: dbError } = await supabase
            .from('User')
            .upsert({
            id: userId,
            email,
            cpf: '00000000000',
            password_hash: 'MANAGED_BY_SUPABASE',
            full_name: 'Administrador',
            role: 'ADMIN',
            rf_status: 'VALID',
            updated_at: new Date().toISOString()
        });
        if (dbError) {
            console.error('Error upserting public user:', dbError.message);
        }
        else {
            console.log('✅ Admin user seeded successfully in public table.');
        }
    }
    catch (error) {
        console.error('Seed failed:', error);
    }
};
seedAdmin();
