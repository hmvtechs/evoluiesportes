"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../config/supabase");
async function seedTournamentSimplified(competitionId) {
    if (!competitionId) {
        console.error('Please provide a competition ID');
        process.exit(1);
    }
    console.log(`[SIMPLIFIED SEEDING] Creating 60 athlete users for competition ${competitionId}...`);
    console.log('Note: This version skips Team creation due to database constraints.');
    console.log('Athletes will be created as users but not linked to teams.\n');
    try {
        let athleteCount = 0;
        // Create 60 athletes
        for (let i = 1; i <= 60; i++) {
            const teamNum = Math.ceil(i / 6); // 6 athletes per team (10 teams)
            const athleteNum = ((i - 1) % 6) + 1;
            const email = `athlete_t${teamNum}_${athleteNum}_${Date.now()}${i}@test.com`;
            console.log(`Creating athlete ${i}/60 (Team ${teamNum}, Athlete ${athleteNum})...`);
            // Create Auth user
            const { data: athleteAuth, error: athleteAuthError } = await supabase_1.supabaseAdmin.auth.admin.createUser({
                email,
                password: 'password123',
                email_confirm: true,
                user_metadata: {
                    full_name: `Athlete ${athleteNum} Team ${teamNum}`,
                    team_number: teamNum,
                    athlete_number: athleteNum
                }
            });
            if (athleteAuthError) {
                console.error(`   ❌ Error creating athlete ${i}:`, athleteAuthError.message);
                continue;
            }
            if (!athleteAuth.user) {
                console.error(`   ❌ No user returned for athlete ${i}`);
                continue;
            }
            const athleteId = athleteAuth.user.id;
            // Insert into User table via exec_sql
            const { error: userInsertError } = await supabase_1.supabaseAdmin.rpc('exec_sql', {
                sql: `INSERT INTO "User" (id, email, full_name, role, cpf) VALUES ('${athleteId}', '${email}', 'Athlete ${athleteNum} Team ${teamNum}', 'ATHLETE', '${Date.now().toString().slice(-11)}') ON CONFLICT (id) DO NOTHING;`
            });
            if (userInsertError) {
                console.error(`   ⚠️  Warning: User table insert failed for athlete ${i}:`, userInsertError.message);
            }
            athleteCount++;
            if (i % 6 === 0) {
                console.log(`   ✅ Completed team ${teamNum} (${athleteCount} total athletes)\n`);
            }
            // Delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        console.log('\n🎉 Seeding complete!');
        console.log(`   - Athletes created: ${athleteCount}/60`);
        console.log(`   - Organized into 10 virtual teams (6 athletes each)`);
        console.log(`   - All athletes can login with password: password123`);
        console.log('\n⚠️  NOTE: Teams, TeamRegistrations, and AthleteInscriptions were not created');
        console.log('   due to database schema constraints (Organization/Championship required).');
        console.log('   To complete the setup, you may need to:');
        console.log('   1. Manually create Organizations and Championships via UI/SQL');
        console.log('   2. Create Teams linked to those entities');
        console.log('   3. Create TeamRegistrations for the competition');
        console.log('   4. Link athletes to teams via AthleteInscription');
    }
    catch (err) {
        console.error('❌ Fatal error during seeding:', err);
        process.exit(1);
    }
}
const competitionId = process.argv[2];
seedTournamentSimplified(competitionId);
