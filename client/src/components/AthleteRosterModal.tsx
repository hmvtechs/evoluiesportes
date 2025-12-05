import React, { useState, useEffect } from 'react';
import { Search, Plus, UserPlus, Trash2, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { IOSModal, IOSSegmentedControl, IOSInput, IOSButton } from './ui/IOSDesign';

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

    const fetchAthletes = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/competitions/team-registrations/${teamRegistrationId}/athletes`, {
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

    // Debounced search function
    useEffect(() => {
        if (activeTab !== 'add' || searchTerm.length < 2) {
            setAvailableUsers([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/v1/users/search?query=${encodeURIComponent(searchTerm)}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setAvailableUsers(data);
                }
            } catch (error) {
                console.error('Failed to search users', error);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchTerm, activeTab, token]);

    const handleAddAthlete = async () => {
        if (!selectedUserId) {
            alert('Selecione um usuário');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/competitions/team-registrations/${teamRegistrationId}/athletes`, {
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
            const response = await fetch(`${API_BASE_URL}/api/v1/competitions/team-registrations/${teamRegistrationId}/athletes/${userId}`, {
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
        <IOSModal isOpen={true} onClose={onClose} title="Gestão de Elenco">
            <div style={{ marginBottom: '1.5rem' }}>
                <IOSSegmentedControl
                    options={[
                        { value: 'list', label: `Elenco (${athletes.length})` },
                        { value: 'add', label: 'Adicionar Atleta' }
                    ]}
                    value={activeTab}
                    onChange={(val) => setActiveTab(val as any)}
                />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', minHeight: '300px' }}>
                {activeTab === 'list' && (
                    <div>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#8E8E93' }}>
                                Carregando...
                            </div>
                        ) : athletes.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#8E8E93' }}>
                                <User size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p>Nenhum atleta inscrito ainda.</p>
                                <IOSButton onClick={() => setActiveTab('add')} style={{ marginTop: '1rem' }}>
                                    Adicionar Primeiro Atleta
                                </IOSButton>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {athletes.map((athlete, index) => (
                                    <div key={athlete.id} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '1rem 0',
                                        borderBottom: index < athletes.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '50%',
                                                background: 'rgba(255,255,255,0.1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'white', fontWeight: 'bold'
                                            }}>
                                                {athlete.user.full_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'white' }}>{athlete.user.full_name}</div>
                                                <div style={{ fontSize: '13px', color: '#8E8E93', fontFamily: 'monospace' }}>{athlete.user.cpf}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span style={{
                                                fontSize: '12px', fontWeight: 600,
                                                color: athlete.status === 'VALID' ? '#30D158' : '#FF9F0A'
                                            }}>
                                                {athlete.status}
                                            </span>
                                            <button
                                                onClick={() => handleRemoveAthlete(athlete.user.id)}
                                                style={{ background: 'none', border: 'none', color: '#FF453A', cursor: 'pointer', padding: '4px' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'add' && (
                    <div>
                        <div style={{ position: 'relative', marginBottom: '1rem' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8E8E93' }} />
                            <IOSInput
                                placeholder="Buscar por nome ou CPF..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '40px' }}
                            />
                        </div>

                        <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
                            {filteredUsers.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#8E8E93', fontSize: '14px' }}>
                                    {searchTerm.length < 2
                                        ? 'Digite pelo menos 2 caracteres para buscar'
                                        : 'Nenhum usuário encontrado'}
                                </div>
                            ) : (
                                filteredUsers.map(user => (
                                    <div
                                        key={user.id}
                                        onClick={() => setSelectedUserId(user.id)}
                                        style={{
                                            padding: '0.75rem',
                                            cursor: 'pointer',
                                            borderRadius: '10px',
                                            marginBottom: '0.5rem',
                                            background: selectedUserId === user.id ? '#0A84FF' : 'rgba(255,255,255,0.05)',
                                            display: 'flex', alignItems: 'center', gap: '0.75rem'
                                        }}
                                    >
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%',
                                            background: selectedUserId === user.id ? 'white' : 'rgba(255,255,255,0.1)',
                                            color: selectedUserId === user.id ? '#0A84FF' : 'white',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px'
                                        }}>
                                            {user.full_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'white', fontSize: '14px' }}>{user.full_name}</div>
                                            <div style={{ fontSize: '12px', color: selectedUserId === user.id ? 'rgba(255,255,255,0.8)' : '#8E8E93' }}>CPF: {user.cpf}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <IOSButton
                            onClick={handleAddAthlete}
                            disabled={!selectedUserId || submitting}
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            <Plus size={18} style={{ marginRight: '0.5rem' }} />
                            {submitting ? 'Adicionando...' : 'Adicionar Atleta'}
                        </IOSButton>
                    </div>
                )}
            </div>
        </IOSModal>
    );
};

export default AthleteRosterModal;
