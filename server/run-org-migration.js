const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function runMigration() {
    console.log('🔧 Running Organization migration...');

    try {
        // Step 1: Make CNPJ nullable
        console.log('Step 1: Making CNPJ optional...');
        const { error: alterError } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE "Organization" ALTER COLUMN "cnpj" DROP NOT NULL;'
        });

        if (alterError && !alterError.message.includes('does not exist')) {
            console.error('Warning on alter:', alterError.message);
        } else {
            console.log('✅ CNPJ is now optional');
        }

        // Step 2: Add new columns
        console.log('\nStep 2: Adding contact fields...');

        const columns = [
            'team_manager_name',
            'team_manager_contact',
            'coach_name',
            'coach_contact'
        ];

        for (const col of columns) {
            const { error } = await supabase.rpc('exec_sql', {
                sql: `ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "${col}" TEXT;`
            });

            if (error && !error.message.includes('already exists')) {
                console.error(`❌ Failed to add ${col}:`, error.message);
            } else {
                console.log(`✅ Added column: ${col}`);
            }
        }

        // Verify
        console.log('\n📊 Verifying columns...');
        const { data, error: verifyError } = await supabase
            .from('Organization')
            .select('*')
            .limit(1);

        if (verifyError) {
            console.error('❌ Verification failed:', verifyError);
        } else {
            console.log('✅ Migration completed successfully!');
            if (data && data[0]) {
                console.log('Available columns:', Object.keys(data[0]));
            }
        }

    } catch (error) {
        console.error('🔴 Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
