const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
let envContent = fs.readFileSync(envPath, 'utf8');

// Regex to capture password between postgres: and @
// Handles postgres://postgres:PASSWORD@host or postgres://postgres.ref:PASSWORD@host
const match = envContent.match(/DATABASE_URL=postgres(?:ql)?:\/\/([^:]+):([^@]+)@/);

if (match) {
    const user = match[1];
    const password = match[2];

    console.log('Found user:', user);
    // We don't print password

    // Construct new URL
    // User must be postgres.deqtlplceaphtindxxtu
    const newUrl = `DATABASE_URL=postgres://postgres.deqtlplceaphtindxxtu:${password}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`;

    const newEnvContent = envContent.replace(/DATABASE_URL=.+/, newUrl);
    fs.writeFileSync(envPath, newEnvContent);
    console.log('Updated .env with new DATABASE_URL');
} else {
    console.log('Could not parse DATABASE_URL');
}
