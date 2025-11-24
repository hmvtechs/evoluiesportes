import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { RefreshCw } from 'lucide-react';

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
            if (res.ok) setMessage('Senha atualizada com sucesso!');
            else setMessage('Erro ao atualizar.');
        } catch (e) {
            setMessage('Erro de rede.');
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
        <div className="animate-fade-in">
            <h1>Meu Perfil</h1>
            <div className="card" style={{ maxWidth: '600px', marginTop: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <div>
                        <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Nome Completo</label>
                        <div style={{ fontWeight: 'bold' }}>{user?.full_name}</div>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Email</label>
                        <div style={{ fontWeight: 'bold' }}>{user?.email}</div>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Função</label>
                        <div style={{ fontWeight: 'bold' }}>{user?.role}</div>
                    </div>
                    {user?.cpf && (
                        <div>
                            <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>CPF</label>
                            <div style={{ fontWeight: 'bold' }}>{user.cpf}</div>
                        </div>
                    )}
                </div>

                {/* CPF Validation Status */}
                {user?.cpf && (
                    <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--card-bg)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <h3 style={{ margin: 0 }}>Status do CPF</h3>
                            <button
                                onClick={handleRevalidateCPF}
                                disabled={cpfStatus.loading}
                                className="btn btn-secondary"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                            >
                                <RefreshCw size={14} style={{ marginRight: '0.5rem' }} />
                                {cpfStatus.loading ? 'Validando...' : 'Revalidar'}
                            </button>
                        </div>
                        {cpfStatus.status && (
                            <>
                                <div style={{
                                    padding: '0.75rem',
                                    borderRadius: '0.375rem',
                                    background: cpfStatus.valid ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    border: `1px solid ${cpfStatus.valid ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
                                    marginBottom: '0.5rem',
                                }}>
                                    <div style={{ fontWeight: 'bold', color: cpfStatus.valid ? 'var(--success)' : 'var(--danger)' }}>
                                        {cpfStatus.valid ? '✅ CPF Válido' : '❌ CPF Irregular'}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                        {cpfStatus.situation}
                                    </div>
                                </div>
                                {cpfStatus.lastValidated && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        Última validação: {cpfStatus.lastValidated}
                                    </div>
                                )}
                            </>
                        )}
                        {!cpfStatus.status && (
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                                Clique em "Revalidar" para verificar o status atual do seu CPF.
                            </p>
                        )}
                    </div>
                )}

                <h3>Alterar Senha</h3>
                <form onSubmit={handleUpdate} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginTop: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nova Senha</label>
                        <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary">Salvar</button>
                </form>
                {message && <p style={{ marginTop: '1rem', color: message.includes('✅') ? 'var(--success)' : 'var(--danger)' }}>{message}</p>}
            </div>
        </div>
    );
};

export default Profile;
