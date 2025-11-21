import React, { useState, useEffect } from 'react';
import { X, Search, Plus, UserPlus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface User {
    id: string;
    full_name: string;
    cpf: string;
    birth_date?: string;
    photo_url?: string;
}

interface Athlete {
    id: number;
    status: string;
    user: User;
}

interface AthleteRosterModalProps {
    teamRegistrationId: number;
    onClose: () => void;
    onSuccess: () => void;
}

const AthleteRosterModal: React.FC<AthleteRosterModalProps> = ({ teamRegistrationId, onClose, onSuccess }) => {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
    const [athletes, setAthletes] = useState<Athlete[]>([]);
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchAthletes();
    }, []);

    useEffect(() => {
        if (activeTab === 'add') {
            fetchAvailableUsers();
        }
    }, [activeTab]);

    const fetchAthletes = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/api/v1/competitions/team-registrations/${teamRegistrationId}/athletes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAthletes(data);
            }
        } catch (error) {
            console.error('Failed to fetch athletes', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableUsers = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/v1/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAvailableUsers(data);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    const handleAddAthlete = async () => {
        if (!selectedUserId) {
            alert('Selecione um usuário');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`http://localhost:3000/api/v1/competitions/team-registrations/${teamRegistrationId}/athletes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ user_id: selectedUserId })
            });

            if (response.ok) {
                setSelectedUserId(null);
                setActiveTab('list');
                fetchAthletes();
                onSuccess();
            } else {
                const error = await response.json();
                alert(`Erro: ${error.error || 'Falha ao adicionar atleta'}`);
            }
        } catch (error) {
            console.error('Failed to add athlete', error);
            alert('Erro ao adicionar atleta');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveAthlete = async (userId: string) => {
        if (!confirm('Remover este atleta do time?')) return;

        try {
            const response = await fetch(`http://localhost:3000/api/v1/competitions/team-registrations/${teamRegistrationId}/athletes/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchAthletes();
                onSuccess();
            } else {
                const error = await response.json();
                alert(`Erro: ${error.error || 'Falha ao remover atleta'}`);
            }
        } catch (error) {
            console.error('Failed to remove athlete', error);
            alert('Erro ao remover atleta');
        }
    };

    const filteredUsers = availableUsers.filter(user => {
        const alreadyInTeam = athletes.some(a => a.user.id === user.id);
        if (alreadyInTeam) return false;

        if (searchTerm.trim() === '') return true;
        return user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.cpf.includes(searchTerm);
    });

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
            }}
            onClick={onClose}
        >
            <div
                className="card"
                style={{
                    maxWidth: '700px',
                    width: '100%',
                    maxHeight: '85vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>Gestão de Elenco</h3>
                    <button
                        onClick={onClose}
                        className="btn-icon"
                        style={{ width: '32px', height: '32px' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                    <button
                        onClick={() => setActiveTab('list')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            background: 'none',
                            borderBottom: activeTab === 'list' ? '2px solid var(--primary)' : 'none',
                            color: activeTab === 'list' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: activeTab === 'list' ? 'bold' : 'normal',
                            cursor: 'pointer'
                        }}
                    >
                        Elenco ({athletes.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('add')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            background: 'none',
                            borderBottom: activeTab === 'add' ? '2px solid var(--primary)' : 'none',
                            color: activeTab === 'add' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: activeTab === 'add' ? 'bold' : 'normal',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <UserPlus size={16} />
                        Adicionar Atleta
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {activeTab === 'list' && (
                        <div>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    Carregando...
                                </div>
                            ) : athletes.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    Nenhum atleta inscrito ainda.
                                    <br />
                                    <button
                                        className="btn-primary"
                                        onClick={() => setActiveTab('add')}
                                        style={{ marginTop: '1rem' }}
                                    >
                                        <Plus size={16} />
                                        Adicionar Primeiro Atleta
                                    </button>
                                </div>
                            ) : (
                                <table style={{ width: '100%' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--surface-light)' }}>
                                            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Nome</th>
                                            <th style={{ textAlign: 'left', padding: '0.5rem' }}>CPF</th>
                                            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Status</th>
                                            <th style={{ textAlign: 'center', padding: '0.5rem' }}>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {athletes.map(athlete => (
                                            <tr key={athlete.id} style={{ borderBottom: '1px solid var(--surface-light)' }}>
                                                <td style={{ padding: '0.75rem' }}>{athlete.user.full_name}</td>
                                                <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                                    {athlete.user.cpf}
                                                </td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <span style={{
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '4px',
                                                        fontSize: '0.75rem',
                                                        background: athlete.status === 'VALID' ? 'var(--success-light)' : 'var(--warning-light)',
                                                        color: athlete.status === 'VALID' ? 'var(--success)' : 'var(--warning)'
                                                    }}>
                                                        {athlete.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                    <button
                                                        onClick={() => handleRemoveAthlete(athlete.user.id)}
                                                        className="btn-icon"
                                                        style={{ color: 'var(--danger)' }}
                                                        title="Remover atleta"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {activeTab === 'add' && (
                        <div>
                            {/* Search */}
                            <div style={{ position: 'relative', marginBottom: '1rem' }}>
                                <Search
                                    size={18}
                                    style={{
                                        position: 'absolute',
                                        left: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--text-muted)'
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Buscar por nome ou CPF..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>

                            {/* User List */}
                            <div
                                style={{
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    marginBottom: '1rem',
                                    maxHeight: '400px',
                                    overflowY: 'auto'
                                }}
                            >
                                {filteredUsers.length === 0 ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        Nenhum usuário encontrado
                                    </div>
                                ) : (
                                    filteredUsers.map(user => (
                                        <div
                                            key={user.id}
                                            onClick={() => setSelectedUserId(user.id)}
                                            style={{
                                                padding: '1rem',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid var(--border-color)',
                                                background: selectedUserId === user.id ? 'var(--primary-light)' : 'transparent',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (selectedUserId !== user.id) {
                                                    e.currentTarget.style.background = 'var(--surface-light)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (selectedUserId !== user.id) {
                                                    e.currentTarget.style.background = 'transparent';
                                                }
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div
                                                    style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '50%',
                                                        border: `2px solid ${selectedUserId === user.id ? 'var(--primary)' : 'var(--border-color)'}`,
                                                        background: selectedUserId === user.id ? 'var(--primary)' : 'transparent',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    {selectedUserId === user.id && (
                                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />
                                                    )}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: selectedUserId === user.id ? 'bold' : 'normal' }}>
                                                        {user.full_name}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                                        CPF: {user.cpf}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Action Button */}
                            <button
                                className="btn-primary"
                                onClick={handleAddAthlete}
                                disabled={!selectedUserId || submitting}
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                                <Plus size={16} />
                                {submitting ? 'Adicionando...' : 'Adicionar Atleta'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AthleteRosterModal;
