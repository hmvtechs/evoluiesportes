import React, { useEffect, useState } from 'react';
import { Users, Trophy, AlertCircle, Activity } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface DashboardStats {
    registrationsToday: number;
    liveMatches: number;
    activeCompetitions: number;
    pendingActions: number;
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/api/v1/users/dashboard`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Erro ao carregar dashboard');
                }

                const data = await response.json();
                setStats(data);
            } catch (err) {
                console.error('Error fetching dashboard:', err);
                setError('Erro ao carregar dados do dashboard');
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
            <h1 style={{ marginBottom: '2rem' }}>Dashboard</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <KPICard
                    title="Cadastros Hoje"
                    value={stats?.registrationsToday || 0}
                    icon={<Users color="var(--primary)" />}
                    change={`${stats?.registrationsToday || 0} novo${(stats?.registrationsToday || 0) !== 1 ? 's' : ''}`}
                />
                <KPICard
                    title="Jogos Ao Vivo"
                    value={stats?.liveMatches || 0}
                    icon={<Activity color="var(--success)" />}
                    change={stats?.liveMatches ? "Ao vivo" : "Nenhum agora"}
                />
                <KPICard
                    title="Pendências"
                    value={stats?.pendingActions || 0}
                    icon={<AlertCircle color="var(--warning)" />}
                    change={stats?.pendingActions ? "Ação necessária" : "Tudo em dia"}
                />
                <KPICard
                    title="Competições"
                    value={stats?.activeCompetitions || 0}
                    icon={<Trophy color="var(--secondary)" />}
                    change="Ativas"
                />
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>Bem-vindo ao e-Esporte</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Sistema de gestão esportiva integrado
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ padding: '0.75rem', background: 'var(--surface-light)', borderRadius: '8px' }}>
                        <strong>📊 Estatísticas em Tempo Real</strong>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            Acompanhe competições, jogos e cadastros
                        </p>
                    </div>
                    <div style={{ padding: '0.75rem', background: 'var(--surface-light)', borderRadius: '8px' }}>
                        <strong>🏆 Gestão de Competições</strong>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            Crie e gerencie torneios esportivos
                        </p>
                    </div>
                    <div style={{ padding: '0.75rem', background: 'var(--surface-light)', borderRadius: '8px' }}>
                        <strong>📱 Carteirinha Digital</strong>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            Identificação digital para atletas
                        </p>
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

export default Dashboard;
