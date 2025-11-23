"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrganization = exports.updateOrganization = exports.createOrganization = exports.getOrganization = exports.listOrganizations = void 0;
const supabase_1 = require("../config/supabase");
/**
 * LIST ALL ORGANIZATIONS
 */
const listOrganizations = async (req, res) => {
    try {
        const { data: organizations, error } = await supabase_1.supabase
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
        const { data: organization, error } = await supabase_1.supabase
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
    const { name_official, cnpj, manager_user_id } = req.body;
    if (!name_official) {
        return res.status(400).json({ error: 'name_official is required' });
    }
    try {
        const { data: organization, error } = await supabase_1.supabase
            .from('Organization')
            .insert([{
                name_official,
                cnpj: cnpj || '00.000.000/0000-00',
                manager_user_id: manager_user_id || null
            }])
            .select()
            .single();
        if (error)
            throw error;
        res.status(201).json(organization);
    }
    catch (error) {
        console.error('Create Organization Error:', error.message);
        res.status(500).json({ error: 'Failed to create organization' });
    }
};
exports.createOrganization = createOrganization;
/**
 * UPDATE ORGANIZATION
 */
const updateOrganization = async (req, res) => {
    const { id } = req.params;
    const { name_official, cnpj } = req.body;
    try {
        const updateData = {};
        if (name_official !== undefined)
            updateData.name_official = name_official;
        if (cnpj !== undefined)
            updateData.cnpj = cnpj;
        const { data: organization, error } = await supabase_1.supabase
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
        const { error } = await supabase_1.supabase
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
