import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { curlFetch } from '../utils/curlFetch';

// Carregar .env apenas em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
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
    fetch: curlFetch as any
  }
};

export const supabase = createClient(supabaseUrl!, supabaseKey!, clientOptions);

export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl!, supabaseServiceKey, clientOptions)
  : null;

console.log('✅ Supabase inicializado (CURL Fetch)');