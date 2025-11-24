"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseAdmin = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Truque: Só tenta ler o arquivo .env se estivermos no computador (development)
// No Render (production), ele pula isso e usa as variáveis do painel
if (process.env.NODE_ENV !== 'production') {
    dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
}
console.log('--- INICIANDO SUPABASE (Diagnóstico) ---');
// Pega as variáveis
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // O Render deve injetar isso aqui
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
// MOSTRA NO LOG O QUE O SERVIDOR ESTÁ VENDO (Sem mostrar a senha inteira)
console.log(`1. Ambiente: ${process.env.NODE_ENV || 'development'}`);
console.log(`2. URL: ${supabaseUrl ? 'OK (Carregada)' : '❌ VAZIA'}`);
console.log(`3. KEY (Anon): ${supabaseKey ? 'OK (' + supabaseKey.substring(0, 5) + '...)' : '❌ VAZIA'}`);
console.log('------------------------------------------');
if (!supabaseUrl || !supabaseKey) {
    // Isso vai aparecer no log do Render se der erro
    throw new Error(`FALHA CRÍTICA: Variáveis não encontradas. URL=${supabaseUrl}, KEY=${supabaseKey}`);
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
