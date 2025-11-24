"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        // Debug para entender o que está chegando
        // console.log('Authorize Check:', { user, allowedRoles });
        if (!user) {
            return res.status(401).json({ error: 'Não autenticado' });
        }
        // Se o usuário não tiver role definida, assumimos 'USER' por segurança, ou deixamos passar se a rota for pública (mas authorize implica proteção)
        const userRole = user.role || 'USER';
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                error: 'Acesso negado. Permissão insuficiente.',
                required: allowedRoles,
                current: userRole
            });
        }
        next();
    };
};
exports.authorize = authorize;
