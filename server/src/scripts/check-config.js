require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('\n=== SUPABASE CONFIGURATION CHECK ===\n');
console.log('URL:', supabaseUrl);
console.log('URL length:', supabaseUrl?.length || 0);
console.log('Key configured:', supabaseKey ? 'YES (length: ' + supabaseKey.length + ')' : 'NO');

if (!supabaseUrl) {
    console.error('\n❌ SUPABASE_URL is not configured!');
    console.error('Please check your .env file');
    process.exit(1);
}

if (!supabaseKey) {
    console.error('\n❌ SUPABASE_ANON_KEY is not configured!');
    console.error('Please check your .env file');
    process.exit(1);
}

// Check if URL is valid
try {
    const url = new URL(supabaseUrl);
    console.log('\n✅ URL is valid');
    console.log('Protocol:', url.protocol);
    console.log('Host:', url.host);
} catch (err) {
    console.error('\n❌ Invalid URL format:', err.message);
    process.exit(1);
}

console.log('\n✅ Configuration looks good!');
console.log('\nIf you\'re still getting "fetch failed" errors, it could be:');
console.log('1. Network/firewall blocking access to Supabase');
console.log('2. Supabase project is paused or deleted');
console.log('3. Invalid API keys');
console.log('\nTry accessing your Supabase URL in a browser:');
console.log(supabaseUrl);
