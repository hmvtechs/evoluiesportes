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
exports.setup2FA = exports.validateRF = exports.login = void 0;
const supabase_1 = require("../config/supabase");
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
/**
 * LOGIN
 * Authenticate user via email/CPF and password using Supabase
 */
const login = async (req, res) => {
    console.log('\n=== LOGIN ATTEMPT (SUPABASE) ===');
    const { identifier, password } = req.body;
    try {
        // 1. Find user by email or CPF
        const { data: users, error } = await supabase_1.supabase
            .from('User')
            .select('*')
            .or(`email.eq.${identifier},cpf.eq.${identifier.replace(/\D/g, '')}`)
            .limit(1);
        if (error) {
            console.error('Supabase query error:', error);
            return res.status(500).json({ error: 'Erro ao buscar usuário' });
        }
        const user = users && users.length > 0 ? users[0] : null;
        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        // 2. Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        // 3. Generate JWT
        const token = jwt.sign({
            userId: user.id,
            email: user.email,
            role: user.role
        }, process.env.JWT_SECRET || 'your-secret-key-change-in-production', { expiresIn: '24h' });
        console.log('✅ Login successful:', user.email);
        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                cpf: user.cpf
            }
        });
    }
    catch (error) {
        console.error('❌ Login error:', error);
        return res.status(500).json({ error: 'Erro ao fazer login', details: error.message });
    }
};
exports.login = login;
/**
 * VALIDATE RF (Mock)
 */
const validateRF = async (req, res) => {
    const { cpf } = req.body;
    // Mock validation
    res.json({
        valid: true,
        name: 'NOME SIMULADO DA SILVA',
        status: 'VALID'
    });
};
exports.validateRF = validateRF;
/**
 * SETUP 2FA
 */
const setup2FA = async (req, res) => {
    // Supabase handles MFA differently. 
    // For now, we return a 501 Not Implemented or a placeholder.
    res.status(501).json({ error: '2FA setup via Supabase not yet implemented in this backend' });
};
exports.setup2FA = setup2FA;
