import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getLineup = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const { data: match, error } = await supabase
            .from('Match')
            .select(`
                *,
                home_team:Team(*, organization:Organization(*)),
                away_team:Team(*, organization:Organization(*))
            `)
            .eq('id', Number(id))
            .single();

        if (error) throw error;
        if (!match) return res.status(404).json({ error: 'Match not found' });

        // Mock lineup data (same as before)
        const lineup = {
            home: [
                { id: 'p1', name: 'Jogador A1', number: 10, status: 'TITULAR' },
                { id: 'p2', name: 'Jogador A2', number: 7, status: 'TITULAR' }
            ],
            away: [
                { id: 'p3', name: 'Jogador B1', number: 9, status: 'TITULAR' },
                { id: 'p4', name: 'Jogador B2', number: 5, status: 'TITULAR' }
            ]
        };

        res.json({ match, lineup });
    } catch (error: any) {
        console.error('Get Lineup Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch lineup' });
    }
};

export const addEvent = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { type, player_id, minute } = req.body;

    try {
        // 1. Create Event
        const { data: event, error: eventError } = await supabase
            .from('MatchEvent')
            .insert([{
                match_id: Number(id),
                event_type: type,
                player_user_id: String(player_id),
                minute: minute
            }])
            .select()
            .single();

        if (eventError) throw eventError;

        // 2. Update Score if GOAL
        if (type === 'GOAL') {
            // Fetch current scores first (Supabase doesn't support atomic increment easily via JS client without RPC)
            // Or use RPC if defined. For now, read-modify-write (optimistic).
            const { data: match, error: fetchError } = await supabase
                .from('Match')
                .select('home_score, away_score')
                .eq('id', Number(id))
                .single();

            if (fetchError) throw fetchError;

            // Assume home score increment for prototype simplicity (as per original code)
            const newHomeScore = (match.home_score || 0) + 1;

            const { data: updatedMatch, error: updateError } = await supabase
                .from('Match')
                .update({ home_score: newHomeScore })
                .eq('id', Number(id))
                .select()
                .single();

            if (updateError) throw updateError;

            return res.json({
                new_home_score: updatedMatch.home_score,
                new_away_score: updatedMatch.away_score,
                event
            });
        }

        res.json({ event });
    } catch (error: any) {
        console.error('Add Event Error:', error.message);
        res.status(500).json({ error: 'Failed to add event' });
    }
};

export const updateStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const { data: match, error } = await supabase
            .from('Match')
            .update({ status })
            .eq('id', Number(id))
            .select()
            .single();

        if (error) throw error;
        res.json(match);
    } catch (error: any) {
        console.error('Update Status Error:', error.message);
        res.status(500).json({ error: 'Failed to update status' });
    }
};

export const createMatch = async (req: Request, res: Response) => {
    try {
        // Mock implementation
        res.json({ message: "Match creation endpoint ready (Supabase)" });
    } catch (error) {
        res.status(500).json({ error: "Error" });
    }
};
