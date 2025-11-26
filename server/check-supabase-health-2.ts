import fetch from 'node-fetch';
import dns from 'dns';

// Force Google DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

const TARGET_HOST = 'deqtlplceaphtindxxtu.supabase.co';
const TARGET_IP = '104.18.38.146';

// GLOBAL PATCH
const originalLookup = dns.lookup;
(dns as any).lookup = (hostname: string, options: any, callback: any) => {
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

async function checkEndpoint(name: string, path: string) {
    const url = `https://${TARGET_HOST}${path}`;
    console.log(`\nChecking ${name} (${url})...`);
    try {
        const res = await fetch(url, {
            headers: {
                'apikey': process.env.SUPABASE_ANON_KEY || '',
                'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`
            }
        });
        console.log(`Status: ${res.status} ${res.statusText}`);
        const text = await res.text();
        console.log(`Body preview: ${text.substring(0, 200)}`);
    } catch (err: any) {
        console.error(`Error: ${err.message}`);
    }
}

async function run() {
    // Load env
    const fs = require('fs');
    const path = require('path');
    const dotenv = require('dotenv');
    dotenv.config({ path: path.resolve(__dirname, '.env') });

    await checkEndpoint('Root', '/');
    await checkEndpoint('Auth Health', '/auth/v1/health');
    await checkEndpoint('Rest Health', '/rest/v1/');
}

run();
