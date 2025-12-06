"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrganization = exports.updateOrganization = exports.createOrganization = exports.getOrganization = exports.listOrganizations = void 0;
const supabase_1 = require("../config/supabase");
/**
 * LIST ALL ORGANIZATIONS
 */
const listOrganizations = async (req, res) => {
    try {
        // Use supabaseAdmin if available to bypass RLS, otherwise fallback to anon client
        const client = supabase_1.supabaseAdmin || supabase_1.supabase;
        const { data: organizations, error } = await client
            .from('Organization')
            .select('*')
            .order('name_official', { ascending: true });
        if (error)
            throw error;
        res.json(organizations || []);
    }
    catch (error) {
        console.error('List Organizations Error:', error.message);
        res.status(500).json({ error: 'Failed to list organizations' });
    }
};
exports.listOrganizations = listOrganizations;
/**
 * GET SINGLE ORGANIZATION
 */
const getOrganization = async (req, res) => {
    const { id } = req.params;
    try {
        // Use supabaseAdmin if available to bypass RLS, otherwise fallback to anon client
        const client = supabase_1.supabaseAdmin || supabase_1.supabase;
        const { data: organization, error } = await client
            .from('Organization')
            .select('*')
            .eq('id', Number(id))
            .single();
        if (error)
            throw error;
        if (!organization)
            return res.status(404).json({ error: 'Organization not found' });
        res.json(organization);
    }
    catch (error) {
        console.error('Get Organization Error:', error.message);
        res.status(500).json({ error: 'Failed to get organization' });
    }
};
exports.getOrganization = getOrganization;
/**
 * CREATE ORGANIZATION
 */
const createOrganization = async (req, res) => {
    const { name_official, cnpj, manager_user_id, team_manager_name, team_manager_contact, coach_name, coach_contact, logo_url } = req.body;
    if (!name_official) {
        return res.status(400).json({ error: 'name_official is required' });
    }
    try {
        // manager_user_id is now OPTIONAL - use provided value, authenticated user, or null
        const managerId = manager_user_id || req.user?.userId || null;
        console.log('[createOrganization] Creating org with managerId:', managerId);
        const { data: organization, error } = await (supabase_1.supabaseAdmin || supabase_1.supabase)
            .from('Organization')
            .insert([{
                name_official,
                cnpj: cnpj || null,
                manager_user_id: managerId, // Can be null now
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
    }
    catch (error) {
        console.error('Create Organization Error:', error.message);
        res.status(500).json({ error: 'Failed to create organization: ' + error.message });
    }
};
exports.createOrganization = createOrganization;
/**
 * UPDATE ORGANIZATION
 */
const updateOrganization = async (req, res) => {
    const { id } = req.params;
    const { name_official, cnpj, team_manager_name, team_manager_contact, coach_name, coach_contact, logo_url } = req.body;
    try {
        const updateData = {};
        if (name_official !== undefined)
            updateData.name_official = name_official;
        if (cnpj !== undefined)
            updateData.cnpj = cnpj;
        if (team_manager_name !== undefined)
            updateData.team_manager_name = team_manager_name;
        if (team_manager_contact !== undefined)
            updateData.team_manager_contact = team_manager_contact;
        if (coach_name !== undefined)
            updateData.coach_name = coach_name;
        if (coach_contact !== undefined)
            updateData.coach_contact = coach_contact;
        if (logo_url !== undefined)
            updateData.logo_url = logo_url;
        const { data: organization, error } = await (supabase_1.supabaseAdmin || supabase_1.supabase)
            .from('Organization')
            .update(updateData)
            .eq('id', Number(id))
            .select()
            .single();
        if (error)
            throw error;
        if (!organization)
            return res.status(404).json({ error: 'Organization not found' });
        res.json(organization);
    }
    catch (error) {
        console.error('Update Organization Error:', error.message);
        res.status(500).json({ error: 'Failed to update organization' });
    }
};
exports.updateOrganization = updateOrganization;
/**
 * DELETE ORGANIZATION
 */
const deleteOrganization = async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await (supabase_1.supabaseAdmin || supabase_1.supabase)
            .from('Organization')
            .delete()
            .eq('id', Number(id));
        if (error)
            throw error;
        res.json({ message: 'Organization deleted successfully' });
    }
    catch (error) {
        console.error('Delete Organization Error:', error.message);
        res.status(500).json({ error: 'Failed to delete organization' });
    }
};
exports.deleteOrganization = deleteOrganization;
