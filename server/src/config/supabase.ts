import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Truque: Só tenta ler o arquivo .env se estivermos no computador (development)
// No Render (production), ele pula isso e usa as variáveis do painel
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: path.resolve(__dirname, '../../.env') });
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

export const supabase = createClient(supabaseUrl, supabaseKey);

export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }) 
  : null;