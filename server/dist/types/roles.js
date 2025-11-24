"use strict";
/**
 * Sistema de Roles e Privilégios
 * Hierarquia de usuários do mais privilegiado ao menos privilegiado
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ROLE = exports.VALID_ROLES = exports.RoleHierarchy = exports.UserRole = void 0;
exports.hasPrivilegeLevel = hasPrivilegeLevel;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["STAFF"] = "STAFF";
    UserRole["REFEREE"] = "REFEREE";
    UserRole["CLUB"] = "CLUB";
    UserRole["ATHLETE"] = "ATHLETE";
    UserRole["FAN"] = "FAN"; // Torcedores
})(UserRole || (exports.UserRole = UserRole = {}));
/**
 * Hierarquia numérica de privilégios (maior número = mais privilégio)
 */
exports.RoleHierarchy = {
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
function hasPrivilegeLevel(userRole, requiredRole) {
    return exports.RoleHierarchy[userRole] >= exports.RoleHierarchy[requiredRole];
}
/**
 * Lista de todos os roles válidos (para validação)
 */
exports.VALID_ROLES = Object.values(UserRole);
/**
 * Role padrão para novos usuários
 */
exports.DEFAULT_ROLE = UserRole.FAN;
