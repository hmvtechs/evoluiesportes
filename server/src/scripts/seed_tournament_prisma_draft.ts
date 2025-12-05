
import { supabaseAdmin } from '../config/supabase';
import { PrismaClient } from '@prisma/client';
const dotenv = require('dotenv');
const path = require('path');

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function seedTournament(competitionId: string) {
    if (!competitionId) {
        console.error('Please provide a competition ID');
        process.exit(1);
    }

    console.log(`Seeding tournament ${competitionId} with 10 teams and 60 athletes...`);

    const teams = [];
    for (let i = 1; i <= 10; i++) {
        teams.push({
            name: `Time ${i}`,
            logo_url: `https://via.placeholder.com/150?text=Time+${i}`,
            coach_name: `Técnico ${i}`,
            contact_email: `time${i}@test.com`,
            contact_phone: `1199999000${i}`,
            // Prisma needs relations or IDs usually, but we can insert scalars
            organization_id: 1, // Assuming organization 1 exists or is not required? Schema says it IS required.
            // Wait, schema says: organization_id Int
            // And organization Organization @relation...
            // So we need an organization.
            // I'll check if organization 1 exists or create it.
            championship_id: 1, // Also required by schema?
            // Schema: championship_id Int
            // category String
        });
    }

    // Wait, the schema I read earlier has:
    // model Team {
    //   id Int @id @default(autoincrement())
    //   organization_id Int
    //   championship_id Int
    //   category String
    //   ...
    // }
    // But my `seed_tournament.ts` was NOT providing organization_id or championship_id!
    // And `supabaseAdmin` insert failed with "Could not find column 'name'".
    // Maybe it failed because I was violating constraints but the error message was misleading?
    // No, "Could not find column" is schema cache.
    // BUT, if I use Prisma, I MUST provide these fields if they are required.
    // Let's check if they are required in the schema I read.
    // Yes: `organization_id Int`, `championship_id Int`, `category String`. No `?` means required.
    // So my previous inserts were doomed anyway!
    // I need to create an Organization and Championship first, or find existing ones.

    try {
        // 0. Ensure Organization and Championship exist
        console.log('Ensuring Organization and Championship exist...');

        // Try to find or create Organization
        let org = await prisma.organization.findFirst();
        if (!org) {
            // Create dummy user for manager
            const { data: authUser } = await supabaseAdmin!.auth.admin.createUser({
                email: `manager_${Date.now()}@test.com`,
                password: 'password123',
                email_confirm: true
            });

            if (authUser.user) {
                await prisma.user.create({
                    data: {
                        id: authUser.user.id,
                        email: authUser.user.email!,
                        full_name: 'Manager Default',
                        cpf: `999999999${Date.now().toString().slice(-2)}`,
                        role: 'ADMIN'
                    }
                });

                org = await prisma.organization.create({
                    data: {
                        name_official: 'Default Org',
                        cnpj: `00000000000${Date.now().toString().slice(-3)}`,
                        manager_user_id: authUser.user.id
                    }
                });
            }
        }

        // Try to find or create Championship
        let champ = await prisma.championship.findFirst();
        if (!champ) {
            champ = await prisma.championship.create({
                data: {
                    name: 'Default Championship',
                    type: 'LEAGUE'
                }
            });
        }

        if (!org || !champ) {
            throw new Error('Failed to setup Org/Champ dependencies');
        }

        // 1. Create Teams
        console.log('Creating teams...');
        const createdTeams = [];
        for (let i = 1; i <= 10; i++) {
            const team = await prisma.team.create({
                data: {
                    name: `Time ${i}`,
                    logo_url: `https://via.placeholder.com/150?text=Time+${i}`,
                    coach_name: `Técnico ${i}`, // Wait, schema I read DID NOT have coach_name!
                    // Let's re-read schema.
                    // model Team { ... organization_id, championship_id, category ... }
                    // It did NOT have coach_name, contact_email, contact_phone in the file I read (Step 1969).
                    // That explains why PostgREST failed with "Could not find column"!
                    // The migration for these columns must have been applied to the DB but NOT updated in schema.prisma?
                    // OR, the migration was NEVER applied, and that's why PostgREST failed?
                    // "Could not find column ... in schema cache" usually means it's not in the DB schema that PostgREST knows.
                    // If I try to insert via Prisma with fields that are NOT in schema.prisma, TS will error.
                    // I need to check if `coach_name` is in `schema.prisma`.
                    // I'll check the file content from Step 1969 again.

                    // Lines 101-115:
                    // model Team {
                    //   id Int @id @default(autoincrement())
                    //   organization_id Int
                    //   championship_id Int
                    //   category String
                    //   home_matches ...
                    //   away_matches ...
                    //   registrations ...
                    //   matches_as_team_a ...
                    //   matches_as_team_b ...
                    // }

                    // THERE IS NO coach_name, contact_email, contact_phone, logo_url!
                    // So my `seed_tournament.ts` was trying to insert columns that DO NOT EXIST in the Prisma schema, and likely DO NOT EXIST in the database either!
                    // The `check_columns.ts` passed?
                    // "✅ coach_name column exists and is accessible."
                    // How?
                    // Maybe I am connecting to a DIFFERENT database?
                    // Or `check_columns.ts` used `supabaseAdmin` which talks to PostgREST.
                    // If PostgREST allows selecting it, it must exist.
                    // But `schema.prisma` is out of sync.
                    // If I use Prisma, I can only use fields in `schema.prisma`.
                    // If I want to use the new fields, I must update `schema.prisma` and run `prisma generate`.
                    // BUT, if the columns exist in DB, I can `db pull`.
                    // I will try to run `npx prisma db pull` to update the schema from the DB.
                    // This will confirm if the columns exist.

                    organization_id: org.id,
                    championship_id: champ.id,
                    category: 'Adulto'
                }
            });
            createdTeams.push(team);
        }

        console.log(`✅ Created ${createdTeams.length} teams.`);

        // 2. Register Teams
        // ...

    } catch (err) {
        console.error('Error seeding:', err);
    } finally {
        await prisma.$disconnect();
    }
}

// seedTournament(competitionId);
