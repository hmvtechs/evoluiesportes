import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';

/**
 * LOGIN - Autentica usando Supabase Auth
 */
export const login = async (req: Request, res: Response) => {
    console.log('\n=== LOGIN (SUPABASE) ===');
    const { identifier, password } = req.body;

    try {
        let emailToLogin = identifier;

        //  Se identifier não tem @, assumimos que é CPF
        if (!identifier.includes('@')) {
            const cleanCpf = identifier.replace(/\D/g, '');

            // Buscar email pelo CPF na tabela User
            const { data: userFound, error: searchError } = await supabaseAdmin!
                .from('User')
                .select('email')
                .eq('cpf', cleanCpf)
                .single();

            if (searchError || !userFound) {
                return res.status(401).json({ error: 'CPF não encontrado' });
            }
            emailToLogin = userFound.email;
        }

        // Autenticar com Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email: emailToLogin,
            password: password
        });

        if (error) {
            console.error('Erro Supabase Auth:', error.message);
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }

        console.log('✅ Login bem sucedido:', emailToLogin);

        return res.json({
            token: data.session.access_token,
            user: {
                id: data.user.id,
                email: data.user.email,
                full_name: data.user.user_metadata?.name || '',
                role: data.user.user_metadata?.role || 'user'
            }
        });

    } catch (error: any) {
        console.error('❌ Erro Login:', error);
        return res.status(500).json({ error: 'Erro interno' });
    }
};

/**
 * VALIDATE RF (Mock)
 */
export const validateRF = async (req: Request, res: Response) => {
    res.json({ valid: true, name: 'TESTE VALIDADO', status: 'VALID' });
};

/**
 * SETUP 2FA
 */
export const setup2FA = async (req: Request, res: Response) => {
    res.status(501).json({ error: 'Not implemented' });
};