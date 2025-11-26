import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

/**
 * Add athlete to team (via TeamRegistration)
 * Athletes are Users linked to TeamRegistrations via AthleteInscription
 */
export const addAthleteToTeam = async (req: Request, res: Response) => {
    const { team_registration_id } = req.params;
    const { user_id } = req.body;

    try {
        // Verify team registration exists
        const { data: registration, error: regError } = await supabase
            .from('TeamRegistration')
            .select('id, competition_id, team_id')
            .eq('id', Number(team_registration_id))
            .single();

        if (regError || !registration) {
            return res.status(404).json({ error: 'Team registration not found' });
        }

        // Check if athlete already registered
        const { data: existing } = await supabase
            .from('AthleteInscription')
            .select('id')
            .eq('team_registration_id', Number(team_registration_id))
            .eq('user_id', user_id)
            .single();

        if (existing) {
            return res.status(400).json({ error: 'Athlete already registered for this team' });
        }

        // Add athlete inscription
        const { data: inscription, error: inscriptionError } = await supabase
            .from('AthleteInscription')
            .insert([{
                team_registration_id: Number(team_registration_id),
                user_id: user_id,
                status: 'VALID'
            }])
            .select()
            .single();

        if (inscriptionError) throw inscriptionError;

        res.json({ message: 'Athlete added successfully', inscription });
    } catch (error: any) {
        console.error('Add Athlete Error:', error.message);
        res.status(500).json({ error: 'Failed to add athlete' });
    }
};

/**
 * List all athletes for a team registration
 */
export const listTeamAthletes = async (req: Request, res: Response) => {
    const { team_registration_id } = req.params;

    try {
        const { data: athletes, error } = await supabase
            .from('AthleteInscription')
            .select(`
                id,
                status,
                user:User(
                    id,
                    full_name,
                    cpf,
                    email,
                    phone,
                    birth_date,
                    photo_url
                )
            `)
            .eq('team_registration_id', Number(team_registration_id));

        if (error) throw error;

        res.json(athletes || []);
    } catch (error: any) {
        console.error('List Athletes Error:', error.message);
        res.status(500).json({ error: 'Failed to list athletes' });
    }
};

/**
 * Remove athlete from team
 */
export const removeAthleteFromTeam = async (req: Request, res: Response) => {
    const { team_registration_id, athlete_id } = req.params;

    try {
        const { error } = await supabase
            .from('AthleteInscription')
            .delete()
            .eq('id', Number(athlete_id))
            .eq('team_registration_id', Number(team_registration_id));

        if (error) throw error;

        res.json({ message: 'Athlete removed successfully' });
    } catch (error: any) {
        console.error('Remove Athlete Error:', error.message);
        res.status(500).json({ error: 'Failed to remove athlete' });
    }
};
