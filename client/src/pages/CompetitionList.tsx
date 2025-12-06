import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Plus, Calendar, Users, Edit, Trash2, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { IOSCard, IOSButton } from '../components/ui/IOSDesign';

interface Competition {
    id: number;
    name: string;
    nickname?: string;
    start_date?: string;
    end_date?: string;
    status: string;
    modality: {
        name: string;
    };
    _count?: {
        registrations: number;
        matches: number;
    };
}

const CompetitionList: React.FC = () => {
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCompetitions();
    }, []);

    const fetchCompetitions = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/competitions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCompetitions(data);
            }
        } catch (error) {
            console.error('Failed to fetch competitions', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (competition: Competition) => {
        // Debug URL
        alert(`Debug DELETE URL: ${API_BASE_URL}/api/v1/competitions/${competition.id}`);

        console.log('[DELETE] Iniciando exclusão de:', competition.name, 'ID:', competition.id);

        const confirmMessage = `Tem certeza que deseja excluir a competição "${competition.name}"?\n\nEsta ação não pode ser desfeita e irá remover todos os dados relacionados (fases, grupos, inscrições, partidas).`;

        if (!window.confirm(confirmMessage)) {
            console.log('[DELETE] Usuário cancelou a exclusão');
            return;
        }

        console.log('[DELETE] Usuário confirmou. Enviando requisição DELETE...');

        try {
            const url = `${API_BASE_URL}/api/v1/competitions/${competition.id}`;
            console.log('[DELETE] URL:', url);
            console.log('[DELETE] Token:', token ? 'Presente' : 'AUSENTE');

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('[DELETE] Response status:', response.status);
            const responseText = await response.text();
            console.log('[DELETE] Response body:', responseText);

            if (response.ok) {
                setCompetitions(prev => prev.filter(c => c.id !== competition.id));
                alert('Competição excluída com sucesso!');
            } else {
                let errorMsg = 'Erro desconhecido';
                try {
                    const error = JSON.parse(responseText);
                    errorMsg = error.error || error.message || errorMsg;
                } catch (e) {
                    errorMsg = responseText || errorMsg;
                }
                alert(`Erro ao excluir: ${errorMsg}`);
            }
        } catch (error) {
            console.error('[DELETE] Erro de rede:', error);
            alert('Erro ao excluir competição. Verifique sua conexão.');
        }
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, { bg: string; text: string }> = {
            'DRAFT': { bg: 'rgba(142, 142, 147, 0.2)', text: '#8E8E93' }, // iOS Gray
            'OPEN_FOR_REGISTRATION': { bg: 'rgba(10, 132, 255, 0.2)', text: '#0A84FF' }, // iOS Blue
            'ACTIVE': { bg: 'rgba(48, 209, 88, 0.2)', text: '#30D158' }, // iOS Green
            'FINISHED': { bg: 'rgba(255, 69, 58, 0.2)', text: '#FF453A' }, // iOS Red
        };
        const color = colors[status] || { bg: 'rgba(142, 142, 147, 0.2)', text: '#8E8E93' };

        return (
            <span style={{
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 700,
                background: color.bg,
                color: color.text,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
            }}>
                {status === 'DRAFT' ? 'Rascunho' :
                    status === 'OPEN_FOR_REGISTRATION' ? 'Inscrições' :
                        status === 'ACTIVE' ? 'Em Andamento' :
                            status === 'FINISHED' ? 'Finalizada' : status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="animate-fade-in" style={{ padding: '4rem', textAlign: 'center', color: '#8E8E93' }}>
                Carregando competições...
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem 6rem' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2.5rem',
                padding: '0 0.5rem'
            }}>
                <div>
                    <h1 style={{ fontSize: '34px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                        Competições
                    </h1>
                    <p style={{ color: '#8E8E93', fontSize: '17px' }}>
                        Gerencie seus torneios e campeonatos
                    </p>
                </div>
                <IOSButton onClick={() => navigate('/competitions/new')}>
                    <Plus size={20} />
                    Nova Competição
                </IOSButton>
            </div>

            {competitions.length === 0 ? (
                <IOSCard style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: 'rgba(10, 132, 255, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem'
                    }}>
                        <Trophy size={40} color="#0A84FF" />
                    </div>
                    <h3 style={{ fontSize: '22px', marginBottom: '0.5rem' }}>Nenhuma competição</h3>
                    <p style={{ color: '#8E8E93', marginBottom: '2rem' }}>
                        Comece criando seu primeiro campeonato agora mesmo.
                    </p>
                    <IOSButton onClick={() => navigate('/competitions/new')}>
                        Criar Competição
                    </IOSButton>
                </IOSCard>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                    {competitions.map(comp => (
                        <IOSCard
                            key={comp.id}
                            onClick={() => navigate(`/competitions/${comp.id}/manage`)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                padding: '0' // Reset padding for custom layout
                            }}
                        >
                            {/* Card Header */}
                            <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(10, 132, 255, 0.3)'
                                    }}>
                                        <Trophy size={24} color="white" />
                                    </div>
                                    {getStatusBadge(comp.status)}
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '0.25rem', lineHeight: 1.2 }}>
                                    {comp.name}
                                </h3>
                                <p style={{ color: '#8E8E93', fontSize: '15px' }}>
                                    {comp.modality.name} {comp.nickname && `• ${comp.nickname}`}
                                </p>
                            </div>

                            {/* Stats Row */}
                            <div style={{
                                display: 'flex',
                                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(0,0,0,0.1)'
                            }}>
                                <div style={{ flex: 1, padding: '1rem', textAlign: 'center', borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>{comp._count?.registrations || 0}</div>
                                    <div style={{ fontSize: '11px', color: '#8E8E93', textTransform: 'uppercase', fontWeight: 600 }}>Times</div>
                                </div>
                                <div style={{ flex: 1, padding: '1rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>{comp._count?.matches || 0}</div>
                                    <div style={{ fontSize: '11px', color: '#8E8E93', textTransform: 'uppercase', fontWeight: 600 }}>Jogos</div>
                                </div>
                            </div>

                            {/* Footer / Actions */}
                            <div style={{ padding: '1rem 1.5rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8E8E93', fontSize: '13px' }}>
                                    <Calendar size={14} />
                                    {comp.start_date ? new Date(comp.start_date).toLocaleDateString('pt-BR') : 'Sem data'}
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {user?.role === 'ADMIN' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(comp);
                                            }}
                                            style={{
                                                background: 'rgba(255, 69, 58, 0.1)',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '32px', height: '32px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#FF453A',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            title="Excluir"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white'
                                    }}>
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </IOSCard>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CompetitionList;
