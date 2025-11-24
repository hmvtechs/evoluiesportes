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
// Tenta pegar ANON_KEY, se não tiver, tenta KEY (para compatibilidade com Render)
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Logs de diagnóstico (seguros)
console.log(`1. Ambiente: ${process.env.NODE_ENV || 'development'}`);
console.log(`2. URL: ${supabaseUrl ? 'OK' : '❌ VAZIA'}`);
console.log(`3. KEY (Anon): ${supabaseKey ? 'OK' : '❌ VAZIA'}`);
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