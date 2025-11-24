"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseAdmin = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Carregar .env apenas em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
    dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
}
console.log('--- INICIANDO SUPABASE ---');
// Pegar variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY; // CORRIGIDO!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
// Logs de diagnóstico
console.log(`1. Ambiente: ${process.env.NODE_ENV || 'development'}`);
console.log(`2. URL: ${supabaseUrl ? 'OK' : '❌ VAZIA'}`);
console.log(`3. ANON_KEY: ${supabaseKey ? 'OK' : '❌ VAZIA'}`);
console.log(`4. SERVICE_KEY: ${supabaseServiceKey ? 'OK' : '❌ VAZIA'}`);
if (!supabaseUrl || !supabaseKey) {
    throw new Error(`FALHA: Variáveis não encontradas. URL=${!!supabaseUrl}, KEY=${!!supabaseKey}`);
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
exports.supabaseAdmin = supabaseServiceKey
    ? (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : null;
console.log('✅ Supabase inicializado');
