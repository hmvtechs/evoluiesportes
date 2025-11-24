import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { token } = useAuth(); // token may not be needed for registration

    const [formData, setFormData] = useState({
        email: '',
        cpf: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        phone: '',
        sex: '',
        birth_date: '',
        city: '',
        state: '',
        role: 'FAN',
    });

    const [rfStatus, setRfStatus] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validateCPF = (cpf: string) => {
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
        let sum = 0;
        let remainder;
        for (let i = 1; i <= 9; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;
        sum = 0;
        for (let i = 1; i <= 10; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;
        return true;
    };

    const formatCPF = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        let value = e.target.value;
        if (e.target.name === 'cpf') {
            value = formatCPF(value);
        }
        setFormData({ ...formData, [e.target.name]: value });
        setError('');
    };

    const handleBlurCpf = async () => {
        const cleanCpf = formData.cpf.replace(/\D/g, '');
        if (cleanCpf.length !== 11) {
            setRfStatus('CPF deve ter 11 dígitos');
            return;
        }
        if (!validateCPF(cleanCpf)) {
            setRfStatus('CPF Inválido (Dígito verificador incorreto)');
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/auth/validate-rf`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cpf: cleanCpf }),
            });
            const data = await res.json();
            if (res.ok && (data.status === 'VALID' || data.status === 'REGULAR')) {
                setRfStatus('✓ Válido na Receita Federal');
                if (data.name && !formData.full_name) {
                    setFormData(prev => ({ ...prev, full_name: data.name }));
                }
            } else {
                setRfStatus('✗ ' + (data.error || 'CPF Irregular na Receita'));
            }
        } catch (err) {
            console.error(err);
            setRfStatus('Erro ao validar na Receita (Offline?)');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const cleanCpf = formData.cpf.replace(/\D/g, '');
        // Basic validation
        if (!formData.email || !cleanCpf || !formData.password || !formData.full_name) {
            setError('Por favor, preencha todos os campos obrigatórios');
            return;
        }
        if (!validateCPF(cleanCpf)) {
            setError('CPF Inválido');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }
        if (formData.password.length < 4) {
            setError('A senha deve ter pelo menos 4 caracteres');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    cpf: cleanCpf,
                    password: formData.password,
                    full_name: formData.full_name,
                    phone: formData.phone,
                    sex: formData.sex,
                    birth_date: formData.birth_date,
                    city: formData.city,
                    state: formData.state,
                    role: formData.role,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                alert('✅ Cadastro realizado com sucesso! Faça login para continuar.');
                navigate('/login');
            } else {
                setError(data.error || 'Erro ao cadastrar. Tente novamente.');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('Erro de conexão com o servidor. Verifique se o backend está rodando.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', minHeight: '100vh', alignItems: 'center' }}>
            <div className="glass animate-fade-in" style={{ padding: '2rem', maxWidth: '600px', width: '100%' }}>
                <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Cadastro de Cidadão</h1>
                {error && (
                    <div style={{ padding: '1rem', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '0.5rem', color: 'var(--danger)' }}>
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* CPF */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            CPF <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <input
                            name="cpf"
                            className="input"
                            value={formData.cpf}
                            onChange={handleChange}
                            onBlur={handleBlurCpf}
                            placeholder="000.000.000-00"
                            maxLength={14}
                            required
                        />
                        {rfStatus && (
                            <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: rfStatus.includes('✓') ? 'var(--success)' : 'var(--danger)' }}>
                                {rfStatus}
                            </p>
                        )}
                    </div>
                    {/* Role Selection */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Tipo de Conta <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <select name="role" className="input" value={formData.role} onChange={handleChange} required>
                            <option value="FAN">🎉 Torcedor</option>
                            <option value="ATHLETE">🏃 Atleta</option>
                            <option value="CLUB">⚽ Clube / Time</option>
                            <option value="REFEREE">👨‍⚖️ Árbitro</option>
                            <option value="STAFF">👔 Staff / Organizador</option>
                        </select>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            Escolha como você pretende usar a plataforma. Você pode alterar depois.
                        </p>
                    </div>
                    {/* Full Name */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Nome Completo <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <input name="full_name" className="input" value={formData.full_name} onChange={handleChange} required />
                    </div>
                    {/* Birth Date and Sex */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Data de Nascimento</label>
                            <input type="date" name="birth_date" className="input" value={formData.birth_date} onChange={handleChange} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Sexo</label>
                            <select name="sex" className="input" value={formData.sex} onChange={handleChange}>
                                <option value="">Selecione</option>
                                <option value="M">Masculino</option>
                                <option value="F">Feminino</option>
                            </select>
                        </div>
                    </div>
                    {/* Email */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Email <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <input type="email" name="email" className="input" value={formData.email} onChange={handleChange} required />
                    </div>
                    {/* Phone */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Telefone</label>
                        <input type="tel" name="phone" className="input" value={formData.phone} onChange={handleChange} placeholder="(00) 00000-0000" />
                    </div>
                    {/* Password */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                                Senha <span style={{ color: 'var(--danger)' }}>*</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className="input"
                                    value={formData.password}
                                    onChange={handleChange}
                                    style={{ paddingRight: '2.5rem' }}
                                    required
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
                                        color: 'var(--text-muted)',
                                        padding: '0.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                                Confirmar Senha <span style={{ color: 'var(--danger)' }}>*</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    className="input"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    style={{ paddingRight: '2.5rem' }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--text-muted)',
                                        padding: '0.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* City and State */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Cidade</label>
                            <input name="city" className="input" value={formData.city} onChange={handleChange} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Estado (UF)</label>
                            <input name="state" className="input" value={formData.state} onChange={handleChange} maxLength={2} placeholder="SP" />
                        </div>
                    </div>
                    {/* Submit Button */}
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                        <Save size={18} /> {loading ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                    {/* Link to Login */}
                    <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Já tem conta? </span>
                        <a href="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.875rem' }}>Fazer Login</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
