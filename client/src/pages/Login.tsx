import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { IOSCard, IOSButton, IOSInput } from '../components/ui/IOSDesign';

const Login: React.FC = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
            });
            const data = await response.json();
            if (response.ok) {
                login(data.token, data.user);
                navigate('/');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Network error');
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: '#000000',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Ambient Background */}
            <div style={{
                position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '60%',
                background: 'radial-gradient(circle, rgba(10, 132, 255, 0.2) 0%, transparent 70%)',
                filter: 'blur(80px)'
            }} />
            <div style={{
                position: 'absolute', bottom: '-20%', right: '-10%', width: '60%', height: '60%',
                background: 'radial-gradient(circle, rgba(48, 209, 88, 0.15) 0%, transparent 70%)',
                filter: 'blur(80px)'
            }} />

            <IOSCard style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', zIndex: 1, backdropFilter: 'blur(40px)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <img
                        src="/logo.png"
                        alt="Evolui"
                        style={{
                            height: '80px',
                            marginBottom: '1rem',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 0 20px rgba(10, 132, 255, 0.4))'
                        }}
                    />
                    <p style={{ color: '#8E8E93', fontSize: '15px' }}>Bem-vindo de volta</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93', fontWeight: 500 }}>Email ou CPF</label>
                        <IOSInput
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="Digite seu acesso"
                            style={{ background: 'rgba(0,0,0,0.2)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93', fontWeight: 500 }}>Senha</label>
                        <div style={{ position: 'relative' }}>
                            <IOSInput
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Sua senha"
                                style={{ paddingRight: '2.5rem', background: 'rgba(0,0,0,0.2)' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#8E8E93',
                                    padding: '0.25rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            padding: '0.75rem', borderRadius: '8px',
                            background: 'rgba(255, 69, 58, 0.1)', color: '#FF453A',
                            fontSize: '13px', textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <IOSButton
                        onClick={(e) => handleSubmit(e as any)}
                        style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}
                    >
                        Entrar
                    </IOSButton>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <span style={{ color: '#8E8E93', fontSize: '14px' }}>Não tem conta? </span>
                        <a
                            href="/register"
                            style={{ color: '#0A84FF', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}
                        >
                            Criar Conta
                        </a>
                    </div>
                </form>
            </IOSCard>
        </div>
    );
};

export default Login;
