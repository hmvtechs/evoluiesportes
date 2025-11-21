const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const dbUrlLine = envContent.split('\n').find(line => line.startsWith('DATABASE_URL='));
if (dbUrlLine) {
    const url = dbUrlLine.split('=')[1].trim();
    // postgres://user:pass@host...
    const match = url.match(/postgres:\/\/([^:]+):/);
    if (match) {
        console.log('Username:', match[1]);
    } else {
        console.log('Could not parse username');
    }
}
