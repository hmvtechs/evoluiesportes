"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const API_BASE_URL = 'http://localhost:3000';
const COMPETITION_ID = 7; // Usar um ID de competição que exista
// Você precisa de um token válido - pegue do localStorage do browser após login
const TOKEN = 'SEU_TOKEN_AQUI'; // ← SUBSTITUIR COM TOKEN REAL
async function testRegisterTeam() {
    console.log('🧪 Testing Team Registration...\n');
    // Test data - usar um organization_id que exista
    const requestData = {
        organization_id: 1, // ← Ajustar para uma org que exista
        category: 'Test Category'
    };
    console.log('📤 Request:', {
        url: `${API_BASE_URL}/api/v1/competitions/${COMPETITION_ID}/register-team`,
        method: 'POST',
        body: requestData
    });
    try {
        const response = await (0, cross_fetch_1.default)(`${API_BASE_URL}/api/v1/competitions/${COMPETITION_ID}/register-team`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            },
            body: JSON.stringify(requestData)
        });
        console.log('\n📥 Response Status:', response.status, response.statusText);
        const data = await response.json();
        if (response.ok) {
            console.log('✅ SUCCESS!');
            console.log('\nRegistration Data:', JSON.stringify(data, null, 2));
        }
        else {
            console.log('❌ ERROR!');
            console.log('\nError Response:', JSON.stringify(data, null, 2));
        }
    }
    catch (error) {
        console.error('🔴 FATAL ERROR:', error.message);
        console.error('Full error:', error);
    }
}
// Primeiro, testar se o servidor está respondendo
async function testServerHealth() {
    try {
        console.log('🏥 Testing server health...');
        const response = await (0, cross_fetch_1.default)(`${API_BASE_URL}/api/v1/competitions`);
        console.log('Server response status:', response.status);
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Server is UP! Found', data.length, 'competitions');
            return true;
        }
    }
    catch (error) {
        console.log('❌ Server is DOWN or unreachable');
        console.error(error);
        return false;
    }
}
async function main() {
    const isServerUp = await testServerHealth();
    if (!isServerUp) {
        console.log('\n⚠️  Server is not running. Start it first:\n   cd server\n   npx ts-node src/app.ts');
        return;
    }
    console.log('\n' + '='.repeat(60));
    await testRegisterTeam();
    console.log('='.repeat(60));
}
main();
