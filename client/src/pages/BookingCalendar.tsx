import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BookingCalendar: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [venue, setVenue] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [availability, setAvailability] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Simple time slots generation (08:00 to 22:00)
    const timeSlots = Array.from({ length: 15 }, (_, i) => i + 8);

    useEffect(() => {
        fetchVenue();
    }, [id]);

    useEffect(() => {
        if (id && selectedDate) {
            fetchAvailability();
        }
    }, [id, selectedDate]);

    const fetchVenue = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/v1/venues/${id}`);
            const data = await response.json();
            setVenue(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailability = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/v1/bookings/venue/${id}/availability?date=${selectedDate}`);
            const data = await response.json();
            setAvailability(data);
        } catch (error) {
            console.error(error);
        }
    };

    const isSlotBooked = (hour: number) => {
        return availability.some((booking: any) => {
            const start = new Date(booking.start_time).getHours();
            const end = new Date(booking.end_time).getHours();
            return hour >= start && hour < end;
        });
    };

    const handleBook = async (hour: number) => {
        if (!confirm(`Confirmar reserva para ${hour}:00?`)) return;

        const startTime = new Date(`${selectedDate}T${hour.toString().padStart(2, '0')}:00:00`);
        const endTime = new Date(`${selectedDate}T${(hour + 1).toString().padStart(2, '0')}:00:00`);

        try {
            const response = await fetch('http://localhost:3000/api/v1/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    venue_id: id,
                    start_time: startTime,
                    end_time: endTime
                })
            });

            if (response.ok) {
                alert('Reserva realizada com sucesso!');
                fetchAvailability();
            } else {
                const data = await response.json();
                alert(`Erro: ${data.error}`);
            }
        } catch (error) {
            alert('Erro de conexão');
        }
    };

    if (loading) return <p>Carregando...</p>;
    if (!venue) return <p>Local não encontrado</p>;

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h2>Reserva: {venue.name}</h2>
                <p>{venue.type} - {venue.city}</p>
                <p>Preço: R$ {venue.price_per_hour}/hora</p>
            </div>

            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <CalendarIcon size={24} />
                    <input
                        type="date"
                        className="input"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem' }}>
                    {timeSlots.map(hour => {
                        const booked = isSlotBooked(hour);
                        return (
                            <button
                                key={hour}
                                disabled={booked}
                                onClick={() => !booked && handleBook(hour)}
                                className={`btn ${booked ? 'btn-outline' : 'btn-primary'}`}
                                style={{
                                    opacity: booked ? 0.5 : 1,
                                    cursor: booked ? 'not-allowed' : 'pointer',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem'
                                }}
                            >
                                <Clock size={16} style={{ marginBottom: '0.5rem' }} />
                                {hour}:00
                                <span style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                    {booked ? 'Ocupado' : 'Livre'}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default BookingCalendar;
