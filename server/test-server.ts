// Test if the listCompetitions endpoint works with a simple mock
import express from 'express';
import cors from 'cors';
import { supabase } from './src/config/supabase';

const app = express();
app.use(cors());
app.use(express.json());

// Simplified listCompetitions for testing
app.get('/test/competitions', async (req, res) => {
    console.log('📥 Request received at /test/competitions');

    try {
        console.log('🔍 Querying Supabase...');
        const { data, error } = await supabase
            .from('Competition')
            .select('id, name, status, modality:Modality(id, name)')
            .limit(10);

        if (error) {
            console.error('❌ Supabase error:', error);
            return res.status(500).json({ error: error.message });
        }

        console.log(`✅ Got ${data?.length || 0} competitions`);
        console.log('📤 Sending response...');

        res.json({
            success: true,
            count: data?.length || 0,
            data: data
        });

        console.log('✅ Response sent successfully');
    } catch (e: any) {
        console.error('❌ Exception:', e.message);
        res.status(500).json({ error: e.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`\n🚀 Test server running on http://localhost:${PORT}`);
    console.log(`📍 Test endpoint: http://localhost:${PORT}/test/competitions\n`);
});
