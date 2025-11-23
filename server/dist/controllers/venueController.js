"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVenue = exports.updateVenue = exports.getVenue = exports.listVenues = exports.createVenue = void 0;
const supabase_1 = require("../config/supabase");
const createVenue = async (req, res) => {
    try {
        const data = req.body;
        // Ensure numeric fields are numbers
        const venueData = {
            ...data,
            capacity: data.capacity ? Number(data.capacity) : null,
            price_per_hour: data.price_per_hour ? Number(data.price_per_hour) : null,
            min_advance_hours: data.min_advance_hours ? Number(data.min_advance_hours) : 1,
            max_future_days: data.max_future_days ? Number(data.max_future_days) : 30,
            max_active_bookings_per_user: data.max_active_bookings_per_user ? Number(data.max_active_bookings_per_user) : 3,
            latitude: data.latitude ? Number(data.latitude) : null,
            longitude: data.longitude ? Number(data.longitude) : null,
            inauguration_date: data.inauguration_date ? new Date(data.inauguration_date).toISOString() : null
        };
        const { data: venue, error } = await supabase_1.supabase
            .from('Venue')
            .insert([venueData])
            .select()
            .single();
        if (error)
            throw error;
        res.status(201).json(venue);
    }
    catch (error) {
        console.error('Create Venue Error:', error.message);
        res.status(500).json({ error: 'Error creating venue' });
    }
};
exports.createVenue = createVenue;
const listVenues = async (req, res) => {
    try {
        const { data: venues, error } = await supabase_1.supabase
            .from('Venue')
            .select('*, modalities:Modality(*)'); // Many-to-many relation might need explicit join table handling if not using views
        if (error)
            throw error;
        res.json(venues);
    }
    catch (error) {
        console.error('List Venues Error:', error.message);
        res.status(500).json({ error: 'Error listing venues' });
    }
};
exports.listVenues = listVenues;
const getVenue = async (req, res) => {
    try {
        const { id } = req.params;
        const { data: venue, error } = await supabase_1.supabase
            .from('Venue')
            .select('*, modalities:Modality(*)')
            .eq('id', Number(id))
            .single();
        if (error)
            throw error;
        if (!venue)
            return res.status(404).json({ error: 'Venue not found' });
        res.json(venue);
    }
    catch (error) {
        console.error('Get Venue Error:', error.message);
        res.status(500).json({ error: 'Error fetching venue' });
    }
};
exports.getVenue = getVenue;
const updateVenue = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updateData = { ...data };
        if (data.capacity)
            updateData.capacity = Number(data.capacity);
        if (data.price_per_hour)
            updateData.price_per_hour = Number(data.price_per_hour);
        const { data: venue, error } = await supabase_1.supabase
            .from('Venue')
            .update(updateData)
            .eq('id', Number(id))
            .select()
            .single();
        if (error)
            throw error;
        res.json(venue);
    }
    catch (error) {
        console.error('Update Venue Error:', error.message);
        res.status(500).json({ error: 'Error updating venue' });
    }
};
exports.updateVenue = updateVenue;
const deleteVenue = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase_1.supabase
            .from('Venue')
            .delete()
            .eq('id', Number(id));
        if (error)
            throw error;
        res.status(204).send();
    }
    catch (error) {
        console.error('Delete Venue Error:', error.message);
        res.status(500).json({ error: 'Error deleting venue' });
    }
};
exports.deleteVenue = deleteVenue;
