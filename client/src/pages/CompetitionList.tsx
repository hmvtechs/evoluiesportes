import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Plus, Calendar, Users, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
    const { token } = useAuth();
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCompetitions();
    }, []);

    const fetchCompetitions = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/v1/competitions', {
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

    const getStatusBadge = (status: string) => {
        const colors: Record<string, { bg: string; text: string }> = {
            'DRAFT': { bg: 'var(--text-muted)', text: 'white' },
            'OPEN_FOR_REGISTRATION': { bg: 'var(--primary)', text: 'white' },
            'ACTIVE': { bg: 'var(--success)', text: 'white' },
            'FINISHED': { bg: 'var(--danger)', text: 'white' },
        };
        const color = colors[status] || { bg: '#6c757d', text: 'white' };

        return (
            <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                background: color.bg,
                color: color.text
            }}>
                {status === 'DRAFT' ? 'Rascunho' :
                    status === 'OPEN_FOR_REGISTRATION' ? 'Inscrições Abertas' :
                        status === 'ACTIVE' ? 'Em Andamento' :
                            status === 'FINISHED' ? 'Finalizada' : status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="animate-fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
                Carregando competições...
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Trophy size={32} color="var(--primary)" />
                    <h1>Competições</h1>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => navigate('/competitions/new')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Plus size={20} />
                    Nova Competição
                </button>
            </div>

            {competitions.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Trophy size={64} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <h3 style={{ color: 'var(--text-muted)' }}>Nenhuma competição criada</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Clique em "Nova Competição" para começar.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {competitions.map(comp => (
                        <div key={comp.id} className="card hover-scale" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                        <h3 style={{ margin: 0 }}>{comp.name}</h3>
                                        {comp.nickname && (
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                "{comp.nickname}"
                                            </span>
                                        )}
                                        {getStatusBadge(comp.status)}
                                    </div>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        {comp.modality.name}
                                    </p>
                                </div>
                                <button
                                    className="btn-primary"
                                    onClick={() => navigate(`/competitions/${comp.id}/manage`)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <Edit size={16} />
                                    Gerenciar
                                </button>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '1rem',
                                padding: '1rem',
                                background: 'var(--surface-light)',
                                borderRadius: '8px'
                            }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                                        <Calendar size={14} />
                                        <span>Período</span>
                                    </div>
                                    <div style={{ fontSize: '0.875rem' }}>
                                        {comp.start_date && comp.end_date ? (
                                            <>
                                                {new Date(comp.start_date).toLocaleDateString('pt-BR')} a{' '}
                                                {new Date(comp.end_date).toLocaleDateString('pt-BR')}
                                            </>
                                        ) : (
                                            <em style={{ color: 'var(--text-muted)' }}>Não definido</em>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                                        <Users size={14} />
                                        <span>Times</span>
                                    </div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                                        {comp._count?.registrations || 0} inscritos
                                    </div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                                        <Trophy size={14} />
                                        <span>Jogos</span>
                                    </div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                                        {comp._count?.matches || 0} agendados
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CompetitionList;
