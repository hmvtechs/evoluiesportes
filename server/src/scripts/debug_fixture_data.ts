
import { supabase } from '../config/supabase';

async function verifyFixture() {
    console.log('🔍 Checking database integrity...');

    // 1. Get latest competition
    const { data: comps } = await supabase
        .from('Competition')
        .select('id, name')
        .order('created_at', { ascending: false })
        .limit(1);

    if (!comps || comps.length === 0) {
        console.log('❌ No competitions found');
        return;
    }

    const compId = comps[0].id;
    console.log(`🏆 Latest Competition: "${comps[0].name}" (ID: ${compId})`);

    // 2. Check Groups
    const { data: groups, error: groupError } = await supabase
        .from('Group')
        .select('id, name, phase_id')
        .eq('phase_id', (await supabase.from('Phase').select('id').eq('competition_id', compId).single()).data?.id); // Hacky get phase

    // Better: Get phases first
    const { data: phases } = await supabase.from('Phase').select('id, name, type').eq('competition_id', compId);
    console.log(`📊 Phases: ${phases?.length}`);
    if (phases) {
        for (const p of phases) {
            const { count } = await supabase.from('Group').select('*', { count: 'exact', head: true }).eq('phase_id', p.id);
            console.log(`   - Phase "${p.name}" (${p.type}): ${count} groups`);
        }
    }

    // 3. Check Registrations
    const { data: regs } = await supabase
        .from('TeamRegistration')
        .select('id, team_id, group_id, status')
        .eq('competition_id', compId);

    const totalRegs = regs?.length || 0;
    const withGroup = regs?.filter(r => r.group_id).length || 0;
    console.log(`📝 Registrations: ${totalRegs} total, ${withGroup} assigned to a group`);

    // 4. Check Matches
    const { data: matches } = await supabase
        .from('GameMatch')
        .select('id, round_number, group_id, scheduled_date, team_a_id, team_b_id')
        .eq('competition_id', compId);

    console.log(`⚽ Matches detected: ${matches?.length}`);

    if (matches && matches.length > 0) {
        console.log('   Sample matches:');
        matches.slice(0, 5).forEach(m => {
            console.log(`   - Round ${m.round_number}, Group ${m.group_id}: Team ${m.team_a_id} vs ${m.team_b_id} @ ${m.scheduled_date}`);
        });
    } else {
        console.log('⚠️ NO MATCHES FOUND. Generation failed or was not triggered.');
    }
}

verifyFixture().catch(console.error);
