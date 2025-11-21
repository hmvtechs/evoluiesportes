import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Upload, CheckCircle, Clock } from 'lucide-react';

const Documents: React.FC = () => {
    const { user } = useAuth();
    const [docs, setDocs] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            fetch(`http://localhost:3000/api/v1/digital-id/${user.id}/documents`)
                .then(res => res.json())
                .then(setDocs);
        }
    }, [user]);

    const handleUpload = async (type: string) => {
        // Mock upload
        const res = await fetch('http://localhost:3000/api/v1/digital-id/documents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user?.id, type, url: 'https://via.placeholder.com/doc' })
        });
        if (res.ok) {
            const newDoc = await res.json();
            setDocs([...docs, newDoc]);
        }
    };

    return (
        <div className="animate-fade-in">
            <h1>Meus Documentos</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                <div className="card">
                    <h3>Enviar Novo Documento</h3>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button className="btn btn-primary" onClick={() => handleUpload('PHOTO')}>
                            <Upload size={16} /> Foto Perfil
                        </button>
                        <button className="btn btn-primary" onClick={() => handleUpload('ID')}>
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
        </div>
    );
};

export default Documents;
