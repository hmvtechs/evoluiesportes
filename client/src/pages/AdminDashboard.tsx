import React, { useEffect, useState } from 'react';
import { Users, Trophy, AlertCircle, Activity, Calendar } from 'lucide-react';

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
                const response = await fetch('http://localhost:3000/api/v1/users/admin/dashboard', {
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
        return (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>Carregando...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '1.5rem', color: 'var(--danger)' }}>{error}</div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <h1 style={{ marginBottom: '2rem' }}>Painel Administrativo</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <KPICard
                    title="Total Usuários"
                    value={stats?.totalUsers || 0}
                    icon={<Users color="var(--primary)" />}
                    change="Base total"
                />
                <KPICard
                    title="Novos (48h)"
                    value={stats?.recentUsers || 0}
                    icon={<Activity color="var(--success)" />}
                    change="Crescimento"
                />
                <KPICard
                    title="Docs Pendentes"
                    value={stats?.pendingDocs || 0}
                    icon={<AlertCircle color="var(--warning)" />}
                    change={stats?.pendingDocs ? "Ação necessária" : "Tudo em dia"}
                />
                <KPICard
                    title="Torneios Ativos"
                    value={stats?.activeTournaments || 0}
                    icon={<Trophy color="var(--secondary)" />}
                    change="Em andamento"
                />
                <KPICard
                    title="Jogos Hoje"
                    value={stats?.matchesToday || 0}
                    icon={<Calendar color="var(--primary)" />}
                    change="Programados"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Resumo do Sistema</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--surface-light)', borderRadius: '6px' }}>
                            <span>Taxa de Crescimento</span>
                            <strong style={{ color: 'var(--success)' }}>
                                {stats?.totalUsers ? ((stats.recentUsers / stats.totalUsers) * 100).toFixed(1) : 0}%
                            </strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--surface-light)', borderRadius: '6px' }}>
                            <span>Pendências vs Total</span>
                            <strong style={{ color: stats?.pendingDocs ? 'var(--warning)' : 'var(--success)' }}>
                                {stats?.totalUsers ? ((stats.pendingDocs / stats.totalUsers) * 100).toFixed(1) : 0}%
                            </strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--surface-light)', borderRadius: '6px' }}>
                            <span>Média Jogos/Torneio</span>
                            <strong>
                                {stats?.activeTournaments && stats.matchesToday
                                    ? (stats.matchesToday / stats.activeTournaments).toFixed(1)
                                    : 0}
                            </strong>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Ações Rápidas</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <a
                            href="/admin/users"
                            className="btn-outline"
                            style={{ textDecoration: 'none', textAlign: 'center' }}
                        >
                            Gerenciar Usuários
                        </a>
                        <a
                            href="/competitions"
                            className="btn-outline"
                            style={{ textDecoration: 'none', textAlign: 'center' }}
                        >
                            Ver Competições
                        </a>
                        <a
                            href="/venues"
                            className="btn-outline"
                            style={{ textDecoration: 'none', textAlign: 'center' }}
                        >
                            Gerenciar Locais
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

const KPICard: React.FC<{ title: string, value: string | number, icon: React.ReactNode, change: string }> = ({ title, value, icon, change }) => (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{title}</span>
            {icon}
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{value}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{change}</div>
    </div>
);

export default AdminDashboard;
