const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api/v1';
const EMAIL = 'test@test.com';
const PASSWORD = 'password123';

async function testRegistration() {
    console.log('1. Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: EMAIL, password: PASSWORD })
    });

    if (!loginRes.ok) {
        console.error('Login failed:', await loginRes.text());
        return;
    }

    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('✅ Login successful. Token obtained.');

    // 2. Get Competitions
    console.log('2. Fetching competitions...');
    const compRes = await fetch(`${API_URL}/competitions`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const competitions = await compRes.json();

    if (competitions.length === 0) {
        console.error('No competitions found.');
        return;
    }

    const compId = competitions[0].id;
    console.log(`✅ Found competition ID: ${compId}`);

    // 3. Create Organization
    console.log('3. Creating new organization...');
    const orgName = `Test Org ${Date.now()}`;
    const createOrgRes = await fetch(`${API_URL}/organizations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name_official: orgName,
            cnpj: '', // Optional now
            team_manager_name: 'Test Manager',
            team_manager_contact: '123456789',
            coach_name: 'Test Coach',
            coach_contact: '987654321'
        })
    });

    if (!createOrgRes.ok) {
        console.error('Failed to create organization:', await createOrgRes.text());
        return;
    }

    const newOrg = await createOrgRes.json();
    console.log('New Org Response:', JSON.stringify(newOrg, null, 2));
    const orgId = newOrg.id;
    console.log(`✅ Created organization ID: ${orgId}`);

    // 4. Register Team
    console.log(`4. Attempting to register team (Org: ${orgId}, Comp: ${compId})...`);
    const regRes = await fetch(`${API_URL}/competitions/${compId}/register-team`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            organization_id: orgId,
            category: 'TEST_SCRIPT_CATEGORY'
        })
    });

    if (regRes.ok) {
        console.log('✅ Registration SUCCESSFUL!');
        console.log(await regRes.json());
    } else {
        console.error('❌ Registration FAILED!');
        console.error('Status:', regRes.status);
        console.error('Response:', await regRes.text());
    }
}

testRegistration().catch(console.error);
