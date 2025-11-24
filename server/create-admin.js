const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function createAdmin() {
    console.log('🧹 Limpando banco e criando administrador...\n');

    const supabaseAdmin = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY // Precisa de SERVICE_KEY para deletar usuários
    );

    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    );

    // ========================================
    // PASSO 1: LIMPAR TABELAS (ORDEM CORRETA!)
    // ========================================
    console.log('1️⃣ Limpando tabelas do banco...\n');

    // Ordem correta: deletar filhos antes dos pais (por causa das foreign keys)
    const cleanupSteps = [
        // Primeiro: tabelas que dependem de outras
        { table: 'MatchEvent', desc: 'Eventos de partidas' },
        { table: 'GameMatch', desc: 'Partidas' },
        { table: 'AthleteInscription', desc: 'Inscrições de atletas' },  // NOVO
        { table: 'TeamRegistration', desc: 'Inscrições de times' },
        { table: 'Group', desc: 'Grupos' },
        { table: 'Phase', desc: 'Fases' },
        { table: 'CompetitionVenue', desc: 'Locais de competição' },
        { table: 'Competition', desc: 'Competições' },
        { table: 'Team', desc: 'Times' },
        { table: 'Booking', desc: 'Reservas' },
        { table: 'Venue', desc: 'Locais' },
        { table: 'Organization', desc: 'Organizações' },
        { table: 'AthleteProfile', desc: 'Perfis de atletas' },  // NOVO - antes de User
        // Por último: usuários
        { table: 'User', desc: 'Usuários' }
    ];

    for (const step of cleanupSteps) {
        try {
            // Usar truncate se possível, senão delete com condição sempre verdadeira
            const { error, count } = await supabaseAdmin
                .from(step.table)
                .delete()
                .gte('id', 0); // Condição sempre verdadeira

            if (error) {
                console.log(`⚠️  ${step.table}: ${error.message}`);
            } else {
                console.log(`✅ ${step.desc}: Limpo`);
            }
        } catch (err) {
            console.log(`⚠️  ${step.table}: ${err.message}`);
        }
    }

    // ========================================
    // PASSO 2: LIMPAR auth.users
    // ========================================
    console.log('\n2️⃣ Limpando usuários do Supabase Auth...\n');

    // Listar todos os usuários
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
        console.log('❌ Erro ao listar usuários:', listError.message);
    } else {
        console.log(`Encontrados ${users.length} usuários`);

        // Deletar todos
        for (const user of users) {
            const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
            if (deleteError) {
                console.log(`❌ Erro ao deletar ${user.email}:`, deleteError.message);
            } else {
                console.log(`✅ Deletado: ${user.email}`);
            }
        }
    }

    // ========================================
    // PASSO 3: CRIAR NOVO ADMIN
    // ========================================
    console.log('\n3️⃣ Criando novo usuário administrador...\n');

    const adminEmail = 'admin@sistema.com';
    const adminPassword = 'Admin@123';  // MUDE ESTA SENHA!

    // Criar no auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,  // Já confirma o email
        user_metadata: {
            full_name: 'Administrador',
            role: 'ADMIN'
        }
    });

    if (authError) {
        console.log('❌ Erro ao criar usuário:', authError.message);
        return;
    }

    console.log(`✅ Usuário criado em auth.users`);
    console.log(`   ID: ${authData.user.id}`);
    console.log(`   Email: ${authData.user.email}`);

    // Aguardar um pouco para garantir que o auth.users foi criado
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Criar perfil na tabela User
    console.log('\n   Criando perfil na tabela User...');

    const userProfile = {
        id: authData.user.id,
        email: adminEmail,
        cpf: '00000000000',
        full_name: 'Administrador',
        role: 'ADMIN',
        rf_status: 'VALID',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    console.log('   Dados do perfil:', JSON.stringify(userProfile, null, 2));

    const { data: profileData, error: profileError } = await supabaseAdmin
        .from('User')
        .insert(userProfile)
        .select()
        .single();

    if (profileError) {
        console.log('❌ Erro ao criar perfil:', profileError.message);
        console.log('   Detalhes:', profileError);
        console.log('\n⚠️  O usuário foi criado no auth.users mas o perfil falhou.');
        console.log('   Você pode criar manualmente ou tentar novamente.');
        return;
    }

    console.log(`✅ Perfil criado na tabela User`);

    // ========================================
    // PASSO 4: VERIFICAR
    // ========================================
    console.log('\n4️⃣ Verificando resultado...\n');

    const { count } = await supabase
        .from('User')
        .select('*', { count: 'exact', head: true });

    console.log(`Total de usuários: ${count}`);

    // ========================================
    // RESUMO
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('✅ BANCO LIMPO E ADMIN CRIADO!');
    console.log('='.repeat(60));
    console.log(`\nCredenciais do Administrador:`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Senha: ${adminPassword}`);
    console.log(`\n⚠️  IMPORTANTE: Mude a senha após o primeiro login!`);
    console.log('='.repeat(60));
}

createAdmin().catch(console.error);
