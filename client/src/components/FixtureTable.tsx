import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { IOSCard } from './ui/IOSDesign';
import { Calendar, MapPin, Clock } from 'lucide-react';

interface Match {
    id: number;
    match_number: number;
    team_a: { id: number; name: string };
    team_b: { id: number; name: string };
    score_a: number | null;
    score_b: number | null;
    scheduled_date: string | null;
    venue: { id: number; name: string } | null;
    group: { id: number; name: string } | null;
    status: string;
}

interface Round {
    round_number: number;
    matches: Match[];
}

const FixtureTable: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [rounds, setRounds] = useState<Round[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFixture();
    }, [id]);

    const fetchFixture = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/competitions/${id}/fixture`);
            if (response.ok) {
                const data = await response.json();
                setRounds(data.rounds || []);
            }
        } catch (error) {
            console.error('Failed to fetch fixture', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: '#8E8E93' }}>Carregando jogos...</div>;
    }

    if (rounds.length === 0) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#8E8E93' }}>
                <p>Nenhum jogo gerado ainda.</p>
                <p style={{ fontSize: '14px', marginTop: '0.5rem' }}>Acesse a aba "Grupos" para gerar a tabela.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {rounds.map(round => (
                <div key={round.round_number}>
                    <h3 style={{
                        fontSize: '17px', fontWeight: 600, color: '#8E8E93',
                        marginBottom: '1rem', paddingLeft: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px'
                    }}>
                        Rodada {round.round_number}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                        {round.matches.map(match => (
                            <IOSCard key={match.id} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#8E8E93' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Calendar size={12} />
                                        {match.scheduled_date ? new Date(match.scheduled_date).toLocaleDateString('pt-BR') : 'Data a definir'}
                                        {match.scheduled_date && (
                                            <>
                                                <span style={{ margin: '0 4px' }}>•</span>
                                                <Clock size={12} />
                                                {new Date(match.scheduled_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {match.group && <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{match.group.name}</span>}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ flex: 1, textAlign: 'right', fontWeight: 600, fontSize: '15px' }}>
                                        {match.team_a.name}
                                    </div>
                                    <div style={{
                                        margin: '0 1rem', padding: '0.5rem 1rem',
                                        background: 'rgba(0,0,0,0.3)', borderRadius: '8px',
                                        fontWeight: 700, fontSize: '18px', fontFamily: 'monospace',
                                        minWidth: '80px', textAlign: 'center'
                                    }}>
                                        {match.score_a !== null ? match.score_a : '-'} : {match.score_b !== null ? match.score_b : '-'}
                                    </div>
                                    <div style={{ flex: 1, textAlign: 'left', fontWeight: 600, fontSize: '15px' }}>
                                        {match.team_b.name}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '13px', color: '#8E8E93', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                                    <MapPin size={14} />
                                    {match.venue ? match.venue.name : 'Local a definir'}
                                </div>
                            </IOSCard>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FixtureTable;
