import React, { useEffect, useState } from 'react';
import { Edit, EyeOff, Loader, Trash2, RefreshCw, Search } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { IOSCard, IOSButton, IOSInput } from '../components/ui/IOSDesign';

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
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredUsers(users);
        } else {
            const lower = searchTerm.toLowerCase();
            setFilteredUsers(users.filter(u =>
                u.full_name.toLowerCase().includes(lower) ||
                u.email.toLowerCase().includes(lower) ||
                u.cpf.includes(lower)
            ));
        }
    }, [searchTerm, users]);

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
            setFilteredUsers(data);
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
                fetchUsers();
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
                fetchUsers();
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
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '4rem', color: '#8E8E93' }}>
                <Loader size={48} className="spin" style={{ margin: '0 auto 1rem' }} />
                <p>Carregando usuários...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="animate-fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '2rem' }}>Gestão de Usuários</h1>
                <IOSCard style={{ background: 'rgba(255, 69, 58, 0.1)', borderColor: 'rgba(255, 69, 58, 0.3)' }}>
                    <p style={{ color: '#FF453A', fontSize: '17px', marginBottom: '1rem' }}>⚠️ {error}</p>
                    <IOSButton onClick={fetchUsers}>Tentar Novamente</IOSButton>
                </IOSCard>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '34px', fontWeight: 800, margin: 0 }}>Usuários</h1>
                    <p style={{ color: '#8E8E93', fontSize: '15px', marginTop: '0.5rem' }}>
                        Total: {users.length} • Anonimizados: {users.filter(u => u.is_obfuscated).length}
                    </p>
                </div>
                <IOSButton onClick={fetchUsers} style={{ padding: '0.5rem' }}>
                    <RefreshCw size={20} />
                </IOSButton>
            </div>

            <div style={{ marginBottom: '2rem', position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8E8E93' }} />
                <IOSInput
                    placeholder="Buscar por nome, email ou CPF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                />
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {filteredUsers.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#8E8E93' }}>
                        Nenhum usuário encontrado
                    </div>
                ) : (
                    filteredUsers.map(user => (
                        <IOSCard
                            key={user.id}
                            style={{
                                padding: '1.25rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                opacity: user.is_obfuscated ? 0.6 : 1,
                                background: user.is_obfuscated ? 'rgba(28, 28, 30, 0.4)' : undefined
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '50%',
                                        background: user.is_obfuscated ? '#8E8E93' : '#0A84FF',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontWeight: 'bold', fontSize: '18px'
                                    }}>
                                        {user.full_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '17px', color: 'white' }}>
                                            {user.full_name}
                                            {user.is_obfuscated && <span style={{ fontSize: '12px', color: '#8E8E93', marginLeft: '0.5rem' }}>(Anonimizado)</span>}
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#8E8E93' }}>{user.email}</div>
                                        <div style={{ fontSize: '13px', color: '#636366', fontFamily: 'monospace' }}>{user.cpf}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                                        background: user.role === 'ADMIN' ? '#0A84FF' : 'rgba(255,255,255,0.1)',
                                        color: user.role === 'ADMIN' ? 'white' : '#8E8E93'
                                    }}>
                                        {user.role}
                                    </span>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                                        background: user.rf_status === 'VALID' ? '#30D158' : user.rf_status === 'INVALID' ? '#FF453A' : '#FF9F0A',
                                        color: 'white'
                                    }}>
                                        {user.rf_status}
                                    </span>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '13px', color: '#8E8E93' }}>
                                    {user.city && user.state ? `${user.city}/${user.state}` : 'Localização não informada'}
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <IOSButton variant="secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                                        <Edit size={14} /> Editar
                                    </IOSButton>
                                    {!user.is_obfuscated && (
                                        <IOSButton
                                            variant="danger"
                                            onClick={() => handleObfuscate(user.id, user.full_name)}
                                            style={{ padding: '6px 12px', fontSize: '13px' }}
                                        >
                                            <EyeOff size={14} />
                                        </IOSButton>
                                    )}
                                    <IOSButton
                                        variant="danger"
                                        onClick={() => handleDelete(user.id, user.full_name)}
                                        style={{ padding: '6px 12px', fontSize: '13px' }}
                                    >
                                        <Trash2 size={14} />
                                    </IOSButton>
                                </div>
                            </div>
                        </IOSCard>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
