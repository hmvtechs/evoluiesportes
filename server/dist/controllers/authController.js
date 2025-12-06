"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setup2FA = exports.validateRF = exports.login = void 0;
const supabase_1 = require("../config/supabase");
const cpfValidationService_1 = require("../services/cpfValidationService");
/**
 * LOGIN - Autentica usando Supabase Auth
 */
const login = async (req, res) => {
    console.log('\n=== LOGIN (SUPABASE) ===');
    const { identifier, password } = req.body;
    try {
        let emailToLogin = identifier;
        //  Se identifier não tem @, assumimos que é CPF
        if (!identifier.includes('@')) {
            const cleanCpf = identifier.replace(/\D/g, '');
            // Buscar email pelo CPF na tabela User
            const { data: userFound, error: searchError } = await supabase_1.supabaseAdmin
                .from('User')
                .select('email')
                .eq('cpf', cleanCpf)
                .single();
            if (searchError || !userFound) {
                console.log('❌ CPF não encontrado no banco de dados');
                return res.status(401).json({ error: 'CPF não encontrado' });
            }
            emailToLogin = userFound.email;
            console.log(`🔍 CPF resolvido para email: ${emailToLogin}`);
        }
        // Autenticar com Supabase
        const { data, error } = await supabase_1.supabase.auth.signInWithPassword({
            email: emailToLogin,
            password: password
        });
        if (error) {
            console.error('Erro Supabase Auth:', error.message);
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }
        console.log('✅ Login bem sucedido:', emailToLogin);
        return res.json({
            token: data.session.access_token,
            user: {
                id: data.user.id,
                email: data.user.email,
                full_name: data.user.user_metadata?.name || '',
                role: data.user.user_metadata?.role || 'user'
            }
        });
    }
    catch (error) {
        console.error('❌ Erro Login:', error);
        return res.status(500).json({ error: 'Erro interno' });
    }
};
exports.login = login;
/**
 * VALIDATE RF - Valida CPF usando serviço de validação
 */
const validateRF = async (req, res) => {
    const { cpf } = req.body;
    if (!cpf) {
        return res.status(400).json({ error: 'CPF é obrigatório' });
    }
    try {
        console.log('\n=== VALIDATING CPF ===');
        const result = await cpfValidationService_1.cpfValidationService.validateCPF(cpf);
        if (result.valid) {
            return res.json({
                valid: true,
                status: result.status,
                name: result.name,
                birthDate: result.birthDate,
                gender: result.gender,
                situation: result.situation,
            });
        }
        else {
            return res.status(400).json({
                valid: false,
                status: result.status,
                error: result.error || 'CPF validation service not available',
                situation: result.situation,
            });
        }
    }
    catch (error) {
        console.error('❌ Error validating CPF:', error);
        return res.status(500).json({
            valid: false,
            status: 'ERROR',
            error: 'Erro ao validar CPF. Tente novamente mais tarde.',
        });
    }
};
exports.validateRF = validateRF;
/**
 * SETUP 2FA
 */
const setup2FA = async (req, res) => {
    res.status(501).json({ error: 'Not implemented' });
};
exports.setup2FA = setup2FA;
