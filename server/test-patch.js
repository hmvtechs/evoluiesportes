const fetch = require('node-fetch');
const dns = require('dns');

const TARGET_HOST = 'deqtlplceaphtindxxtu.supabase.co';
const TARGET_IP = '104.18.38.146';

// GLOBAL PATCH
const originalLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    if (hostname === TARGET_HOST) {
        console.log(`🔍 Intercepting DNS lookup for: ${hostname}`);
        return callback(null, TARGET_IP, 4);
    }

    return originalLookup(hostname, options, callback);
};

async function run() {
    const url = `https://${TARGET_HOST}/auth/v1/health`;
    console.log(`Checking ${url}...`);
    try {
        const res = await fetch(url);
        console.log(`Status: ${res.status} ${res.statusText}`);
        const text = await res.text();
        console.log(`Body: ${text}`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        if (err.cause) console.error('Cause:', err.cause);
    }
}

run();
