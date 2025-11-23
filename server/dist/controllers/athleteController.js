"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeAthleteFromTeam = exports.listTeamAthletes = exports.addAthleteToTeam = void 0;
const supabase_1 = require("../config/supabase");
/**
 * Add athlete to team registration
 * POST /api/v1/team-registrations/:id/athletes
 */
const addAthleteToTeam = async (req, res) => {
    const { id } = req.params; // team_registration_id
    const { user_id } = req.body;
    try {
        // 1. Verify team registration exists
        const { data: teamReg, error: teamError } = await supabase_1.supabase
            .from('TeamRegistration')
            .select('id, competition_id')
            .eq('id', Number(id))
            .single();
        if (teamError || !teamReg) {
            return res.status(404).json({ error: 'Team registration not found' });
        }
        // 2. Verify user exists
        const { data: user, error: userError } = await supabase_1.supabase
            .from('User')
            .select('id, birth_date')
            .eq('id', user_id)
            .single();
        if (userError || !user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // 3. Get competition constraints
        const { data: competition, error: compError } = await supabase_1.supabase
            .from('Competition')
            .select('min_age, max_age, min_athletes, max_athletes')
            .eq('id', teamReg.competition_id)
            .single();
        if (compError || !competition) {
            return res.status(404).json({ error: 'Competition not found' });
        }
        // 4. Validate age if birth_date and constraints exist
        if (user.birth_date && (competition.min_age || competition.max_age)) {
            const birthDate = new Date(user.birth_date);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            const adjustedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
                ? age - 1
                : age;
            if (competition.min_age && adjustedAge < competition.min_age) {
                return res.status(400).json({
                    error: `Athlete is too young. Minimum age: ${competition.min_age}`
                });
            }
            if (competition.max_age && adjustedAge > competition.max_age) {
                return res.status(400).json({
                    error: `Athlete is too old. Maximum age: ${competition.max_age}`
                });
            }
        }
        // 5. Check if athlete already in this team
        const { data: existing, error: existError } = await supabase_1.supabase
            .from('AthleteInscription')
            .select('id')
            .eq('team_registration_id', Number(id))
            .eq('user_id', user_id)
            .single();
        if (existing) {
            return res.status(400).json({ error: 'Athlete already in this team' });
        }
        // 6. Count current athletes
        const { count, error: countError } = await supabase_1.supabase
            .from('AthleteInscription')
            .select('id', { count: 'exact' })
            .eq('team_registration_id', Number(id));
        if (countError)
            throw countError;
        // 7. Validate max athletes
        if (competition.max_athletes && count && count >= competition.max_athletes) {
            return res.status(400).json({
                error: `Team is full. Maximum athletes: ${competition.max_athletes}`
            });
        }
        // 8. Create athlete inscription
        const { data: inscription, error: inscError } = await supabase_1.supabase
            .from('AthleteInscription')
            .insert([{
                team_registration_id: Number(id),
                user_id,
                status: 'VALID'
            }])
            .select()
            .single();
        if (inscError)
            throw inscError;
        res.status(201).json(inscription);
    }
    catch (error) {
        console.error('Add Athlete Error:', error.message);
        res.status(500).json({ error: 'Failed to add athlete' });
    }
};
exports.addAthleteToTeam = addAthleteToTeam;
/**
 * List athletes in team registration
 * GET /api/v1/team-registrations/:id/athletes
 */
const listTeamAthletes = async (req, res) => {
    const { id } = req.params;
    try {
        const { data: athletes, error } = await supabase_1.supabase
            .from('AthleteInscription')
            .select(`
                id,
                status,
                user:User(
                    id,
                    full_name,
                    cpf,
                    birth_date,
                    photo_url
                )
            `)
            .eq('team_registration_id', Number(id));
        if (error)
            throw error;
        res.json(athletes || []);
    }
    catch (error) {
        console.error('List Athletes Error:', error.message);
        res.status(500).json({ error: 'Failed to list athletes' });
    }
};
exports.listTeamAthletes = listTeamAthletes;
/**
 * Remove athlete from team registration
 * DELETE /api/v1/team-registrations/:id/athletes/:athleteId
 */
const removeAthleteFromTeam = async (req, res) => {
    const { id, athleteId } = req.params;
    try {
        const { error } = await supabase_1.supabase
            .from('AthleteInscription')
            .delete()
            .eq('team_registration_id', Number(id))
            .eq('user_id', athleteId);
        if (error)
            throw error;
        res.json({ message: 'Athlete removed successfully' });
    }
    catch (error) {
        console.error('Remove Athlete Error:', error.message);
        res.status(500).json({ error: 'Failed to remove athlete' });
    }
};
exports.removeAthleteFromTeam = removeAthleteFromTeam;
