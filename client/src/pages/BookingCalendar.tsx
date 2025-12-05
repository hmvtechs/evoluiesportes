import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { IOSCard, IOSButton, IOSInput } from '../components/ui/IOSDesign';

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
            const response = await fetch(`${API_BASE_URL}/api/v1/venues/${id}`);
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
            const response = await fetch(`${API_BASE_URL}/api/v1/bookings/venue/${id}/availability?date=${selectedDate}`);
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
            const response = await fetch(`${API_BASE_URL}/api/v1/bookings`, {
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
                alert('✅ Reserva realizada com sucesso!');
                fetchAvailability();
            } else {
                const data = await response.json();
                alert(`❌ Erro: ${data.error}`);
            }
        } catch (error) {
            alert('❌ Erro de conexão');
        }
    };

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: '#8E8E93' }}>Carregando...</div>;
    if (!venue) return <div style={{ padding: '4rem', textAlign: 'center', color: '#8E8E93' }}>Local não encontrado</div>;

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '34px', fontWeight: 800, margin: 0 }}>Reservar Horário</h1>
                <p style={{ color: '#8E8E93', fontSize: '17px', marginTop: '0.5rem' }}>
                    Escolha o melhor momento para seu jogo
                </p>
            </div>

            <IOSCard style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.1) 0%, rgba(10, 132, 255, 0.05) 100%)', border: '1px solid rgba(10, 132, 255, 0.2)' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 0.5rem 0' }}>{venue.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8E8E93', marginBottom: '1rem' }}>
                    <MapPin size={16} />
                    <span>{venue.city} • {venue.type}</span>
                </div>
                <div style={{ fontSize: '20px', fontWeight: 600, color: '#30D158' }}>
                    R$ {venue.price_per_hour}/hora
                </div>
            </IOSCard>

            <IOSCard>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CalendarIcon size={20} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '13px', color: '#8E8E93', marginBottom: '0.25rem' }}>Data Selecionada</label>
                        <IOSInput
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: 'white', fontSize: '17px', fontWeight: 600 }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem' }}>
                    {timeSlots.map(hour => {
                        const booked = isSlotBooked(hour);
                        return (
                            <button
                                key={hour}
                                disabled={booked}
                                onClick={() => !booked && handleBook(hour)}
                                className={booked ? '' : 'hover-scale'}
                                style={{
                                    background: booked ? 'rgba(255,255,255,0.05)' : '#0A84FF',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    cursor: booked ? 'not-allowed' : 'pointer',
                                    opacity: booked ? 0.5 : 1,
                                    transition: 'transform 0.2s'
                                }}
                            >
                                <div style={{ fontSize: '17px', fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>
                                    {hour}:00
                                </div>
                                <div style={{ fontSize: '12px', color: booked ? '#8E8E93' : 'rgba(255,255,255,0.8)' }}>
                                    {booked ? 'Ocupado' : 'Livre'}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </IOSCard>
        </div>
    );
};

export default BookingCalendar;
