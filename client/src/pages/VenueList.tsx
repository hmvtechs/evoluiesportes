import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/api';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Plus, Edit, Trash } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Venue {
    id: number;
    name: string;
    type: string;
    city: string;
    neighborhood: string;
    capacity: number;
    price_per_hour: number;
}

const VenueList: React.FC = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchVenues = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/venues`);
            const data = await response.json();
            setVenues(data);
        } catch (error) {
            console.error('Error fetching venues:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir este local?')) return;
        try {
            await fetch(`${API_BASE_URL}/api/v1/venues/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchVenues();
        } catch (error) {
            alert('Erro ao excluir local');
        }
    };

    useEffect(() => {
        fetchVenues();
    }, []);

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <MapPin size={32} color="var(--primary)" />
                    <h1>Locais Esportivos</h1>
                </div>
                {user?.role === 'ADMIN' && (
                    <button className="btn btn-primary" onClick={() => navigate('/venues/new')}>
                        <Plus size={18} /> Novo Local
                    </button>
                )}
            </div>

            {loading ? (
                <p>Carregando...</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {venues.map((venue) => (
                        <div key={venue.id} className="card hover-scale">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ marginBottom: '0.5rem' }}>{venue.name}</h3>
                                    <span className="badge">{venue.type}</span>
                                </div>
                                {user?.role === 'ADMIN' && (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn-icon" onClick={() => navigate(`/venues/${venue.id}/edit`)}>
                                            <Edit size={16} />
                                        </button>
                                        <button className="btn-icon" onClick={() => handleDelete(venue.id)}>
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                <p>{venue.neighborhood}, {venue.city}</p>
                                <p>Capacidade: {venue.capacity || 'N/A'} pessoas</p>
                                <p>Preço: {venue.price_per_hour ? `R$ ${venue.price_per_hour}/h` : 'Grátis'}</p>
                            </div>
                            <div style={{ marginTop: '1.5rem' }}>
                                <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => navigate(`/venues/${venue.id}/book`)}>
                                    <Calendar size={16} /> Ver Disponibilidade
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VenueList;
