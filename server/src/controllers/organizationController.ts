import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const listOrganizations = async (req: Request, res: Response) => {
    try {
        const { data: organizations, error } = await supabase
            .from('Organization')
            .select('id, name_official, cnpj')
            .order('name_official', { ascending: true });

        if (error) throw error;

        res.json(organizations || []);
    } catch (error: any) {
        console.error('List Organizations Error:', error.message);
        res.status(500).json({ error: 'Failed to list organizations' });
    }
};

export const getOrganization = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const { data: organization, error } = await supabase
            .from('Organization')
            .select('*')
            .eq('id', Number(id))
            .single();

        if (error) throw error;
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        res.json(organization);
    } catch (error: any) {
        console.error('Get Organization Error:', error.message);
        res.status(500).json({ error: 'Failed to get organization' });
    }
};

export const createOrganization = async (req: Request, res: Response) => {
    const { name_official, cnpj } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
        const { data: organization, error } = await supabase
            .from('Organization')
            .insert([{
                name_official,
                cnpj,
                manager_user_id: userId
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(organization);
    } catch (error: any) {
        console.error('Create Organization Error:', error.message);
        res.status(500).json({ error: 'Failed to create organization: ' + error.message });
    }
};
