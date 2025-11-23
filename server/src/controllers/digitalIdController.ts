import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import QRCode from 'qrcode';

// Get digital ID details for a user
export const getDigitalID = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const { data: user, error } = await supabase
            .from('User')
            .select('*, organizations:Organization(*)') // adjust relation as needed
            .eq('id', id)
            .single();

        if (error || !user) return res.status(404).json({ error: 'User not found' });

        // Generate QR code for validation
        const validationUrl = `http://localhost:5173/validate/${user.id}`;
        const qrCode = await QRCode.toDataURL(validationUrl);

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
    } catch (error: any) {
        console.error('Get Digital ID Error:', error.message);
        res.status(500).json({ error: 'Failed to generate ID' });
    }
};

// Upload a document (photo or ID) for a user
export const uploadDocument = async (req: Request, res: Response) => {
    try {
        const { userId, type } = req.body;
        const file = (req as any).file;

        if (!file) return res.status(400).json({ error: 'No file uploaded' });
        if (!userId || !type) return res.status(400).json({ error: 'userId and type are required' });

        // Determine bucket based on document type
        const bucket = type === 'PHOTO' ? 'user-photos' : 'user-documents';

        // Create a unique filename
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${userId}_${type}_${Date.now()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
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
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);

        // Insert document record using admin client to bypass RLS
        const { data: doc, error: docError } = await supabaseAdmin!
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
            const { error: updateError } = await supabaseAdmin!
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
    } catch (error: any) {
        console.error('Upload Document Error:', error.message);
        return res.status(500).json({ error: 'Upload failed: ' + error.message });
    }
};

// Retrieve all documents for a specific user
export const getDocuments = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const { data: docs, error } = await supabase
            .from('Document')
            .select('*')
            .eq('user_id', userId);
        if (error) throw error;
        res.json(docs);
    } catch (error: any) {
        console.error('Get Documents Error:', error.message);
        res.status(500).json({ error: 'Fetch failed' });
    }
};

// Deactivate a user account
export const deactivateUser = async (req: Request, res: Response) => {
    const { userId } = req.body;
    try {
        const { error } = await supabase
            .from('User')
            .update({ is_active: false })
            .eq('id', userId);
        if (error) throw error;
        res.json({ message: 'User deactivated' });
    } catch (error: any) {
        console.error('Deactivate User Error:', error.message);
        res.status(500).json({ error: 'Deactivation failed' });
    }
};
