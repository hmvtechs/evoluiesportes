"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../config/supabase");
async function testExecSql() {
    console.log('Testing exec_sql function...\n');
    // Test 1: Simple SELECT
    console.log('1. Testing SELECT via exec_sql:');
    const { data: selectData, error: selectError } = await supabase_1.supabaseAdmin.rpc('exec_sql', {
        sql: 'SELECT COUNT(*) as count FROM "Team";'
    });
    console.log('Result:', selectData);
    console.log('Error:', selectError);
    // Test 2: Simple INSERT
    console.log('\n2. Testing INSERT via exec_sql:');
    const testName = `Test Team ${Date.now()}`;
    const { data: insertData, error: insertError } = await supabase_1.supabaseAdmin.rpc('exec_sql', {
        sql: `INSERT INTO "Team" (name) VALUES ('${testName}');`
    });
    console.log('Result:', insertData);
    console.log('Error:', insertError);
    // Test 3: SELECT via PostgREST (regular API)
    console.log('\n3. Testing SELECT via PostgREST:');
    const { data: postgrestData, error: postgrestError } = await supabase_1.supabaseAdmin
        .from('Team')
        .select('id, name')
        .limit(5);
    console.log('Result:', postgrestData);
    console.log('Error:', postgrestError);
}
testExecSql();
