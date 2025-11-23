import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

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
        return <div style={{ padding: '2rem' }}>Carregando fixture...</div>;
    }

    if (rounds.length === 0) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>Nenhum jogo gerado ainda. Clique em "Gerar Fixture" para criar a tabela.</p>
            </div>
        );
    }

    return (
        <div>
            {rounds.map(round => (
                <div key={round.round_number} style={{ marginBottom: '2rem' }}>
                    <h4 style={{
                        padding: '0.75rem 1rem',
                        background: 'var(--surface-light)',
                        borderRadius: '8px',
                        marginBottom: '1rem'
                    }}>
                        Rodada {round.round_number}
                    </h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--surface-light)' }}>
                                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Data/Hora</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Time A</th>
                                <th style={{ textAlign: 'center', padding: '0.75rem' }}>Placar</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem' }}>Time B</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Local</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Grupo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {round.matches.map(match => (
                                <tr key={match.id} style={{ borderBottom: '1px solid var(--surface-light)' }}>
                                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                                        {match.scheduled_date ? (
                                            <>
                                                <div>{new Date(match.scheduled_date).toLocaleDateString('pt-BR')}</div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                                    {new Date(match.scheduled_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </>
                                        ) : (
                                            <em style={{ color: 'var(--text-muted)' }}>A definir</em>
                                        )}
                                    </td>
                                    <td style={{ padding: '0.75rem', fontWeight: '500' }}>
                                        {match.team_a.name}
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>
                                        {match.score_a !== null && match.score_b !== null
                                            ? `${match.score_a} x ${match.score_b}`
                                            : '-'}
                                    </td>
                                    <td style={{ padding: '0.75rem', fontWeight: '500', textAlign: 'right' }}>
                                        {match.team_b.name}
                                    </td>
                                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                                        {match.venue?.name || <em style={{ color: 'var(--text-muted)' }}>Não definido</em>}
                                    </td>
                                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                                        {match.group?.name || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
};

export default FixtureTable;
