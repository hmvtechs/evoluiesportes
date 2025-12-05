const fetch = require('node-fetch');

const API_URL = 'http://localhost:3001/api/v1';
const EMAIL = 'test@test.com'; // Using the test user we created
const PASSWORD = 'password123';
const COMPETITION_ID = 9;

async function verifyFix() {
    console.log('🚀 Starting verification script...');

    try {
        // 1. Login to get token
        console.log('🔑 Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: EMAIL, password: PASSWORD })
        });

        if (!loginRes.ok) {
            const err = await loginRes.text();
            throw new Error(`Login failed: ${err}`);
        }

        const { token, user } = await loginRes.json();
        console.log(`✅ Login successful! User ID: ${user.id}`);

        // 2. Create a new Organization (to ensure fresh data)
        const orgName = `Org Test ${Date.now()}`;
        console.log(`🏢 Creating organization: ${orgName}...`);
        const orgRes = await fetch(`${API_URL}/organizations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name_official: orgName })
        });

        if (!orgRes.ok) {
            const err = await orgRes.text();
            throw new Error(`Organization creation failed: ${err}`);
        }

        const organization = await orgRes.json();
        console.log(`✅ Organization created! ID: ${organization.id}`);

        // 3. Register Team
        console.log(`🏐 Registering team for Competition ${COMPETITION_ID}...`);
        const regRes = await fetch(`${API_URL}/competitions/${COMPETITION_ID}/register-team`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                organization_id: organization.id,
                category: 'Principal'
            })
        });

        if (!regRes.ok) {
            const err = await regRes.text();
            throw new Error(`Team registration failed: ${err}`);
        }

        const registration = await regRes.json();
        console.log(`✅ Team registered successfully!`);
        console.log(`   - Registration ID: ${registration.id}`);
        console.log(`   - Status: ${registration.status}`);
        console.log(`   - Team ID: ${registration.team_id}`);

        console.log('\n🎉 VERIFICATION SUCCESSFUL: The backend is accepting registrations from authenticated users!');

    } catch (error) {
        console.error('\n❌ VERIFICATION FAILED:', error.message);
    }
}

verifyFix();
