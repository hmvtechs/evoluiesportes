import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, Users, MapPin, FileText, CheckCircle, Plus, Trash } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CompetitionWizard: React.FC = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [availableVenues, setAvailableVenues] = useState<any[]>([]);
    const [availableModalities, setAvailableModalities] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        nickname: '',
        start_date: '',
        end_date: '',
        modality_id: 1,
        gender: 'MALE',
        min_athletes: 5,
        max_athletes: 15,
        min_age: 16,
        max_age: 99,
        regulation_pdf_url: '',
        competition_type: 'ROUND_ROBIN',
        venueAssignmentMode: 'MANUAL',
        venues: [] as any[], // Selected venues
        phases: [
            { name: 'Fase de Grupos', type: 'GROUP', groups: [{ name: 'Grupo A' }, { name: 'Grupo B' }] }
        ]
    });

    useEffect(() => {
        fetchVenues();
        fetchModalities();
    }, []);

    const fetchVenues = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/v1/venues', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAvailableVenues(data);
            }
        } catch (error) {
            console.error('Failed to fetch venues', error);
        }
    };

    const fetchModalities = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/v1/modalities');
            if (response.ok) {
                const data = await response.json();
                setAvailableModalities(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, modality_id: data[0].id }));
                }
            }
        } catch (error) {
            console.error('Failed to fetch modalities', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleVenueToggle = (venue: any) => {
        const isSelected = formData.venues.some(v => v.id === venue.id);
        let newVenues;
        if (isSelected) {
            newVenues = formData.venues.filter(v => v.id !== venue.id);
        } else {
            newVenues = [...formData.venues, { id: venue.id, priority: 0, is_primary: false }];
        }
        setFormData({ ...formData, venues: newVenues });
    };

    const handlePhaseChange = (index: number, field: string, value: any) => {
        const newPhases = [...formData.phases];
        (newPhases[index] as any)[field] = value;
        setFormData({ ...formData, phases: newPhases });
    };

    const addPhase = () => {
        setFormData({
            ...formData,
            phases: [...formData.phases, { name: 'Nova Fase', type: 'ELIMINATION', groups: [] }]
        });
    };

    const addGroup = (phaseIndex: number) => {
        const newPhases = [...formData.phases];
        newPhases[phaseIndex].groups.push({ name: `Grupo ${newPhases[phaseIndex].groups.length + 1}` });
        setFormData({ ...formData, phases: newPhases });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/v1/competitions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                // Trigger fixture generation if requested? Or let user do it later.
                // For now, just redirect.
                alert('Competição criada com sucesso!');
                navigate('/modules');
            } else {
                const data = await response.json();
                alert(`Erro ao criar competição: ${data.error || 'Erro desconhecido'}`);
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Trophy size={32} color="var(--primary)" />
                <h1>Nova Competição</h1>
            </div>

            {/* Stepper */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative' }}>
                {[1, 2, 3, 4].map((s) => (
                    <div key={s} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1,
                        opacity: step >= s ? 1 : 0.5,
                        transition: 'opacity 0.3s'
                    }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: step >= s ? 'var(--primary)' : 'var(--surface-light)',
                            color: step >= s ? 'white' : 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 'bold', marginBottom: '0.5rem',
                            boxShadow: step >= s ? '0 0 10px rgba(99, 102, 241, 0.5)' : 'none'
                        }}>
                            {s}
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: step === s ? 'bold' : 'normal' }}>
                            {s === 1 ? 'Básico' : s === 2 ? 'Locais' : s === 3 ? 'Formato' : 'Revisão'}
                        </span>
                    </div>
                ))}
                <div style={{
                    position: 'absolute', top: '20px', left: '0', right: '0', height: '2px',
                    background: 'var(--surface-light)', zIndex: 0
                }} />
            </div>

            <div className="card">
                {step === 1 && (
                    <div className="animate-fade-in">
                        <h3>Passo 1: Informações Básicas</h3>
                        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                            <div>
                                <label>Nome Oficial</label>
                                <input type="text" name="name" className="input" value={formData.name} onChange={handleChange} placeholder="Ex: Campeonato Municipal 2025" />
                            </div>
                            <div>
                                <label>Apelido (Opcional)</label>
                                <input type="text" name="nickname" className="input" value={formData.nickname} onChange={handleChange} placeholder="Ex: Copão" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label>Início</label>
                                    <input type="date" name="start_date" className="input" value={formData.start_date} onChange={handleChange} />
                                </div>
                                <div>
                                    <label>Término</label>
                                    <input type="date" name="end_date" className="input" value={formData.end_date} onChange={handleChange} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label>Modalidade</label>
                                    <select name="modality_id" className="input" value={formData.modality_id} onChange={handleChange}>
                                        {availableModalities.length === 0 && <option value="">Carregando...</option>}
                                        {availableModalities.map(mod => (
                                            <option key={mod.id} value={mod.id}>{mod.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label>Naipe</label>
                                    <select name="gender" className="input" value={formData.gender} onChange={handleChange}>
                                        <option value="MALE">Masculino</option>
                                        <option value="FEMALE">Feminino</option>
                                        <option value="MIXED">Misto</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label>Link do Regulamento (PDF)</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input type="text" name="regulation_pdf_url" className="input" value={formData.regulation_pdf_url} onChange={handleChange} placeholder="https://..." />
                                    <button className="btn btn-secondary" title="Upload (Simulado)"><FileText size={18} /></button>
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn btn-primary" onClick={() => setStep(2)}>Próximo</button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-fade-in">
                        <h3>Passo 2: Locais e Agendamento</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Selecione os locais onde os jogos acontecerão.</p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Modo de Atribuição de Locais</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="venueAssignmentMode"
                                        value="MANUAL"
                                        checked={formData.venueAssignmentMode === 'MANUAL'}
                                        onChange={handleChange}
                                    />
                                    Manual (Definir depois)
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="venueAssignmentMode"
                                        value="RANDOM"
                                        checked={formData.venueAssignmentMode === 'RANDOM'}
                                        onChange={handleChange}
                                    />
                                    Aleatório (Sorteio automático)
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                            {availableVenues.map(venue => (
                                <div
                                    key={venue.id}
                                    onClick={() => handleVenueToggle(venue)}
                                    style={{
                                        padding: '1rem',
                                        border: formData.venues.some(v => v.id === venue.id) ? '2px solid var(--primary)' : '1px solid var(--surface-light)',
                                        borderRadius: 'var(--radius)',
                                        cursor: 'pointer',
                                        background: formData.venues.some(v => v.id === venue.id) ? 'rgba(var(--primary-rgb), 0.05)' : 'transparent'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <strong>{venue.name}</strong>
                                        {formData.venues.some(v => v.id === venue.id) && <CheckCircle size={16} color="var(--primary)" />}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{venue.city}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                            <button className="btn btn-secondary" onClick={() => setStep(1)}>Voltar</button>
                            <button className="btn btn-primary" onClick={() => setStep(3)}>Próximo</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-fade-in">
                        <h3>Passo 3: Formato e Fases</h3>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label>Tipo de Competição</label>
                            <select name="competition_type" className="input" value={formData.competition_type} onChange={handleChange}>
                                <option value="ROUND_ROBIN">Pontos Corridos (Todos contra Todos)</option>
                                <option value="SINGLE_ELIMINATION">Mata-mata (Eliminatória Simples)</option>
                                <option value="GROUPS_KNOCKOUT">Fase de Grupos + Mata-mata</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                            {formData.phases.map((phase, index) => (
                                <div key={index} style={{ padding: '1rem', border: '1px solid var(--surface-light)', borderRadius: 'var(--radius)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <input
                                            type="text"
                                            className="input"
                                            value={phase.name}
                                            onChange={(e) => handlePhaseChange(index, 'name', e.target.value)}
                                            style={{ fontWeight: 'bold' }}
                                        />
                                        <select
                                            className="input"
                                            value={phase.type}
                                            onChange={(e) => handlePhaseChange(index, 'type', e.target.value)}
                                            style={{ width: 'auto' }}
                                        >
                                            <option value="GROUP">Fase de Grupos</option>
                                            <option value="ELIMINATION">Eliminatória</option>
                                            <option value="ROUND_ROBIN">Pontos Corridos</option>
                                        </select>
                                    </div>

                                    {phase.type === 'GROUP' && (
                                        <div>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Grupos:</p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                {phase.groups.map((group, gIndex) => (
                                                    <span key={gIndex} className="badge">{group.name}</span>
                                                ))}
                                                <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => addGroup(index)}>
                                                    <Plus size={14} /> Add Grupo
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button className="btn btn-outline" onClick={addPhase} style={{ alignSelf: 'flex-start' }}>
                                <Plus size={16} /> Adicionar Fase
                            </button>
                        </div>
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                            <button className="btn btn-secondary" onClick={() => setStep(2)}>Voltar</button>
                            <button className="btn btn-primary" onClick={() => setStep(4)}>Próximo</button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="animate-fade-in">
                        <h3>Passo 4: Revisão e Confirmação</h3>

                        <div style={{ display: 'grid', gap: '1rem', background: 'var(--surface-light)', padding: '1rem', borderRadius: 'var(--radius)' }}>
                            <div><strong>Nome:</strong> {formData.name}</div>
                            <div><strong>Datas:</strong> {formData.start_date} a {formData.end_date}</div>
                            <div><strong>Modalidade:</strong> {formData.modality_id === 1 ? 'Futsal' : 'Outra'} ({formData.gender})</div>
                            <div><strong>Locais Selecionados:</strong> {formData.venues.length} ({formData.venueAssignmentMode === 'RANDOM' ? 'Sorteio Automático' : 'Manual'})</div>
                            <div><strong>Formato:</strong> {formData.competition_type}</div>
                            <div><strong>Fases:</strong> {formData.phases.length}</div>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                            <button className="btn btn-secondary" onClick={() => setStep(3)}>Voltar</button>
                            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                                {loading ? 'Criando...' : 'Confirmar e Criar Competição'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompetitionWizard;
