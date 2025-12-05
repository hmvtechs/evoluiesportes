/**
 * curlFetch - Workaround for DNS/Networking issues in Node.js
 * Uses system curl command to perform HTTP requests
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function curlFetch(url: string, options: any = {}): Promise<Response> {
    const method = options.method || 'GET';
    const headers = options.headers || {};

    // Convert Headers object to plain object if needed
    let headersObj: Record<string, string> = {};
    if (headers instanceof Headers) {
        headers.forEach((value: string, key: string) => {
            headersObj[key] = value;
        });
    } else {
        headersObj = headers;
    }

    let curlCmd = `curl -X ${method} "${url}"`;

    // Add --resolve flag for Supabase domain
    if (url.includes('deqtlplceaphtindxxtu.supabase.co')) {
        curlCmd += ` --resolve deqtlplceaphtindxxtu.supabase.co:443:104.18.38.146`;
    }

    // Add headers
    for (const [key, value] of Object.entries(headersObj)) {
        curlCmd += ` -H "${key}: ${value}"`;
    }

    // Add body for POST/PUT/PATCH
    if (options.body && (method !== 'GET' && method !== 'HEAD')) {
        const bodyStr = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
        // Windows-safe escaping: wrap in double quotes, escape internal double quotes with backslash
        const escapedBody = bodyStr.replace(/"/g, '\\"');
        curlCmd += ` -d "${escapedBody}"`;
    }

    try {
        const { stdout } = await execPromise(curlCmd);

        return {
            ok: true,
            status: 200,
            statusText: 'OK',
            headers: new Headers(),
            json: async () => JSON.parse(stdout),
            text: async () => stdout,
            blob: async () => new Blob([stdout]),
            arrayBuffer: async () => new ArrayBuffer(0),
            formData: async () => new FormData(),
            clone: () => ({ json: async () => JSON.parse(stdout) }) as any,
            body: null,
            bodyUsed: false,
            redirected: false,
            type: 'basic' as ResponseType,
            url: url
        } as Response;

    } catch (error: any) {
        console.error('curlFetch error:', error.message);
        throw new Error(`Fetch failed: ${error.message}`);
    }
}
