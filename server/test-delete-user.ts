import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';

const generateUser = (role: string) => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const cpfBase = timestamp.toString().slice(-9) + randomNum.toString().slice(-2);
    const cpf = cpfBase.padEnd(11, '0');

    return {
        email: `test_${role.toLowerCase()}_${timestamp}_${randomNum}@example.com`,
        cpf: cpf,
        password: "password123",
        full_name: `Test ${role} ${timestamp}`,
        phone: "11999999999",
        sex: "M",
        birth_date: "1990-01-01",
        city: "Test City",
        state: "TS",
        role: role
    };
};

const runTest = async () => {
    console.log('🤖 Starting Admin User Deletion Test');
    console.log('-------------------------------------------');

    try {
        // 1. Register Admin
        const adminData = generateUser('ADMIN');
        console.log(`\n1. Registering Admin: ${adminData.email}`);
        const adminReg = await axios.post(`${API_URL}/users`, adminData);
        console.log('✅ Admin Registered');

        // 2. Register Victim
        const victimData = generateUser('FAN');
        console.log(`\n2. Registering Victim: ${victimData.email}`);
        const victimReg = await axios.post(`${API_URL}/users`, victimData);
        const victimId = victimReg.data.user.id;
        console.log(`✅ Victim Registered (ID: ${victimId})`);

        // 3. Login Admin
        console.log('\n3. Logging in Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            identifier: adminData.email,
            password: adminData.password
        });
        const token = loginRes.data.token;
        console.log('✅ Admin Logged In (Token received)');

        // 4. Delete Victim
        console.log(`\n4. Deleting Victim (ID: ${victimId})...`);
        const deleteRes = await axios.delete(`${API_URL}/users/admin/${victimId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Delete Request Success:', deleteRes.data.message);

        // 5. Verify Deletion (Try to login as victim)
        console.log('\n5. Verifying Deletion (Attempting Victim Login)...');
        try {
            await axios.post(`${API_URL}/auth/login`, {
                identifier: victimData.email,
                password: victimData.password
            });
            console.error('❌ FAILURE: Victim was able to login after deletion!');
        } catch (err: any) {
            if (err.response && (err.response.status === 400 || err.response.status === 401)) {
                console.log('✅ SUCCESS: Victim login failed as expected (User not found or invalid credentials)');
            } else {
                console.error('❓ Unexpected error during verification:', err.message);
            }
        }

    } catch (error: any) {
        console.error('\n❌ TEST FAILED');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
};

runTest();
