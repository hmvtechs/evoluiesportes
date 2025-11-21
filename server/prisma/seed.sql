-- Seed script SQL para criar usuários e entidades de teste
-- Execute com: psql -U postgres -d seu_banco < seed.sql

-- Criar organização padrão (assumindo que admin existe)
DO $$
DECLARE
  admin_id TEXT;
  org_id INT;
  champ_id INT;
  pwd_hash TEXT := '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'; -- senha123
BEGIN
  -- Pegar ID do admin
  SELECT id INTO admin_id FROM "User" WHERE role = 'ADMIN' LIMIT 1;
  
  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'Admin user not found';
  END IF;

  -- Criar organização
  INSERT INTO "Organization" (name_official, cnpj, manager_user_id)
  VALUES ('Clube Default', '00.000.000/0000-00', admin_id)
  RETURNING id INTO org_id;

  -- Criar campeonato
  INSERT INTO "Championship" (name, status, type)
  VALUES ('Campeonato Padrão', 'OPEN', 'LEAGUE')
  RETURNING id INTO champ_id;

  -- Criar 100 atletas
  FOR i IN 1..100 LOOP
    DECLARE
      user_id TEXT;
      cpf_num TEXT := LPAD((999999999 + i)::TEXT, 11, '0');
    BEGIN
      INSERT INTO "User" (
        id, cpf, email, password_hash, full_name, phone, sex, birth_date,
        role, rf_status, is_obfuscated, city, state, created_at, updated_at
      ) VALUES (
        gen_random_uuid()::TEXT,
        cpf_num,
        'user' || i || '@example.com',
        pwd_hash,
        'Atleta ' || i,
        '+55' || (1000000000 + i),
        CASE WHEN i % 2 = 0 THEN 'M' ELSE 'F' END,
        '1990-01-01'::DATE,
        'USER',
        'VALID',
        false,
        'São Paulo',
        'SP',
        NOW(),
        NOW()
      )
      RETURNING id INTO user_id;

      -- Criar perfil de atleta
      INSERT INTO "AthleteProfile" (user_id, document_url, photo_url, status, created_at, updated_at)
      VALUES (
        user_id,
        'https://example.com/doc.pdf',
        'https://example.com/photo.jpg',
        'VALID',
        NOW(),
        NOW()
      );
    END;
  END LOOP;

  -- Criar 20 times
  FOR i IN 1..20 LOOP
    INSERT INTO "Team" (organization_id, championship_id, category)
    VALUES (org_id, champ_id, 'Senior');
  END LOOP;

  -- Criar 10 árbitros
  FOR i IN 1..10 LOOP
    DECLARE
      user_id TEXT;
      cpf_num TEXT := LPAD((888888888 + i)::TEXT, 11, '0');
    BEGIN
      INSERT INTO "User" (
        id, cpf, email, password_hash, full_name, phone, sex, birth_date,
        role, rf_status, is_obfuscated, city, state, created_at, updated_at
      ) VALUES (
        gen_random_uuid()::TEXT,
        cpf_num,
        'referee' || i || '@example.com',
        pwd_hash,
        'Árbitro ' || i,
        '+55' || (2000000000 + i),
        CASE WHEN i % 2 = 0 THEN 'M' ELSE 'F' END,
        '1985-01-01'::DATE,
        'STAFF',
        'VALID',
        false,
        'Rio de Janeiro',
        'RJ',
        NOW(),
        NOW()
      )
      RETURNING id INTO user_id;

      -- Criar registro de árbitro
      INSERT INTO "Referee" (user_id, category, functions)
      VALUES (user_id, 'Football', '["MATCH_OFFICIAL"]');
    END;
  END LOOP;

  -- Criar 3 staff members
  FOR i IN 1..3 LOOP
    DECLARE
      cpf_num TEXT := LPAD((777777777 + i)::TEXT, 11, '0');
    BEGIN
      INSERT INTO "User" (
        id, cpf, email, password_hash, full_name, phone, sex, birth_date,
        role, rf_status, is_obfuscated, city, state, created_at, updated_at
      ) VALUES (
        gen_random_uuid()::TEXT,
        cpf_num,
        'staff' || i || '@example.com',
        pwd_hash,
        'Staff ' || i,
        '+55' || (3000000000 + i),
        CASE WHEN i % 2 = 0 THEN 'M' ELSE 'F' END,
        '1992-01-01'::DATE,
        'STAFF',
        'VALID',
        false,
        'Belo Horizonte',
        'MG',
        NOW(),
        NOW()
      );
    END;
  END LOOP;

  RAISE NOTICE 'Seed data inserted successfully!';
END $$;
