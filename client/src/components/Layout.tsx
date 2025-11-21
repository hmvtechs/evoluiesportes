import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getModulesForUser } from '../modules/registry';

const Layout: React.FC = () => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const modules = getModulesForUser(user?.role);

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="layout">
            <aside className="sidebar">
                <div className="logo">
                    <h2 style={{ fontSize: '1.5rem', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        e-Esporte
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Gestão Pública</p>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {modules.map(module => (
                        <Link
                            key={module.id}
                            to={module.path}
                            className="btn"
                            style={{
                                justifyContent: 'flex-start',
                                background: isActive(module.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                color: isActive(module.path) ? 'white' : 'var(--text-muted)',
                                border: isActive(module.path) ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
                                boxShadow: isActive(module.path) ? '0 0 15px rgba(99, 102, 241, 0.2)' : 'none'
                            }}
                        >
                            <module.icon size={20} /> {module.label}
                        </Link>
                    ))}
                </nav>

                <div style={{ marginTop: 'auto' }}>
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 'var(--radius)',
                        marginBottom: '1rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(4px)'
                    }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{user?.full_name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.role}</p>
                    </div>
                    <button onClick={logout} className="btn btn-danger" style={{ width: '100%' }}>
                        <LogOut size={20} /> Sair
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
