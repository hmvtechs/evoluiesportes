import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MyBookings: React.FC = () => {
    const { token } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/v1/bookings/my', {
                headers: { 'Authorization': `Bearer ${token}` }
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
        <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Calendar size={32} color="var(--primary)" />
                <h1>Minhas Reservas</h1>
            </div>

            {loading ? (
                <p>Carregando...</p>
            ) : bookings.length === 0 ? (
                <p>Nenhuma reserva encontrada.</p>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {bookings.map(booking => (
                        <div key={booking.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MapPin size={18} /> {booking.venue.name}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Calendar size={14} /> {new Date(booking.start_time).toLocaleDateString()}
                                    <Clock size={14} style={{ marginLeft: '0.5rem' }} /> {new Date(booking.start_time).toLocaleTimeString()} - {new Date(booking.end_time).toLocaleTimeString()}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span className={`badge ${booking.status === 'CONFIRMED' ? 'badge-success' : 'badge-warning'}`}>
                                    {booking.status}
                                </span>
                                <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
                                    R$ {booking.total_price.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBookings;
