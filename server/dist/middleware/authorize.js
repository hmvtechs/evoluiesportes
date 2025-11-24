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
        // Se o usuário não tiver role definida, assumimos FAN (menor privilégio)
        const userRole = user.role || 'FAN';
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
