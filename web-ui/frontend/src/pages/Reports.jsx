import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Reports.css';
import { FilePdf, Printer, ShareNetwork } from '@phosphor-icons/react';
import { caseService } from '../services/caseService';
import { analysisService } from '../services/analysisService';
import { authStore } from '../services/authStore';

const toPatientKey = (item) => `${(item.fname || '').trim()} ${(item.lname || '').trim()}`.trim().toLowerCase();

const Reports = () => {
    const [loading, setLoading] = useState(true);
    const [cases, setCases] = useState([]);
    const [selectedPatientKey, setSelectedPatientKey] = useState('');
    const [selectedCase, setSelectedCase] = useState(null);
    const [selectedCaseAnalysis, setSelectedCaseAnalysis] = useState(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const requestedId = searchParams.get('id');

    React.useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const allCases = (await caseService.getCases()) || [];
                setCases(allCases);

                let resolvedCase = null;
                if (requestedId) {
                    resolvedCase = await caseService.getCaseById(requestedId);
                }

                if (!resolvedCase && allCases.length > 0) {
                    resolvedCase = allCases[0];
                }

                if (resolvedCase) {
                    setSelectedCase(resolvedCase);
                    setSelectedPatientKey(toPatientKey(resolvedCase));
                    try {
                        const analysis = await analysisService.getResult(resolvedCase.id);
                        setSelectedCaseAnalysis(analysis || null);
                    } catch (_e) {
                        setSelectedCaseAnalysis(null);
                    }
                }
            } catch (error) {
                console.error('Error loading reports:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [requestedId]);

    const patientGroups = useMemo(() => {
        const grouped = new Map();
        cases.forEach((item) => {
            const key = toPatientKey(item);
            if (!grouped.has(key)) {
                grouped.set(key, {
                    key,
                    label: `${item.fname || ''} ${item.lname || ''}`.trim() || 'Unknown Patient',
                    cases: [],
                });
            }
            grouped.get(key).cases.push(item);
        });

        return Array.from(grouped.values()).map((group) => ({
            ...group,
            cases: group.cases.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()),
        }));
    }, [cases]);

    const visibleCases = useMemo(() => {
        if (!selectedPatientKey) {
            return [];
        }
        const group = patientGroups.find((item) => item.key === selectedPatientKey);
        return group?.cases || [];
    }, [patientGroups, selectedPatientKey]);

    const handlePickPatient = async (key) => {
        setSelectedPatientKey(key);
        const group = patientGroups.find((item) => item.key === key);
        const firstCase = group?.cases?.[0] || null;
        setSelectedCase(firstCase);
        if (firstCase) {
            try {
                const analysis = await analysisService.getResult(firstCase.id);
                setSelectedCaseAnalysis(analysis || null);
            } catch (_e) {
                setSelectedCaseAnalysis(null);
            }
        } else {
            setSelectedCaseAnalysis(null);
        }
    };

    const handlePickCase = async (caseRow) => {
        setSelectedCase(caseRow);
        navigate(`/reports?id=${encodeURIComponent(caseRow.id)}`);
        try {
            const analysis = await analysisService.getResult(caseRow.id);
            setSelectedCaseAnalysis(analysis || null);
        } catch (_e) {
            setSelectedCaseAnalysis(null);
        }
    };

    const handleBack = () => {
        navigate('/dashboard');
    };

    if (loading) {
        return (
            <div className="reports-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#64748B' }}>
                <div style={{ textAlign: 'center' }}>
                    <h3>Loading Reports...</h3>
                </div>
            </div>
        );
    }

    if (!cases.length) {
        return (
            <div className="reports-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <h3>No Reports Yet</h3>
                    <p>Create a case and complete analysis to generate reports.</p>
                    <button onClick={handleBack} className="btn-primary" style={{ marginTop: '1rem' }}>Back to Dashboard</button>
                </div>
            </div>
        );
    }

    const isReady = selectedCase?.status === 'Ready' || selectedCase?.status === 'Analysis Complete';
    const metrics = selectedCaseAnalysis || {
        bone_height: '--',
        bone_width_36: '--',
        nerve_distance: '--',
    };

    return (
        <div className="reports-container">
            <div className="report-actions" style={{ width: '360px' }}>
                <div className="action-card">
                    <h3 className="action-title">Patients</h3>
                    <div className="patient-list">
                        {patientGroups.map((patient) => (
                            <button
                                key={patient.key}
                                className={`patient-item ${selectedPatientKey === patient.key ? 'active' : ''}`}
                                onClick={() => handlePickPatient(patient.key)}
                            >
                                <span>{patient.label}</span>
                                <span>{patient.cases.length} reports</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="action-card">
                    <h3 className="action-title">Reports</h3>
                    <div className="patient-list">
                        {visibleCases.map((item) => (
                            <button
                                key={item.id}
                                className={`patient-item ${selectedCase?.id === item.id ? 'active' : ''}`}
                                onClick={() => handlePickCase(item)}
                            >
                                <span>{item.case_id || `Case ${item.id}`}</span>
                                <span>{new Date(item.created_at || Date.now()).toLocaleDateString()}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {selectedCase && (
                <div className="report-preview">
                    <div className="preview-header">
                        <div className="preview-title">
                            <h1>Surgical Plan</h1>
                            <span className="case-id">Case ID: {selectedCase.case_id || selectedCase.id}</span>
                        </div>
                        <div className="doctor-info">
                            <div className="doctor-name">Dr. {authStore.getUserName() || 'Surgeon'}</div>
                            <div>Oral & Maxillofacial Surgery</div>
                            <div style={{ marginTop: '0.25rem' }}>{new Date().toLocaleDateString()}</div>
                        </div>
                    </div>

                    <div className="report-section">
                        <h3 className="section-title">Patient Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Name</label>
                                <span>{selectedCase.fname} {selectedCase.lname}</span>
                            </div>
                            <div className="info-item">
                                <label>Age</label>
                                <span>{selectedCase.patient_age || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <label>Tooth</label>
                                <span>{selectedCase.tooth_number || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <label>Complaint</label>
                                <span>{selectedCase.complaint || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {isReady ? (
                        <>
                            <div className="report-section">
                                <h3 className="section-title">Measurements</h3>
                                <div className="measurements-grid">
                                    <div className="measurement-card">
                                        <span className="measure-label">Bone Height</span>
                                        <span className="measure-value">{metrics.bone_height} <span className="measure-unit">mm</span></span>
                                    </div>
                                    <div className="measurement-card">
                                        <span className="measure-label">Bone Width</span>
                                        <span className="measure-value">{metrics.bone_width_36} <span className="measure-unit">mm</span></span>
                                    </div>
                                    <div className="measurement-card">
                                        <span className="measure-label">Nerve Distance</span>
                                        <span className="measure-value">{metrics.nerve_distance} <span className="measure-unit">mm</span></span>
                                    </div>
                                </div>
                            </div>

                            <div className="export-options">
                                <button className="export-btn"><FilePdf weight="duotone" /> PDF</button>
                                <button className="export-btn"><Printer weight="duotone" /> Print</button>
                                <button className="export-btn"><ShareNetwork weight="duotone" /> Share</button>
                            </div>
                        </>
                    ) : (
                        <div className="report-section" style={{ textAlign: 'center', padding: '2rem', background: '#F8FAFC', borderRadius: '12px' }}>
                            <h3 style={{ color: '#64748B' }}>Analysis In Progress</h3>
                            <p style={{ color: '#94A3B8' }}>Report will be populated once processing completes.</p>
                        </div>
                    )}

                    <button
                        onClick={handleBack}
                        className="btn-primary"
                        style={{ marginTop: '1rem', background: 'white', color: '#2563EB', border: '1px solid #2563EB' }}
                    >
                        Back to Dashboard
                    </button>
                </div>
            )}
        </div>
    );
};

export default Reports;
