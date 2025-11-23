import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Upload, CheckCircle, Clock } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

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
        <div className="animate-fade-in">
            <h1>Meus Documentos</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                <div className="card">
                    <h3>Enviar Novo Documento</h3>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button className="btn btn-primary" onClick={() => triggerUpload('PHOTO')}>
                            <Upload size={16} /> Foto Perfil
                        </button>
                        <button className="btn btn-primary" onClick={() => triggerUpload('ID')}>
                            <Upload size={16} /> Identidade
                        </button>
                    </div>
                </div>
                <div className="card">
                    <h3>Histórico</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        {docs.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Nenhum documento enviado.</p>}
                        {docs.map(doc => (
                            <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: 'var(--surface-light)', borderRadius: 'var(--radius)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FileText size={20} />
                                    <span>{doc.type}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {doc.status === 'APPROVED' ? <CheckCircle size={16} color="var(--success)" /> : <Clock size={16} color="var(--warning)" />}
                                    <span style={{ fontSize: '0.75rem' }}>{doc.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
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

export default Documents;
