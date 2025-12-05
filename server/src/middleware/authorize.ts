import { Request, Response, NextFunction } from 'express';

export const authorize = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        // Debug para entender o que está chegando
        console.log('🔐 [authorize] Check:', { user, allowedRoles, path: req.path, method: req.method });

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
