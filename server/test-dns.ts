import fetch from 'node-fetch';
import https from 'https';
import dns from 'dns';

dns.setServers(['8.8.8.8']);

const customAgent = new https.Agent({
    lookup: (hostname, options, callback) => {
        console.log('Resolving:', hostname);
        if (hostname === 'deqtlplceaphtindxxtu.supabase.co') {
            dns.resolve4(hostname, (err, addresses) => {
                if (err) {
                    console.error('Resolve error:', err);
                    return callback(err, '', 4);
                }
                console.log('Resolved IPs:', addresses);
                callback(null, addresses[0], 4);
            });
        } else {
            dns.lookup(hostname, options, callback);
        }
    }
});

async function test() {
    try {
        console.log('Testing fetch...');
        const res = await fetch('https://deqtlplceaphtindxxtu.supabase.co', { agent: customAgent });
        console.log('Status:', res.status);
    } catch (err) {
        console.error('Error:', err);
    }
}

test();
