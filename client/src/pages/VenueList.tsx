import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/api';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Plus, Edit, Trash, Users, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { IOSCard, IOSButton } from '../components/ui/IOSDesign';

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
        <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '34px', fontWeight: 800, margin: 0 }}>Locais Esportivos</h1>
                    <p style={{ color: '#8E8E93', fontSize: '17px', marginTop: '0.5rem' }}>
                        Encontre o lugar perfeito para seu jogo
                    </p>
                </div>
                {user?.role === 'ADMIN' && (
                    <IOSButton onClick={() => navigate('/venues/new')}>
                        <Plus size={20} style={{ marginRight: '0.5rem' }} /> Novo Local
                    </IOSButton>
                )}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#8E8E93' }}>Carregando...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                    {venues.map((venue) => (
                        <IOSCard key={venue.id} className="hover-scale" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            {/* Header / Image Placeholder */}
                            <div style={{
                                height: '140px', background: 'linear-gradient(135deg, #0A84FF 0%, #0056b3 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                position: 'relative'
                            }}>
                                <MapPin size={48} color="rgba(255,255,255,0.2)" />
                                <div style={{
                                    position: 'absolute', bottom: '1rem', left: '1.5rem',
                                    color: 'white', fontWeight: 700, fontSize: '20px',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                }}>
                                    {venue.name}
                                </div>
                                <div style={{
                                    position: 'absolute', top: '1rem', right: '1rem',
                                    background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: '20px',
                                    color: 'white', fontSize: '12px', fontWeight: 600, backdropFilter: 'blur(10px)'
                                }}>
                                    {venue.type}
                                </div>
                            </div>

                            {/* Content */}
                            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8E8E93', fontSize: '15px', marginBottom: '0.5rem' }}>
                                        <MapPin size={16} />
                                        {venue.neighborhood}, {venue.city}
                                    </div>
                                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontSize: '14px' }}>
                                            <Users size={16} color="#0A84FF" />
                                            {venue.capacity || 'N/A'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontSize: '14px' }}>
                                            <DollarSign size={16} color="#30D158" />
                                            {venue.price_per_hour ? `R$ ${venue.price_per_hour}/h` : 'Grátis'}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem' }}>
                                    <IOSButton variant="secondary" onClick={() => navigate(`/venues/${venue.id}/book`)} style={{ flex: 1, justifyContent: 'center' }}>
                                        <Calendar size={18} style={{ marginRight: '0.5rem' }} /> Reservar
                                    </IOSButton>

                                    {user?.role === 'ADMIN' && (
                                        <>
                                            <button
                                                onClick={() => navigate(`/venues/${venue.id}/edit`)}
                                                style={{
                                                    background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px',
                                                    width: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: 'pointer', color: 'white'
                                                }}
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(venue.id)}
                                                style={{
                                                    background: 'rgba(255, 69, 58, 0.1)', border: 'none', borderRadius: '12px',
                                                    width: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: 'pointer', color: '#FF453A'
                                                }}
                                            >
                                                <Trash size={18} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </IOSCard>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VenueList;
