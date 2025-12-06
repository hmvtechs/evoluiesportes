
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

console.log('CWD:', process.cwd());
const envPath = path.resolve(__dirname, '.env');
console.log('Looking for .env at:', envPath);

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log('Loaded .env');
} else {
    console.log('.env NOT FOUND at', envPath);
    // Try parent
    const parentEnv = path.resolve(__dirname, '../.env');
    if (fs.existsSync(parentEnv)) {
        dotenv.config({ path: parentEnv });
        console.log('Loaded ../.env');
    }
}

const supabaseUrl = process.env.SUPABASE_URL || 'https://deqtlplceaphtindxxtu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_KEY;

console.log('URL:', supabaseUrl);
console.log('Key defined:', !!supabaseKey);

if (!supabaseKey) {
    console.error('FATAL: No SUAPBASE_KEY found. Check .env file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('--- Checking Teams ---');
    // Get latest comp
    const { data: comps } = await supabase.from('Competition').select('id, name').order('created_at', { ascending: false }).limit(1);
    if (!comps.length) { console.log('No comps'); return; }
    const compId = comps[0].id;
    console.log(`Comp: ${comps[0].name} (${compId})`);

    // Count registrations without group
    const { count: nullGroup, error } = await supabase
        .from('TeamRegistration')
        .select('*', { count: 'exact', head: true })
        .eq('competition_id', compId)
        .is('group_id', null);

    const { count: total } = await supabase
        .from('TeamRegistration')
        .select('*', { count: 'exact', head: true })
        .eq('competition_id', compId);

    console.log(`Total Teams: ${total}`);
    console.log(`Teams WITHOUT Group: ${nullGroup}`);

    if (nullGroup === total && total > 0) {
        console.log('🚨 PROBLEM: No teams have been assigned to groups yet!');
        console.log('   Solution: User needs to go to "Grupos" tab and click "Sortear" first.');
    } else {
        console.log('✅ Teams appear to be assigned.');
    }

    // Check matches
    const { count: matches } = await supabase
        .from('GameMatch')
        .select('*', { count: 'exact', head: true })
        .eq('competition_id', compId);
    console.log(`Matches in DB: ${matches}`);
}

check();
