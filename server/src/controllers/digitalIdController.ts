import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import QRCode from 'qrcode';

export const getDigitalID = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const { data: user, error } = await supabase
            .from('User')
            .select('*, organizations:Organization(*)') // Assuming relation or join
            .eq('id', id)
            .single();

        if (error || !user) return res.status(404).json({ error: 'User not found' });

        // Generate QR Code for validation
        const validationUrl = `http://localhost:5173/validate/${user.id}`;
        const qrCode = await QRCode.toDataURL(validationUrl);

        // Mask CPF
        const maskedCpf = user.cpf ? user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '***.$2.$3-**') : '***';

        const digitalIdData = {
            name: user.full_name,
            birth_date: user.birth_date,
            city: user.city,
            state: user.state,
            cpf_masked: maskedCpf,
            photo_url: user.photo_url || 'https://via.placeholder.com/150',
            organization: 'Clube Exemplo', // Mocked or from relation
            qr_code: qrCode,
            generated_at: new Date()
        };

        res.json(digitalIdData);
    } catch (error: any) {
        console.error('Get Digital ID Error:', error.message);
        res.status(500).json({ error: 'Failed to generate ID' });
    }
};

export const uploadDocument = async (req: Request, res: Response) => {
    const { userId, type, url } = req.body;

    try {
        const { data: doc, error } = await supabase
            .from('Document')
            .insert([{
                user_id: userId,
                type,
                url: url || 'https://via.placeholder.com/300',
                status: 'PENDING'
            }])
            .select()
            .single();

        if (error) throw error;
        res.json(doc);
    } catch (error: any) {
        console.error('Upload Document Error:', error.message);
        res.status(500).json({ error: 'Upload failed' });
    }
};

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
