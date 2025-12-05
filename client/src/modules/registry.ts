import { LayoutDashboard, ClipboardList, Users, FileText, Shield, Trophy } from 'lucide-react';

export interface Module {
    id: string;
    label: string;
    path: string;
    icon: any;
    roles: string[]; // 'ADMIN', 'USER', 'STAFF', 'ALL'
    color?: string; // Optional color for module icon background
}

export const MODULES: Module[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/',
        icon: LayoutDashboard,
        roles: ['ALL']
    },
    {
        id: 'matches',
        label: 'Súmula Digital',
        path: '/matches',
        icon: ClipboardList,
        roles: ['ADMIN', 'STAFF', 'USER']
    },
    {
        id: 'digital-id',
        label: 'Carteirinha',
        path: '/digital-id',
        icon: ClipboardList,
        roles: ['USER', 'ADMIN']
    },
    {
        id: 'documents',
        label: 'Documentos',
        path: '/documents',
        icon: FileText,
        roles: ['USER', 'ADMIN']
    },
    {
        id: 'profile',
        label: 'Meu Perfil',
        path: '/profile',
        icon: Users,
        roles: ['ALL']
    },
    {
        id: 'admin-dashboard',
        label: 'Admin',
        path: '/admin',
        icon: Shield,
        roles: ['ADMIN']
    },
    {
        id: 'admin-users',
        label: 'Usuários',
        path: '/admin/users',
        icon: Users,
        roles: ['ADMIN']
    },
    {
        id: 'competitions',
        label: 'Competições',
        path: '/competitions',
        icon: Trophy,
        roles: ['ADMIN']
    }
];

export const getModulesForUser = (userRole: string | undefined) => {
    if (!userRole) return [];
    return MODULES.filter(m => m.roles.includes('ALL') || m.roles.includes(userRole));
};
