import React from 'react';
import { Link } from 'react-router-dom';
import { MODULES } from '../modules/registry';
import { useAuth } from '../context/AuthContext';
import { MapPin, Calendar } from 'lucide-react';

const ModulesDashboard: React.FC = () => {
    const { user } = useAuth();

    // Combine registry modules with hardcoded new ones for now, or update registry
    // For simplicity, I'll just append the new ones here visually if they aren't in registry yet
    // But better to update registry.ts. Let's check registry.ts later.
    // For now, I will manually construct the list to ensure it works.

    const allModules = [
        ...MODULES,
        {
            id: 'venues',
            label: 'Locais Esportivos',
            icon: MapPin,
            path: '/venues',
            color: 'var(--secondary)'
        },
        {
            id: 'my-bookings',
            label: 'Minhas Reservas',
            icon: Calendar,
            path: '/my-bookings',
            color: 'var(--accent)'
        }
    ];

    return (
        <div className="animate-fade-in">
            <h1>Módulos do Sistema</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Acesso rápido aos módulos disponíveis.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {allModules.map(module => (
                    <Link key={module.id} to={module.path} style={{ textDecoration: 'none' }}>
                        <div className="card hover-scale" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '150px', gap: '1rem', textAlign: 'center' }}>
                            <module.icon size={40} color="var(--primary)" />
                            <span style={{ fontWeight: 'bold', color: 'var(--text)' }}>{module.label}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ModulesDashboard;
