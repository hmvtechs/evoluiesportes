import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';

/**
 * PUBLIC REGISTRATION usando Supabase Auth (método correto)
 */
export const register = async (req: Request, res: Response) => {
    console.log('\n=== USER REGISTRATION ATTEMPT (SUPABASE AUTH) ===');
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

        // COMMENTED OUT: This check requires admin permissions
        // Supabase Auth will automatically reject duplicate emails
        /*
        const { data: existingUsers, error: checkError } = await supabase
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
        */

        // Validate Role
        // Importar roles válidos
        const validRoles = ['ADMIN', 'STAFF', 'REFEREE', 'CLUB', 'ATHLETE', 'FAN'];
        const assignedRole = validRoles.includes(role) ? role : 'FAN';

        // 1. Criar usuário no Supabase Auth (isso cria a senha na auth.users)
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    role: assignedRole,
                    full_name: full_name
                }
            }
        });

        if (authError) {
            console.error('Error creating auth user:', JSON.stringify(authError, null, 2));
            return res.status(500).json({ error: 'Erro ao criar conta: ' + authError.message });
        }

        if (!authData.user) {
            return res.status(500).json({ error: 'Erro ao criar usuário' });
        }

        // 2. Criar perfil do usuário na tabela User (SEM password_hash!)
        const { data: newUser, error: createError } = await supabase
            .from('User')
            .insert({
                id: authData.user.id,  // Usar o mesmo ID do auth.users
                email,
                cpf: cleanCpf,
                // NÃO incluir password_hash - fica só no auth.users!
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
            console.error('Error creating user profile:', createError);
            // Se falhar, tentar limpar o usuário do auth
            await supabase.auth.admin.deleteUser(authData.user.id);
            return res.status(500).json({ error: 'Erro ao criar perfil do usuário' });
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

    } catch (error: any) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ error: 'Erro ao cadastrar usuário' });
    }
};

/**
 * ADMIN: Get all users
 */
export const getUsers = async (req: Request, res: Response) => {
    console.log('\n=== FETCHING ALL USERS (SUPABASE) ===');

    try {
        const { data: users, error } = await supabase
            .from('User')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        console.log(`✅ Found ${users?.length || 0} users`);
        res.json(users);
    } catch (error: any) {
        console.error('❌ Error fetching users:', error.message);
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
};

/**
 * Search users by CPF or name
 */
export const searchUsers = async (req: Request, res: Response) => {
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
        const { data: users, error } = await supabase
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
    } catch (error: any) {
        console.error('❌ Error searching users:', error.message);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
};

/**
 * ADMIN: Update user fields
 */
export const updateAdminUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { birth_date, nationality, place_of_birth, role, city, state } = req.body;

    try {
        const { data: user, error } = await supabase
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

        if (error) throw error;

        console.log('✅ User updated successfully');
        res.json(user);
    } catch (error: any) {
        console.error('❌ Error updating user:', error.message);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
};

/**
 * ADMIN: Obfuscate user data (LGPD compliance)
 */
export const obfuscateUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const { data: user, error } = await supabase
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

        if (error) throw error;

        console.log('✅ User obfuscated successfully');
        res.json({ message: 'Usuário anonimizado com sucesso', user });
    } catch (error: any) {
        console.error('❌ Error obfuscating user:', error.message);
        res.status(500).json({ error: 'Erro ao anonimizar usuário' });
    }
};

/**
 * USER: Update own profile
 */
export const updateProfile = async (req: Request, res: Response) => {
    const { userId } = (req as any).user || {};
    const { phone, city, state } = req.body;

    try {
        const { error } = await supabase
            .from('User')
            .update({
                phone,
                city,
                state
            })
            .eq('id', userId);

        if (error) throw error;

        console.log('✅ Profile updated successfully');
        res.json({ message: 'Perfil atualizado com sucesso' });
    } catch (error: any) {
        console.error('❌ Error updating profile:', error.message);
        res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
};

/**
 * USER: Get dashboard statistics
 */
export const getDashboard = async (req: Request, res: Response) => {
    const { userId } = (req as any).user || {};

    try {
        // Get user's competitions (as participant)
        const { data: userCompetitions, error: compError } = await supabase
            .from('CompetitionTeam')
            .select(`
                competition_id,
                Competition (
                    id,
                    name,
                    status,
                    start_date,
                    end_date
                )
            `)
            .eq('team_id', userId); // Assuming user can be in teams

        // Get user's upcoming matches
        const { data: upcomingMatches, error: matchError } = await supabase
            .from('Match')
            .select('*')
            .gte('date', new Date().toISOString())
            .order('date', { ascending: true })
            .limit(5);

        // Get recent registrations count
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count: registrationsToday } = await supabase
            .from('User')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today.toISOString());

        // Get active competitions count (including DRAFT which is default)
        const { count: activeCompetitions } = await supabase
            .from('Competition')
            .select('*', { count: 'exact', head: true })
            .in('status', ['DRAFT', 'SCHEDULED', 'ONGOING']);

        // Get live matches count
        const { count: liveMatches } = await supabase
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
    } catch (error: any) {
        console.error('❌ Error fetching dashboard:', error.message);
        return res.status(500).json({ error: 'Erro ao carregar estatísticas' });
    }
};

/**
 * ADMIN: Get dashboard statistics
 */
export const getAdminDashboard = async (req: Request, res: Response) => {
    try {
        const { count: totalUsers } = await supabase
            .from('User')
            .select('*', { count: 'exact', head: true });

        const { count: pendingDocs } = await supabase
            .from('User')
            .select('*', { count: 'exact', head: true })
            .eq('rf_status', 'PENDING');

        // Recent users (last 48h)
        const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
        const { count: recentUsers } = await supabase
            .from('User')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', twoDaysAgo);

        // Active competitions (status = DRAFT, SCHEDULED or ONGOING)
        const { count: activeCompetitions } = await supabase
            .from('Competition')
            .select('*', { count: 'exact', head: true })
            .in('status', ['DRAFT', 'SCHEDULED', 'ONGOING']);

        // Active matches today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count: matchesToday } = await supabase
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
    } catch (error: any) {
        console.error('❌ Error fetching dashboard:', error.message);
        return res.status(500).json({ error: 'Erro ao carregar estatísticas' });
    }
};

/**
 * ADMIN: Delete user (Auth + Database)
 */
export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    console.log(`\n=== DELETING USER: ${id} ===`);

    try {
        if (!supabaseAdmin) {
            return res.status(500).json({ error: 'Supabase Admin not configured' });
        }

        // 1. Delete from Supabase Auth
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

        if (authError) {
            console.error('❌ Error deleting auth user:', authError);
            return res.status(500).json({ error: 'Erro ao apagar usuário do Auth' });
        }

        // 2. Delete from Database (User table)
        // Ideally this should cascade, but we force it just in case
        const { error: dbError } = await supabase
            .from('User')
            .delete()
            .eq('id', id);

        if (dbError) {
            console.error('❌ Error deleting database user:', dbError);
            // We don't return error here because Auth user is already gone
        }

        console.log('✅ User deleted successfully');
        res.json({ message: 'Usuário removido com sucesso' });
    } catch (error: any) {
        console.error('❌ Error deleting user:', error.message);
        res.status(500).json({ error: 'Erro ao apagar usuário' });
    }
};
