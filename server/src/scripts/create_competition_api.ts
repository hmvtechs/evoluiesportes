
import { supabase } from '../config/supabase';
import axios from 'axios';

async function createCompetition() {
    const email = 'admin_test@test.com';
    const password = 'password123';

    console.log(`Logging in as ${email}...`);

    try {
        // 1. Login to get token
        const loginRes = await axios.post('http://localhost:3000/api/v1/auth/login', {
            identifier: email,
            password: password
        });

        const token = loginRes.data.token;
        if (!token) {
            console.error('Failed to get token');
            return;
        }
        console.log('✅ Login successful. Token obtained.');

        // 2. Create Competition
        const competitionData = {
            name: 'Torneio Teste 2026',
            start_date: '2026-01-01',
            end_date: '2026-02-01',
            status: 'DRAFT' // or Aberta if mapped
        };

        console.log('Creating competition...');
        const compRes = await axios.post('http://localhost:3000/api/v1/competitions', competitionData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log('✅ Competition created:', compRes.data);
        console.log(`COMPETITION_ID: ${compRes.data.id}`);

    } catch (error: any) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

createCompetition();
