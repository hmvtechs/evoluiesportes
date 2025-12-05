import React from 'react';
import { Link } from 'react-router-dom';
import { MODULES } from '../modules/registry';
import { useAuth } from '../context/AuthContext';
import { MapPin, Calendar, ChevronRight } from 'lucide-react';
import { IOSCard } from '../components/ui/IOSDesign';

const ModulesDashboard: React.FC = () => {
    const { user } = useAuth();

    const allModules = [
        ...MODULES,
        {
            id: 'venues',
            label: 'Locais',
            icon: MapPin,
            path: '/venues',
            color: '#FF375F' // iOS Pink
        },
        {
            id: 'my-bookings',
            label: 'Reservas',
            icon: Calendar,
            path: '/my-bookings',
            color: '#BF5AF2' // iOS Purple
        }
    ];

    return (
        <div className="animate-fade-in" style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '34px', fontWeight: 800, margin: 0 }}>Módulos</h1>
                <p style={{ color: '#8E8E93', fontSize: '17px', marginTop: '0.5rem' }}>
                    Seus aplicativos e ferramentas
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1.5rem' }}>
                {allModules.map(module => (
                    <Link key={module.id} to={module.path} style={{ textDecoration: 'none' }}>
                        <IOSCard
                            className="hover-scale"
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                height: '160px', gap: '1rem', textAlign: 'center',
                                background: 'rgba(28, 28, 30, 0.6)', // Darker background for contrast
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '18px',
                                background: module.color || '#0A84FF',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: `0 8px 24px ${module.color ? module.color + '4D' : 'rgba(10, 132, 255, 0.3)'}`
                            }}>
                                <module.icon size={32} color="white" />
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '15px', color: 'white' }}>{module.label}</span>
                        </IOSCard>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ModulesDashboard;
