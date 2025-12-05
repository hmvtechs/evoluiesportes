import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';

/**
 * LIST ALL ORGANIZATIONS
 */
export const listOrganizations = async (req: Request, res: Response) => {
    try {
        // Use supabaseAdmin if available to bypass RLS, otherwise fallback to anon client
        const client = supabaseAdmin || supabase;

        const { data: organizations, error } = await client
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
        // Use supabaseAdmin if available to bypass RLS, otherwise fallback to anon client
        const client = supabaseAdmin || supabase;

        const { data: organization, error } = await client
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
    const {
        name_official,
        cnpj,
        manager_user_id,
        team_manager_name,
        team_manager_contact,
        coach_name,
        coach_contact,
        logo_url
    } = req.body;

    if (!name_official) {
        return res.status(400).json({ error: 'name_official is required' });
    }

    try {
        // Debug logging
        console.log('[createOrganization] req.user:', (req as any).user);
        console.log('[createOrganization] manager_user_id from body:', manager_user_id);

        // Use provided manager_user_id or fall back to authenticated user
        const managerId = manager_user_id || (req as any).user?.userId;

        if (!managerId) {
            return res.status(400).json({ error: 'manager_user_id is required (login required)' });
        }

        const { data: organization, error } = await (supabaseAdmin || supabase)
            .from('Organization')
            .insert([{
                name_official,
                cnpj: cnpj || null,
                manager_user_id: managerId,
                team_manager_name: team_manager_name || null,
                team_manager_contact: team_manager_contact || null,
                coach_name: coach_name || null,
                coach_contact: coach_contact || null,
                logo_url: logo_url || null
            }])
            .select()
            .single();

        if (error) {
            console.error('Create Organization Error:', error);
            // Check for unique constraint violation
            if (error.code === '23505') {
                return res.status(400).json({ error: 'CNPJ já cadastrado' });
            }
            throw error;
        }

        res.status(201).json(organization);
    } catch (error: any) {
        console.error('Create Organization Error:', error.message);
        res.status(500).json({ error: 'Failed to create organization: ' + error.message });
    }
};

/**
 * UPDATE ORGANIZATION
 */
export const updateOrganization = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        name_official,
        cnpj,
        team_manager_name,
        team_manager_contact,
        coach_name,
        coach_contact,
        logo_url
    } = req.body;

    try {
        const updateData: any = {};
        if (name_official !== undefined) updateData.name_official = name_official;
        if (cnpj !== undefined) updateData.cnpj = cnpj;
        if (team_manager_name !== undefined) updateData.team_manager_name = team_manager_name;
        if (team_manager_contact !== undefined) updateData.team_manager_contact = team_manager_contact;
        if (coach_name !== undefined) updateData.coach_name = coach_name;
        if (coach_contact !== undefined) updateData.coach_contact = coach_contact;
        if (logo_url !== undefined) updateData.logo_url = logo_url;

        const { data: organization, error } = await (supabaseAdmin || supabase)
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
        const { error } = await (supabaseAdmin || supabase)
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
