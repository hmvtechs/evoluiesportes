import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

/**
 * LOGIN
 * Authenticate user via email/CPF and password using Supabase
 */
export const login = async (req: Request, res: Response) => {
    console.log('\n=== LOGIN ATTEMPT (SUPABASE) ===');
    const { identifier, password } = req.body;

    try {
        // 1. Find user by email or CPF
        const { data: users, error } = await supabase
            .from('User')
            .select('*')
            .or(`email.eq.${identifier},cpf.eq.${identifier.replace(/\D/g, '')}`)
            .limit(1);

        if (error) {
            console.error('Supabase query error:', error);
            return res.status(500).json({ error: 'Erro ao buscar usuário' });
        }

        const user = users && users.length > 0 ? users[0] : null;

        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // 2. Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // 3. Generate JWT
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET || 'your-secret-key-change-in-production',
            { expiresIn: '24h' }
        );

        console.log('✅ Login successful:', user.email);

        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                cpf: user.cpf
            }
        });
    } catch (error: any) {
        console.error('❌ Login error:', error);
        return res.status(500).json({ error: 'Erro ao fazer login', details: error.message });
    }
};

/**
 * VALIDATE RF (Mock)
 */
export const validateRF = async (req: Request, res: Response) => {
    const { cpf } = req.body;
    // Mock validation
    res.json({
        valid: true,
        name: 'NOME SIMULADO DA SILVA',
        status: 'VALID'
    });
};

/**
 * SETUP 2FA
 */
export const setup2FA = async (req: Request, res: Response) => {
    // Supabase handles MFA differently. 
    // For now, we return a 501 Not Implemented or a placeholder.
    res.status(501).json({ error: '2FA setup via Supabase not yet implemented in this backend' });
};
