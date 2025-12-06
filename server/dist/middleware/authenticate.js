"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const supabase_1 = require("../config/supabase");
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log('🔑 [authenticate] Starting auth check for:', req.method, req.path);
    if (!authHeader) {
        console.log('❌ [authenticate] No auth header');
        return res.status(401).json({ error: 'Token não fornecido' });
    }
    const token = authHeader.split(' ')[1];
    console.log('🎫 [authenticate] Token present, length:', token?.length);
    try {
        // Use supabaseAdmin to bypass RLS, or fallback to supabase
        const client = supabase_1.supabaseAdmin || supabase_1.supabase;
        // Validar token com Supabase
        const response = await client.auth.getUser(token);
        // Debug: log full response
        console.log('📦 [authenticate] Full Supabase response:', JSON.stringify(response, null, 2));
        const user = response.data?.user;
        const error = response.error;
        if (error || !user) {
            console.error('❌ [authenticate] Token validation failed:', error?.message);
            return res.status(401).json({ error: 'Token inválido ou expirado' });
        }
        console.log('✅ [authenticate] User validated:', user.id, user.email);
        // Extrair role do metadata ou usar padrão (FAN = menor privilégio)
        const role = user.user_metadata?.role || 'FAN';
        req.user = {
            userId: user.id,
            email: user.email,
            role: role
        };
        console.log('👤 [authenticate] User attached to request:', { userId: user.id, role });
        next();
    }
    catch (error) {
        console.error('🔴 [authenticate] Exception:', error);
        return res.status(401).json({ error: 'Erro interno de autenticação' });
    }
};
exports.authenticate = authenticate;
