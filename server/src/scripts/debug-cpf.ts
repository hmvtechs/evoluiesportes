import axios from 'axios';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const CPF = '10362896640';
const API_KEY = process.env.CPF_API_KEY;

console.log('--- DEBUG CPF API ---');
console.log('CPF:', CPF);
console.log('API Key configured:', !!API_KEY);

async function test() {
    try {
        const url = 'https://apicpf.com/api/consulta';
        console.log('Requesting:', url);

        const response = await axios.get(url, {
            params: { cpf: CPF },
            headers: { 'X-API-KEY': API_KEY }
        });

        console.log('Status:', response.status);
        const data = response.data;
        console.log('Data:', JSON.stringify(data, null, 2));

        // Save to file
        const fs = require('fs');
        fs.writeFileSync('debug_result.json', JSON.stringify(data, null, 2));
        console.log('Saved to debug_result.json');

    } catch (error: any) {
        console.error('Error:', error.message);
        if (error.response) {
            console.log('Response Status:', error.response.status);
            console.log('Response Data:', JSON.stringify(error.response.data, null, 2));
            const fs = require('fs');
            fs.writeFileSync('debug_result.json', JSON.stringify(error.response.data, null, 2));
        }
    }
}

test();
