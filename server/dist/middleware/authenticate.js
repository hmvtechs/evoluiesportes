"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const supabase_1 = require("../config/supabase");
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }
    const token = authHeader.split(' ')[1];
    try {
        // Validar token com Supabase
        const { data: { user }, error } = await supabase_1.supabase.auth.getUser(token);
        if (error || !user) {
            console.error('Erro validação token:', error?.message);
            return res.status(401).json({ error: 'Token inválido ou expirado' });
        }
        // Extrair role do metadata ou usar padrão
        const role = user.user_metadata?.role || 'USER';
        req.user = {
            userId: user.id,
            email: user.email,
            role: role
        };
        next();
    }
    catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(401).json({ error: 'Erro interno de autenticação' });
    }
};
exports.authenticate = authenticate;
