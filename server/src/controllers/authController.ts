import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';

/**
 * LOGIN usando Supabase Auth (método correto)
 */
export const login = async (req: Request, res: Response) => {
    console.log('\n=== LOGIN ATTEMPT (SUPABASE AUTH) ===');
    const { identifier, password } = req.body;

    try {
        // O identifier pode ser email ou CPF
        // Vamos assumir que é email, ou buscar o email pelo CPF primeiro
        let email = identifier;

        // Se identifier parece ser CPF (só números), buscar o email
        if (identifier.replace(/\D/g, '').length === 11) {
            const { data: user, error: userError } = await supabase
                .from('User')
                .select('email')
                .eq('cpf', identifier.replace(/\D/g, ''))
                .single();

            if (userError || !user) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }
            email = user.email;
        }

        // Usar o método oficial do Supabase para autenticação
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.error('Supabase auth error:', error);
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // Buscar dados adicionais do usuário na tabela User
        const { data: userProfile, error: profileError } = await supabase
            .from('User')
            .select('id, email, full_name, role, cpf')
            .eq('email', email)
            .single();

        console.log('✅ Login successful:', email);

        return res.json({
            token: data.session?.access_token,  // Token do Supabase (não manual!)
            user: {
                id: userProfile?.id || data.user.id,
                email: data.user.email,
                full_name: userProfile?.full_name,
                role: userProfile?.role,
                cpf: userProfile?.cpf
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
