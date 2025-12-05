import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, FileText, CheckCircle, Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { IOSCard, IOSInput, IOSButton, IOSSegmentedControl } from '../components/ui/IOSDesign';

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
            const response = await fetch(`${API_BASE_URL}/api/v1/venues`, {
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
            const response = await fetch(`${API_BASE_URL}/api/v1/modalities`);
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
            const response = await fetch(`${API_BASE_URL}/api/v1/competitions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('✅ Competição criada com sucesso!');
                navigate('/modules');
            } else {
                const data = await response.json();
                alert(`❌ Erro ao criar competição: ${data.error || 'Erro desconhecido'}`);
            }
        } catch (error) {
            console.error(error);
            alert('❌ Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '34px', fontWeight: 800, margin: 0 }}>Nova Competição</h1>
                <p style={{ color: '#8E8E93', fontSize: '17px', marginTop: '0.5rem' }}>
                    Configure o campeonato passo a passo
                </p>
            </div>

            {/* Stepper */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative', padding: '0 1rem' }}>
                {[1, 2, 3, 4].map((s) => (
                    <div key={s} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1,
                        opacity: step >= s ? 1 : 0.4,
                        transition: 'opacity 0.3s'
                    }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: step >= s ? '#0A84FF' : '#1C1C1E',
                            border: `2px solid ${step >= s ? '#0A84FF' : '#3A3A3C'}`,
                            color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '14px'
                        }}>
                            {s}
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: step === s ? 600 : 400, color: step === s ? 'white' : '#8E8E93' }}>
                            {s === 1 ? 'Básico' : s === 2 ? 'Locais' : s === 3 ? 'Formato' : 'Revisão'}
                        </span>
                    </div>
                ))}
                <div style={{
                    position: 'absolute', top: '16px', left: '2rem', right: '2rem', height: '2px',
                    background: '#3A3A3C', zIndex: 0
                }} />
                <div style={{
                    position: 'absolute', top: '16px', left: '2rem', right: '2rem', height: '2px',
                    background: '#0A84FF', zIndex: 0,
                    width: `${((step - 1) / 3) * 100}%`, transition: 'width 0.3s ease'
                }} />
            </div>

            <IOSCard>
                {step === 1 && (
                    <div className="animate-fade-in">
                        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '1.5rem' }}>Informações Básicas</h3>
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Nome Oficial</label>
                                <IOSInput name="name" value={formData.name} onChange={handleChange} placeholder="Ex: Campeonato Municipal 2025" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Apelido (Opcional)</label>
                                <IOSInput name="nickname" value={formData.nickname} onChange={handleChange} placeholder="Ex: Copão" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Início</label>
                                    <IOSInput type="date" name="start_date" value={formData.start_date} onChange={handleChange} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Término</label>
                                    <IOSInput type="date" name="end_date" value={formData.end_date} onChange={handleChange} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Modalidade</label>
                                    <select
                                        name="modality_id"
                                        value={formData.modality_id}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%', padding: '12px', borderRadius: '12px',
                                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'white', fontSize: '15px'
                                        }}
                                    >
                                        {availableModalities.map(mod => (
                                            <option key={mod.id} value={mod.id} style={{ color: 'black' }}>{mod.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Naipe</label>
                                    <IOSSegmentedControl
                                        options={[
                                            { value: 'MALE', label: 'Masc' },
                                            { value: 'FEMALE', label: 'Fem' },
                                            { value: 'MIXED', label: 'Misto' }
                                        ]}
                                        value={formData.gender}
                                        onChange={(val) => setFormData({ ...formData, gender: val })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Link do Regulamento (PDF)</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <IOSInput name="regulation_pdf_url" value={formData.regulation_pdf_url} onChange={handleChange} placeholder="https://..." />
                                    <IOSButton variant="secondary" style={{ width: 'auto' }}><FileText size={18} /></IOSButton>
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <IOSButton onClick={() => setStep(2)} style={{ width: 'auto' }}>
                                Próximo <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                            </IOSButton>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-fade-in">
                        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '0.5rem' }}>Locais e Agendamento</h3>
                        <p style={{ color: '#8E8E93', marginBottom: '1.5rem', fontSize: '15px' }}>Selecione os locais onde os jogos acontecerão.</p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Modo de Atribuição</label>
                            <IOSSegmentedControl
                                options={[
                                    { value: 'MANUAL', label: 'Manual' },
                                    { value: 'RANDOM', label: 'Sorteio Automático' }
                                ]}
                                value={formData.venueAssignmentMode}
                                onChange={(val) => setFormData({ ...formData, venueAssignmentMode: val })}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                            {availableVenues.map(venue => {
                                const isSelected = formData.venues.some(v => v.id === venue.id);
                                return (
                                    <div
                                        key={venue.id}
                                        onClick={() => handleVenueToggle(venue)}
                                        style={{
                                            padding: '1rem',
                                            border: isSelected ? '2px solid #0A84FF' : '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            background: isSelected ? 'rgba(10, 132, 255, 0.1)' : 'rgba(255,255,255,0.05)',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                            <strong style={{ color: 'white' }}>{venue.name}</strong>
                                            {isSelected && <CheckCircle size={16} color="#0A84FF" />}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#8E8E93' }}>{venue.city}</div>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                            <IOSButton variant="secondary" onClick={() => setStep(1)} style={{ width: 'auto' }}>
                                <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Voltar
                            </IOSButton>
                            <IOSButton onClick={() => setStep(3)} style={{ width: 'auto' }}>
                                Próximo <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                            </IOSButton>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-fade-in">
                        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '1.5rem' }}>Formato e Fases</h3>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#8E8E93' }}>Tipo de Competição</label>
                            <select
                                name="competition_type"
                                value={formData.competition_type}
                                onChange={handleChange}
                                style={{
                                    width: '100%', padding: '12px', borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white', fontSize: '15px'
                                }}
                            >
                                <option value="ROUND_ROBIN" style={{ color: 'black' }}>Pontos Corridos (Todos contra Todos)</option>
                                <option value="SINGLE_ELIMINATION" style={{ color: 'black' }}>Mata-mata (Eliminatória Simples)</option>
                                <option value="GROUPS_KNOCKOUT" style={{ color: 'black' }}>Fase de Grupos + Mata-mata</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                            {formData.phases.map((phase, index) => (
                                <div key={index} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem' }}>
                                        <IOSInput
                                            value={phase.name}
                                            onChange={(e) => handlePhaseChange(index, 'name', e.target.value)}
                                            style={{ fontWeight: 'bold' }}
                                        />
                                        <select
                                            value={phase.type}
                                            onChange={(e) => handlePhaseChange(index, 'type', e.target.value)}
                                            style={{
                                                padding: '10px', borderRadius: '10px',
                                                background: 'rgba(255,255,255,0.1)', border: 'none',
                                                color: 'white', fontSize: '14px', width: 'auto'
                                            }}
                                        >
                                            <option value="GROUP" style={{ color: 'black' }}>Grupos</option>
                                            <option value="ELIMINATION" style={{ color: 'black' }}>Eliminatória</option>
                                            <option value="ROUND_ROBIN" style={{ color: 'black' }}>Pontos Corridos</option>
                                        </select>
                                    </div>

                                    {phase.type === 'GROUP' && (
                                        <div>
                                            <p style={{ fontSize: '13px', color: '#8E8E93', marginBottom: '0.5rem' }}>Grupos:</p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                {phase.groups.map((group, gIndex) => (
                                                    <span key={gIndex} style={{
                                                        padding: '4px 10px', borderRadius: '20px',
                                                        background: 'rgba(10, 132, 255, 0.1)', color: '#0A84FF',
                                                        fontSize: '13px', fontWeight: 600
                                                    }}>
                                                        {group.name}
                                                    </span>
                                                ))}
                                                <button
                                                    onClick={() => addGroup(index)}
                                                    style={{
                                                        background: 'none', border: '1px dashed rgba(255,255,255,0.3)',
                                                        borderRadius: '20px', padding: '4px 10px', color: 'white', cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px'
                                                    }}
                                                >
                                                    <Plus size={12} /> Add
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <IOSButton variant="secondary" onClick={addPhase} style={{ width: 'auto', alignSelf: 'flex-start' }}>
                                <Plus size={16} style={{ marginRight: '0.5rem' }} /> Adicionar Fase
                            </IOSButton>
                        </div>
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                            <IOSButton variant="secondary" onClick={() => setStep(2)} style={{ width: 'auto' }}>
                                <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Voltar
                            </IOSButton>
                            <IOSButton onClick={() => setStep(4)} style={{ width: 'auto' }}>
                                Próximo <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                            </IOSButton>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="animate-fade-in">
                        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '1.5rem' }}>Revisão e Confirmação</h3>

                        <div style={{ display: 'grid', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px' }}>
                            <ReviewRow label="Nome" value={formData.name} />
                            <ReviewRow label="Datas" value={`${formData.start_date} a ${formData.end_date}`} />
                            <ReviewRow label="Modalidade" value={`${formData.modality_id === 1 ? 'Futsal' : 'Outra'} (${formData.gender})`} />
                            <ReviewRow label="Locais" value={`${formData.venues.length} selecionados (${formData.venueAssignmentMode === 'RANDOM' ? 'Sorteio' : 'Manual'})`} />
                            <ReviewRow label="Formato" value={formData.competition_type} />
                            <ReviewRow label="Fases" value={`${formData.phases.length} fases configuradas`} />
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                            <IOSButton variant="secondary" onClick={() => setStep(3)} style={{ width: 'auto' }}>
                                <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Voltar
                            </IOSButton>
                            <IOSButton onClick={handleSubmit} disabled={loading} style={{ width: 'auto', background: '#30D158' }}>
                                {loading ? 'Criando...' : 'Confirmar e Criar Competição'}
                            </IOSButton>
                        </div>
                    </div>
                )}
            </IOSCard>
        </div>
    );
};

const ReviewRow: React.FC<{ label: string, value: string }> = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
        <span style={{ color: '#8E8E93' }}>{label}</span>
        <span style={{ fontWeight: 600, color: 'white' }}>{value}</span>
    </div>
);

export default CompetitionWizard;
