import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

/**
 * LIST ALL ORGANIZATIONS
 */
export const listOrganizations = async (req: Request, res: Response) => {
    try {
        const { data: organizations, error } = await supabase
            .from('Organization')
            .select('*')
            .order('name_official', { ascending: true });

        if (error) throw error;

        res.json(organizations || []);
    } catch (error: any) {
        console.error('List Organizations Error:', error.message);
        res.status(500).json({ error: 'Failed to list organizations' });
    }
};

/**
 * GET SINGLE ORGANIZATION
 */
export const getOrganization = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const { data: organization, error } = await supabase
            .from('Organization')
            .select('*')
            .eq('id', Number(id))
            .single();

        if (error) throw error;
        if (!organization) return res.status(404).json({ error: 'Organization not found' });

        res.json(organization);
    } catch (error: any) {
        console.error('Get Organization Error:', error.message);
        res.status(500).json({ error: 'Failed to get organization' });
    }
};

/**
 * CREATE ORGANIZATION
 */
export const createOrganization = async (req: Request, res: Response) => {
    const { name_official, cnpj, manager_user_id } = req.body;

    if (!name_official) {
        return res.status(400).json({ error: 'name_official is required' });
    }

    try {
        const { data: organization, error } = await supabase
            .from('Organization')
            .insert([{
                name_official,
                cnpj: cnpj || '00.000.000/0000-00',
                manager_user_id: manager_user_id || null
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(organization);
    } catch (error: any) {
        console.error('Create Organization Error:', error.message);
        res.status(500).json({ error: 'Failed to create organization' });
    }
};

/**
 * UPDATE ORGANIZATION
 */
export const updateOrganization = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name_official, cnpj } = req.body;

    try {
        const updateData: any = {};
        if (name_official !== undefined) updateData.name_official = name_official;
        if (cnpj !== undefined) updateData.cnpj = cnpj;

        const { data: organization, error } = await supabase
            .from('Organization')
            .update(updateData)
            .eq('id', Number(id))
            .select()
            .single();

        if (error) throw error;
        if (!organization) return res.status(404).json({ error: 'Organization not found' });

        res.json(organization);
    } catch (error: any) {
        console.error('Update Organization Error:', error.message);
        res.status(500).json({ error: 'Failed to update organization' });
    }
};

/**
 * DELETE ORGANIZATION
 */
export const deleteOrganization = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const { error } = await supabase
            .from('Organization')
            .delete()
            .eq('id', Number(id));

        if (error) throw error;

        res.json({ message: 'Organization deleted successfully' });
    } catch (error: any) {
        console.error('Delete Organization Error:', error.message);
        res.status(500).json({ error: 'Failed to delete organization' });
    }
};
