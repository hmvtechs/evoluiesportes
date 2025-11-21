import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
                alert('Local salvo com sucesso!');
                navigate('/venues');
            } else {
                const data = await response.json();
                alert(`Erro: ${data.error}`);
            }
        } catch (error) {
            alert('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button className="btn-icon" onClick={() => navigate('/venues')}><ArrowLeft size={24} /></button>
                <MapPin size={32} color="var(--primary)" />
                <h1>{id ? 'Editar Local' : 'Novo Local Esportivo'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="card" style={{ display: 'grid', gap: '1.5rem' }}>
                {/* Basic Info */}
                <section>
                    <h3>Informações Básicas</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                        <div>
                            <label>Nome Oficial</label>
                            <input type="text" name="name" className="input" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div>
                            <label>Apelido</label>
                            <input type="text" name="nickname" className="input" value={formData.nickname} onChange={handleChange} />
                        </div>
                        <div>
                            <label>Tipo</label>
                            <select name="type" className="input" value={formData.type} onChange={handleChange}>
                                <option value="FIELD">Campo</option>
                                <option value="GYM">Ginásio</option>
                                <option value="COURT">Quadra</option>
                                <option value="POOL">Piscina</option>
                                <option value="COMPLEX">Complexo</option>
                                <option value="TRACK">Pista</option>
                                <option value="OTHER">Outro</option>
                            </select>
                        </div>
                        <div>
                            <label>Data Inauguração</label>
                            <input type="date" name="inauguration_date" className="input" value={formData.inauguration_date} onChange={handleChange} />
                        </div>
                    </div>
                </section>

                {/* Location */}
                <section>
                    <h3>Localização</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                        <input type="text" name="zip_code" className="input" placeholder="CEP" value={formData.zip_code} onChange={handleChange} />
                        <input type="text" name="city" className="input" placeholder="Cidade" value={formData.city} onChange={handleChange} />
                        <input type="text" name="neighborhood" className="input" placeholder="Bairro" value={formData.neighborhood} onChange={handleChange} />
                        <input type="text" name="address" className="input" placeholder="Endereço" value={formData.address} onChange={handleChange} />
                        <input type="text" name="number" className="input" placeholder="Número" value={formData.number} onChange={handleChange} />
                        <input type="text" name="complement" className="input" placeholder="Complemento" value={formData.complement} onChange={handleChange} />
                    </div>
                </section>

                {/* Config & Specs */}
                <section>
                    <h3>Configuração e Reservas</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                        <div>
                            <label>Capacidade</label>
                            <input type="number" name="capacity" className="input" value={formData.capacity} onChange={handleChange} />
                        </div>
                        <div>
                            <label>Preço/Hora (R$)</label>
                            <input type="number" name="price_per_hour" className="input" value={formData.price_per_hour} onChange={handleChange} />
                        </div>
                        <div>
                            <label>Antecedência Mín. (h)</label>
                            <input type="number" name="min_advance_hours" className="input" value={formData.min_advance_hours} onChange={handleChange} />
                        </div>
                        <div>
                            <label>Limite Futuro (dias)</label>
                            <input type="number" name="max_future_days" className="input" value={formData.max_future_days} onChange={handleChange} />
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input type="checkbox" name="has_accessibility" checked={formData.has_accessibility} onChange={handleChange} />
                            Possui Acessibilidade?
                        </label>
                    </div>
                </section>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        <Save size={18} /> {loading ? 'Salvando...' : 'Salvar Local'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VenueForm;
