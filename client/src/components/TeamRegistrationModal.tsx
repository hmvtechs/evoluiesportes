import React, { useState, useEffect } from 'react';
import { X, Search, Plus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Organization {
    id: number;
    name_official: string;
    name_short?: string;
    type?: string;
    cnpj?: string;
}

interface TeamRegistrationModalProps {
    competitionId: number;
    onClose: () => void;
    onSuccess: () => void;
}

const TeamRegistrationModal: React.FC<TeamRegistrationModalProps> = ({ competitionId, onClose, onSuccess }) => {
    const { token } = useAuth();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Create Organization State
    const [isCreating, setIsCreating] = useState(false);
    const [newOrgData, setNewOrgData] = useState({
        name_official: '',
        cnpj: ''
    });

    useEffect(() => {
        if (!isCreating) {
            fetchOrganizations();
        }
    }, [isCreating]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredOrgs(organizations);
        } else {
            const filtered = organizations.filter(org =>
                org.name_official.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (org.name_short && org.name_short.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredOrgs(filtered);
        }
    }, [searchTerm, organizations]);

    const fetchOrganizations = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/v1/organizations', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setOrganizations(data);
                setFilteredOrgs(data);
            }
        } catch (error) {
            console.error('Failed to fetch organizations', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrganization = async () => {
        if (!newOrgData.name_official) {
            alert('Nome oficial é obrigatório');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch('http://localhost:3000/api/v1/organizations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newOrgData)
            });

            if (response.ok) {
                const newOrg = await response.json();
                setIsCreating(false);
                setNewOrgData({ name_official: '', cnpj: '' });
                // Refresh list and select the new org
                await fetchOrganizations();
                setSelectedOrgId(newOrg.id);
            } else {
                const error = await response.json();
                alert(`Erro: ${error.error || 'Falha ao criar organização'}`);
            }
        } catch (error) {
            console.error('Failed to create organization', error);
            alert('Erro ao criar organização');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedOrgId) {
            alert('Selecione uma organização');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`http://localhost:3000/api/v1/competitions/${competitionId}/register-team`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ team_id: selectedOrgId })
            });

            if (response.ok) {
                onSuccess();
            } else {
                const error = await response.json();
                alert(`Erro: ${error.error || 'Falha ao inscrever time'}`);
            }
        } catch (error) {
            console.error('Failed to register team', error);
            alert('Erro ao inscrever time');
        } finally {
            setSubmitting(false);
        }
    };

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
                className="card animate-fade-in"
                style={{
                    maxWidth: '500px',
                    width: '100%',
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isCreating && (
                            <button className="btn-icon" onClick={() => setIsCreating(false)} style={{ width: '32px', height: '32px' }}>
                                <ArrowLeft size={16} />
                            </button>
                        )}
                        <h3 style={{ margin: 0 }}>{isCreating ? 'Nova Organização' : 'Inscrever Time'}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn-icon"
                        style={{ width: '32px', height: '32px' }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {isCreating ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nome Oficial *</label>
                            <input
                                type="text"
                                className="input"
                                value={newOrgData.name_official}
                                onChange={(e) => setNewOrgData({ ...newOrgData, name_official: e.target.value })}
                                placeholder="Ex: Esporte Clube Exemplo"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>CNPJ *</label>
                            <input
                                type="text"
                                className="input"
                                value={newOrgData.cnpj}
                                onChange={(e) => setNewOrgData({ ...newOrgData, cnpj: e.target.value })}
                                placeholder="00.000.000/0000-00"
                            />
                        </div>
                        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button className="btn btn-secondary" onClick={() => setIsCreating(false)} disabled={submitting}>
                                Cancelar
                            </button>
                            <button className="btn btn-primary" onClick={handleCreateOrganization} disabled={submitting}>
                                {submitting ? 'Criando...' : 'Criar Organização'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Search and Add */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
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
                                    placeholder="Buscar organização..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                        border: '1px solid var(--surface-light)',
                                        borderRadius: 'var(--radius)',
                                        background: 'var(--surface-light)',
                                        color: 'var(--text)',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setIsCreating(true)}
                                title="Criar Nova Organização"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        {/* Organization List */}
                        <div
                            style={{
                                flex: 1,
                                overflowY: 'auto',
                                border: '1px solid var(--surface-light)',
                                borderRadius: 'var(--radius)',
                                marginBottom: '1.5rem',
                                background: 'var(--surface-light)'
                            }}
                        >
                            {loading ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    Carregando...
                                </div>
                            ) : filteredOrgs.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    Nenhuma organização encontrada.
                                    <br />
                                    <button
                                        className="btn btn-outline"
                                        style={{ marginTop: '1rem' }}
                                        onClick={() => setIsCreating(true)}
                                    >
                                        Criar Nova Organização
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    {filteredOrgs.map(org => (
                                        <div
                                            key={org.id}
                                            onClick={() => setSelectedOrgId(org.id)}
                                            style={{
                                                padding: '1rem',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                background: selectedOrgId === org.id ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                                transition: 'background 0.2s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div
                                                    style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '50%',
                                                        border: `2px solid ${selectedOrgId === org.id ? 'var(--primary)' : 'var(--text-muted)'}`,
                                                        background: selectedOrgId === org.id ? 'var(--primary)' : 'transparent',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    {selectedOrgId === org.id && (
                                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />
                                                    )}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: selectedOrgId === org.id ? 'bold' : 'normal' }}>
                                                        {org.name_official}
                                                    </div>
                                                    {org.name_short && (
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                            {org.name_short}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>
                                Cancelar
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSubmit}
                                disabled={!selectedOrgId || submitting}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Plus size={16} />
                                {submitting ? 'Inscrevendo...' : 'Inscrever'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TeamRegistrationModal;
