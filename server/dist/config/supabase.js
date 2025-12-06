"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseAdmin = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const curlFetch_1 = require("../utils/curlFetch");
// Carregar .env apenas em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
    dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
}
console.log('--- INICIANDO SUPABASE (CURL MODE) ---');
// Pegar variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
// Logs de diagnóstico
console.log(`1. Ambiente: ${process.env.NODE_ENV || 'development'}`);
console.log(`2. URL: ${supabaseUrl || '❌ VAZIA'}`);
console.log(`3. KEY (Anon): ${supabaseKey ? 'OK' : '❌ VAZIA'}`);
console.log(`4. SERVICE_KEY: ${supabaseServiceKey ? 'OK' : '❌ VAZIA'}`);
if (!supabaseUrl || !supabaseKey) {
    throw new Error(`FALHA: Variáveis não encontradas. URL=${!!supabaseUrl}, KEY=${!!supabaseKey}`);
}
const clientOptions = {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
    },
    global: {
        fetch: curlFetch_1.curlFetch
    }
};
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey, clientOptions);
exports.supabaseAdmin = supabaseServiceKey
    ? (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, clientOptions)
    : null;
console.log('✅ Supabase inicializado (CURL Fetch)');
