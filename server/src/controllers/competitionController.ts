import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
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
    try {
        const { data: competitions, error } = await supabase
            .from('Competition')
            .select('*, modality:Modality(id, name)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Get counts for each competition
        const competitionsWithCounts = await Promise.all(
            (competitions || []).map(async (comp) => {
                const [regResult, matchResult] = await Promise.all([
                    supabase.from('TeamRegistration').select('id', { count: 'exact', head: true }).eq('competition_id', comp.id),
                    supabase.from('GameMatch').select('id', { count: 'exact', head: true }).eq('competition_id', comp.id)
                ]);

                return {
                    ...comp,
                    _count: {
                        registrations: regResult.count || 0,
                        matches: matchResult.count || 0
                    }
                };
            })
        );

        res.json(competitionsWithCounts);
    } catch (error: any) {
        console.error('List Competitions Error:', error.message);
        res.status(500).json({ error: 'Failed to list competitions' });
    }
};

export const getCompetition = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const { data: competition, error } = await supabase
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
                registrations:TeamRegistration(team_id),
                venues:CompetitionVenue(venue_id, priority)
            `)
            .eq('id', Number(id))
            .single();

        if (compError || !competition) throw new Error('Competition not found');

        const teams = competition.registrations.map((r: any) => r.team_id);
        if (teams.length < 2) return res.status(400).json({ error: 'Not enough teams to generate fixture' });

        // 2. Generate Matches based on Type
        let matches: ScheduledMatch[] = [];

        if (competition.competition_type === 'ROUND_ROBIN') {
            matches = generateRoundRobin(teams);
        } else if (competition.competition_type === 'SINGLE_ELIMINATION') {
            matches = generateElimination(teams);
        } else {
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
            status: 'SCHEDULED'
        }));

        const { error: insertError } = await supabase.from('GameMatch').insert(matchInserts);
        if (insertError) throw insertError;

        res.json({ message: 'Fixture generated successfully', matches: matchInserts });

    } catch (error: any) {
        console.error('Generate Fixture Error:', error.message);
        res.status(500).json({ error: 'Failed to generate fixture: ' + error.message });
    }
};

export const registerTeam = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { team_id } = req.body;

    try {
        const { data, error } = await supabase
            .from('TeamRegistration')
            .insert([{
                competition_id: Number(id),
                team_id: Number(team_id),
                status: 'CONFIRMED'
            }])
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error: any) {
        console.error('Register Team Error:', error.message);
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
            .order('match_number', { ascending: true });

        if (error) throw error;

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
