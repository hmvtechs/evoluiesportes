import React, { useState, useEffect } from 'react';
import { Building2, Edit2, Save, X, Plus, Trash2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { IOSCard, IOSButton, IOSInput } from '../components/ui/IOSDesign';

interface Organization {
    id: number;
    name_official: string;
    cnpj: string;
    manager_user_id: string | null;
    team_manager_name?: string;
    team_manager_contact?: string;
    coach_name?: string;
    coach_contact?: string;
}

const AdminOrganizations: React.FC = () => {
    const { token } = useAuth();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editCnpj, setEditCnpj] = useState('');
    const [editTeamManager, setEditTeamManager] = useState('');
    const [editTeamContact, setEditTeamContact] = useState('');
    const [editCoach, setEditCoach] = useState('');
    const [editCoachContact, setEditCoachContact] = useState('');
    const [showNewForm, setShowNewForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newCnpj, setNewCnpj] = useState('');
    const [newTeamManager, setNewTeamManager] = useState('');
    const [newTeamContact, setNewTeamContact] = useState('');
    const [newCoach, setNewCoach] = useState('');
    const [newCoachContact, setNewCoachContact] = useState('');

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/organizations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setOrganizations(data);
            }
        } catch (error) {
            console.error('Failed to fetch organizations', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartEdit = (org: Organization) => {
        setEditingId(org.id);
        setEditName(org.name_official);
        setEditCnpj(org.cnpj);
        setEditTeamManager(org.team_manager_name || '');
        setEditTeamContact(org.team_manager_contact || '');
        setEditCoach(org.coach_name || '');
        setEditCoachContact(org.coach_contact || '');
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditName('');
        setEditCnpj('');
        setEditTeamManager('');
        setEditTeamContact('');
        setEditCoach('');
        setEditCoachContact('');
    };

    const handleSaveEdit = async (id: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/organizations/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name_official: editName,
                    cnpj: editCnpj,
                    team_manager_name: editTeamManager,
                    team_manager_contact: editTeamContact,
                    coach_name: editCoach,
                    coach_contact: editCoachContact
                })
            });

            if (response.ok) {
                alert('✅ Organização atualizada com sucesso!');
                fetchOrganizations();
                handleCancelEdit();
            } else {
                alert('❌ Erro ao atualizar organização');
            }
        } catch (error) {
            console.error('Failed to update organization', error);
            alert('❌ Erro ao atualizar organização');
        }
    };

    const handleCreate = async () => {
        if (!newName.trim()) {
            alert('⚠️ Nome é obrigatório');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/organizations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name_official: newName,
                    cnpj: newCnpj || null,
                    team_manager_name: newTeamManager || null,
                    team_manager_contact: newTeamContact || null,
                    coach_name: newCoach || null,
                    coach_contact: newCoachContact || null
                })
            });

            if (response.ok) {
                alert('✅ Organização criada com sucesso!');
                fetchOrganizations();
                setShowNewForm(false);
                setNewName('');
                setNewCnpj('');
                setNewTeamManager('');
                setNewTeamContact('');
                setNewCoach('');
                setNewCoachContact('');
            } else {
                alert('❌ Erro ao criar organização');
            }
        } catch (error) {
            console.error('Failed to create organization', error);
            alert('❌ Erro ao criar organização');
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Tem certeza que deseja excluir "${name}"?\n\nISSO PODE AFETAR TIMES E COMPETIÇÕES!`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/organizations/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert('✅ Organização excluída');
                fetchOrganizations();
            } else {
                alert('❌ Erro ao excluir organização');
            }
        } catch (error) {
            console.error('Failed to delete organization', error);
            alert('❌ Erro ao excluir organização');
        }
    };

    if (loading) {
        return <div style={{ padding: '4rem', textAlign: 'center', color: '#8E8E93' }}>Carregando...</div>;
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '34px', fontWeight: 800, margin: 0 }}>Organizações</h1>
                    <p style={{ color: '#8E8E93', fontSize: '15px', marginTop: '0.5rem' }}>
                        Gerencie clubes e entidades
                    </p>
                </div>
                <IOSButton onClick={() => setShowNewForm(!showNewForm)}>
                    <Plus size={18} /> Nova
                </IOSButton>
            </div>

            {showNewForm && (
                <IOSCard style={{ marginBottom: '2rem', border: '1px solid #0A84FF' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '20px', fontWeight: 700 }}>Nova Organização</h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Nome Oficial *</label>
                            <IOSInput value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex: Clube Atlético Mineiro" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>CNPJ</label>
                            <IOSInput value={newCnpj} onChange={(e) => setNewCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Responsável</label>
                                <IOSInput value={newTeamManager} onChange={(e) => setNewTeamManager(e.target.value)} placeholder="Nome" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Contato</label>
                                <IOSInput value={newTeamContact} onChange={(e) => setNewTeamContact(e.target.value)} placeholder="Tel/Email" />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Treinador</label>
                                <IOSInput value={newCoach} onChange={(e) => setNewCoach(e.target.value)} placeholder="Nome" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Contato</label>
                                <IOSInput value={newCoachContact} onChange={(e) => setNewCoachContact(e.target.value)} placeholder="Tel/Email" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <IOSButton variant="secondary" onClick={() => setShowNewForm(false)}>Cancelar</IOSButton>
                            <IOSButton onClick={handleCreate}>Criar Organização</IOSButton>
                        </div>
                    </div>
                </IOSCard>
            )}

            <div style={{ display: 'grid', gap: '1rem' }}>
                {organizations.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#8E8E93', padding: '4rem' }}>
                        Nenhuma organização cadastrada
                    </div>
                ) : (
                    organizations.map(org => (
                        <IOSCard key={org.id} style={{ padding: '1.5rem' }}>
                            {editingId === org.id ? (
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    <IOSInput value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nome Oficial" />
                                    <IOSInput value={editCnpj} onChange={(e) => setEditCnpj(e.target.value)} placeholder="CNPJ" />
                                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                        <IOSButton variant="secondary" onClick={handleCancelEdit}>Cancelar</IOSButton>
                                        <IOSButton onClick={() => handleSaveEdit(org.id)}>Salvar</IOSButton>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '48px', height: '48px', borderRadius: '12px',
                                            background: 'rgba(255,255,255,0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontWeight: 'bold', fontSize: '18px'
                                        }}>
                                            {org.name_official.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '17px', color: 'white' }}>{org.name_official}</div>
                                            <div style={{ fontSize: '14px', color: '#8E8E93' }}>{org.cnpj || 'Sem CNPJ'}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <IOSButton variant="secondary" onClick={() => handleStartEdit(org)} style={{ padding: '8px' }}>
                                            <Edit2 size={16} />
                                        </IOSButton>
                                        <IOSButton variant="danger" onClick={() => handleDelete(org.id, org.name_official)} style={{ padding: '8px' }}>
                                            <Trash2 size={16} />
                                        </IOSButton>
                                    </div>
                                </div>
                            )}
                        </IOSCard>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminOrganizations;
