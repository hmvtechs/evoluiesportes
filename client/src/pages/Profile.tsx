import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const Profile: React.FC = () => {
    const { user } = useAuth();
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

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
                </div>
                <h3>Alterar Senha</h3>
                <form onSubmit={handleUpdate} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginTop: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nova Senha</label>
                        <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary">Salvar</button>
                </form>
                {message && <p style={{ marginTop: '1rem', color: 'var(--success)' }}>{message}</p>}
            </div>
        </div>
    );
};

export default Profile;
