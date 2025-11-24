import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';

/**
 * LOGIN
 * Autentica usando o Supabase Auth
 */
export const login = async (req: Request, res: Response) => {
    console.log('\n=== TENTATIVA DE LOGIN (SUPABASE) ===');
    const { identifier, password } = req.body;

    try {
        let emailToLogin = identifier;

        // 1. Lógica para CPF (Se o identificador não tiver @, assumimos que é CPF)
        if (!identifier.includes('@')) {
            const cleanCpf = identifier.replace(/\D/g, ''); // Remove pontos e traços
            
            // Busca o email atrelado a esse CPF na tabela pública
            // ATENÇÃO: Verifique se sua tabela no Supabase chama 'users' ou 'User'
            const { data: userFound, error: searchError } = await supabaseAdmin!
                .from('users') // <-- Se sua tabela for 'User', mude aqui
                .select('email')
                .eq('cpf', cleanCpf)
                .single();

            if (searchError || !userFound) {
                return res.status(401).json({ error: 'CPF não encontrado ou não cadastrado.' });
            }
            emailToLogin = userFound.email;
        }

        // 2. Pergunta ao Supabase: "Essa senha está certa?"
        const { data, error } = await supabase.auth.signInWithPassword({
            email: emailToLogin,
            password: password
        });

        if (error) {
            console.error('Erro no Supabase Auth:', error.message);
            return res.status(401).json({ error: 'Email ou senha incorretos.' });
        }

        // 3. Sucesso! Retorna o token original do Supabase
        // O Supabase retorna user + session (com access_token)
        console.log('✅ Login bem sucedido para:', emailToLogin);

        return res.json({
            token: data.session.access_token, // O token REAL que abre as portas do banco
            user: {
                id: data.user.id,
                email: data.user.email,
                // Aqui buscamos dados extras do metadata ou da tabela pública se precisar
                full_name: data.user.user_metadata?.name || '',
                role: data.user.user_metadata?.role || 'user'
            }
        });

    } catch (error: any) {
        console.error('❌ Erro interno de Login:', error);
        return res.status(500).json({ error: 'Erro interno ao processar login' });
    }
};

/**
 * VALIDATE RF (Mock)
 */
export const validateRF = async (req: Request, res: Response) => {
    // ... manter igual ...
    res.json({ valid: true, name: 'TESTE VALIDADO', status: 'VALID' });
};

/**
 * SETUP 2FA
 */
export const setup2FA = async (req: Request, res: Response) => {
    res.status(501).json({ error: 'Not implemented' });
};