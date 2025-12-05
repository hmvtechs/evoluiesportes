import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Upload, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { IOSCard, IOSButton } from '../components/ui/IOSDesign';

const Documents: React.FC = () => {
    const { user, token } = useAuth();
    const [docs, setDocs] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load existing documents
    useEffect(() => {
        if (user) {
            fetch(`${API_BASE_URL}/api/v1/digital-id/${user.id}/documents`)
                .then(res => res.json())
                .then(setDocs)
                .catch(err => console.error('Failed to load documents', err));
        }
    }, [user]);

    const uploadFile = async (type: string, file: File) => {
        if (!user) return;
        const formData = new FormData();
        formData.append('userId', user.id);
        formData.append('type', type);
        formData.append('file', file);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/digital-id/documents`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }, // let browser set multipart boundary
                body: formData,
            });
            if (res.ok) {
                const newDoc = await res.json();
                setDocs(prev => [...prev, newDoc]);
            } else {
                const err = await res.json();
                alert('Upload failed: ' + (err.error || 'unknown'));
            }
        } catch (e) {
            console.error('Upload error', e);
            alert('Upload error');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadFile(type, file);
        }
        // Reset input so same file can be selected again
        e.target.value = '';
    };

    const triggerUpload = (type: string) => {
        if (fileInputRef.current) {
            fileInputRef.current.dataset.type = type;
            fileInputRef.current.click();
        }
    };

    return (
        <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '34px', fontWeight: 800, margin: 0 }}>Documentos</h1>
                <p style={{ color: '#8E8E93', fontSize: '17px', marginTop: '0.5rem' }}>
                    Envie seus comprovantes
                </p>
            </div>

            <div style={{ display: 'grid', gap: '2rem' }}>
                <IOSCard>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '1.5rem' }}>Enviar Novo Documento</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                        <UploadButton
                            label="Foto Perfil"
                            icon={<UserIcon />}
                            onClick={() => triggerUpload('PHOTO')}
                        />
                        <UploadButton
                            label="Identidade"
                            icon={<IdIcon />}
                            onClick={() => triggerUpload('ID')}
                        />
                    </div>
                </IOSCard>

                <IOSCard>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '1rem' }}>Histórico</h3>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {docs.length === 0 && (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#8E8E93' }}>
                                Nenhum documento enviado.
                            </div>
                        )}
                        {docs.map((doc, index) => (
                            <div key={doc.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '1rem 0',
                                borderBottom: index < docs.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '10px',
                                        background: 'rgba(10, 132, 255, 0.1)', color: '#0A84FF',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '16px', fontWeight: 600, color: 'white' }}>{doc.type === 'PHOTO' ? 'Foto de Perfil' : 'Identidade'}</div>
                                        <div style={{ fontSize: '13px', color: '#8E8E93' }}>{new Date(doc.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {doc.status === 'APPROVED' ? (
                                        <span style={{ color: '#30D158', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <CheckCircle size={14} /> Aprovado
                                        </span>
                                    ) : (
                                        <span style={{ color: '#FF9F0A', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={14} /> Pendente
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </IOSCard>
            </div>

            {/* Hidden file input */}
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={e => {
                    const type = (e.target as any).dataset.type as string;
                    handleFileChange(e, type);
                }}
            />
        </div>
    );
};

const UploadButton: React.FC<{ label: string, icon: React.ReactNode, onClick: () => void }> = ({ label, icon, onClick }) => (
    <button
        onClick={onClick}
        className="hover-scale"
        style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
            cursor: 'pointer', color: 'white', transition: 'all 0.2s'
        }}
    >
        <div style={{ color: '#0A84FF' }}>{icon}</div>
        <span style={{ fontWeight: 600, fontSize: '15px' }}>{label}</span>
    </button>
);

const UserIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const IdIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="3"></rect>
        <circle cx="9" cy="10" r="2"></circle>
        <line x1="15" y1="8" x2="17" y2="8"></line>
        <line x1="15" y1="12" x2="17" y2="12"></line>
        <line x1="7" y1="16" x2="17" y2="16"></line>
    </svg>
);

export default Documents;
