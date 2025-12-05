import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { IOSCard } from '../components/ui/IOSDesign';

const MyBookings: React.FC = () => {
    const { token } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/bookings/my`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setBookings(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '34px', fontWeight: 800, margin: 0 }}>Minhas Reservas</h1>
                <p style={{ color: '#8E8E93', fontSize: '17px', marginTop: '0.5rem' }}>
                    Histórico de agendamentos
                </p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#8E8E93' }}>Carregando...</div>
            ) : bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#8E8E93' }}>
                    <Calendar size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>Nenhuma reserva encontrada.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {bookings.map((booking) => (
                        <IOSCard key={booking.id} style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{
                                        fontSize: '20px', fontWeight: 700, margin: '0 0 0.5rem 0',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                                    }}>
                                        <MapPin size={20} color="#0A84FF" />
                                        {booking.venue.name}
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', color: '#8E8E93', fontSize: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Calendar size={16} />
                                            {new Date(booking.start_time).toLocaleDateString()}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Clock size={16} />
                                            {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                        padding: '4px 10px', borderRadius: '20px',
                                        background: booking.status === 'CONFIRMED' ? 'rgba(48, 209, 88, 0.1)' : 'rgba(255, 159, 10, 0.1)',
                                        color: booking.status === 'CONFIRMED' ? '#30D158' : '#FF9F0A',
                                        fontSize: '12px', fontWeight: 700, marginBottom: '0.5rem'
                                    }}>
                                        {booking.status === 'CONFIRMED' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                        {booking.status === 'CONFIRMED' ? 'CONFIRMADO' : booking.status}
                                    </div>
                                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>
                                        R$ {booking.total_price.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </IOSCard>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBookings;
