import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Save, ArrowLeft, Info, Settings, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { IOSCard, IOSInput, IOSButton, IOSSegmentedControl } from '../components/ui/IOSDesign';

const VenueForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        nickname: '',
        type: 'FIELD',
        inauguration_date: '',
        zip_code: '',
        country: 'Brasil',
        state: '',
        city: '',
        neighborhood: '',
        address: '',
        number: '',
        complement: '',
        latitude: '',
        longitude: '',
        phone: '',
        pix_key: '',
        owner_entity: '',
        capacity: '',
        has_accessibility: false,
        description: '',
        price_per_hour: '',
        min_advance_hours: 1,
        max_future_days: 30,
        max_active_bookings_per_user: 3
    });

    useEffect(() => {
        if (id) {
            fetchVenue();
        }
    }, [id]);

    const fetchVenue = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/v1/venues/${id}`);
            const data = await response.json();
            // Format date for input
            if (data.inauguration_date) {
                data.inauguration_date = data.inauguration_date.split('T')[0];
            }
            setFormData(data);
        } catch (error) {
            console.error('Error fetching venue:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = id ? `http://localhost:3000/api/v1/venues/${id}` : 'http://localhost:3000/api/v1/venues';
            const method = id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('✅ Local salvo com sucesso!');
                navigate('/venues');
            } else {
                const data = await response.json();
                alert(`❌ Erro: ${data.error}`);
            }
        } catch (error) {
            alert('❌ Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <IOSButton variant="secondary" onClick={() => navigate('/venues')} style={{ width: '40px', height: '40px', padding: 0, justifyContent: 'center' }}>
                        <ArrowLeft size={20} />
                    </IOSButton>
                    <div>
                        <h1 style={{ fontSize: '34px', fontWeight: 800, margin: 0 }}>{id ? 'Editar Local' : 'Novo Local'}</h1>
                        <p style={{ color: '#8E8E93', fontSize: '17px', marginTop: '0.25rem' }}>
                            {id ? 'Atualize as informações do local' : 'Cadastre um novo espaço esportivo'}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>
                {/* Basic Info */}
                <IOSCard>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Info size={24} color="#0A84FF" />
                        <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Informações Básicas</h3>
                    </div>
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Nome Oficial</label>
                                <IOSInput name="name" value={formData.name} onChange={handleChange} required placeholder="Ex: Ginásio Municipal" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Apelido</label>
                                <IOSInput name="nickname" value={formData.nickname} onChange={handleChange} placeholder="Ex: Ginasião" />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Tipo</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%', padding: '12px', borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'white', fontSize: '15px'
                                    }}
                                >
                                    <option value="FIELD" style={{ color: 'black' }}>Campo</option>
                                    <option value="GYM" style={{ color: 'black' }}>Ginásio</option>
                                    <option value="COURT" style={{ color: 'black' }}>Quadra</option>
                                    <option value="POOL" style={{ color: 'black' }}>Piscina</option>
                                    <option value="COMPLEX" style={{ color: 'black' }}>Complexo</option>
                                    <option value="TRACK" style={{ color: 'black' }}>Pista</option>
                                    <option value="OTHER" style={{ color: 'black' }}>Outro</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Data Inauguração</label>
                                <IOSInput type="date" name="inauguration_date" value={formData.inauguration_date} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                </IOSCard>

                {/* Location */}
                <IOSCard>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <MapPin size={24} color="#30D158" />
                        <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Localização</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <IOSInput name="zip_code" placeholder="CEP" value={formData.zip_code} onChange={handleChange} />
                        <IOSInput name="city" placeholder="Cidade" value={formData.city} onChange={handleChange} />
                        <IOSInput name="neighborhood" placeholder="Bairro" value={formData.neighborhood} onChange={handleChange} />
                        <IOSInput name="address" placeholder="Endereço" value={formData.address} onChange={handleChange} />
                        <IOSInput name="number" placeholder="Número" value={formData.number} onChange={handleChange} />
                        <IOSInput name="complement" placeholder="Complemento" value={formData.complement} onChange={handleChange} />
                    </div>
                </IOSCard>

                {/* Config & Specs */}
                <IOSCard>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Settings size={24} color="#FF9F0A" />
                        <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Configuração e Reservas</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Capacidade</label>
                            <IOSInput type="number" name="capacity" value={formData.capacity} onChange={handleChange} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Preço/Hora (R$)</label>
                            <IOSInput type="number" name="price_per_hour" value={formData.price_per_hour} onChange={handleChange} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Antecedência Mín. (h)</label>
                            <IOSInput type="number" name="min_advance_hours" value={formData.min_advance_hours} onChange={handleChange} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Limite Futuro (dias)</label>
                            <IOSInput type="number" name="max_future_days" value={formData.max_future_days} onChange={handleChange} />
                        </div>
                    </div>
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '15px', fontWeight: 600 }}>Possui Acessibilidade?</span>
                        <label className="switch">
                            <input type="checkbox" name="has_accessibility" checked={formData.has_accessibility} onChange={handleChange} />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </IOSCard>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <IOSButton type="submit" disabled={loading} style={{ width: 'auto', padding: '12px 32px', fontSize: '16px' }}>
                        <Save size={20} style={{ marginRight: '0.5rem' }} />
                        {loading ? 'Salvando...' : 'Salvar Local'}
                    </IOSButton>
                </div>
            </form>

            <style>{`
        .switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 30px;
        }
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #3A3A3C;
            transition: .4s;
        }
        .slider:before {
            position: absolute;
            content: "";
            height: 26px;
            width: 26px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            transition: .4s;
        }
        input:checked + .slider {
            background-color: #30D158;
        }
        input:checked + .slider:before {
            transform: translateX(20px);
        }
        .slider.round {
            border-radius: 34px;
        }
        .slider.round:before {
            border-radius: 50%;
        }
      `}</style>
        </div>
    );
};

export default VenueForm;
