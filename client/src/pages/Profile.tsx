import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { RefreshCw, User, Mail, Shield, CreditCard, Lock, Save } from 'lucide-react';
import { IOSCard, IOSButton, IOSInput } from '../components/ui/IOSDesign';

const Profile: React.FC = () => {
    const { user } = useAuth();
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [cpfStatus, setCpfStatus] = useState<{
        valid?: boolean;
        status?: string;
        situation?: string;
        loading: boolean;
        lastValidated?: string;
    }>({ loading: false });

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ userId: user?.id, password }),
            });
            if (res.ok) setMessage('✅ Senha atualizada com sucesso!');
            else setMessage('❌ Erro ao atualizar.');
        } catch (e) {
            setMessage('❌ Erro de rede.');
        }
    };

    const handleRevalidateCPF = async () => {
        if (!user?.cpf) return;

        setCpfStatus({ loading: true });

        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/auth/validate-rf`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cpf: user.cpf }),
            });

            const data = await res.json();

            if (res.ok && data.valid) {
                setCpfStatus({
                    valid: true,
                    status: data.status,
                    situation: data.situation || 'CPF válido',
                    loading: false,
                    lastValidated: new Date().toLocaleString('pt-BR'),
                });
                setMessage('✅ CPF revalidado com sucesso!');
            } else {
                setCpfStatus({
                    valid: false,
                    status: data.status,
                    situation: data.error || 'CPF irregular',
                    loading: false,
                    lastValidated: new Date().toLocaleString('pt-BR'),
                });
                setMessage('⚠️ CPF validado, mas há restrições.');
            }

            setTimeout(() => setMessage(''), 5000);
        } catch (error) {
            console.error('Error revalidating CPF:', error);
            setCpfStatus({
                loading: false,
                situation: 'Erro ao validar CPF',
            });
            setMessage('❌ Erro ao revalidar CPF. Tente novamente.');
            setTimeout(() => setMessage(''), 5000);
        }
    };

    return (
        <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '34px', fontWeight: 800, margin: 0 }}>Meu Perfil</h1>
                <p style={{ color: '#8E8E93', fontSize: '17px', marginTop: '0.5rem' }}>
                    Gerencie suas informações pessoais
                </p>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                <IOSCard>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '1.5rem' }}>Informações Pessoais</h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <ProfileRow icon={<User size={20} />} label="Nome Completo" value={user?.full_name} />
                        <ProfileRow icon={<Mail size={20} />} label="Email" value={user?.email} />
                        <ProfileRow icon={<Shield size={20} />} label="Função" value={user?.role} />
                        {user?.cpf && <ProfileRow icon={<CreditCard size={20} />} label="CPF" value={user.cpf} />}
                    </div>
                </IOSCard>

                {user?.cpf && (
                    <IOSCard>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Status do CPF</h3>
                            <IOSButton
                                onClick={handleRevalidateCPF}
                                disabled={cpfStatus.loading}
                                style={{ padding: '8px 16px', fontSize: '14px' }}
                            >
                                <RefreshCw size={16} className={cpfStatus.loading ? 'spin' : ''} style={{ marginRight: '0.5rem' }} />
                                {cpfStatus.loading ? 'Validando...' : 'Revalidar'}
                            </IOSButton>
                        </div>

                        {cpfStatus.status ? (
                            <div style={{
                                padding: '1rem',
                                borderRadius: '12px',
                                background: cpfStatus.valid ? 'rgba(48, 209, 88, 0.1)' : 'rgba(255, 69, 58, 0.1)',
                                border: `1px solid ${cpfStatus.valid ? 'rgba(48, 209, 88, 0.3)' : 'rgba(255, 69, 58, 0.3)'}`
                            }}>
                                <div style={{ fontWeight: 700, color: cpfStatus.valid ? '#30D158' : '#FF453A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {cpfStatus.valid ? '✅ CPF Válido' : '❌ CPF Irregular'}
                                </div>
                                <div style={{ fontSize: '15px', marginTop: '0.5rem', color: 'white' }}>
                                    {cpfStatus.situation}
                                </div>
                                {cpfStatus.lastValidated && (
                                    <div style={{ fontSize: '13px', color: '#8E8E93', marginTop: '0.5rem' }}>
                                        Última validação: {cpfStatus.lastValidated}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p style={{ color: '#8E8E93', fontSize: '15px' }}>
                                Clique em "Revalidar" para verificar o status atual do seu CPF na Receita Federal.
                            </p>
                        )}
                    </IOSCard>
                )}

                <IOSCard>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '1.5rem' }}>Segurança</h3>
                    <form onSubmit={handleUpdate}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Nova Senha</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8E8E93' }} />
                                <IOSInput
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Digite a nova senha"
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
                            {message && <span style={{ fontSize: '14px', color: message.includes('✅') ? '#30D158' : '#FF453A' }}>{message}</span>}
                            <IOSButton type="submit">
                                <Save size={18} style={{ marginRight: '0.5rem' }} />
                                Salvar Senha
                            </IOSButton>
                        </div>
                    </form>
                </IOSCard>
            </div>
        </div>
    );
};

const ProfileRow: React.FC<{ icon: React.ReactNode, label: string, value?: string | null }> = ({ icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ width: '40px', color: '#0A84FF' }}>{icon}</div>
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', color: '#8E8E93' }}>{label}</div>
            <div style={{ fontSize: '17px', fontWeight: 500, color: 'white' }}>{value || '-'}</div>
        </div>
    </div>
);

export default Profile;
