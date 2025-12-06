"use strict";
const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
// Load .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
async function reloadSchema() {
    console.log('Connecting to database to reload schema cache...');
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('DATABASE_URL not found in environment variables');
        process.exit(1);
    }
    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false } // Required for Supabase
    });
    try {
        await client.connect();
        console.log('Connected. Executing NOTIFY pgrst, "reload config"...');
        await client.query("NOTIFY pgrst, 'reload config';");
        console.log('✅ Schema cache reload triggered.');
    }
    catch (err) {
        console.error('Error reloading schema:', err);
    }
    finally {
        await client.end();
    }
}
reloadSchema();
