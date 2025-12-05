import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Plus, User as UserIcon, Clock } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { IOSCard, IOSButton } from '../components/ui/IOSDesign';

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
            const res = await fetch(`${API_BASE_URL}/api/v1/matches/1/lineup`);
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (e) {
            console.error('Failed to fetch match');
        }
    };

    const handleEvent = async (type: string, playerId: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/matches/1/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, player_id: playerId, minute: Math.floor(timer / 60) })
            });
            if (res.ok) fetchMatchData();
        } catch (e) {
            console.error('Event failed');
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    if (!data) return <div style={{ padding: '4rem', textAlign: 'center', color: '#8E8E93' }}>Carregando partida...</div>;

    return (
        <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Scoreboard */}
            <IOSCard style={{
                marginBottom: '2rem',
                background: 'linear-gradient(180deg, #1C1C1E 0%, #2C2C2E 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '2rem'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>{data.match.home_team.organization.name_official}</h2>
                    </div>

                    <div style={{ padding: '0 3rem', textAlign: 'center' }}>
                        <div style={{
                            fontSize: '64px', fontWeight: 800, fontFamily: 'monospace',
                            background: 'black', padding: '0.5rem 2rem', borderRadius: '16px',
                            border: '2px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                            color: '#30D158',
                            textShadow: '0 0 10px rgba(48, 209, 88, 0.5)'
                        }}>
                            {data.match.home_score} - {data.match.away_score}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                            <div style={{
                                fontSize: '24px', fontFamily: 'monospace', fontWeight: 600,
                                color: isRunning ? 'white' : '#8E8E93',
                                display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}>
                                <Clock size={20} />
                                {formatTime(timer)}
                            </div>
                            <button
                                onClick={() => setIsRunning(!isRunning)}
                                style={{
                                    background: isRunning ? 'rgba(255, 69, 58, 0.2)' : 'rgba(48, 209, 88, 0.2)',
                                    color: isRunning ? '#FF453A' : '#30D158',
                                    border: 'none', borderRadius: '50%',
                                    width: '40px', height: '40px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                {isRunning ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                            </button>
                        </div>
                    </div>

                    <div style={{ flex: 1, textAlign: 'left' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>{data.match.away_team.organization.name_official}</h2>
                    </div>
                </div>
            </IOSCard>

            {/* Rosters */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <TeamRoster teamName={data.match.home_team.organization.name_official} players={data.lineup.home} onEvent={handleEvent} color="#0A84FF" />
                <TeamRoster teamName={data.match.away_team.organization.name_official} players={data.lineup.away} onEvent={handleEvent} color="#FF9F0A" />
            </div>
        </div>
    );
};

const TeamRoster: React.FC<{ teamName: string; players: Player[]; onEvent: (t: string, id: string) => void, color: string }> = ({ teamName, players, onEvent, color }) => (
    <IOSCard>
        <h3 style={{
            fontSize: '18px', fontWeight: 700, marginBottom: '1rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem',
            color: color
        }}>
            {teamName}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {players.map(p => (
                <div key={p.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{
                            fontWeight: 800, fontSize: '18px', width: '30px', textAlign: 'center',
                            color: 'rgba(255,255,255,0.5)'
                        }}>
                            {p.number}
                        </span>
                        <span style={{ fontWeight: 600 }}>{p.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => onEvent('GOAL', p.id)}
                            style={{
                                background: 'rgba(48, 209, 88, 0.2)', color: '#30D158',
                                border: 'none', borderRadius: '8px',
                                padding: '6px 12px', fontWeight: 700, fontSize: '12px',
                                cursor: 'pointer'
                            }}
                        >
                            GOL
                        </button>
                        <button
                            onClick={() => onEvent('YELLOW', p.id)}
                            style={{
                                background: 'rgba(255, 214, 10, 0.2)', color: '#FFD60A',
                                border: 'none', borderRadius: '8px',
                                padding: '6px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <Square size={16} fill="currentColor" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </IOSCard>
);

export default MatchOperation;
