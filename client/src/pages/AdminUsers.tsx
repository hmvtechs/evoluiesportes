import React, { useEffect, useState } from 'react';
import { Edit, EyeOff, Loader, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface User {
    id: string;
    full_name: string;
    email: string;
    cpf: string;
    phone: string | null;
    role: string;
    rf_status: string;
    is_obfuscated: boolean;
    city: string | null;
    state: string | null;
    created_at: string;
}

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');

        if (!token) {
            setError('Você precisa estar logado como administrador');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/users/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    throw new Error('Acesso negado. Você precisa ser administrador.');
                }
                throw new Error('Erro ao carregar usuários');
            }

            const data = await res.json();
            setUsers(data);
        } catch (err: any) {
            console.error('Error fetching users:', err);
            setError(err.message || 'Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    };

    const handleObfuscate = async (id: string, userName: string) => {
        if (!confirm(`Tem certeza que deseja anonimizar o usuário "${userName}"?\n\nEsta ação é irreversível e está em conformidade com a LGPD.`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/v1/users/admin/${id}/obfuscate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                alert('✅ Usuário anonimizado com sucesso');
                fetchUsers(); // Refresh list
            } else {
                const data = await res.json();
                alert('❌ Erro: ' + (data.error || 'Falha ao anonimizar usuário'));
            }
        } catch (err) {
            console.error('Error obfuscating user:', err);
            alert('❌ Erro de conexão ao anonimizar usuário');
        }
    };

    const handleDelete = async (id: string, userName: string) => {
        if (!confirm(`⚠️ PERIGO: Tem certeza que deseja EXCLUIR o usuário "${userName}"?\n\nEsta ação removerá o usuário do sistema e do banco de dados permanentemente.\n\nEsta ação NÃO pode ser desfeita.`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/v1/users/admin/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                alert('✅ Usuário removido com sucesso');
                fetchUsers(); // Refresh list
            } else {
                const data = await res.json();
                alert('❌ Erro: ' + (data.error || 'Falha ao remover usuário'));
            }
        } catch (err) {
            console.error('Error deleting user:', err);
            alert('❌ Erro de conexão ao remover usuário');
        }
    };

    if (loading) {
        return (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '3rem' }}>
                <Loader size={48} className="spin" style={{ margin: '0 auto' }} />
                <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
                    Carregando usuários...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="animate-fade-in">
                <h1>Gestão de Usuários</h1>
                <div className="card" style={{
                    marginTop: '2rem',
                    padding: '2rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    textAlign: 'center'
                }}>
                    <p style={{ color: 'var(--danger)', fontSize: '1.1rem' }}>
                        ⚠️ {error}
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={fetchUsers}
                        style={{ marginTop: '1rem' }}
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1>Gestão de Usuários</h1>
                <button className="btn btn-primary" onClick={fetchUsers}>
                    Atualizar Lista
                </button>
            </div>

            <div className="card">
                {users.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)' }}>
                            Nenhum usuário encontrado
                        </p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{
                                    textAlign: 'left',
                                    borderBottom: '2px solid var(--surface-light)'
                                }}>
                                    <th style={{ padding: '1rem' }}>Nome</th>
                                    <th style={{ padding: '1rem' }}>Email</th>
                                    <th style={{ padding: '1rem' }}>CPF</th>
                                    <th style={{ padding: '1rem' }}>Cidade/UF</th>
                                    <th style={{ padding: '1rem' }}>Status RF</th>
                                    <th style={{ padding: '1rem' }}>Função</th>
                                    <th style={{ padding: '1rem' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr
                                        key={user.id}
                                        style={{
                                            borderBottom: '1px solid var(--surface-light)',
                                            opacity: user.is_obfuscated ? 0.5 : 1,
                                            background: user.is_obfuscated ? 'rgba(128, 128, 128, 0.05)' : 'transparent'
                                        }}
                                    >
                                        <td style={{ padding: '1rem' }}>
                                            {user.full_name}
                                            {user.is_obfuscated && (
                                                <span style={{
                                                    marginLeft: '0.5rem',
                                                    fontSize: '0.75rem',
                                                    color: 'var(--text-muted)'
                                                }}>
                                                    (Anonimizado)
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                            {user.email}
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                                            {user.cpf}
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                            {user.city && user.state
                                                ? `${user.city}/${user.state}`
                                                : user.city || user.state || '-'}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                background: user.rf_status === 'VALID'
                                                    ? 'var(--success)'
                                                    : user.rf_status === 'INVALID'
                                                        ? 'var(--danger)'
                                                        : 'var(--warning)',
                                                color: 'white'
                                            }}>
                                                {user.rf_status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '0.25rem',
                                                fontSize: '0.75rem',
                                                background: user.role === 'ADMIN'
                                                    ? 'var(--primary)'
                                                    : 'var(--secondary)',
                                                color: 'var(--text)'
                                            }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    className="btn-secondary btn-icon"
                                                    title="Editar usuário"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                {!user.is_obfuscated && (
                                                    <button
                                                        className="btn-icon"
                                                        style={{ color: 'var(--danger)' }}
                                                        onClick={() => handleObfuscate(user.id, user.full_name)}
                                                        title="Anonimizar dados (LGPD)"
                                                    >
                                                        <EyeOff size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    className="btn-icon"
                                                    style={{ color: 'var(--danger)' }}
                                                    onClick={() => handleDelete(user.id, user.full_name)}
                                                    title="Excluir usuário"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div style={{
                marginTop: '1rem',
                padding: '1rem',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: 'var(--text-muted)'
            }}>
                <strong>Total de usuários:</strong> {users.length} |
                <strong> Anonimizados:</strong> {users.filter(u => u.is_obfuscated).length}
            </div>
        </div>
    );
};

export default AdminUsers;
