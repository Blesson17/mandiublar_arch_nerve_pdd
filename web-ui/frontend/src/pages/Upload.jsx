import React, { useState, useEffect } from 'react';
import {
    FolderOpen, Files, FileDashed, Info
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { caseService } from '../services/caseService';

export default function Upload() {
    const navigate = useNavigate();
    const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStage, setUploadStage] = useState('initial'); // initial, preview, uploading
    const [previewUrl, setPreviewUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('');

    // Options are informational only for upload step.
    const [jaw, setJaw] = useState('mandible');
    const [toothRegion, setToothRegion] = useState('Global');

    useEffect(() => {
        // Load cases
        const loadCases = async () => {
            try {
                const data = await caseService.getCases();
                setCases(data || []);
            } catch (e) { console.error("Error loading cases", e); }
        };
        loadCases();
    }, []);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);

            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (ev) => setPreviewUrl(ev.target.result);
                reader.readAsDataURL(file);
            } else {
                setPreviewUrl('');
            }
            setUploadStage('preview');
        }
    };

    const handleUpload = async () => {
        if (!selectedCase || !selectedFile) {
            alert("Please select a case and a file.");
            return;
        }

        setIsUploading(true);
        setProcessingMessage('Uploading file...');
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await caseService.uploadCaseFile(selectedCase, formData);
            if (!response) throw new Error('Upload failed');

            setProcessingMessage('Upload complete. Open Analysis to process this case.');
            localStorage.setItem('implantAI_lastCaseId', String(selectedCase));

            // Navigate to Analysis
            navigate(`/analysis?id=${selectedCase}`);

        } catch (e) {
            alert("Upload failed: " + e.message);
            setUploadStage('preview');
            setIsUploading(false);
            setProcessingMessage('');
        }
    };

    const resetUpload = () => {
        setSelectedFile(null);
        setPreviewUrl('');
        setUploadStage('initial');
        setIsUploading(false);
        setProcessingMessage('');
    };

    return (
        <div className="upload-page-content">
            <div className="page-header">
                <h1>Upload CBCT Slice</h1>
            </div>

            {uploadStage === 'initial' && (
                <>
                    <div className="upload-container" style={{ display: 'flex', gap: '2rem', height: '400px', marginBottom: '2rem' }}>
                        <div className="upload-card"
                            style={{ flex: 1, background: 'white', border: '2px dashed #E2E8F0', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
                            onClick={() => document.getElementById('fileInput').click()}
                        >
                            <div className="card-icon icon-blue" style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '1.5rem' }}>
                                <FolderOpen />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.5rem' }}>Upload 3D CBCT Slice</h3>

                            <input type="file" id="fileInput" hidden multiple accept=".dcm,.zip,.png,.jpg,.jpeg" onChange={handleFileSelect} />

                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', color: '#CBD5E1', marginBottom: '1rem' }}><Files /></div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Drag & Drop Scan Files</h3>
                                <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '1.5rem' }}>Supported: DICOM (.dcm), ZIP (.zip), JPEG/PNG</p>
                                <button style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                                    Select Files
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', color: '#94A3B8', fontSize: '0.85rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileDashed /> Supported:</span>
                        <span>.dcm (DICOM)</span>
                        <span>.zip (Archive)</span>
                        <span>.jpg / .png (Panoramic image)</span>
                    </div>
                </>
            )}

            {uploadStage === 'preview' && (
                <div className="post-upload-container" style={{ maxWidth: '900px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Selected File Card */}
                    <div className="content-card" style={{ background: 'white', borderRadius: '12px', padding: '2.5rem', border: '1px solid #E2E8F0' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.15rem', color: '#1E293B' }}>Selected File</h3>
                        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
                            <div style={{ width: '180px', height: '140px', background: '#F8FAFC', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748B' }}><Files size={32} /></div>
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>File Name</span>
                                    <span style={{ fontSize: '1.05rem', fontWeight: 500, color: '#334155' }}>{selectedFile?.name}</span>
                                </div>
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>File Size</span>
                                    <span style={{ fontSize: '1.05rem', fontWeight: 500, color: '#334155' }}>{(selectedFile?.size / (1024 * 1024)).toFixed(2)} MB</span>
                                </div>
                                <span style={{ color: '#EF4444', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }} onClick={resetUpload}>Remove File</span>
                            </div>
                        </div>
                    </div>

                    {/* Options Card */}
                    <div className="content-card" style={{ background: 'white', borderRadius: '12px', padding: '2.5rem', border: '1px solid #E2E8F0' }}>
                        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.15rem', color: '#1E293B' }}>Implant Planning Options</h3>
                        <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '2.5rem' }}>Configure these settings to help AI interpret the slice correctly</p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.75rem' }}>Select Patient Case</label>
                            <select
                                value={selectedCase}
                                onChange={(e) => setSelectedCase(e.target.value)}
                                style={{ width: '100%', padding: '0.875rem 1rem', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '0.95rem', background: 'white' }}
                            >
                                <option value="">Select a Case...</option>
                                {cases.map(c => <option key={c.id} value={c.id}>{c.fname} {c.lname} ({c.id})</option>)}
                            </select>
                        </div>

                        <div className="options-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginBottom: '2.5rem' }}>
                            {/* Tooth Region */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.75rem' }}>Tooth Region *</label>
                                <select
                                    value={toothRegion}
                                    onChange={(e) => setToothRegion(e.target.value)}
                                    style={{ width: '100%', padding: '0.875rem 1rem', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '0.95rem', background: 'white' }}
                                >
                                    <option value="27">27 - Upper Left Second Molar</option>
                                    <option value="19">19 - Lower Left First Molar</option>
                                    <option value="30">30 - Lower Right First Molar</option>
                                    <option value="Global">Full Arch Analysis</option>
                                </select>
                            </div>

                            {/* Jaw Selection */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.75rem' }}>Jaw Selection *</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={() => setJaw('maxilla')}
                                        style={{ flex: 1, padding: '0.8rem', border: `1px solid ${jaw === 'maxilla' ? '#3B82F6' : '#E2E8F0'}`, background: jaw === 'maxilla' ? '#EFF6FF' : 'white', color: jaw === 'maxilla' ? '#2563EB' : '#64748B', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
                                    >Maxilla</button>
                                    <button
                                        onClick={() => setJaw('mandible')}
                                        style={{ flex: 1, padding: '0.8rem', border: `1px solid ${jaw === 'mandible' ? '#3B82F6' : '#E2E8F0'}`, background: jaw === 'mandible' ? '#EFF6FF' : 'white', color: jaw === 'mandible' ? '#2563EB' : '#64748B', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
                                    >Mandible</button>
                                </div>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div style={{ background: '#EFF6FF', borderRadius: '12px', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <Info size={24} color="#2563EB" />
                            <div>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#1E40AF' }}>Why these settings matter</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#3B82F6', lineHeight: 1.6 }}>These parameters help the AI correctly interpret your 3D CBCT slice for accurate bone segmentation and implant planning.</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1.5rem', marginTop: '3rem' }}>
                            <button onClick={resetUpload} style={{ background: 'transparent', border: 'none', color: '#64748B', fontWeight: 500, cursor: 'pointer', fontSize: '1rem' }}>Cancel</button>
                            <button onClick={handleUpload} disabled={isUploading} style={{ background: '#0066CC', color: 'white', border: 'none', padding: '0.875rem 2rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', boxShadow: 'none' }}>
                                {isUploading ? 'Uploading...' : 'Upload to Backend'}
                            </button>
                        </div>
                        {isUploading && (
                            <p style={{ marginTop: '1rem', color: '#2563EB', fontWeight: 600 }}>
                                {processingMessage}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
