import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file in server root
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Conectando ao banco de dados...');

        // Test connection first
        await prisma.$connect();
        console.log('Conexão bem-sucedida!');

        // Find existing admin
        console.log('Procurando admin...');
        const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
        if (!admin) {
            console.error('No admin user found. Seed aborted.');
            return;
        }
        console.log('Admin encontrado:', admin.email);

        // Create a default organization
        console.log('Criando organização...');
        const organization = await prisma.organization.create({
            data: {
                name_official: 'Clube Default',
                cnpj: '00.000.000/0000-00',
                manager_user_id: admin.id,
            },
        });

        // Create a default championship
        console.log('Criando campeonato...');
        const championship = await prisma.championship.create({
            data: {
                name: 'Campeonato Padrão',
                status: 'OPEN',
                type: 'LEAGUE',
            },
        });

        // Helper to generate a random CPF (placeholder)
        const randomCpf = () => {
            const nums = Array.from({ length: 11 }, () => Math.floor(Math.random() * 10)).join('');
            return nums;
        };

        // Password hash (same for all users for simplicity)
        const passwordHash = await bcrypt.hash('senha123', 10);

        // Create 100 athletes (users with role USER and athlete profile)
        console.log('Criando 100 atletas...');
        for (let i = 1; i <= 100; i++) {
            const user = await prisma.user.create({
                data: {
                    cpf: randomCpf(),
                    email: `user${i}@example.com`,
                    password_hash: passwordHash,
                    full_name: `Atleta ${i}`,
                    phone: `+55${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                    sex: i % 2 === 0 ? 'M' : 'F',
                    birth_date: new Date(1990, 0, 1),
                    role: 'USER',
                    rf_status: 'VALID',
                    is_obfuscated: false,
                    city: 'São Paulo',
                    state: 'SP',
                },
            });

            await prisma.athleteProfile.create({
                data: {
                    user_id: user.id,
                    document_url: 'https://example.com/doc.pdf',
                    photo_url: 'https://example.com/photo.jpg',
                    status: 'VALID',
                },
            });

            if (i % 10 === 0) {
                console.log(`  ${i} atletas criados...`);
            }
        }

        // Create 20 teams
        console.log('Criando 20 times...');
        for (let i = 1; i <= 20; i++) {
            await prisma.team.create({
                data: {
                    organization_id: organization.id,
                    championship_id: championship.id,
                    category: 'Senior',
                },
            });
        }

        // Create 10 referees
        console.log('Criando 10 árbitros...');
        for (let i = 1; i <= 10; i++) {
            const user = await prisma.user.create({
                data: {
                    cpf: randomCpf(),
                    email: `referee${i}@example.com`,
                    password_hash: passwordHash,
                    full_name: `Árbitro ${i}`,
                    phone: `+55${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                    sex: i % 2 === 0 ? 'M' : 'F',
                    birth_date: new Date(1985, 0, 1),
                    role: 'STAFF',
                    rf_status: 'VALID',
                    is_obfuscated: false,
                    city: 'Rio de Janeiro',
                    state: 'RJ',
                },
            });

            await prisma.referee.create({
                data: {
                    user_id: user.id,
                    category: 'Football',
                    functions: JSON.stringify(['MATCH_OFFICIAL']),
                },
            });
        }

        // Create 3 staff members
        console.log('Criando 3 staff members...');
        for (let i = 1; i <= 3; i++) {
            await prisma.user.create({
                data: {
                    cpf: randomCpf(),
                    email: `staff${i}@example.com`,
                    password_hash: passwordHash,
                    full_name: `Staff ${i}`,
                    phone: `+55${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                    sex: i % 2 === 0 ? 'M' : 'F',
                    birth_date: new Date(1992, 0, 1),
                    role: 'STAFF',
                    rf_status: 'VALID',
                    is_obfuscated: false,
                    city: 'Belo Horizonte',
                    state: 'MG',
                },
            });
        }

        console.log('✅ Seed data inserted successfully!');
    } catch (error) {
        console.error('❌ Erro detalhado:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error('Erro fatal:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
