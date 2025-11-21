import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Plus, User as UserIcon } from 'lucide-react';

interface Player {
    id: string;
    name: string;
    number: number;
    status: string;
}

interface MatchData {
    match: {
        id: number;
        home_team: { organization: { name_official: string } };
        away_team: { organization: { name_official: string } };
        home_score: number;
        away_score: number;
        status: string;
    };
    lineup: {
        home: Player[];
        away: Player[];
    };
}

const MatchOperation: React.FC = () => {
    const [data, setData] = useState<MatchData | null>(null);
    const [timer, setTimer] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        fetchMatchData();
        const interval = setInterval(() => {
            if (isRunning) setTimer(t => t + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [isRunning]);

    const fetchMatchData = async () => {
        try {
            // Hardcoded ID 1 for prototype
            const res = await fetch('http://localhost:3000/api/v1/matches/1/lineup');
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (e) {
            console.error("Failed to fetch match");
        }
    };

    const handleEvent = async (type: string, playerId: string) => {
        try {
            const res = await fetch('http://localhost:3000/api/v1/matches/1/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, player_id: playerId, minute: Math.floor(timer / 60) })
            });
            if (res.ok) {
                fetchMatchData(); // Refresh score
            }
        } catch (e) {
            console.error("Event failed");
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    if (!data) return <div className="animate-fade-in">Carregando partida... (Certifique-se de rodar /seed no backend)</div>;

    return (
        <div className="animate-fade-in">
            <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', marginBottom: '2rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ width: '30%', textAlign: 'right' }}>{data.match.home_team.organization.name_official}</h2>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', background: 'var(--surface)', padding: '0.5rem 2rem', borderRadius: 'var(--radius)' }}>
                        {data.match.home_score} - {data.match.away_score}
                    </div>
                    <h2 style={{ width: '30%', textAlign: 'left' }}>{data.match.away_team.organization.name_official}</h2>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontFamily: 'monospace' }}>{formatTime(timer)}</div>
                    <button className="btn" onClick={() => setIsRunning(!isRunning)}>
                        {isRunning ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <TeamRoster teamName={data.match.home_team.organization.name_official} players={data.lineup.home} onEvent={handleEvent} />
                <TeamRoster teamName={data.match.away_team.organization.name_official} players={data.lineup.away} onEvent={handleEvent} />
            </div>
        </div>
    );
};

const TeamRoster: React.FC<{ teamName: string, players: Player[], onEvent: (t: string, id: string) => void }> = ({ teamName, players, onEvent }) => (
    <div className="card">
        <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--surface-light)', paddingBottom: '0.5rem' }}>{teamName}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {players.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: 'var(--surface-light)', borderRadius: 'var(--radius)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 'bold', width: '24px' }}>{p.number}</span>
                        <span>{p.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button className="btn btn-success" style={{ padding: '0.25rem 0.5rem' }} onClick={() => onEvent('GOAL', p.id)}>Gol</button>
                        <button className="btn btn-warning" style={{ padding: '0.25rem 0.5rem' }} onClick={() => onEvent('YELLOW', p.id)}><Square size={16} fill="currentColor" /></button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default MatchOperation;
