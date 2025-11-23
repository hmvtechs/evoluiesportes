# 📝 Como Atualizar Nomes das Organizações

## Passo a Passo Rápido

### 1. Acesse o Supabase SQL Editor
1. Vá em https://app.supabase.com/
2. Selecione seu projeto
3. Clique em **SQL Editor** no menu lateral

### 2. Execute o Script de Consulta

Cole e execute isto primeiro para ver as organizações:

```sql
SELECT id, name_official, cnpj FROM "Organization" ORDER BY id;
```

Você verá algo como:
```
id | name_official  | cnpj
---+---------------+------------------
1  | Clube Default | 00.000.000/0000-00
2  | Clube Default | 00.000.000/0000-00
```

### 3. Atualize os Nomes

Copie e adapte este template:

```sql
-- Substitua pelos nomes REAIS dos clubes
UPDATE "Organization"
SET name_official = 'Flamengo Esporte Clube'
WHERE id = 1;

UPDATE "Organization"
SET name_official = 'Palmeiras Society'
WHERE id = 2;

-- Adicione mais conforme necessário
```

### 4. Execute e Verifique

```sql
SELECT id, name_official FROM "Organization" ORDER BY id;
```

### 5. Recarregue o Frontend

Pressione **F5** na página da competição e os nomes atualizados aparecerão!

---

## 🎯 Exemplo Completo

Para a competição "Pirapora", se você tem 4 times:

```sql
UPDATE "Organization" SET name_official = 'Clube Atletico Mineiro' WHERE id = 1;
UPDATE "Organization" SET name_official = 'Cruzeiro Esporte Clube' WHERE id = 2;
UPDATE "Organization" SET name_official = 'América Futebol Clube' WHERE id = 3;
UPDATE "Organization" SET name_official = 'Athletic Club' WHERE id = 4;
```

---

## 📂 Arquivo Criado

O script SQL completo está em:
```
server/update-organizations.sql
```

Este arquivo tem exemplos e comandos úteis adicionais! 🚀
