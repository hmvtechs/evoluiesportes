"use strict";
const dotenv = require('dotenv');
const path = require('path');
// Load .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
    // Mask password
    const masked = dbUrl.replace(/:([^:@]+)@/, ':****@');
    console.log('DATABASE_URL found:', masked);
    // Check if it has special chars in password
    const match = dbUrl.match(/:([^:@]+)@/);
    if (match) {
        const password = match[1];
        console.log('Password length:', password.length);
        console.log('Password has special chars:', /[^a-zA-Z0-9]/.test(password));
        // Print first and last char to verify if it's wrapped in quotes
        console.log('First char:', password[0]);
        console.log('Last char:', password[password.length - 1]);
    }
}
else {
    console.log('DATABASE_URL NOT found');
}
const directUrl = process.env.DIRECT_URL;
if (directUrl) {
    const masked = directUrl.replace(/:([^:@]+)@/, ':****@');
    console.log('DIRECT_URL found:', masked);
}
else {
    console.log('DIRECT_URL NOT found');
}
