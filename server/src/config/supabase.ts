import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Carregar .env apenas em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

console.log('--- INICIANDO SUPABASE ---');

// Pegar variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;  // CORRIGIDO!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Logs de diagnóstico
console.log(`1. Ambiente: ${process.env.NODE_ENV || 'development'}`);
console.log(`2. URL: ${supabaseUrl ? 'OK' : '❌ VAZIA'}`);
console.log(`3. ANON_KEY: ${supabaseKey ? 'OK' : '❌ VAZIA'}`);
console.log(`4. SERVICE_KEY: ${supabaseServiceKey ? 'OK' : '❌ VAZIA'}`);

if (!supabaseUrl || !supabaseKey) {
  throw new Error(`FALHA: Variáveis não encontradas. URL=${!!supabaseUrl}, KEY=${!!supabaseKey}`);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  : null;

console.log('✅ Supabase inicializado');