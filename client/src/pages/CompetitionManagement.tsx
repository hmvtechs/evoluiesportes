import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Users, Shuffle, Calendar, Play, ArrowLeft, Plus, UserPlus, ChevronRight, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FixtureTable from '../components/FixtureTable';
import TeamRegistrationModal from '../components/TeamRegistrationModal';
import AthleteRosterModal from '../components/AthleteRosterModal';
import { API_BASE_URL } from '../config/api';
import { IOSCard, IOSButton, IOSSegmentedControl } from '../components/ui/IOSDesign';

interface Competition {
    id: number;
    name: string;
    nickname?: string;
    start_date?: string;
    end_date?: string;
    status: string;
    modality: { name: string };
}

interface Team {
    id: number;
    team_id: number;
    team: {
        organization: {
            name_official: string;
            logo_url?: string;
        };
    };
    group?: {
        name: string;
    };
}

interface Phase {
    id: number;
    name: string;
    type: string;
    groups: Group[];
}

interface Group {
    id: number;
    name: string;
}

const CompetitionManagement: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [competition, setCompetition] = useState<Competition | null>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const [phases, setPhases] = useState<Phase[]>([]);
    const [activeTab, setActiveTab] = useState('teams');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showRosterModal, setShowRosterModal] = useState(false);
    const [selectedTeamRegId, setSelectedTeamRegId] = useState<number | null>(null);
    const [deletingTeamId, setDeletingTeamId] = useState<number | null>(null);

    useEffect(() => {
        fetchCompetition();
        fetchTeams();
        fetchPhases();
    }, [id]);

    const fetchCompetition = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/competitions/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCompetition(data);
            }
        } catch (error) {
            console.error('Failed to fetch competition', error);
        }
    };

    const fetchTeams = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/competitions/${id}?t=${Date.now()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setTeams(data.registrations || []);
            }
        } catch (error) {
            console.error('Failed to fetch teams', error);
        }
    };

    const fetchPhases = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/competitions/${id}?t=${Date.now()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPhases(data.phases || []);
            }
        } catch (error) {
            console.error('Failed to fetch phases', error);
        }
    };

    const handleDrawGroups = async (phaseId: number) => {
        if (!confirm('Deseja sortear os times nos grupos? Esta ação não pode ser desfeita.')) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/competitions/${id}/draw-groups`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ phase_id: phaseId })
            });

            if (response.ok) {
                const data = await response.json();
                alert('Times sorteados com sucesso!');
                console.log('Distribution:', data.distribution);
                fetchTeams(); // Refresh
            } else {
                const error = await response.json();
                alert(`Erro: ${error.error}`);
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao sortear times');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateFixture = async () => {
        if (!confirm('Deseja gerar a tabela de jogos?')) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/competitions/${id}/fixture`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    venueAssignmentMode: 'RANDOM',
                    matchesPerDay: 3
                })
            });

            if (response.ok) {
                alert('Fixture gerado com sucesso!');
                setActiveTab('fixture');
            } else {
                const error = await response.json();
                alert(`Erro: ${error.error}`);
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao gerar fixture');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTeam = async (teamRegId: number, teamName: string) => {
        if (!confirm(`Deseja remover "${teamName}" da competição?`)) {
            return;
        }

        console.log('🗑️ [handleDeleteTeam] Starting delete...', { teamRegId, teamName, id, token: token ? 'present' : 'missing' });

        setDeletingTeamId(teamRegId);
        try {
            const url = `${API_BASE_URL}/api/v1/competitions/${id}/registrations/${teamRegId}`;
            console.log('🔗 [handleDeleteTeam] DELETE URL:', url);

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('📡 [handleDeleteTeam] Response status:', response.status);

            if (response.ok) {
                console.log('✅ [handleDeleteTeam] Delete successful!');
                fetchTeams(); // Refresh the list
            } else {
                const error = await response.json();
                console.error('❌ [handleDeleteTeam] Error:', error);
                alert(`Erro: ${error.error}`);
            }
        } catch (error) {
            console.error('🔴 [handleDeleteTeam] Exception:', error);
            alert('Erro ao remover time');
        } finally {
            setDeletingTeamId(null);
        }
    };

    if (!competition) {
        return <div style={{ padding: '4rem', textAlign: 'center', color: '#8E8E93' }}>Carregando...</div>;
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem 6rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate('/competitions')}
                    style={{
                        background: 'none', border: 'none', color: '#0A84FF',
                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                        fontSize: '17px', cursor: 'pointer', marginBottom: '1rem', padding: 0
                    }}
                >
                    <ArrowLeft size={20} />
                    Voltar
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(10, 132, 255, 0.3)'
                    }}>
                        <Trophy size={32} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>{competition.name}</h1>
                        <p style={{ color: '#8E8E93', fontSize: '15px', marginTop: '0.25rem' }}>
                            {competition.modality.name} • {competition.status}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div style={{ marginBottom: '2rem' }}>
                <IOSSegmentedControl
                    value={activeTab}
                    onChange={setActiveTab}
                    options={[
                        { value: 'teams', label: 'Times' },
                        { value: 'groups', label: 'Grupos' },
                        { value: 'fixture', label: 'Jogos' }
                    ]}
                />
            </div>

            {/* Content */}
            <div className="animate-fade-in">
                {activeTab === 'teams' && (
                    <IOSCard>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Times Inscritos ({teams.length})</h3>
                            <IOSButton onClick={() => setShowModal(true)} style={{ padding: '0.5rem 1rem', fontSize: '14px' }}>
                                <Plus size={16} />
                                Inscrever
                            </IOSButton>
                        </div>

                        {teams.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#8E8E93' }}>
                                <Users size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                <p>Nenhum time inscrito ainda.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
                                {teams.map(team => {
                                    const logoUrl = team.team?.organization?.logo_url;
                                    const teamName = team.team?.organization?.name_official || 'Time';
                                    return (
                                        <div key={team.id} style={{
                                            padding: '1rem',
                                            background: 'rgba(30, 30, 32, 0.6)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                {/* Team Logo or Avatar */}
                                                {logoUrl ? (
                                                    <img
                                                        src={logoUrl}
                                                        alt={teamName}
                                                        style={{
                                                            width: '48px', height: '48px', borderRadius: '12px',
                                                            objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)'
                                                        }}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : null}
                                                <div style={{
                                                    width: '48px', height: '48px', borderRadius: '12px',
                                                    background: 'linear-gradient(135deg, #32D74B, #0A84FF)',
                                                    display: logoUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: 'white', fontWeight: 'bold', fontSize: '18px'
                                                }}>
                                                    {teamName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '16px' }}>
                                                        {teamName}
                                                    </div>
                                                    <div style={{ fontSize: '13px', color: '#8E8E93' }}>
                                                        {team.group?.name ? `Grupo ${team.group.name}` : 'Aguardando sorteio'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <IOSButton
                                                    variant="secondary"
                                                    onClick={() => {
                                                        setSelectedTeamRegId(team.id);
                                                        setShowRosterModal(true);
                                                    }}
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '13px' }}
                                                >
                                                    <UserPlus size={14} />
                                                    Elenco
                                                </IOSButton>
                                                <IOSButton
                                                    variant="secondary"
                                                    onClick={() => handleDeleteTeam(team.id, teamName)}
                                                    disabled={deletingTeamId === team.id}
                                                    style={{
                                                        padding: '0.4rem 0.5rem',
                                                        background: 'rgba(255, 69, 58, 0.15)',
                                                        color: '#FF453A'
                                                    }}
                                                >
                                                    <Trash2 size={14} />
                                                </IOSButton>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </IOSCard>
                )}

                {activeTab === 'groups' && (
                    <div>
                        {phases.map(phase => (
                            <IOSCard key={phase.id} style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: 700 }}>{phase.name}</h3>
                                    <IOSButton
                                        variant="secondary"
                                        onClick={() => handleDrawGroups(phase.id)}
                                        disabled={loading}
                                        style={{ fontSize: '14px' }}
                                    >
                                        <Shuffle size={16} />
                                        Sortear
                                    </IOSButton>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                                    {phase.groups?.map(group => (
                                        <div key={group.id} style={{
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            borderRadius: '12px',
                                            padding: '1.5rem',
                                            textAlign: 'center',
                                            border: '1px solid rgba(255, 255, 255, 0.1)'
                                        }}>
                                            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '0.5rem' }}>{group.name}</div>
                                            <div style={{ fontSize: '12px', color: '#8E8E93' }}>Grupo</div>
                                        </div>
                                    ))}
                                </div>
                            </IOSCard>
                        ))}
                    </div>
                )}

                {activeTab === 'fixture' && (
                    <IOSCard>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Tabela de Jogos</h3>
                            <IOSButton
                                onClick={handleGenerateFixture}
                                disabled={loading}
                            >
                                <Play size={16} />
                                Gerar Tabela
                            </IOSButton>
                        </div>
                        <FixtureTable />
                    </IOSCard>
                )}
            </div>

            {/* Modals */}
            {showModal && (
                <TeamRegistrationModal
                    competitionId={Number(id)}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        fetchTeams();
                        setShowModal(false);
                    }}
                />
            )}

            {showRosterModal && selectedTeamRegId && (
                <AthleteRosterModal
                    teamRegistrationId={selectedTeamRegId}
                    onClose={() => {
                        setShowRosterModal(false);
                        setSelectedTeamRegId(null);
                    }}
                    onSuccess={() => { }}
                />
            )}
        </div>
    );
};

export default CompetitionManagement;
