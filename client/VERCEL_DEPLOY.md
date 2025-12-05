# Vercel Deployment Instructions

## ✅ Correções Aplicadas

### 1. Removido `vercel.json` da raiz
O arquivo na raiz estava configurado para serverless functions, causando conflito com o deploy do frontend SPA.

### 2. Atualizado `client/vercel.json`
Migrado da configuração antiga (version 2) para formato moderno com:
- `buildCommand`: `npm run build`
- `outputDirectory`: `dist`
- `framework`: `vite`
- `rewrites`: Suporte para React Router (SPA)

### 3. Configurado `vite.config.ts`
Adicionadas configurações de build para produção:
- `base: '/'` - Paths corretos para assets
- `outDir: 'dist'` - Diretório de saída padrão
- `sourcemap: false` - Reduz tamanho do bundle

## 📋 Passos para Deploy no Vercel

### Opção A: Deploy via Dashboard (Recomendado)

1. **Acesse o Vercel Dashboard**: https://vercel.com/dashboard

2. **Import Project**:
   - Clique em "Add New..." → "Project"
   - Select Git Provider (GitHub/GitLab/Bitbucket)
   - Escolha o repositório `EvoluiGestão`

3. **Configure Build Settings**:
   ```
   Framework Preset: Vite
   Root Directory: client
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Environment Variables**:
   - `VITE_API_URL`: URL do backend (ex: `https://seu-backend.onrender.com`)
   - `VITE_SUPABASE_URL`: URL do Supabase
   - `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase

5. **Deploy**: Clique em "Deploy"

### Opção B: Deploy via CLI

```bash
# 1. Instalar Vercel CLI (se não tiver)
npm i -g vercel

# 2. Navegar para o diretório do client
cd client

# 3. Login no Vercel
vercel login

# 4. Deploy
vercel --prod
```

Quando perguntado:
- **Setup and deploy**: Yes
- **Which scope**: Seu username/org
- **Link to existing project**: No (primeira vez) / Yes (redeploy)
- **Project name**: evolui-gestao (ou seu nome preferido)
- **Directory**: `.` (já está em /client)
- **Override settings**: No

## 🔧 Troubleshooting

### 404 em Rotas do React Router

**Causa**: Vercel não está redirecionando todas as rotas para `index.html`

**Solução**: Já configurado no `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Assets não Carregam (JS/CSS 404)

**Causa**: Paths incorretos no build

**Solução**: Já configurado no `vite.config.ts`:
```typescript
base: '/'
```

### Variáveis de Ambiente Undefined

**Causa**: Env vars não configuradas no Vercel

**Solução**:
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Adicione todas as variáveis do arquivo `.env.example`
3. Marque para usar em: Production, Preview, Development
4. Redeploy o projeto

### Build Falha

**Causa**: Dependências faltando ou TypeScript errors

**Solução**:
```bash
# Local - testar build
cd client
npm run build

# Se houver erros de TypeScript, corrija-os antes de deploy
npm run lint
```

## ✅ Checklist Antes do Deploy

- [ ] Código commitado e pushed para o Git
- [ ] `.env.production` com valores corretos (não commitar!)
- [ ] Build local funciona: `npm run build`
- [ ] Preview funciona: `npm run preview`
- [ ] Variáveis de ambiente preparadas
- [ ] Backend está rodando e acessível

## 🔗 URLs Após Deploy

- **Production**: `https://seu-projeto.vercel.app`
- **Dashboard**: `https://vercel.com/seu-username/seu-projeto`
- **Deployments**: Ver histórico e logs de builds

## 📝 Notas Adicionais

- O Vercel faz **automatic deployments** em cada push para o branch principal
- **Preview deployments** são criados automaticamente para PRs
- Logs de build estão disponíveis no Dashboard para debug
- Certificado SSL é automático e gratuito
