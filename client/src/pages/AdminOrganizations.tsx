import React, { useState, useEffect } from 'react';
import { Building2, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

interface Organization {
    id: number;
    name_official: string;
    cnpj: string;
    manager_user_id: string | null;
}

const AdminOrganizations: React.FC = () => {
    const { token } = useAuth();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editCnpj, setEditCnpj] = useState('');
    const [showNewForm, setShowNewForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newCnpj, setNewCnpj] = useState('');

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
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditName('');
        setEditCnpj('');
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
                    cnpj: editCnpj
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
                    cnpj: newCnpj || '00.000.000/0000-00'
                })
            });

            if (response.ok) {
                alert('✅ Organização criada com sucesso!');
                fetchOrganizations();
                setShowNewForm(false);
                setNewName('');
                setNewCnpj('');
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
        return <div style={{ padding: '2rem' }}>Carregando...</div>;
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Building2 size={32} />
                    <h1 style={{ margin: 0 }}>Gerenciar Organizações</h1>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => setShowNewForm(!showNewForm)}
                >
                    <Plus size={16} />
                    Nova Organização
                </button>
            </div>

            {showNewForm && (
                <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                    <h3 style={{ marginTop: 0 }}>Nova Organização</h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                Nome Oficial <span style={{ color: 'var(--danger)' }}>*</span>
                            </label>
                            <input
                                type="text"
                                className="input"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Ex: Clube Atlético Mineiro"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                CNPJ
                            </label>
                            <input
                                type="text"
                                className="input"
                                value={newCnpj}
                                onChange={(e) => setNewCnpj(e.target.value)}
                                placeholder="00.000.000/0000-00"
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    setShowNewForm(false);
                                    setNewName('');
                                    setNewCnpj('');
                                }}
                            >
                                <X size={16} />
                                Cancelar
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleCreate}
                            >
                                <Save size={16} />
                                Criar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="card">
                {organizations.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                        Nenhuma organização cadastrada
                    </p>
                ) : (
                    <table style={{ width: '100%' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--surface-light)' }}>
                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>ID</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Nome Oficial</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>CNPJ</th>
                                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {organizations.map(org => (
                                <tr key={org.id} style={{ borderBottom: '1px solid var(--surface-light)' }}>
                                    <td style={{ padding: '0.75rem' }}>{org.id}</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        {editingId === org.id ? (
                                            <input
                                                type="text"
                                                className="input"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                style={{ width: '100%' }}
                                            />
                                        ) : (
                                            <strong>{org.name_official}</strong>
                                        )}
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>
                                        {editingId === org.id ? (
                                            <input
                                                type="text"
                                                className="input"
                                                value={editCnpj}
                                                onChange={(e) => setEditCnpj(e.target.value)}
                                                style={{ width: '100%' }}
                                            />
                                        ) : (
                                            org.cnpj
                                        )}
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            {editingId === org.id ? (
                                                <>
                                                    <button
                                                        className="btn-primary"
                                                        onClick={() => handleSaveEdit(org.id)}
                                                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                                                    >
                                                        <Save size={14} />
                                                        Salvar
                                                    </button>
                                                    <button
                                                        className="btn-secondary"
                                                        onClick={handleCancelEdit}
                                                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                                                    >
                                                        <X size={14} />
                                                        Cancelar
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        className="btn-secondary"
                                                        onClick={() => handleStartEdit(org)}
                                                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                                                    >
                                                        <Edit2 size={14} />
                                                        Editar
                                                    </button>
                                                    <button
                                                        className="btn-danger"
                                                        onClick={() => handleDelete(org.id, org.name_official)}
                                                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="card" style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--warning-bg)', border: '1px solid var(--warning)' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--warning)' }}>⚠️ Importante</h4>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text)' }}>
                    <li>Alterar o nome de uma organização afetará TODOS os times e competições associados</li>
                    <li>As mudanças aparecem IMEDIATAMENTE após salvar</li>
                    <li>Exclua organizações apenas se não tiverem times associados</li>
                </ul>
            </div>
        </div>
    );
};

export default AdminOrganizations;
