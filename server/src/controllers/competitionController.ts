import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import { generateRoundRobin, generateElimination, assignDatesAndVenues, ScheduledMatch } from '../utils/scheduleGenerator';

export const createCompetition = async (req: Request, res: Response) => {
    const { name, nickname, start_date, end_date, modality_id, gender, min_athletes, max_athletes, min_age, max_age, phases, venues, competition_type } = req.body;

    try {
        // 1. Create Competition
        const { data: competition, error: compError } = await supabase
            .from('Competition')
            .insert([{
                name,
                nickname,
                start_date: start_date ? new Date(start_date).toISOString() : null,
                end_date: end_date ? new Date(end_date).toISOString() : null,
                modality_id: Number(modality_id),
                gender,
                min_athletes: min_athletes ? Number(min_athletes) : null,
                max_athletes: max_athletes ? Number(max_athletes) : null,
                min_age: min_age ? Number(min_age) : null,
                max_age: max_age ? Number(max_age) : null,
                competition_type: competition_type || 'ROUND_ROBIN',
                status: 'DRAFT',
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (compError) throw compError;
        if (!competition) throw new Error('Failed to create competition');

        // 2. Create Phases and Groups (if provided)
        if (phases && phases.length > 0) {
            for (let i = 0; i < phases.length; i++) {
                const phaseData = phases[i];
                const { data: phase, error: phaseError } = await supabase
                    .from('Phase')
                    .insert([{
                        competition_id: competition.id,
                        name: phaseData.name,
                        type: phaseData.type,
                        order: i + 1
                    }])
                    .select()
                    .single();

                if (phaseError) continue;

                if (phaseData.groups && phaseData.groups.length > 0) {
                    const groupsToInsert = phaseData.groups.map((group: any) => ({
                        phase_id: phase.id,
                        name: group.name
                    }));
                    await supabase.from('Group').insert(groupsToInsert);
                }
            }
        }

        // 3. Assign Venues (Pool)
        if (venues && venues.length > 0) {
            const venueInserts = venues.map((v: any) => ({
                competition_id: competition.id,
                venue_id: v.id,
                priority: v.priority || 0,
                is_primary: v.is_primary || false
            }));
            await supabase.from('CompetitionVenue').insert(venueInserts);
        }

        res.json(competition);

    } catch (error: any) {
        console.error('Create Competition Error:', error.message);
        res.status(500).json({ error: 'Failed to create competition: ' + error.message });
    }
};

export const listCompetitions = async (req: Request, res: Response) => {
    console.log('🔵 [listCompetitions] Request received');
    try {
        console.log('🟢 [listCompetitions] Querying Supabase...');

        // Use supabaseAdmin if available to bypass RLS
        const client = supabaseAdmin || supabase;

        const { data: competitions, error } = await client
            .from('Competition')
            .select('id, name, status, nickname, start_date, end_date, gender, modality:Modality(id, name)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('🔴 [listCompetitions] Supabase error:', error);
            throw error;
        }

        console.log(`✅ [listCompetitions] Got ${competitions?.length || 0} competitions`);

        // Buscar contagens de registrations e matches para cada competição
        const result = await Promise.all((competitions || []).map(async (comp) => {
            try {
                // Contar registrations
                const { count: regCount } = await client
                    .from('TeamRegistration')
                    .select('*', { count: 'exact', head: true })
                    .eq('competition_id', comp.id);

                // Contar matches
                const { count: matchCount } = await client
                    .from('GameMatch')
                    .select('*', { count: 'exact', head: true })
                    .eq('competition_id', comp.id);

                return {
                    ...comp,
                    _count: {
                        registrations: regCount || 0,
                        matches: matchCount || 0
                    }
                };
            } catch (countError) {
                console.error(`Error counting for comp ${comp.id}:`, countError);
                return {
                    ...comp,
                    _count: { registrations: 0, matches: 0 }
                };
            }
        }));

        console.log('📤 [listCompetitions] Sending response...');
        res.status(200).json(result);
        console.log(`✅ [listCompetitions] Sent ${result.length} competitions`);
    } catch (error: any) {
        console.error('🔴 [listCompetitions] FATAL ERROR:', error.message);
        res.status(500).json({ error: 'Failed to list competitions' });
    }
};


export const getCompetition = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // Use supabaseAdmin to bypass RLS for fetching registrations
        const client = supabaseAdmin || supabase;

        const { data: competition, error } = await client
            .from('Competition')
            .select(`
                *,
                modality:Modality(*),
                phases:Phase(
                    *,
                    groups:Group(*)
                ),
                registrations:TeamRegistration(
                    *,
                    team:Team(
                        *,
                        organization:Organization(*)
                    ),
                    group:Group(*)
                ),
                venues:CompetitionVenue(
                    *,
                    venue:Venue(*)
                ),
                matches:GameMatch(
                    *,
                    team_a:Team!GameMatch_team_a_id_fkey(id, organization:Organization(name_official)),
                    team_b:Team!GameMatch_team_b_id_fkey(id, organization:Organization(name_official)),
                    venue:Venue(id, name),
                    group:Group(id, name)
                )
            `)
            .eq('id', Number(id))
            .single();

        if (error) throw error;
        if (!competition) return res.status(404).json({ error: 'Competition not found' });

        res.json(competition);
    } catch (error: any) {
        console.error('Get Competition Error:', error.message);
        res.status(500).json({ error: 'Failed to get competition' });
    }
};

export const deleteCompetition = async (req: Request, res: Response) => {
    const { id } = req.params;

    console.log(`🗑️  [deleteCompetition] Deleting competition ID: ${id}`);

    try {
        // Use supabaseAdmin to bypass RLS
        const client = supabaseAdmin || supabase;

        // First check if competition exists
        const { data: existing, error: checkError } = await client
            .from('Competition')
            .select('id, name')
            .eq('id', Number(id))
            .single();

        if (checkError || !existing) {
            console.error('❌ [deleteCompetition] Competition not found:', id);
            return res.status(404).json({ error: 'Competition not found' });
        }

        console.log(`🔍 [deleteCompetition] Found competition: ${existing.name}`);

        // Delete the competition (cascade deletes will handle related records)
        const { error: deleteError } = await client
            .from('Competition')
            .delete()
            .eq('id', Number(id));

        if (deleteError) {
            console.error('❌ [deleteCompetition] Delete failed:', deleteError);
            throw deleteError;
        }

        console.log(`✅ [deleteCompetition] Successfully deleted competition: ${existing.name} (ID: ${id})`);

        res.json({
            message: 'Competition deleted successfully',
            id: Number(id),
            name: existing.name
        });
    } catch (error: any) {
        console.error('🔴 [deleteCompetition] Fatal error:', error.message);
        res.status(500).json({ error: 'Failed to delete competition' });
    }
};

export const uploadRegulation = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { url } = req.body;

    try {
        const { error } = await supabase
            .from('Competition')
            .update({ regulation_pdf_url: url })
            .eq('id', Number(id));

        if (error) throw error;
        res.json({ message: 'Regulation uploaded', url });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to upload regulation' });
    }
};

export const generateFixture = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { venueAssignmentMode } = req.body;

    try {
        // 1. Fetch Competition Data
        const { data: competition, error: compError } = await supabase
            .from('Competition')
            .select(`
                *,
                registrations:TeamRegistration(team_id, group_id),
                venues:CompetitionVenue(venue_id, priority),
                phases:Phase(*, groups:Group(*))
            `)
            .eq('id', Number(id))
            .single();

        if (compError || !competition) throw new Error('Competition not found');

        if (compError || !competition) throw new Error('Competition not found');

        // 2. Determine Match Generation Strategy
        let matches: ScheduledMatch[] = [];

        // Check if there are groups in the first phase
        const groupPhase = competition.phases?.find((p: any) => p.type === 'GROUP' || p.groups?.length > 0);

        if (groupPhase && groupPhase.groups?.length > 0) {
            console.log('🗓️ [generateFixture] Generating matches for GROUP phase...');

            // Loop through groups and generate Round Robin for each
            for (const group of groupPhase.groups) {
                // Filter teams belonging to this group
                const groupTeams = competition.registrations
                    .filter((r: any) => r.group_id === group.id)
                    .map((r: any) => r.team_id);

                if (groupTeams.length >= 2) {
                    const groupMatches = generateRoundRobin(groupTeams);
                    // Add group_id to matches
                    groupMatches.forEach(m => {
                        m.group_id = group.id;
                        m.phase_id = groupPhase.id;
                    });
                    matches.push(...groupMatches);
                } else {
                    console.warn(`⚠️ Group ${group.name} has fewer than 2 teams. Skipping.`);
                }
            }
        }
        // Fallback to standard generation if no groups defined
        else if (competition.competition_type === 'ROUND_ROBIN') {
            const teams = competition.registrations.map((r: any) => r.team_id);
            matches = generateRoundRobin(teams);
        } else if (competition.competition_type === 'SINGLE_ELIMINATION') {
            const teams = competition.registrations.map((r: any) => r.team_id);
            matches = generateElimination(teams);
        } else {
            // Default fallback
            const teams = competition.registrations.map((r: any) => r.team_id);
            matches = generateRoundRobin(teams);
        }

        // 3. Assign Dates and Venues
        const venues = competition.venues.map((v: any) => ({ id: v.venue_id, priority: v.priority }));

        const scheduledMatches = assignDatesAndVenues(matches, {
            startDate: new Date(competition.start_date || new Date()),
            endDate: new Date(competition.end_date || new Date(new Date().setDate(new Date().getDate() + 30))),
            matchesPerDay: 4,
            matchDurationMinutes: 90,
            restTimeMinutes: 30,
            venueAssignmentMode: venueAssignmentMode || 'MANUAL',
            venues: venues
        });

        // 4. Save to Database
        await supabase.from('GameMatch').delete().eq('competition_id', competition.id);

        const matchInserts = scheduledMatches.map(m => ({
            competition_id: competition.id,
            round_number: m.round_number,
            match_number: m.match_number,
            team_a_id: m.team_a_id,
            team_b_id: m.team_b_id,
            scheduled_date: m.scheduled_date ? m.scheduled_date.toISOString() : null,
            venue_id: m.venue_id,
            status: 'SCHEDULED',
            group_id: m.group_id || null
        }));

        console.log('📝 [generateFixture] Inserting matches:', matchInserts.length);
        console.log('📝 [generateFixture] First match:', matchInserts[0]);

        const { data: insertedData, error: insertError } = await supabase.from('GameMatch').insert(matchInserts).select();

        if (insertError) {
            console.error('❌ [generateFixture] Insert error:', insertError);
            throw insertError;
        }

        console.log('✅ [generateFixture] Inserted successfully:', insertedData?.length, 'matches');

        res.json({ message: 'Fixture generated successfully', matches: matchInserts });

    } catch (error: any) {
        console.error('Generate Fixture Error:', error.message);
        res.status(500).json({ error: 'Failed to generate fixture: ' + error.message });
    }
};

export const registerTeam = async (req: Request, res: Response) => {
    const { id } = req.params; // competition_id
    const { organization_id, category } = req.body;

    console.log(`🏐 [registerTeam] Competition ID: ${id}, Organization ID: ${organization_id}`);

    try {
        // Use supabaseAdmin to bypass RLS
        const client = supabaseAdmin || supabase;

        // 1. Verify competition exists
        const { data: competition, error: compError } = await client
            .from('Competition')
            .select('id, name')
            .eq('id', Number(id))
            .single();

        if (compError || !competition) {
            console.error('❌ [registerTeam] Competition not found:', id);
            return res.status(404).json({ error: 'Competition not found' });
        }

        console.log(`✅ [registerTeam] Competition: ${competition.name}`);

        // 2. Check if Team already exists for this organization
        let teamId;
        const { data: existingTeam } = await client
            .from('Team')
            .select('id')
            .eq('organization_id', Number(organization_id))
            .maybeSingle();

        if (existingTeam) {
            teamId = existingTeam.id;
            console.log(`♻️  [registerTeam] Reusing existing Team ID: ${teamId}`);
        } else {
            // 3. Create Team record
            console.log(`🆕 [registerTeam] Creating new Team record...`);
            const { data: newTeam, error: teamError } = await client
                .from('Team')
                .insert([{
                    organization_id: Number(organization_id),
                    championship_id: null,
                    category: category || 'Principal'
                }])
                .select()
                .single();

            if (teamError) {
                console.error('❌ [registerTeam] Failed to create Team:', teamError);
                throw new Error(`Failed to create Team: ${teamError.message}`);
            }

            teamId = newTeam.id;
            console.log(`✅ [registerTeam] Created new Team ID: ${teamId}`);
        }

        // 4. Check if already registered
        const { data: existingReg } = await client
            .from('TeamRegistration')
            .select('id')
            .eq('competition_id', Number(id))
            .eq('team_id', teamId)
            .maybeSingle();

        if (existingReg) {
            console.log(`⚠️  [registerTeam] Team already registered: ${existingReg.id}`);
            return res.status(400).json({ error: 'Team already registered for this competition' });
        }

        // 5. Create TeamRegistration
        console.log(`📝 [registerTeam] Creating TeamRegistration...`);
        const { data: registration, error: regError } = await client
            .from('TeamRegistration')
            .insert([{
                competition_id: Number(id),
                team_id: teamId,
                status: 'CONFIRMED'
            }])
            .select()
            .single();

        if (regError) {
            console.error('❌ [registerTeam] Failed to create registration:', regError);
            throw new Error(`Failed to register team: ${regError.message}`);
        }

        console.log(`✅ [registerTeam] Registration created successfully: ${registration.id}`);
        res.json(registration);
    } catch (error: any) {
        console.error('🔴 [registerTeam] Fatal error:', error.message);
        res.status(500).json({ error: 'Failed to register team: ' + error.message });
    }
};

export const drawGroups = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { phase_id } = req.body;

    try {
        // 1. Get all registered teams for this competition (not yet assigned to a group)
        const { data: registrations, error: regError } = await supabase
            .from('TeamRegistration')
            .select('id, team_id, team:Team(id, organization:Organization(name_official))')
            .eq('competition_id', Number(id))
            .is('group_id', null);

        if (regError) throw regError;
        if (!registrations || registrations.length === 0) {
            return res.status(400).json({ error: 'No teams available to draw' });
        }

        // 2. Get all groups for the specified phase
        const { data: groups, error: groupsError } = await supabase
            .from('Group')
            .select('id, name')
            .eq('phase_id', Number(phase_id));

        if (groupsError) throw groupsError;
        if (!groups || groups.length === 0) {
            return res.status(400).json({ error: 'No groups found for this phase' });
        }

        // 3. Use draw service to distribute teams
        const { drawTeamsIntoGroups } = await import('../utils/teamDrawService');
        const teamRegistrationIds = registrations.map(r => r.id);
        const distribution = drawTeamsIntoGroups(teamRegistrationIds, groups);

        // 4. Update TeamRegistration with group assignments
        const updatePromises = [];
        for (const [groupId, regIds] of distribution.entries()) {
            for (const regId of regIds) {
                updatePromises.push(
                    supabase
                        .from('TeamRegistration')
                        .update({ group_id: groupId })
                        .eq('id', regId)
                );
            }
        }

        await Promise.all(updatePromises);

        // 5. Format response
        const result: Record<string, any[]> = {};
        for (const [groupId, regIds] of distribution.entries()) {
            const group = groups.find(g => g.id === groupId);
            if (group) {
                result[group.name] = regIds.map(regId => {
                    const reg = registrations.find(r => r.id === regId);
                    return {
                        team_id: reg?.team_id,
                        team_name: (reg?.team as any)?.organization?.name_official || 'Unknown'
                    };
                });
            }
        }

        res.json({ message: 'Teams drawn successfully', distribution: result });

    } catch (error: any) {
        console.error('Draw Groups Error:', error.message);
        res.status(500).json({ error: 'Failed to draw groups: ' + error.message });
    }
};
export const getFixture = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        console.log(`Getting fixture for competition ${id}`);
        // Use supabaseAdmin or supabase
        const { data: matches, error } = await supabase
            .from('GameMatch')
            .select(`
                *,
                team_a:Team!GameMatch_team_a_id_fkey(id, organization:Organization(name_official)),
                team_b:Team!GameMatch_team_b_id_fkey(id, organization:Organization(name_official)),
                venue:Venue(id, name),
                group:Group(id, name)
            `)
            .eq('competition_id', Number(id))
            .order('round_number', { ascending: true })
            .order('scheduled_date', { ascending: true });

        if (error) {
            console.error('Supabase error getting fixture:', error);
            throw error;
        }

        console.log(`Found ${matches?.length} matches`);

        // Group by rounds
        const rounds: Record<number, any[]> = {};
        (matches || []).forEach((match: any) => {
            if (!rounds[match.round_number]) {
                rounds[match.round_number] = [];
            }
            rounds[match.round_number].push({
                id: match.id,
                match_number: match.match_number,
                team_a: {
                    id: match.team_a?.id,
                    name: match.team_a?.organization?.name_official || 'TBD'
                },
                team_b: {
                    id: match.team_b?.id,
                    name: match.team_b?.organization?.name_official || 'TBD'
                },
                score_a: match.score_a,
                score_b: match.score_b,
                scheduled_date: match.scheduled_date,
                venue: match.venue ? { id: match.venue.id, name: match.venue.name } : null,
                group: match.group ? { id: match.group.id, name: match.group.name } : null,
                status: match.status
            });
        });

        const formattedRounds = Object.keys(rounds).map(roundNum => ({
            round_number: Number(roundNum),
            matches: rounds[Number(roundNum)]
        }));

        res.json({ rounds: formattedRounds });

    } catch (error: any) {
        console.error('Get Fixture Error:', error.message);
        res.status(500).json({ error: 'Failed to get fixture' });
    }
};

/**
 * GENERATE BRACKET - Knockout/Elimination Tournament
 * Implements exact algorithm as specified by user:
 * 1. Get approved teams from Competition_Registrations
 * 2. Validate >= 2 teams
 * 3. Shuffle randomly
 * 4. Pair 2-by-2 for round 1
 * 5. Handle odd teams (bye)
 * 6. Create matches with status SCHEDULED
 * 7. Update competition status to 'Em andamento'
 */
export const generateBracketKnockout = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        console.log(`\n=== GENERATING KNOCKOUT BRACKET ===`);
        console.log(`Competition ID: ${id}`);

        // 1. Fetch approved team registrations
        const { data: registrations, error: regError } = await supabase
            .from('TeamRegistration')
            .select('team_id, team:Team(id, organization:Organization(name_official))')
            .eq('competition_id', Number(id))
            .in('status', ['CONFIRMED', 'APPROVED']);

        if (regError) throw regError;
        if (!registrations || registrations.length < 2) {
            return res.status(400).json({
                error: 'Insuficiente: Precisa de pelo menos 2 times para gerar chaveamento'
            });
        }

        console.log(`✅ Found ${registrations.length} approved teams`);

        // 2. Extract team IDs and shuffle (random algorithm)
        const teamIds = registrations.map((r: any) => r.team_id);

        // Fisher-Yates shuffle
        for (let i = teamIds.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [teamIds[i], teamIds[j]] = [teamIds[j], teamIds[i]];
        }

        console.log(`🔀 Shuffled teams:`, teamIds);

        // 3. Pair teams 2-by-2 for Round 1
        const matches = [];
        let matchNumber = 1;

        for (let i = 0; i < teamIds.length; i += 2) {
            const teamA = teamIds[i];
            const teamB = teamIds[i + 1] || null; // null = BYE

            matches.push({
                competition_id: Number(id),
                phase_id: null, // Can be set if phase exists
                round_number: 1,
                match_number: matchNumber++,
                team_a_id: teamA,
                team_b_id: teamB,
                status: teamB ? 'SCHEDULED' : 'BYE', // If no opponent, mark as BYE
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            if (teamB) {
                console.log(`📋 Match ${matchNumber - 1}: Team ${teamA} vs Team ${teamB}`);
            } else {
                console.log(`📋 Match ${matchNumber - 1}: Team ${teamA} (BYE - advances automatically)`);
            }
        }

        // 4. Delete existing matches and insert new ones
        await supabase.from('GameMatch').delete().eq('competition_id', Number(id));
        const { error: insertError } = await supabase.from('GameMatch').insert(matches);

        if (insertError) throw insertError;

        // 5. Update competition status to 'Em andamento'
        const { error: updateError } = await supabase
            .from('Competition')
            .update({
                status: 'ONGOING',
                updated_at: new Date().toISOString()
            })
            .eq('id', Number(id));

        if (updateError) throw updateError;

        console.log(`✅ Bracket generated successfully with ${matches.length} matches`);
        console.log(`✅ Competition status updated to ONGOING`);

        res.json({
            message: 'Chaveamento gerado com sucesso',
            matches: matches.length,
            round: 1,
            teams: teamIds.length,
            bracket: matches.map(m => ({
                match_number: m.match_number,
                team_a_id: m.team_a_id,
                team_b_id: m.team_b_id,
                status: m.status
            }))
        });

    } catch (error: any) {
        console.error('❌ Generate Bracket Error:', error.message);
        res.status(500).json({ error: 'Falha ao gerar chaveamento: ' + error.message });
    }
};

/**
 * UNREGISTER TEAM - Remove a team from a competition
 */
export const unregisterTeam = async (req: Request, res: Response) => {
    const { id, teamRegId } = req.params;

    console.log(`🗑️ [unregisterTeam] Removing registration ${teamRegId} from competition ${id}`);

    try {
        const client = supabaseAdmin || supabase;

        // 1. Verify registration exists and belongs to this competition
        const { data: registration, error: checkError } = await client
            .from('TeamRegistration')
            .select('id, team_id, competition_id, team:Team(organization:Organization(name_official))')
            .eq('id', Number(teamRegId))
            .eq('competition_id', Number(id))
            .single();

        if (checkError || !registration) {
            console.error('❌ [unregisterTeam] Registration not found');
            return res.status(404).json({ error: 'Registration not found' });
        }

        const teamName = (registration.team as any)?.organization?.name_official || 'Unknown';
        console.log(`🔍 [unregisterTeam] Found registration for: ${teamName}`);

        // 2. Check if competition has matches with this team
        const { data: matches } = await client
            .from('GameMatch')
            .select('id')
            .eq('competition_id', Number(id))
            .or(`team_a_id.eq.${registration.team_id},team_b_id.eq.${registration.team_id}`)
            .limit(1);

        if (matches && matches.length > 0) {
            console.error('❌ [unregisterTeam] Team has matches, cannot remove');
            return res.status(400).json({
                error: 'Não é possível remover time com jogos já programados'
            });
        }

        // 3. Delete the registration
        const { error: deleteError } = await client
            .from('TeamRegistration')
            .delete()
            .eq('id', Number(teamRegId));

        if (deleteError) throw deleteError;

        console.log(`✅ [unregisterTeam] Successfully removed: ${teamName}`);

        res.json({
            message: 'Time removido da competição com sucesso',
            id: Number(teamRegId),
            team_name: teamName
        });

    } catch (error: any) {
        console.error('🔴 [unregisterTeam] Fatal error:', error.message);
        res.status(500).json({ error: 'Falha ao remover time: ' + error.message });
    }
};

/**
 * UPDATE TEAM REGISTRATION - Update status or group
 */
export const updateTeamRegistration = async (req: Request, res: Response) => {
    const { id, teamRegId } = req.params;
    const { status, group_id } = req.body;

    console.log(`📝 [updateTeamRegistration] Updating registration ${teamRegId}`);

    try {
        const client = supabaseAdmin || supabase;

        const updateData: any = {};
        if (status !== undefined) updateData.status = status;
        if (group_id !== undefined) updateData.group_id = group_id;

        const { data: registration, error } = await client
            .from('TeamRegistration')
            .update(updateData)
            .eq('id', Number(teamRegId))
            .eq('competition_id', Number(id))
            .select(`
                *,
                team:Team(
                    *,
                    organization:Organization(name_official, logo_url)
                ),
                group:Group(id, name)
            `)
            .single();

        if (error) throw error;
        if (!registration) {
            return res.status(404).json({ error: 'Registration not found' });
        }

        console.log(`✅ [updateTeamRegistration] Updated successfully`);
        res.json(registration);

    } catch (error: any) {
        console.error('🔴 [updateTeamRegistration] Error:', error.message);
        res.status(500).json({ error: 'Failed to update registration' });
    }
};
