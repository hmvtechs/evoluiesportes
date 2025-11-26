import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import { cpfValidationService } from '../services/cpfValidationService';

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
 * VALIDATE RF - Valida CPF usando serviço de validação
 */
export const validateRF = async (req: Request, res: Response) => {
    const { cpf } = req.body;

    if (!cpf) {
        return res.status(400).json({ error: 'CPF é obrigatório' });
    }

    try {
        console.log('\n=== VALIDATING CPF ===');
        const result = await cpfValidationService.validateCPF(cpf);

        if (result.valid) {
            return res.json({
                valid: true,
                status: result.status,
                name: result.name,
                birthDate: result.birthDate,
                gender: result.gender,
                situation: result.situation,
            });
        } else {
            return res.status(400).json({
                valid: false,
                status: result.status,
                error: result.error || 'CPF validation service not available',
                situation: result.situation,
            });
        }
    } catch (error: any) {
        console.error('❌ Error validating CPF:', error);
        return res.status(500).json({
            valid: false,
            status: 'ERROR',
            error: 'Erro ao validar CPF. Tente novamente mais tarde.',
        });
    }
};

/**
 * SETUP 2FA
 */
export const setup2FA = async (req: Request, res: Response) => {
    res.status(501).json({ error: 'Not implemented' });
};