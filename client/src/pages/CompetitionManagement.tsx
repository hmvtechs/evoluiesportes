import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Users, Shuffle, Calendar, Play, ArrowLeft, Plus, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FixtureTable from '../components/FixtureTable';
import TeamRegistrationModal from '../components/TeamRegistrationModal';
import AthleteRosterModal from '../components/AthleteRosterModal';
import { API_BASE_URL } from '../config/api';

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
    const [activeTab, setActiveTab] = useState<'teams' | 'groups' | 'fixture'>('teams');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showRosterModal, setShowRosterModal] = useState(false);
    const [selectedTeamRegId, setSelectedTeamRegId] = useState<number | null>(null);

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
            const response = await fetch(`${API_BASE_URL}/api/v1/competitions/${id}`, {
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
            const response = await fetch(`${API_BASE_URL}/api/v1/competitions/${id}`, {
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

    if (!competition) {
        return <div style={{ padding: '2rem' }}>Carregando...</div>;
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button className="btn-secondary btn-icon" onClick={() => navigate('/modules')}>
                    <ArrowLeft size={20} />
                </button>
                <Trophy size={32} color="var(--primary)" />
                <div>
                    <h1 style={{ margin: 0 }}>{competition.name}</h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {competition.modality.name} • Status: {competition.status}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--surface-light)' }}>
                <button
                    onClick={() => setActiveTab('teams')}
                    style={{
                        padding: '1rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'teams' ? '3px solid var(--primary)' : 'none',
                        color: activeTab === 'teams' ? 'var(--primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'teams' ? 'bold' : 'normal'
                    }}
                >
                    <Users size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Times Inscritos
                </button>
                <button
                    onClick={() => setActiveTab('groups')}
                    style={{
                        padding: '1rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'groups' ? '3px solid var(--primary)' : 'none',
                        color: activeTab === 'groups' ? 'var(--primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'groups' ? 'bold' : 'normal'
                    }}
                >
                    <Shuffle size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Estrutura & Sorteio
                </button>
                <button
                    onClick={() => setActiveTab('fixture')}
                    style={{
                        padding: '1rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'fixture' ? '3px solid var(--primary)' : 'none',
                        color: activeTab === 'fixture' ? 'var(--primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'fixture' ? 'bold' : 'normal'
                    }}
                >
                    <Calendar size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Tabela de Jogos
                </button>
            </div>

            {/* Content */}
            <div className="card">
                {activeTab === 'teams' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>Times Inscritos ({teams.length})</h3>
                            <button
                                className="btn-primary"
                                onClick={() => setShowModal(true)}
                            >
                                <Plus size={16} />
                                Inscrever Time
                            </button>
                        </div>
                        {teams.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)' }}>Nenhum time inscrito ainda.</p>
                        ) : (
                            <table style={{ width: '100%', marginTop: '1rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--surface-light)' }}>
                                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Time</th>
                                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Grupo</th>
                                        <th style={{ textAlign: 'center', padding: '0.5rem' }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teams.map(team => (
                                        <tr key={team.id} style={{ borderBottom: '1px solid var(--surface-light)' }}>
                                            <td style={{ padding: '0.75rem' }}>
                                                {team.team?.organization?.name_official || 'N/A'}
                                            </td>
                                            <td style={{ padding: '0.75rem' }}>
                                                {team.group?.name || <em style={{ color: 'var(--text-muted)' }}>Não sorteado</em>}
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                <button
                                                    className="btn-secondary"
                                                    onClick={() => {
                                                        setSelectedTeamRegId(team.id);
                                                        setShowRosterModal(true);
                                                    }}
                                                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                                                >
                                                    <UserPlus size={14} />
                                                    Elenco
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {activeTab === 'groups' && (
                    <div>
                        <h3>Fases e Grupos</h3>
                        {phases.map(phase => (
                            <div key={phase.id} style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--surface-light)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4>{phase.name}</h4>
                                    <button
                                        className="btn-primary"
                                        onClick={() => handleDrawGroups(phase.id)}
                                        disabled={loading}
                                    >
                                        <Shuffle size={16} />
                                        Sortear Times
                                    </button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem', marginTop: '1rem' }}>
                                    {phase.groups?.map(group => (
                                        <div key={group.id} className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                                            {group.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'fixture' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>Tabela de Jogos</h3>
                            <button
                                className="btn-primary"
                                onClick={handleGenerateFixture}
                                disabled={loading}
                            >
                                <Play size={16} />
                                Gerar Fixture
                            </button>
                        </div>
                        <FixtureTable />
                    </div>
                )}
            </div>

            {/* Modal */}
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

            {/* Athlete Roster Modal */}
            {showRosterModal && selectedTeamRegId && (
                <AthleteRosterModal
                    teamRegistrationId={selectedTeamRegId}
                    onClose={() => {
                        setShowRosterModal(false);
                        setSelectedTeamRegId(null);
                    }}
                    onSuccess={() => {
                        // No need to refresh anything specific here
                        // Athletes are managed per team
                    }}
                />
            )}
        </div>
    );
};

export default CompetitionManagement;
