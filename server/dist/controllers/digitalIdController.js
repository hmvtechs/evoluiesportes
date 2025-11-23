"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivateUser = exports.getDocuments = exports.uploadDocument = exports.getDigitalID = void 0;
const supabase_1 = require("../config/supabase");
const qrcode_1 = __importDefault(require("qrcode"));
// Get digital ID details for a user
const getDigitalID = async (req, res) => {
    const { id } = req.params;
    try {
        const { data: user, error } = await supabase_1.supabase
            .from('User')
            .select('*, organizations:Organization(*)') // adjust relation as needed
            .eq('id', id)
            .single();
        if (error || !user)
            return res.status(404).json({ error: 'User not found' });
        // Generate QR code for validation
        const validationUrl = `http://localhost:5173/validate/${user.id}`;
        const qrCode = await qrcode_1.default.toDataURL(validationUrl);
        // Mask CPF
        const maskedCpf = user.cpf
            ? user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '***.$2.$3-**')
            : '***';
        const digitalIdData = {
            name: user.full_name,
            birth_date: user.birth_date,
            city: user.city,
            state: user.state,
            cpf_masked: maskedCpf,
            photo_url: user.photo_url || 'https://via.placeholder.com/150',
            organization: 'Clube Exemplo', // placeholder
            qr_code: qrCode,
            generated_at: new Date()
        };
        res.json(digitalIdData);
    }
    catch (error) {
        console.error('Get Digital ID Error:', error.message);
        res.status(500).json({ error: 'Failed to generate ID' });
    }
};
exports.getDigitalID = getDigitalID;
// Upload a document (photo or ID) for a user
const uploadDocument = async (req, res) => {
    try {
        const { userId, type } = req.body;
        const file = req.file;
        if (!file)
            return res.status(400).json({ error: 'No file uploaded' });
        if (!userId || !type)
            return res.status(400).json({ error: 'userId and type are required' });
        // Determine bucket based on document type
        const bucket = type === 'PHOTO' ? 'user-photos' : 'user-documents';
        // Create a unique filename
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${userId}_${type}_${Date.now()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;
        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase_1.supabase.storage
            .from(bucket)
            .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true
        });
        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            return res.status(500).json({ error: 'Upload to storage failed' });
        }
        // Get public URL for the uploaded file
        const { data: { publicUrl } } = supabase_1.supabase.storage.from(bucket).getPublicUrl(filePath);
        // Insert document record using admin client to bypass RLS
        const { data: doc, error: docError } = await supabase_1.supabaseAdmin
            .from('Document')
            .insert([
            {
                user_id: userId,
                type,
                url: publicUrl,
                status: 'PENDING'
            }
        ])
            .select()
            .single();
        if (docError) {
            console.error('Insert document error:', docError);
            return res.status(500).json({ error: 'Failed to save document record' });
        }
        // If the uploaded file is a profile photo, update the user's photo_url
        if (type === 'PHOTO') {
            const { error: updateError } = await supabase_1.supabaseAdmin
                .from('User')
                .update({ photo_url: publicUrl })
                .eq('id', userId);
            if (updateError) {
                console.error('Error updating user photo:', updateError);
            }
        }
        return res.json({
            ...doc,
            message: type === 'PHOTO' ? 'Foto de perfil atualizada com sucesso' : 'Documento enviado com sucesso'
        });
    }
    catch (error) {
        console.error('Upload Document Error:', error.message);
        return res.status(500).json({ error: 'Upload failed: ' + error.message });
    }
};
exports.uploadDocument = uploadDocument;
// Retrieve all documents for a specific user
const getDocuments = async (req, res) => {
    const { userId } = req.params;
    try {
        const { data: docs, error } = await supabase_1.supabase
            .from('Document')
            .select('*')
            .eq('user_id', userId);
        if (error)
            throw error;
        res.json(docs);
    }
    catch (error) {
        console.error('Get Documents Error:', error.message);
        res.status(500).json({ error: 'Fetch failed' });
    }
};
exports.getDocuments = getDocuments;
// Deactivate a user account
const deactivateUser = async (req, res) => {
    const { userId } = req.body;
    try {
        const { error } = await supabase_1.supabase
            .from('User')
            .update({ is_active: false })
            .eq('id', userId);
        if (error)
            throw error;
        res.json({ message: 'User deactivated' });
    }
    catch (error) {
        console.error('Deactivate User Error:', error.message);
        res.status(500).json({ error: 'Deactivation failed' });
    }
};
exports.deactivateUser = deactivateUser;
