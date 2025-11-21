import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Printer } from 'lucide-react';

const DigitalID: React.FC = () => {
    const { user } = useAuth();
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        if (user) {
            fetch(`http://localhost:3000/api/v1/digital-id/${user.id}/digital-id`)
                .then(res => res.json())
                .then(setData);
        }
    }, [user]);

    if (!data) return <div>Carregando Carteirinha...</div>;

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Minha Carteirinha</h1>
                <button className="btn btn-primary" onClick={() => window.print()}>
                    <Printer size={20} /> Imprimir
                </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
                {/* Front */}
                <div className="id-card" style={{
                    width: '340px', height: '215px',
                    background: `linear-gradient(135deg, var(--surface), var(--background))`,
                    borderRadius: '12px', padding: '1.5rem',
                    border: '1px solid rgba(255,255,255,0.2)',
                    position: 'relative', overflow: 'hidden',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
                }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', height: '100%' }}>
                        <img src={data.photo_url} style={{ width: '100px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '2px solid white' }} />
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1.1rem', lineHeight: '1.2', marginBottom: '0.5rem' }}>{data.name}</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nascimento</p>
                            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{new Date(data.birth_date).toLocaleDateString()}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CPF</p>
                            <p style={{ fontSize: '0.9rem' }}>{data.cpf_masked}</p>
                        </div>
                    </div>
                    <div style={{ position: 'absolute', bottom: '10px', right: '15px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        e-Esporte ID
                    </div>
                </div>

                {/* Back */}
                <div className="id-card" style={{
                    width: '340px', height: '215px',
                    background: 'var(--surface-light)', color: 'var(--text)',
                    borderRadius: '12px', padding: '1.5rem',
                    border: '1px solid var(--glass-border)',
                    position: 'relative',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', height: '100%' }}>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ marginBottom: '1rem' }}>{data.organization}</h4>
                            <p style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Cidade/UF</p>
                            <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>{data.city}/{data.state}</p>
                            <p style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Validade</p>
                            <p style={{ fontSize: '0.85rem' }}>Indeterminada</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={data.qr_code} style={{ width: '100px', height: '100px' }} />
                            <span style={{ fontSize: '0.6rem', marginTop: '0.25rem' }}>Validar</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @media print {
            .sidebar, .btn { display: none; }
            .main-content { margin: 0; padding: 0; }
            .id-card { break-inside: avoid; border: 1px solid var(--text) !important; box-shadow: none !important; }
            body { background: white; color: black; }
        }
      `}</style>
        </div>
    );
};

export default DigitalID;
