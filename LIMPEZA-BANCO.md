# 🧹 Limpeza Total do Banco de Dados

## 🎯 Objetivo
Apagar TODOS os dados de teste e deixar apenas 1 usuário administrador limpo.

---

## ⚡ OPÇÃO 1: Script Automático (RECOMENDADO)

**Mais Fácil e Rápido!**

```bash
cd server
node create-admin.js
```

Este script vai:
- ✅ Limpar TODAS as tabelas
- ✅ Deletar TODOS os usuários
- ✅ Criar 1 admin: `admin@sistema.com` / `Admin@123`

**ATENÇÃO:** Este processo é **IRREVERSÍVEL**!

---

## 🔧 OPÇÃO 2: Manual via SQL Editor

### 1. Abrir Supabase SQL Editor
https://app.supabase.com/ → Seu projeto → **SQL Editor**

### 2. Executar Script de Limpeza
Abra o arquivo: `server/limpar-banco.sql`

Copie e execute o SQL (PASSO 1 do arquivo)

### 3. Limpar Usuários Manualmente
https://app.supabase.com/ → **Authentication** → **Users**
- Selecione todos
- Delete

### 4. Criar Admin Manualmente
**Authentication** → **Users** → **Add User**
```
Email: admin@sistema.com
Password: Admin@123
☑️ Auto Confirm User
```

### 5. Criar Perfil na Tabela User
Volte ao SQL Editor e execute o INSERT do PASSO 2 (substitua o UUID)

---

## ✅ Verificar Limpeza

Execute no SQL Editor:
```sql
SELECT 'Users' as tabela, COUNT(*) as total FROM "User"
UNION ALL
SELECT 'Competitions', COUNT(*) FROM "Competition"
UNION ALL
SELECT 'Teams', COUNT(*) FROM "Team"
UNION ALL
SELECT 'Matches', COUNT(*) FROM "GameMatch";
```

**Resultado esperado:**
```
Users: 1
Competitions: 0
Teams: 0
Matches: 0
```

---

## 🔑 Credenciais do Admin

Após a limpeza:
```
Email: admin@sistema.com
Senha: Admin@123
```

⚠️ **IMPORTANTE:** Mude a senha após primeiro login!

---

## 📁 Arquivos Criados

1. `server/limpar-banco.sql` - Script SQL manual
2. `server/create-admin.js` - Script automático (Node.js)

---

## ⚠️ ATENÇÃO

- ✅ Backup seus dados antes (se necessário)
- ✅ Este processo é **IRREVERSÍVEL**
- ✅ Vai apagar: competições, times, organizações, locais, etc.
- ✅ Vai manter: estrutura das tabelas (schemas)

---

## 🆘 Se Algo Der Errado

Execute novamente:
```bash
node create-admin.js
```

Ou recrie manualmente via Dashboard (Opção 2).
