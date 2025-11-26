import { exec } from 'child_process';
import { Response } from 'node-fetch';

export const curlFetch = (url: string, options: any = {}): Promise<any> => {
    return new Promise((resolve, reject) => {
        const method = options.method || 'GET';
        const headers = options.headers || {};
        const body = options.body;

        // Construct curl command
        // Use --resolve to force DNS
        const targetHost = 'deqtlplceaphtindxxtu.supabase.co';
        const targetIp = '104.18.38.146';

        let cmd = `curl -s -i -X ${method}`;

        // Force resolve if URL matches
        if (url.includes(targetHost)) {
            cmd += ` --resolve ${targetHost}:443:${targetIp}`;
        }

        // Add headers
        let headerObj: any = headers;
        if (typeof headers.forEach === 'function') {
            headerObj = {};
            headers.forEach((value: string, key: string) => {
                headerObj[key] = value;
            });
        }

        console.log('[curlFetch] Headers:', JSON.stringify(headerObj));
        Object.keys(headerObj).forEach(key => {
            cmd += ` -H "${key}: ${headerObj[key]}"`;
        });

        // Add body
        if (body) {
            // Escape body for shell (basic)
            const escapedBody = body.replace(/"/g, '\\"');
            cmd += ` -d "${escapedBody}"`;
        }

        cmd += ` "${url}"`;

        console.log(`[curlFetch] Executing: ${cmd.substring(0, 200)}...`);

        exec(cmd, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
            if (error) {
                console.error('[curlFetch] Error:', error);
                return reject(error);
            }

            // Parse output (headers + body)
            // curl -i outputs headers then empty line then body
            const parts = stdout.split('\r\n\r\n');
            if (parts.length < 2) {
                // Try \n\n
                const parts2 = stdout.split('\n\n');
                if (parts2.length >= 2) {
                    const headerPart = parts2[0];
                    const bodyPart = parts2.slice(1).join('\n\n');
                    resolve(new Response(bodyPart, { status: 200 })); // Mock status parsing
                    return;
                }
                return resolve(new Response(stdout, { status: 200 }));
            }

            const headerPart = parts[0];
            const bodyPart = parts.slice(1).join('\r\n\r\n');

            // Parse status code from first line
            const statusLine = headerPart.split('\n')[0];
            const statusCode = parseInt(statusLine.split(' ')[1]) || 200;

            resolve(new Response(bodyPart, { status: statusCode }));
        });
    });
};
