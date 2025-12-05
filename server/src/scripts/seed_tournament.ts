
import { supabaseAdmin } from '../config/supabase';

async function seedTournament(competitionId: string) {
    if (!competitionId) {
        console.error('Please provide a competition ID');
        process.exit(1);
    }

    console.log(`Seeding tournament ${competitionId} with 10 teams and 60 athletes...`);

    try {
        // Step 1: Create Manager User for Organization
        console.log('1. Creating manager user...');
        const managerEmail = `manager_${Date.now()}@test.com`;
        const { data: managerAuth, error: managerAuthError } = await supabaseAdmin!.auth.admin.createUser({
            email: managerEmail,
            password: 'password123',
            email_confirm: true,
            user_metadata: { full_name: 'Tournament Manager' }
        });

        if (managerAuthError || !managerAuth.user) {
            console.error('Error creating manager:', managerAuthError);
            process.exit(1);
        }

        const managerId = managerAuth.user.id;

        // Insert manager into User table
        await supabaseAdmin!.rpc('exec_sql', {
            sql: `INSERT INTO "User" (id, email, full_name, role, cpf) VALUES ('${managerId}', '${managerEmail}', 'Tournament Manager', 'ADMIN', '99999999999') ON CONFLICT (id) DO NOTHING;`
        });

        console.log(`✅ Manager created: ${managerId}`);

        // Step 2: Create Organization
        console.log('2. Creating organization...');
        const cnpj = Date.now().toString().padStart(14, '0');
        const orgName = `Tournament Org ${Date.now()}`;

        const { error: orgError } = await supabaseAdmin!.rpc('exec_sql', {
            sql: `INSERT INTO "Organization" (name_official, cnpj, manager_user_id) VALUES ('${orgName}', '${cnpj}', '${managerId}');`
        });

        if (orgError) {
            console.error('Error inserting organization:', orgError);
        }

        // Wait for persistence
        await new Promise(resolve => setTimeout(resolve, 500));

        // Get org ID via SELECT
        const { data: orgs, error: orgSelectError } = await supabaseAdmin!
            .from('Organization')
            .select('id')
            .eq('cnpj', cnpj)
            .limit(1);

        if (orgSelectError) {
            console.error('Error selecting organization:', orgSelectError);
        }

        const orgId = orgs?.[0]?.id;

        if (!orgId) {
            console.error('Failed to get organization ID. Orgs data:', orgs);
            process.exit(1);
        }

        console.log(`✅ Organization created: ${orgId}`);

        // Step 3: Create Championship
        console.log('3. Creating championship...');
        const champName = `Tournament Championship ${Date.now()}`;

        await supabaseAdmin!.rpc('exec_sql', {
            sql: `INSERT INTO "Championship" (name, type, status) VALUES ('${champName}', 'LEAGUE', 'ACTIVE');`
        });

        await new Promise(resolve => setTimeout(resolve, 500));

        const { data: champs } = await supabaseAdmin!.from('Championship').select('id').eq('name', champName).limit(1);
        const champId = champs?.[0]?.id;

        if (!champId) {
            console.error('Failed to create championship');
            process.exit(1);
        }

        console.log(`✅ Championship created: ${champId}`);

        // Step 4: Create 10 Teams
        console.log('4. Creating 10 teams...');
        for (let i = 1; i <= 10; i++) {
            await supabaseAdmin!.rpc('exec_sql', {
                sql: `INSERT INTO "Team" (organization_id, championship_id, category) VALUES (${orgId}, ${champId}, 'Time ${i}');`
            });
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get created teams
        const { data: createdTeams } = await supabaseAdmin!
            .from('Team')
            .select('id, category')
            .eq('organization_id', orgId)
            .eq('championship_id', champId)
            .order('id', { ascending: false })
            .limit(10);

        if (!createdTeams || createdTeams.length === 0) {
            console.error('Failed to create teams');
            process.exit(1);
        }

        console.log(`✅ Created ${createdTeams.length} teams`);

        // Step 5: Register Teams to Competition
        console.log('5. Registering teams to competition...');
        for (const team of createdTeams) {
            await supabaseAdmin!.rpc('exec_sql', {
                sql: `INSERT INTO "TeamRegistration" (competition_id, team_id, status) VALUES (${competitionId}, ${team.id}, 'APPROVED');`
            });
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get created registrations
        const { data: createdRegistrations } = await supabaseAdmin!
            .from('TeamRegistration')
            .select('id, team_id')
            .eq('competition_id', competitionId)
            .eq('status', 'APPROVED')
            .order('id', { ascending: false })
            .limit(10);

        if (!createdRegistrations || createdRegistrations.length === 0) {
            console.error('Failed to create registrations');
            process.exit(1);
        }

        console.log(`✅ Registered ${createdRegistrations.length} teams to competition`);

        // Step 6: Create 60 Athletes (6 per team)
        console.log('6. Creating 60 athletes...');
        let athleteCount = 0;

        for (const reg of createdRegistrations) {
            console.log(`   Adding athletes to team ${reg.team_id}...`);

            for (let j = 1; j <= 6; j++) {
                const email = `athlete_${reg.team_id}_${j}_${Date.now()}@test.com`;

                // Create Auth user
                const { data: athleteAuth, error: athleteAuthError } = await supabaseAdmin!.auth.admin.createUser({
                    email,
                    password: 'password123',
                    email_confirm: true,
                    user_metadata: { full_name: `Athlete ${j} Team ${reg.team_id}` }
                });

                if (athleteAuthError || !athleteAuth.user) {
                    console.error(`   Error creating athlete ${j}:`, athleteAuthError?.message);
                    continue;
                }

                const athleteId = athleteAuth.user.id;

                // Insert into User table
                await supabaseAdmin!.rpc('exec_sql', {
                    sql: `INSERT INTO "User" (id, email, full_name, role, cpf) VALUES ('${athleteId}', '${email}', 'Athlete ${j} Team ${reg.team_id}', 'ATHLETE', '${Date.now().toString().slice(-11)}') ON CONFLICT (id) DO NOTHING;`
                });

                // Create AthleteInscription
                await supabaseAdmin!.rpc('exec_sql', {
                    sql: `INSERT INTO "AthleteInscription" (team_registration_id, user_id, status) VALUES (${reg.id}, '${athleteId}', 'VALID');`
                });

                athleteCount++;

                // Small delay to avoid overwhelming Auth API
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }

        console.log(`✅ Created ${athleteCount} athletes`);
        console.log('\n🎉 Seeding complete!');
        console.log(`   - Organization: ${orgId}`);
        console.log(`   - Championship: ${champId}`);
        console.log(`   - Teams: ${createdTeams.length}`);
        console.log(`   - Registrations: ${createdRegistrations.length}`);
        console.log(`   - Athletes: ${athleteCount}`);

    } catch (err) {
        console.error('❌ Fatal error during seeding:', err);
        process.exit(1);
    }
}

const competitionId = process.argv[2];
seedTournament(competitionId);
