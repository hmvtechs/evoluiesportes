import React, { useEffect, useState } from 'react';
import { Users, Trophy, AlertCircle, Activity, Calendar, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { IOSCard } from '../components/ui/IOSDesign';
import { Link } from 'react-router-dom';

interface AdminDashboardStats {
    totalUsers: number;
    recentUsers: number;
    pendingDocs: number;
    activeTournaments: number;
    matchesToday: number;
}

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<AdminDashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/api/v1/users/admin/dashboard`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Unauthorized');
                }

                const data = await response.json();
                setStats(data);
            } catch (err) {
                console.error('Error fetching admin dashboard:', err);
                setError('Erro ao carregar painel administrativo');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return <div style={{ padding: '4rem', textAlign: 'center', color: '#8E8E93' }}>Carregando...</div>;
    }

    if (error) {
        return <div style={{ padding: '4rem', textAlign: 'center', color: '#FF453A' }}>{error}</div>;
    }

    return (
        <div className="animate-fade-in" style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '34px', fontWeight: 800, margin: 0 }}>Administração</h1>
                <p style={{ color: '#8E8E93', fontSize: '17px', marginTop: '0.5rem' }}>
                    Visão geral do sistema
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <KPICard
                    title="Total Usuários"
                    value={stats?.totalUsers || 0}
                    icon={<Users size={24} color="white" />}
                    color="#0A84FF"
                    change="Base total"
                />
                <KPICard
                    title="Novos (48h)"
                    value={stats?.recentUsers || 0}
                    icon={<Activity size={24} color="white" />}
                    color="#30D158"
                    change="Crescimento"
                />
                <KPICard
                    title="Docs Pendentes"
                    value={stats?.pendingDocs || 0}
                    icon={<AlertCircle size={24} color="white" />}
                    color="#FF9F0A"
                    change={stats?.pendingDocs ? "Ação necessária" : "Tudo em dia"}
                />
                <KPICard
                    title="Torneios Ativos"
                    value={stats?.activeTournaments || 0}
                    icon={<Trophy size={24} color="white" />}
                    color="#BF5AF2"
                    change="Em andamento"
                />
                <KPICard
                    title="Jogos Hoje"
                    value={stats?.matchesToday || 0}
                    icon={<Calendar size={24} color="white" />}
                    color="#FF375F"
                    change="Programados"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <IOSCard>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '1.5rem' }}>Resumo do Sistema</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <StatRow
                            label="Taxa de Crescimento"
                            value={`${stats?.totalUsers ? ((stats.recentUsers / stats.totalUsers) * 100).toFixed(1) : 0}%`}
                            color="#30D158"
                        />
                        <StatRow
                            label="Pendências vs Total"
                            value={`${stats?.totalUsers ? ((stats.pendingDocs / stats.totalUsers) * 100).toFixed(1) : 0}%`}
                            color={stats?.pendingDocs ? '#FF9F0A' : '#30D158'}
                        />
                        <StatRow
                            label="Média Jogos/Torneio"
                            value={`${stats?.activeTournaments && stats.matchesToday ? (stats.matchesToday / stats.activeTournaments).toFixed(1) : 0}`}
                            color="#0A84FF"
                        />
                    </div>
                </IOSCard>

                <IOSCard>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '1.5rem' }}>Ações Rápidas</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <QuickActionLink to="/admin/users" label="Gerenciar Usuários" />
                        <QuickActionLink to="/competitions" label="Ver Competições" />
                        <QuickActionLink to="/venues" label="Gerenciar Locais" />
                    </div>
                </IOSCard>
            </div>
        </div>
    );
};

const KPICard: React.FC<{ title: string, value: string | number, icon: React.ReactNode, color: string, change: string }> = ({ title, value, icon, color, change }) => (
    <IOSCard style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 12px ${color}66`
            }}>
                {icon}
            </div>
        </div>
        <div>
            <div style={{ fontSize: '14px', color: '#8E8E93', fontWeight: 600, marginBottom: '0.25rem' }}>{title}</div>
            <div style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '13px', color: '#8E8E93', marginTop: '0.5rem' }}>{change}</div>
        </div>
    </IOSCard>
);

const StatRow: React.FC<{ label: string, value: string, color: string }> = ({ label, value, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
        <span style={{ fontSize: '15px', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '17px', fontWeight: 700, color: color }}>{value}</span>
    </div>
);

const QuickActionLink: React.FC<{ to: string, label: string }> = ({ to, label }) => (
    <Link to={to} style={{ textDecoration: 'none' }}>
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px',
            color: 'white', transition: 'background 0.2s'
        }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >
            <span style={{ fontSize: '15px', fontWeight: 500 }}>{label}</span>
            <ArrowRight size={16} color="#8E8E93" />
        </div>
    </Link>
);

export default AdminDashboard;
