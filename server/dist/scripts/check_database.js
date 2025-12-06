"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../config/supabase");
async function checkDatabase() {
    console.log('Checking database schema...\n');
    // Test 1: Try to select from Organization
    console.log('1. Checking Organization table:');
    const { data: orgs, error: orgError } = await supabase_1.supabaseAdmin
        .from('Organization')
        .select('*')
        .limit(1);
    console.log('Result:', orgs);
    console.log('Error:', orgError);
    // Test 2: Try to insert via exec_sql and immediately select
    console.log('\n2. Testing Organization INSERT and SELECT:');
    const testCnpj = `9999${Date.now()}`;
    const { data: insertResult, error: insertError } = await supabase_1.supabaseAdmin.rpc('exec_sql', {
        sql: `INSERT INTO "Organization" (name_official, cnpj, manager_user_id) VALUES ('Test Org', '${testCnpj}', '1b251b40-6406-4de1-af28-550c2fcd1205');`
    });
    console.log('Insert result:', insertResult);
    console.log('Insert error:', insertError);
    // Wait a bit
    await new Promise(r => setTimeout(r, 1000));
    const { data: selectResult, error: selectError } = await supabase_1.supabaseAdmin
        .from('Organization')
        .select('*')
        .eq('cnpj', testCnpj);
    console.log('Select result:', selectResult);
    console.log('Select error:', selectError);
    // Test 3: List all Organizations
    console.log('\n3. Listing all Organizations:');
    const { data: allOrgs, error: allOrgsError } = await supabase_1.supabaseAdmin
        .from('Organization')
        .select('id, name_official, cnpj')
        .limit(10);
    console.log('All orgs:', allOrgs);
    console.log('Error:', allOrgsError);
}
checkDatabase();
