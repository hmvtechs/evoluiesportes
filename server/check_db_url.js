const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const dbUrlLine = envContent.split('\n').find(line => line.startsWith('DATABASE_URL='));
if (dbUrlLine) {
    const url = dbUrlLine.split('=')[1].trim();
    if (url.includes('?')) {
        console.log('Query Params:', url.split('?')[1]);
    } else {
        console.log('No query params found.');
    }
} else {
    console.log('DATABASE_URL not found in .env');
}
