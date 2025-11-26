import dotenv from 'dotenv';
import path from 'path';
import https from 'https';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('\n=== SUPABASE CONNECTIVITY TEST ===\n');
console.log('URL:', supabaseUrl);
console.log('Key configured:', supabaseKey ? 'YES' : 'NO');
console.log('Key length:', supabaseKey?.length || 0);

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase configuration!');
    process.exit(1);
}

// Test 1: Basic HTTP request
console.log('\n--- Test 1: HTTP GET to /rest/v1/ ---');
const url = new URL('/rest/v1/', supabaseUrl);

https.get(url.toString(), {
    headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
    }
}, (res) => {
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response:', data);
        if (res.statusCode === 200 || res.statusCode === 404) {
            console.log('✅ HTTP connection successful!');
        } else {
            console.log('⚠️ Unexpected status code');
        }
    });
}).on('error', (err) => {
    console.error('❌ HTTP request failed:', err.message);
    console.error('Error code:', err.code);
});

// Test 2: Try auth endpoint
console.log('\n--- Test 2: POST to /auth/v1/signup ---');
const authUrl = new URL('/auth/v1/signup', supabaseUrl);
const postData = JSON.stringify({
    email: `test_${Date.now()}@example.com`,
    password: 'test1234'
});

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = https.request(authUrl.toString(), options, (res) => {
    console.log('Status Code:', res.statusCode);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response:', data);
        if (res.statusCode === 200 || res.statusCode === 400) {
            console.log('✅ Auth endpoint reachable!');
        } else {
            console.log('⚠️ Unexpected auth response');
        }
    });
});

req.on('error', (err) => {
    console.error('❌ Auth request failed:', err.message);
    console.error('Error code:', err.code);
});

req.write(postData);
req.end();
