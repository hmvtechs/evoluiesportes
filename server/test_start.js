console.log('Starting test...');
try {
    require('dotenv').config();
    console.log('Dotenv loaded');
    const { PrismaClient } = require('@prisma/client');
    console.log('PrismaClient imported');
    const prisma = new PrismaClient();
    console.log('PrismaClient instantiated');
} catch (e) {
    console.error('Error:', e);
}
