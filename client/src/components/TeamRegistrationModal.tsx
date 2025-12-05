import React, { useState, useEffect } from 'react';
import { Search, Plus, ArrowLeft, RefreshCw, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { IOSModal, IOSButton, IOSInput } from './ui/IOSDesign';

interface Organization {
    id: number;
    name_official: string;
    name_short?: string;
    type?: string;
    cnpj?: string;
    logo_url?: string;
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
    const [refreshing, setRefreshing] = useState(false);

    // Create Organization State
    const [isCreating, setIsCreating] = useState(false);
    const [newOrgData, setNewOrgData] = useState({
        name_official: '',
        cnpj: '',
        team_manager_name: '',
        team_manager_contact: '',
        coach_name: '',
        coach_contact: '',
        logo_url: ''
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
            const response = await fetch(`${API_BASE_URL}/api/v1/organizations?t=${Date.now()}`, {
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
            const response = await fetch(`${API_BASE_URL}/api/v1/organizations`, {
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
                setNewOrgData({
                    name_official: '',
                    cnpj: '',
                    team_manager_name: '',
                    team_manager_contact: '',
                    coach_name: '',
                    coach_contact: '',
                    logo_url: ''
                });
                // Refresh list and select the new org
                setSearchTerm(''); // Clear search to ensure new org is visible
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

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchOrganizations();
        setRefreshing(false);
    };

    const handleSubmit = async () => {
        if (!selectedOrgId) {
            alert('Selecione uma organização');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/competitions/${competitionId}/register-team`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    organization_id: selectedOrgId,
                    category: 'Principal' // Default category, could be made dynamic
                })
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
        <IOSModal
            isOpen={true}
            onClose={onClose}
            title={isCreating ? 'Nova Organização' : 'Inscrever Time'}
        >
            {isCreating ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <IOSButton variant="secondary" onClick={() => setIsCreating(false)} style={{ alignSelf: 'flex-start', marginBottom: '0.5rem' }}>
                        <ArrowLeft size={16} /> Voltar
                    </IOSButton>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', color: '#8E8E93' }}>Nome Oficial *</label>
                        <IOSInput
                            value={newOrgData.name_official}
                            onChange={(e) => setNewOrgData({ ...newOrgData, name_official: e.target.value })}
                            placeholder="Ex: Esporte Clube Exemplo"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', color: '#8E8E93' }}>CNPJ (opcional)</label>
                        <IOSInput
                            value={newOrgData.cnpj}
                            onChange={(e) => setNewOrgData({ ...newOrgData, cnpj: e.target.value })}
                            placeholder="00.000.000/0000-00"
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', color: '#8E8E93' }}>Responsável</label>
                            <IOSInput
                                value={newOrgData.team_manager_name}
                                onChange={(e) => setNewOrgData({ ...newOrgData, team_manager_name: e.target.value })}
                                placeholder="Nome"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', color: '#8E8E93' }}>Contato</label>
                            <IOSInput
                                value={newOrgData.team_manager_contact}
                                onChange={(e) => setNewOrgData({ ...newOrgData, team_manager_contact: e.target.value })}
                                placeholder="Tel/Email"
                            />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', color: '#8E8E93' }}>Treinador</label>
                            <IOSInput
                                value={newOrgData.coach_name}
                                onChange={(e) => setNewOrgData({ ...newOrgData, coach_name: e.target.value })}
                                placeholder="Nome"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', color: '#8E8E93' }}>Contato</label>
                            <IOSInput
                                value={newOrgData.coach_contact}
                                onChange={(e) => setNewOrgData({ ...newOrgData, coach_contact: e.target.value })}
                                placeholder="Tel/Email"
                            />
                        </div>
                    </div>

                    {/* Logo URL Field */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', color: '#8E8E93' }}>URL do Logo (opcional)</label>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <IOSInput
                                value={newOrgData.logo_url}
                                onChange={(e) => setNewOrgData({ ...newOrgData, logo_url: e.target.value })}
                                placeholder="https://exemplo.com/logo.png"
                                style={{ flex: 1 }}
                            />
                            {newOrgData.logo_url && (
                                <img
                                    src={newOrgData.logo_url}
                                    alt="Preview"
                                    style={{
                                        width: '40px', height: '40px', borderRadius: '8px',
                                        objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)'
                                    }}
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            )}
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <IOSButton variant="secondary" onClick={() => setIsCreating(false)} disabled={submitting}>
                            Cancelar
                        </IOSButton>
                        <IOSButton onClick={handleCreateOrganization} disabled={submitting}>
                            {submitting ? 'Criando...' : 'Criar Organização'}
                        </IOSButton>
                    </div>
                </div>
            ) : (
                <>
                    {/* Search and Add */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search
                                size={18}
                                style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#8E8E93'
                                }}
                            />
                            <IOSInput
                                type="text"
                                placeholder="Buscar organização..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '38px' }}
                            />
                        </div>
                        <IOSButton
                            variant="secondary"
                            onClick={handleRefresh}
                            disabled={refreshing || loading}
                            style={{ width: '44px', padding: 0 }}
                        >
                            <RefreshCw
                                size={20}
                                style={{
                                    animation: refreshing ? 'spin 1s linear infinite' : 'none'
                                }}
                            />
                        </IOSButton>
                        <IOSButton
                            onClick={() => setIsCreating(true)}
                            style={{ width: '44px', padding: 0 }}
                        >
                            <Plus size={20} />
                        </IOSButton>
                    </div>

                    {/* Organization List */}
                    <div
                        style={{
                            height: '300px',
                            overflowY: 'auto',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '16px',
                            marginBottom: '1.5rem',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                    >
                        {loading ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#8E8E93' }}>
                                Carregando...
                            </div>
                        ) : filteredOrgs.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#8E8E93' }}>
                                Nenhuma organização encontrada.
                                <br />
                                <IOSButton
                                    variant="secondary"
                                    style={{ marginTop: '1rem' }}
                                    onClick={() => setIsCreating(true)}
                                >
                                    Criar Nova Organização
                                </IOSButton>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                {filteredOrgs.map(org => (
                                    <div
                                        key={org.id}
                                        onClick={() => setSelectedOrgId(org.id)}
                                        style={{
                                            padding: '1rem',
                                            cursor: 'pointer',
                                            background: selectedOrgId === org.id ? 'rgba(10, 132, 255, 0.15)' : 'transparent',
                                            transition: 'background 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            {/* Organization Logo or Avatar */}
                                            {org.logo_url ? (
                                                <img
                                                    src={org.logo_url}
                                                    alt={org.name_official}
                                                    style={{
                                                        width: '36px', height: '36px', borderRadius: '50%',
                                                        objectFit: 'cover',
                                                        border: selectedOrgId === org.id ? '2px solid #0A84FF' : '1px solid rgba(255,255,255,0.1)'
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '50%',
                                                        background: selectedOrgId === org.id ? '#0A84FF' : 'rgba(255, 255, 255, 0.1)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        fontSize: '14px'
                                                    }}
                                                >
                                                    {org.name_official.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div style={{ fontWeight: selectedOrgId === org.id ? 600 : 400, color: 'white' }}>
                                                    {org.name_official}
                                                </div>
                                                {org.name_short && (
                                                    <div style={{ fontSize: '12px', color: '#8E8E93' }}>
                                                        {org.name_short}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {selectedOrgId === org.id && (
                                            <Check size={20} color="#0A84FF" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <IOSButton variant="secondary" onClick={onClose} disabled={submitting}>
                            Cancelar
                        </IOSButton>
                        <IOSButton
                            onClick={handleSubmit}
                            disabled={!selectedOrgId || submitting}
                        >
                            <Plus size={16} />
                            {submitting ? 'Inscrevendo...' : 'Inscrever'}
                        </IOSButton>
                    </div>
                </>
            )}
        </IOSModal>
    );
};

export default TeamRegistrationModal;
