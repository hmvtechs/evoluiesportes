import fetch from 'node-fetch';
import https from 'https';
import dns from 'dns';

// Force Google DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

const TARGET_HOST = 'deqtlplceaphtindxxtu.supabase.co';
const TARGET_IP = '104.18.38.146';

// Custom Agent to force IP
const customAgent = new https.Agent({
    lookup: (hostname, options, callback) => {
        if (hostname === TARGET_HOST) {
            console.log(`Using hardcoded IP: ${TARGET_IP}`);
            return callback(null, TARGET_IP, 4);
        }
        dns.lookup(hostname, options, callback);
    }
});

async function checkEndpoint(name: string, path: string) {
    const url = `https://${TARGET_HOST}${path}`;
    console.log(`\nChecking ${name} (${url})...`);
    try {
        const res = await fetch(url, { agent: customAgent });
        console.log(`Status: ${res.status} ${res.statusText}`);
        const text = await res.text();
        console.log(`Body preview: ${text.substring(0, 200)}`);
    } catch (err: any) {
        console.error(`Error: ${err.message}`);
    }
}

async function run() {
    await checkEndpoint('Root', '/');
    await checkEndpoint('Auth Health', '/auth/v1/health');
    await checkEndpoint('Rest Health', '/rest/v1/');
    await checkEndpoint('Storage Health', '/storage/v1/status');
}

run();
