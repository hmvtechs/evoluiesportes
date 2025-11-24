import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Validar token com Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.error('Erro validação token:', error?.message);
            return res.status(401).json({ error: 'Token inválido ou expirado' });
        }

        // Extrair role do metadata ou usar padrão (FAN = menor privilégio)
        const role = user.user_metadata?.role || 'FAN';

        (req as any).user = {
            userId: user.id,
            email: user.email,
            role: role
        };

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(401).json({ error: 'Erro interno de autenticação' });
    }
};
