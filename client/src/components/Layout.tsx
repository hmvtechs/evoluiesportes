import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getModulesForUser } from '../modules/registry';

const Layout: React.FC = () => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const modules = getModulesForUser(user?.role);

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="layout" style={{ background: '#000000', minHeight: '100vh', display: 'flex' }}>
            {/* Glassmorphic Sidebar */}
            <aside style={{
                width: '280px',
                background: 'rgba(28, 28, 30, 0.75)', // iOS System Gray 6 with opacity
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                padding: '2rem 1rem',
                position: 'fixed',
                top: 0,
                bottom: 0,
                zIndex: 50
            }}>
                {/* Logo Area */}
                <div style={{ padding: '0 1rem', marginBottom: '3rem', textAlign: 'center' }}>
                    <img
                        src="/logo.png"
                        alt="Evolui"
                        style={{
                            height: '60px',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 0 10px rgba(10, 132, 255, 0.3))'
                        }}
                    />
                </div>

                {/* Navigation */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    {modules.map(module => {
                        const active = isActive(module.path);
                        return (
                            <Link
                                key={module.id}
                                to={module.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    background: active ? '#0A84FF' : 'transparent',
                                    color: active ? 'white' : '#8E8E93',
                                    textDecoration: 'none',
                                    fontSize: '15px',
                                    fontWeight: active ? 600 : 500,
                                    transition: 'all 0.2s ease',
                                    position: 'relative'
                                }}
                            >
                                <module.icon size={20} color={active ? 'white' : '#8E8E93'} />
                                {module.label}
                                {active && (
                                    <ChevronRight
                                        size={16}
                                        style={{ position: 'absolute', right: '12px', opacity: 0.6 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile Card */}
                <div style={{
                    marginTop: 'auto',
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #FF9F0A, #FF375F)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 'bold', fontSize: '16px'
                        }}>
                            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user?.full_name}
                            </p>
                            <p style={{ fontSize: '12px', color: '#8E8E93' }}>{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '8px',
                            background: 'rgba(255, 69, 58, 0.15)',
                            color: '#FF453A',
                            border: 'none',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 69, 58, 0.25)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 69, 58, 0.15)'}
                    >
                        <LogOut size={14} /> Sair
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{
                flex: 1,
                marginLeft: '280px', // Match sidebar width
                padding: '0',
                background: '#000000', // Deep black background
                minHeight: '100vh',
                position: 'relative'
            }}>
                {/* Background Gradients */}
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none',
                    background: `
                        radial-gradient(circle at 80% 0%, rgba(10, 132, 255, 0.08) 0%, transparent 40%),
                        radial-gradient(circle at 20% 100%, rgba(48, 209, 88, 0.05) 0%, transparent 40%)
                    `
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
