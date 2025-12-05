import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { Save, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { IOSCard, IOSButton, IOSInput } from '../components/ui/IOSDesign';

const Register: React.FC = () => {
    const navigate = useNavigate();

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

    // Clear validation status when CPF changes
    useEffect(() => {
        setRfStatus(null);
    }, [formData.cpf]);

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
            setRfStatus('❌ CPF deve ter 11 dígitos');
            return;
        }
        if (!validateCPF(cleanCpf)) {
            setRfStatus('❌ CPF inválido');
            return;
        }

        setRfStatus('🔍 Validando...');

        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/auth/validate-rf`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cpf: cleanCpf }),
            });

            const data = await res.json();

            if (res.ok && data.valid) {
                const updates: any = {};
                const name = data.name || data.nome;
                const birthDate = data.birthDate || data.birth_date || data.nascimento;
                const gender = data.gender || data.sexo || data.sex;

                if (name) updates.full_name = name;
                if (birthDate) {
                    if (birthDate.includes('/')) {
                        const [day, month, year] = birthDate.split('/');
                        updates.birth_date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    } else {
                        updates.birth_date = birthDate;
                    }
                }
                if (gender) {
                    const normalizedGender = gender.toUpperCase();
                    if (normalizedGender.startsWith('M')) updates.sex = 'M';
                    else if (normalizedGender.startsWith('F')) updates.sex = 'F';
                    else updates.sex = normalizedGender;
                }

                if (Object.keys(updates).length > 0) {
                    setFormData(prev => ({ ...prev, ...updates }));
                    setRfStatus(`✅ CPF válido`);
                } else {
                    setRfStatus('✅ CPF válido');
                }
            } else {
                setRfStatus('⚠️ ' + (data.error || 'CPF não encontrado'));
            }
        } catch (err) {
            setRfStatus('⚠️ Erro ao validar');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanCpf = formData.cpf.replace(/\D/g, '');

        if (!formData.email || !cleanCpf || !formData.password || !formData.full_name) {
            setError('Preencha os campos obrigatórios');
            return;
        }

        if (!validateCPF(cleanCpf)) {
            setError('CPF Inválido');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Senhas não coincidem');
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
                alert('✅ Cadastro realizado com sucesso!');
                navigate('/login');
            } else {
                setError(data.error || 'Erro ao cadastrar');
            }
        } catch (err) {
            setError('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '100vh', background: '#000000', padding: '2rem',
            position: 'relative'
        }}>
            {/* Ambient Background */}
            <div style={{
                position: 'absolute', top: '-10%', right: '-10%', width: '50%', height: '50%',
                background: 'radial-gradient(circle, rgba(10, 132, 255, 0.15) 0%, transparent 70%)',
                filter: 'blur(80px)'
            }} />

            <IOSCard style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', zIndex: 1, backdropFilter: 'blur(40px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                    <IOSButton variant="ghost" onClick={() => navigate('/login')} style={{ padding: '0.5rem', marginRight: '1rem' }}>
                        <ArrowLeft size={20} />
                    </IOSButton>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img
                            src="/logo.png"
                            alt="Evolui"
                            style={{ height: '40px', objectFit: 'contain' }}
                        />
                        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Cadastro</h1>
                    </div>
                </div>

                {error && (
                    <div style={{
                        padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem',
                        background: 'rgba(255, 69, 58, 0.1)', color: '#FF453A',
                        fontSize: '13px', textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* CPF */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>CPF *</label>
                        <IOSInput
                            name="cpf"
                            value={formData.cpf}
                            onChange={handleChange}
                            onBlur={handleBlurCpf}
                            placeholder="000.000.000-00"
                            maxLength={14}
                            style={{ background: 'rgba(0,0,0,0.2)' }}
                        />
                        {rfStatus && (
                            <p style={{ fontSize: '12px', marginTop: '0.5rem', color: rfStatus.includes('✅') ? '#30D158' : '#FF453A' }}>
                                {rfStatus}
                            </p>
                        )}
                    </div>

                    {/* Role */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Tipo de Conta *</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: '12px',
                                background: 'rgba(0, 0, 0, 0.2)', border: 'none', color: 'white',
                                fontSize: '16px', outline: 'none', appearance: 'none'
                            }}
                        >
                            <option value="FAN">🎉 Torcedor</option>
                            <option value="ATHLETE">🏃 Atleta</option>
                            <option value="CLUB">⚽ Clube / Time</option>
                            <option value="REFEREE">👨‍⚖️ Árbitro</option>
                            <option value="STAFF">👔 Staff / Organizador</option>
                        </select>
                    </div>

                    {/* Full Name */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Nome Completo *</label>
                        <IOSInput name="full_name" value={formData.full_name} onChange={handleChange} style={{ background: 'rgba(0,0,0,0.2)' }} />
                    </div>

                    {/* Birth & Sex */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Nascimento</label>
                            <IOSInput type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} style={{ background: 'rgba(0,0,0,0.2)' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Sexo</label>
                            <select
                                name="sex"
                                value={formData.sex}
                                onChange={handleChange}
                                style={{
                                    width: '100%', padding: '12px 16px', borderRadius: '12px',
                                    background: 'rgba(0, 0, 0, 0.2)', border: 'none', color: 'white',
                                    fontSize: '16px', outline: 'none'
                                }}
                            >
                                <option value="">Selecione</option>
                                <option value="M">Masculino</option>
                                <option value="F">Feminino</option>
                            </select>
                        </div>
                    </div>

                    {/* Email & Phone */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Email *</label>
                        <IOSInput type="email" name="email" value={formData.email} onChange={handleChange} style={{ background: 'rgba(0,0,0,0.2)' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Telefone</label>
                        <IOSInput type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="(00) 00000-0000" style={{ background: 'rgba(0,0,0,0.2)' }} />
                    </div>

                    {/* Passwords */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Senha *</label>
                            <div style={{ position: 'relative' }}>
                                <IOSInput
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    style={{ paddingRight: '2.5rem', background: 'rgba(0,0,0,0.2)' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', color: '#8E8E93', cursor: 'pointer'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Confirmar *</label>
                            <div style={{ position: 'relative' }}>
                                <IOSInput
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    style={{ paddingRight: '2.5rem', background: 'rgba(0,0,0,0.2)' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{
                                        position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', color: '#8E8E93', cursor: 'pointer'
                                    }}
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* City & State */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Cidade</label>
                            <IOSInput name="city" value={formData.city} onChange={handleChange} style={{ background: 'rgba(0,0,0,0.2)' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>UF</label>
                            <IOSInput name="state" value={formData.state} onChange={handleChange} maxLength={2} placeholder="SP" style={{ background: 'rgba(0,0,0,0.2)' }} />
                        </div>
                    </div>

                    <IOSButton
                        onClick={(e) => handleSubmit(e as any)}
                        disabled={loading}
                        style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
                    >
                        <Save size={18} /> {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
                    </IOSButton>
                </form>
            </IOSCard>
        </div>
    );
};

export default Register;
