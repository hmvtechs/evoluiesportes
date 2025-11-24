/**
 * Sistema de Roles e Privilégios
 * Hierarquia de usuários do mais privilegiado ao menos privilegiado
 */

export enum UserRole {
    ADMIN = 'ADMIN',           // Administrador do sistema (máximo privilégio)
    STAFF = 'STAFF',           // Staff/Equipe administrativa
    REFEREE = 'REFEREE',       // Árbitros
    CLUB = 'CLUB',             // Clubes/Times
    ATHLETE = 'ATHLETE',       // Atletas
    FAN = 'FAN'                // Torcedores
}

/**
 * Hierarquia numérica de privilégios (maior número = mais privilégio)
 */
export const RoleHierarchy: Record<UserRole, number> = {
    [UserRole.ADMIN]: 100,
    [UserRole.STAFF]: 80,
    [UserRole.REFEREE]: 60,
    [UserRole.CLUB]: 40,
    [UserRole.ATHLETE]: 20,
    [UserRole.FAN]: 10
};

/**
 * Verifica se um role tem privilégio maior ou igual a outro
 */
export function hasPrivilegeLevel(userRole: UserRole, requiredRole: UserRole): boolean {
    return RoleHierarchy[userRole] >= RoleHierarchy[requiredRole];
}

/**
 * Lista de todos os roles válidos (para validação)
 */
export const VALID_ROLES = Object.values(UserRole);

/**
 * Role padrão para novos usuários
 */
export const DEFAULT_ROLE = UserRole.FAN;

/**
 * Tipo para representar um usuário autenticado
 */
export interface AuthenticatedUser {
    userId: string;
    email: string;
    role: UserRole;
    full_name?: string;
}
