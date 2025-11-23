"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminDashboard = exports.getDashboard = exports.updateProfile = exports.obfuscateUser = exports.updateAdminUser = exports.searchUsers = exports.getUsers = exports.register = void 0;
const supabase_1 = require("../config/supabase");
const bcrypt = __importStar(require("bcryptjs"));
/**
 * PUBLIC REGISTRATION
 * Creates a new user account in Supabase
 */
const register = async (req, res) => {
    console.log('\n=== USER REGISTRATION ATTEMPT (SUPABASE) ===');
    console.log('Timestamp:', new Date().toISOString());
    const { email, cpf, password, full_name, phone, sex, birth_date, city, state, role } = req.body;
    try {
        // Validate required fields
        if (!email || !cpf || !password || !full_name) {
            return res.status(400).json({
                error: 'Campos obrigatórios faltando: email, CPF, senha e nome completo são necessários'
            });
        }
        const cleanCpf = cpf.replace(/\D/g, '');
        // Check if user already exists
        const { data: existingUsers, error: checkError } = await supabase_1.supabase
            .from('User')
            .select('id')
            .or(`email.eq.${email},cpf.eq.${cleanCpf}`)
            .limit(1);
        if (checkError) {
            console.error('Error checking existing user:', checkError);
            return res.status(500).json({ error: 'Erro ao verificar usuário existente' });
        }
        if (existingUsers && existingUsers.length > 0) {
            return res.status(400).json({ error: 'Usuário já cadastrado com este email ou CPF' });
        }
        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        // Validate Role
        const validRoles = ['USER', 'ENTITY', 'STAFF'];
        const assignedRole = validRoles.includes(role) ? role : 'USER';
        // Create User
        const { data: newUser, error: createError } = await supabase_1.supabase
            .from('User')
            .insert({
            email,
            cpf: cleanCpf,
            password_hash: passwordHash,
            full_name,
            phone: phone || null,
            sex: sex || null,
            birth_date: (birth_date && !isNaN(Date.parse(birth_date))) ? birth_date : null,
            city: city || null,
            state: state || null,
            rf_status: 'VALID', // Mock validation
            role: assignedRole,
            updated_at: new Date().toISOString()
        })
            .select()
            .single();
        if (createError) {
            console.error('Error creating user:', createError);
            return res.status(500).json({ error: 'Erro ao criar usuário' });
        }
        console.log('✅ User created successfully:', newUser.email);
        res.status(201).json({
            message: 'Usuário cadastrado com sucesso',
            user: {
                id: newUser.id,
                email: newUser.email,
                full_name: newUser.full_name,
                role: newUser.role
            }
        });
    }
    catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ error: 'Erro ao cadastrar usuário' });
    }
};
exports.register = register;
/**
 * ADMIN: Get all users
 */
const getUsers = async (req, res) => {
    console.log('\n=== FETCHING ALL USERS (SUPABASE) ===');
    try {
        const { data: users, error } = await supabase_1.supabase
            .from('User')
            .select('*')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        console.log(`✅ Found ${users?.length || 0} users`);
        res.json(users);
    }
    catch (error) {
        console.error('❌ Error fetching users:', error.message);
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
};
exports.getUsers = getUsers;
/**
 * Search users by CPF or name
 */
const searchUsers = async (req, res) => {
    const { query } = req.query;
    if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' });
    }
    console.log('\n=== SEARCHING USERS ===');
    console.log('Query:', query);
    try {
        // Clean CPF (remove non-digits)
        const cleanedQuery = query.replace(/\D/g, '');
        // Search by CPF or by name (case-insensitive)
        const { data: users, error } = await supabase_1.supabase
            .from('User')
            .select('id, full_name, cpf, email, birth_date, photo_url, role')
            .or(`cpf.like.%${cleanedQuery}%,full_name.ilike.%${query}%`)
            .limit(10);
        if (error) {
            console.error('Search error:', error);
            return res.status(500).json({ error: 'Erro ao buscar usuários' });
        }
        console.log(`✅ Found ${users?.length || 0} users matching query`);
        res.json(users || []);
    }
    catch (error) {
        console.error('❌ Error searching users:', error.message);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
};
exports.searchUsers = searchUsers;
/**
 * ADMIN: Update user fields
 */
const updateAdminUser = async (req, res) => {
    const { id } = req.params;
    const { birth_date, nationality, place_of_birth, role, city, state } = req.body;
    try {
        const { data: user, error } = await supabase_1.supabase
            .from('User')
            .update({
            birth_date: birth_date ? new Date(birth_date).toISOString() : undefined,
            nationality,
            place_of_birth,
            role,
            city,
            state
        })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        console.log('✅ User updated successfully');
        res.json(user);
    }
    catch (error) {
        console.error('❌ Error updating user:', error.message);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
};
exports.updateAdminUser = updateAdminUser;
/**
 * ADMIN: Obfuscate user data (LGPD compliance)
 */
const obfuscateUser = async (req, res) => {
    const { id } = req.params;
    try {
        const { data: user, error } = await supabase_1.supabase
            .from('User')
            .update({
            full_name: 'ANONYMIZED',
            email: `anonymized_${id}@deleted.com`,
            cpf: `00000000000_${id}`,
            phone: null,
            photo_url: null,
            city: null,
            state: null,
            is_obfuscated: true
        })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        console.log('✅ User obfuscated successfully');
        res.json({ message: 'Usuário anonimizado com sucesso', user });
    }
    catch (error) {
        console.error('❌ Error obfuscating user:', error.message);
        res.status(500).json({ error: 'Erro ao anonimizar usuário' });
    }
};
exports.obfuscateUser = obfuscateUser;
/**
 * USER: Update own profile
 */
const updateProfile = async (req, res) => {
    const { userId } = req.user || {};
    const { phone, city, state } = req.body;
    try {
        const { error } = await supabase_1.supabase
            .from('User')
            .update({
            phone,
            city,
            state
        })
            .eq('id', userId);
        if (error)
            throw error;
        console.log('✅ Profile updated successfully');
        res.json({ message: 'Perfil atualizado com sucesso' });
    }
    catch (error) {
        console.error('❌ Error updating profile:', error.message);
        res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
};
exports.updateProfile = updateProfile;
/**
 * USER: Get dashboard statistics
 */
const getDashboard = async (req, res) => {
    const { userId } = req.user || {};
    try {
        // Get user's competitions (as participant)
        const { data: userCompetitions, error: compError } = await supabase_1.supabase
            .from('CompetitionTeam')
            .select(`
                competition_id,
                competition (
                    id,
                    name,
                    status,
                    start_date,
                    end_date
                )
            `)
            .eq('team_id', userId); // Assuming user can be in teams
        // Get user's upcoming matches
        const { data: upcomingMatches, error: matchError } = await supabase_1.supabase
            .from('Match')
            .select('*')
            .gte('date', new Date().toISOString())
            .order('date', { ascending: true })
            .limit(5);
        // Get recent registrations count
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count: registrationsToday } = await supabase_1.supabase
            .from('User')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today.toISOString());
        // Get active competitions count (including DRAFT which is default)
        const { count: activeCompetitions } = await supabase_1.supabase
            .from('Competition')
            .select('*', { count: 'exact', head: true })
            .in('status', ['DRAFT', 'SCHEDULED', 'ONGOING']);
        // Get live matches count
        const { count: liveMatches } = await supabase_1.supabase
            .from('Match')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'ONGOING');
        const stats = {
            registrationsToday: registrationsToday || 0,
            liveMatches: liveMatches || 0,
            activeCompetitions: activeCompetitions || 0,
            upcomingMatches: upcomingMatches || [],
            pendingActions: 0 // Can be customized based on user's pending tasks
        };
        return res.json(stats);
    }
    catch (error) {
        console.error('❌ Error fetching dashboard:', error.message);
        return res.status(500).json({ error: 'Erro ao carregar estatísticas' });
    }
};
exports.getDashboard = getDashboard;
/**
 * ADMIN: Get dashboard statistics
 */
const getAdminDashboard = async (req, res) => {
    try {
        const { count: totalUsers } = await supabase_1.supabase
            .from('User')
            .select('*', { count: 'exact', head: true });
        const { count: pendingDocs } = await supabase_1.supabase
            .from('User')
            .select('*', { count: 'exact', head: true })
            .eq('rf_status', 'PENDING');
        // Recent users (last 48h)
        const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
        const { count: recentUsers } = await supabase_1.supabase
            .from('User')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', twoDaysAgo);
        // Active competitions (status = DRAFT, SCHEDULED or ONGOING)
        const { count: activeCompetitions } = await supabase_1.supabase
            .from('Competition')
            .select('*', { count: 'exact', head: true })
            .in('status', ['DRAFT', 'SCHEDULED', 'ONGOING']);
        // Active matches today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count: matchesToday } = await supabase_1.supabase
            .from('Match')
            .select('*', { count: 'exact', head: true })
            .gte('date', today.toISOString())
            .lte('date', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString());
        const stats = {
            totalUsers: totalUsers || 0,
            recentUsers: recentUsers || 0,
            pendingDocs: pendingDocs || 0,
            activeTournaments: activeCompetitions || 0,
            matchesToday: matchesToday || 0
        };
        return res.json(stats);
    }
    catch (error) {
        console.error('❌ Error fetching dashboard:', error.message);
        return res.status(500).json({ error: 'Erro ao carregar estatísticas' });
    }
};
exports.getAdminDashboard = getAdminDashboard;
