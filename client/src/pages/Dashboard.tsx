import React, { useEffect, useState } from 'react';
import { Users, Trophy, AlertCircle, Activity, ArrowUpRight } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { IOSCard } from '../components/ui/IOSDesign';

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
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '4rem', color: '#8E8E93' }}>
                Carregando...
            </div>
        );
    }

    if (error) {
        return (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '4rem', color: '#FF453A' }}>
                {error}
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '34px', fontWeight: 800, margin: 0 }}>Visão Geral</h1>
                <p style={{ color: '#8E8E93', fontSize: '17px', marginTop: '0.5rem' }}>
                    Resumo das atividades hoje
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <KPICard
                    title="Cadastros Hoje"
                    value={stats?.registrationsToday || 0}
                    icon={<Users size={24} color="white" />}
                    color="#0A84FF"
                    change={`${stats?.registrationsToday || 0} novo${(stats?.registrationsToday || 0) !== 1 ? 's' : ''}`}
                />
                <KPICard
                    title="Jogos Ao Vivo"
                    value={stats?.liveMatches || 0}
                    icon={<Activity size={24} color="white" />}
                    color="#30D158"
                    change={stats?.liveMatches ? "Em andamento" : "Nenhum agora"}
                />
                <KPICard
                    title="Pendências"
                    value={stats?.pendingActions || 0}
                    icon={<AlertCircle size={24} color="white" />}
                    color="#FF9F0A"
                    change={stats?.pendingActions ? "Ação necessária" : "Tudo em dia"}
                />
                <KPICard
                    title="Competições"
                    value={stats?.activeCompetitions || 0}
                    icon={<Trophy size={24} color="white" />}
                    color="#BF5AF2"
                    change="Ativas"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <IOSCard style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Bem-vindo ao e-Esporte</h3>
                        <p style={{ color: '#8E8E93', fontSize: '15px', marginTop: '0.25rem' }}>
                            Sistema de gestão esportiva integrado
                        </p>
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <FeatureRow
                                icon="📊"
                                title="Estatísticas em Tempo Real"
                                description="Acompanhe competições, jogos e cadastros instantaneamente."
                            />
                            <FeatureRow
                                icon="🏆"
                                title="Gestão de Competições"
                                description="Crie e gerencie torneios esportivos com facilidade."
                            />
                            <FeatureRow
                                icon="📱"
                                title="Carteirinha Digital"
                                description="Identificação digital segura para todos os atletas."
                            />
                        </div>
                    </div>
                </IOSCard>

                {/* Placeholder for future widgets like "Recent Activity" or "Calendar" */}
                <IOSCard style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <div style={{ textAlign: 'center', color: '#8E8E93' }}>
                        <p>Mais widgets em breve...</p>
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
            {/* <ArrowUpRight size={20} color="#8E8E93" /> */}
        </div>
        <div>
            <div style={{ fontSize: '14px', color: '#8E8E93', fontWeight: 600, marginBottom: '0.25rem' }}>{title}</div>
            <div style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '13px', color: '#8E8E93', marginTop: '0.5rem' }}>{change}</div>
        </div>
    </IOSCard>
);

const FeatureRow: React.FC<{ icon: string, title: string, description: string }> = ({ icon, title, description }) => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ fontSize: '24px' }}>{icon}</div>
        <div>
            <div style={{ fontWeight: 600, fontSize: '15px' }}>{title}</div>
            <div style={{ fontSize: '13px', color: '#8E8E93' }}>{description}</div>
        </div>
    </div>
);

export default Dashboard;
