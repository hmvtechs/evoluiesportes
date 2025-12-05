import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Printer, Share, Download } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { IOSButton } from '../components/ui/IOSDesign';

const DigitalID: React.FC = () => {
    const { user } = useAuth();
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        if (user) {
            fetch(`${API_BASE_URL}/api/v1/digital-id/${user.id}/digital-id`)
                .then(res => res.json())
                .then(setData);
        }
    }, [user]);

    if (!data) return <div style={{ padding: '4rem', textAlign: 'center', color: '#8E8E93' }}>Carregando Carteirinha...</div>;

    return (
        <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '34px', fontWeight: 800, margin: 0 }}>Carteirinha</h1>
                    <p style={{ color: '#8E8E93', fontSize: '17px', marginTop: '0.5rem' }}>
                        Sua identificação digital
                    </p>
                </div>
                <IOSButton onClick={() => window.print()}>
                    <Printer size={20} style={{ marginRight: '0.5rem' }} /> Imprimir
                </IOSButton>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
                {/* Front */}
                <div className="id-card" style={{
                    width: '340px', height: '215px',
                    background: 'linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%)',
                    borderRadius: '16px', padding: '1.5rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    position: 'relative', overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                    {/* Background decoration */}
                    <div style={{
                        position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
                        background: 'radial-gradient(circle, rgba(10,132,255,0.15) 0%, transparent 60%)',
                        pointerEvents: 'none'
                    }} />

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden',
                            border: '3px solid rgba(255,255,255,0.2)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                        }}>
                            <img src={data.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Foto" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'white', lineHeight: 1.2 }}>{data.name}</h3>
                            <div style={{ fontSize: '13px', color: '#8E8E93', fontWeight: 500 }}>ATLETA</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', position: 'relative', zIndex: 1, marginTop: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '11px', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nascimento</div>
                            <div style={{ fontSize: '15px', color: 'white', fontWeight: 600 }}>{new Date(data.birth_date).toLocaleDateString()}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CPF</div>
                            <div style={{ fontSize: '15px', color: 'white', fontWeight: 600, fontFamily: 'monospace' }}>{data.cpf_masked}</div>
                        </div>
                    </div>

                    <div style={{
                        position: 'absolute', bottom: '15px', right: '15px',
                        fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.3)',
                        letterSpacing: '1px'
                    }}>
                        e-ESPORTE ID
                    </div>
                </div>

                {/* Back */}
                <div className="id-card" style={{
                    width: '340px', height: '215px',
                    background: '#F2F2F7', color: '#1C1C1E', // Light mode style for back
                    borderRadius: '16px', padding: '1.5rem',
                    border: '1px solid rgba(0,0,0,0.1)',
                    position: 'relative',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    display: 'flex', flexDirection: 'column'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', height: '100%' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '11px', color: '#8E8E93', textTransform: 'uppercase' }}>Organização</div>
                                <div style={{ fontSize: '16px', fontWeight: 700 }}>{data.organization}</div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '11px', color: '#8E8E93', textTransform: 'uppercase' }}>Cidade/UF</div>
                                <div style={{ fontSize: '15px', fontWeight: 600 }}>{data.city}/{data.state}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', color: '#8E8E93', textTransform: 'uppercase' }}>Validade</div>
                                <div style={{ fontSize: '15px', fontWeight: 600, color: '#30D158' }}>Indeterminada</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid rgba(0,0,0,0.1)', paddingLeft: '1rem' }}>
                            <div style={{ background: 'white', padding: '5px', borderRadius: '8px' }}>
                                <img src={data.qr_code} style={{ width: '90px', height: '90px' }} alt="QR Code" />
                            </div>
                            <span style={{ fontSize: '10px', marginTop: '0.5rem', color: '#8E8E93', fontWeight: 600 }}>VALIDAR</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @media print {
            .sidebar, .btn, button { display: none !important; }
            .main-content { margin: 0; padding: 0; background: white; }
            body { background: white; color: black; }
            .id-card {
                break-inside: avoid;
                border: 1px solid #000 !important;
                box-shadow: none !important;
                background: white !important;
                color: black !important;
                margin-bottom: 20px;
            }
            .id-card * { color: black !important; }
        }
      `}</style>
        </div>
    );
};

export default DigitalID;
