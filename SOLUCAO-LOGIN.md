# 🔐 Solução: Email ou Senha Incorretos

## ✅ TESTE BEM SUCEDIDO!

Rodei um teste de autenticação e **FUNCIONOU**! 🎉

## 👤 Credenciais de Teste Criadas

Use estas para testar o login:

```
Email: admin@teste.com
Senha: Teste123!
```

## 📋 Usuários Existentes no Banco

Encontrei 5 usuários na tabela `User`:
- `admin@admin.com` (Administrador)
- `admin@teste.com` (Admin Teste) ← **NOVO**
- `user1@example.com` (Atleta 1)
- `user2@example.com` (Atleta 2)
- `user26@example.com` (Atleta 26)
- `user27@example.com` (Atleta 27)

## 🐛 Possíveis Causas do Erro

### 1. **Confirmação de Email**
O Supabase pode estar exigindo confirmação de email!

**Solução Rápida:**
1. Acesse: https://app.supabase.com/
2. Seu projeto → **Authentication** → **Providers**
3. Clique em **Email**
4. **DESABILITE** → "Confirm email" (para desenvolvimento)
5. Salve

### 2. **Senha dos Usuários Antigos**
Os usuários `admin@admin.com`, `user1@example.com`, etc. podem ter senhas diferentes ou não estarem em `auth.users`.

**Teste:**
- Use `admin@teste.com` / `Teste123!` que acabei de criar

### 3. **Tabela com Nome Errado**
Verifique se a tabela no Supabase se chama `User` (com U maiúsculo).

### 4. **Email com Espaços**
Certifique-se de não ter espaços antes/depois do email.

## 🔧 Como Criar Mais Usuários de Teste

### Opção 1: Via Script (Rápido)
```bash
cd server
node test-auth.js
```

### Opção 2: Via Tela de Registro
1. Acesse `http://localhost:5173/register`
2. Preencha o formulário
3. Clique em "Cadastrar"

### Opção 3: Via Supabase Dashboard
1. https://app.supabase.com/
2. Seu projeto → **Authentication** → **Users**
3. **Add User** → **Create new user**
4. Email: `seu@email.com`
5. Password: `SuaSenha123!`
6. User Metadata (opcional):
   ```json
   {
     "name": "Seu Nome",
     "role": "ADMIN"
   }
   ```

## ✅ Testando Agora

1. Abra `http://localhost:5173/login`
2. Digite:
   - Email: `admin@teste.com`
   - Senha: `Teste123!`
3. Clique em "Entrar"
4. ✅ Deve funcionar!

## 📝 Como Saber Senha de Usuários Existentes

**Resposta Curta:** **Não dá!** 🔒

As senhas ficam criptografadas em `auth.users` (inacessível).

**Opções:**
1. **Resetar senha** no Supabase Dashboard
2. **Criar novo usuário** de teste
3. **Use** `admin@teste.com` / `Teste123!`

## 🆘 Ainda com Erro?

Execute novamente:
```bash
cd server
node test-auth.js
```

E me mostre o resultado! 🔍
