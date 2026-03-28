import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileArrowUp, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { caseService } from '../services/caseService';
import { analysisService } from '../services/analysisService';
import './CaseRecord.css';

function ResultImage({ title, imageBase64, overlays = [] }) {
    const [dims, setDims] = React.useState({ width: 0, height: 0 });

    if (!imageBase64) {
        return <p className="case-record-muted">{title} image not available.</p>;
    }

    return (
        <div className="case-analysis-image-wrap">
            <img
                src={`data:image/png;base64,${imageBase64}`}
                alt={title}
                className="case-analysis-image"
                onLoad={(event) => {
                    const img = event.currentTarget;
                    setDims({ width: img.naturalWidth || 0, height: img.naturalHeight || 0 });
                }}
            />
            {dims.width > 0 && dims.height > 0 && overlays.length > 0 && (
                <svg
                    className="case-analysis-overlay"
                    viewBox={`0 0 ${dims.width} ${dims.height}`}
                    preserveAspectRatio="none"
                >
                    {overlays.map((overlay, overlayIndex) => {
                        const segments = splitOverlaySegments(overlay.points, overlay.maxJumpPx);
                        return segments.map((segment, segmentIndex) => (
                            <polyline
                                key={`${overlay.className || 'overlay'}-${overlayIndex}-${segmentIndex}`}
                                className={`case-overlay-line ${overlay.className || ''}`.trim()}
                                points={segment
                                    .map((p) => {
                                        const x = Number.isFinite(Number(p?.[0])) ? Number(p[0]) : 0;
                                        const yRaw = Number.isFinite(Number(p?.[1])) ? Number(p[1]) : 0;
                                        const y = Math.min(
                                            Math.max(yRaw + Number(overlay.offsetY || 0), 0),
                                            dims.height,
                                        );
                                        return `${x},${y}`;
                                    })
                                    .join(' ')}
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        ));
                    })}
                </svg>
            )}
        </div>
    );
}

const inferRoleFromFilename = (filename = '') => {
    const lower = filename.toLowerCase();
    if (lower.startsWith('arch_') || lower.includes('arch')) return 'ARCH';
    if (lower.startsWith('ian_') || lower.includes('ian')) return 'IAN';
    return 'GENERAL';
};

const prettyDate = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString();
};

const normalizePathPoints = (rawPoints) => {
    if (!Array.isArray(rawPoints)) return [];
    return rawPoints
        .map((point) => {
            if (Array.isArray(point) && point.length >= 2) {
                const x = Number(point[0]);
                const y = Number(point[1]);
                return Number.isFinite(x) && Number.isFinite(y) ? [x, y] : null;
            }
            if (point && typeof point === 'object') {
                const x = Number(point.x);
                const y = Number(point.y);
                return Number.isFinite(x) && Number.isFinite(y) ? [x, y] : null;
            }
            return null;
        })
        .filter(Boolean);
};

const smoothPath = (points, windowSize = 5) => {
    if (!Array.isArray(points) || points.length <= 2 || windowSize <= 1) return points || [];
    const half = Math.max(1, Math.floor(windowSize / 2));
    const smoothed = points.map((pt, idx) => {
        let sumX = 0;
        let sumY = 0;
        let count = 0;
        for (let j = idx - half; j <= idx + half; j += 1) {
            if (j < 0 || j >= points.length) continue;
            sumX += points[j][0];
            sumY += points[j][1];
            count += 1;
        }
        return count > 0 ? [sumX / count, sumY / count] : pt;
    });
    return smoothed;
};

const splitOverlaySegments = (points, explicitMaxJumpPx) => {
    if (!Array.isArray(points) || points.length < 2) return [];

    const distances = [];
    for (let i = 1; i < points.length; i += 1) {
        const dx = Number(points[i][0]) - Number(points[i - 1][0]);
        const dy = Number(points[i][1]) - Number(points[i - 1][1]);
        distances.push(Math.hypot(dx, dy));
    }

    const sorted = [...distances].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length > 0
        ? (sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid])
        : 0;
    const maxJumpPx = Number.isFinite(Number(explicitMaxJumpPx))
        ? Number(explicitMaxJumpPx)
        : Math.max(42, median * 4.0);

    const segments = [];
    let current = [points[0]];
    for (let i = 1; i < points.length; i += 1) {
        const dx = Number(points[i][0]) - Number(points[i - 1][0]);
        const dy = Number(points[i][1]) - Number(points[i - 1][1]);
        const distance = Math.hypot(dx, dy);
        if (distance > maxJumpPx) {
            if (current.length > 1) segments.push(current);
            current = [points[i]];
        } else {
            current.push(points[i]);
        }
    }
    if (current.length > 1) segments.push(current);
    return segments;
};

const buildArchOverlays = (archResult) => {
    // Prefer arch curve if available; otherwise use planning contours.
    const archCurve = normalizePathPoints(archResult?.arch_curve_data);
    const planning = archResult?.planning_overlay_data || {};
    const outer = normalizePathPoints(planning.outer_contour);
    const inner = normalizePathPoints(planning.inner_contour);
    const guide = normalizePathPoints(planning.base_guide);

    const overlays = [];

    const archOffset = -40;
    const smoothInner = smoothPath(inner, 7);
    const smoothArch = smoothPath(archCurve, 7);

    if (smoothInner.length > 1) {
        overlays.push({ points: smoothInner, className: 'arch-overlay-inner', maxJumpPx: 18, offsetY: archOffset });
    } else if (smoothArch.length > 1) {
        overlays.push({ points: smoothArch, className: 'arch-overlay-inner', maxJumpPx: 18, offsetY: archOffset });
    }

    return overlays;
};

export default function CaseRecord() {
    const navigate = useNavigate();
    const { caseId } = useParams();

    const [loading, setLoading] = React.useState(true);
    const [caseRow, setCaseRow] = React.useState(null);
    const [analysis, setAnalysis] = React.useState(null);
    const [files, setFiles] = React.useState([]);

    const [archFile, setArchFile] = React.useState(null);
    const [ianFile, setIanFile] = React.useState(null);
    const [analyzing, setAnalyzing] = React.useState(false);
    const [banner, setBanner] = React.useState('');

    const loadData = React.useCallback(async () => {
        if (!caseId) return;
        setLoading(true);
        try {
            const resolvedCase = await caseService.getCaseById(caseId);
            setCaseRow(resolvedCase || null);

            if (resolvedCase?.id) {
                try {
                    const result = await analysisService.getResult(resolvedCase.id);
                    setAnalysis(result || null);
                } catch (_e) {
                    setAnalysis(null);
                }
            } else {
                setAnalysis(null);
            }

            const uploadedFiles = await caseService.getCaseFiles(caseId);
            setFiles(uploadedFiles || []);
        } finally {
            setLoading(false);
        }
    }, [caseId]);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    const uploadRoleFile = async (role, file) => {
        if (!file) return true;
        const renamedFile = new File(
            [file],
            `${role.toLowerCase()}_${Date.now()}_${file.name}`,
            { type: file.type || 'application/octet-stream' },
        );
        const formData = new FormData();
        formData.append('file', renamedFile);
        const upload = await caseService.uploadCaseFile(caseId, formData);
        return Boolean(upload);
    };

    const handleStartAnalysis = async () => {
        const archReady = Boolean(archFile) || archUploaded;
        const ianReady = Boolean(ianFile) || ianUploaded;
        if (!archReady || !ianReady) {
            setBanner('Please provide both ARCH and IAN files before starting analysis.');
            return;
        }

        setBanner('');
        setAnalyzing(true);

        try {
            const archOk = await uploadRoleFile('ARCH', archFile);
            const ianOk = await uploadRoleFile('IAN', ianFile);
            if (!archOk || !ianOk) {
                setBanner('Could not upload required files. Please retry.');
                return;
            }

            const result = await analysisService.run(caseId);
            if (!result) {
                setBanner('Analysis could not be completed. Please retry.');
                return;
            }

            setArchFile(null);
            setIanFile(null);
            setAnalysis(result);
            await loadData();
            setBanner('Analysis complete. The results look good, but AI is not 100% accurate. Please consider expert clinical judgment.');
        } catch (_e) {
            setBanner('Analysis failed. Please verify files and try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) {
        return (
            <div className="case-record-page">
                <div className="case-record-header">
                    <h1>Case Details</h1>
                </div>
                <p className="case-record-muted">Loading case...</p>
            </div>
        );
    }

    if (!caseRow) {
        return (
            <div className="case-record-page">
                <button className="case-record-back" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>
                <h1>Case Not Found</h1>
            </div>
        );
    }

    const archUploaded = files.some((file) => inferRoleFromFilename(file.filename) === 'ARCH');
    const ianUploaded = files.some((file) => inferRoleFromFilename(file.filename) === 'IAN');
    const archResult = analysis?.arch_result && Object.keys(analysis.arch_result).length > 0
        ? analysis.arch_result
        : analysis;
    const ianResult = analysis?.ian_result && Object.keys(analysis.ian_result).length > 0
        ? analysis.ian_result
        : null;
    const archOverlays = buildArchOverlays(archResult);
    const ianOverlayPoints = normalizePathPoints(
        (Array.isArray(ianResult?.safe_zone_path_data) && ianResult.safe_zone_path_data.length > 1)
            ? ianResult.safe_zone_path_data
            : ianResult?.nerve_path_data,
    );
    const ianOverlays = ianOverlayPoints.length > 1
        ? [{ points: ianOverlayPoints, className: 'ian-overlay', offsetY: -140, maxJumpPx: 32 }]
        : [];

    const steps = [
        { title: 'Step 1: Case selected', done: Boolean(caseRow) },
        { title: 'Step 2: ARCH input ready', done: Boolean(archFile) || archUploaded },
        { title: 'Step 3: IAN input ready', done: Boolean(ianFile) || ianUploaded },
        { title: 'Step 4: Analysis result', done: Boolean(analysis) },
    ];

    return (
        <div className="case-record-page">
            <div className="case-record-toolbar">
                <button className="case-record-back" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>
            </div>

            <div className="page-header">
                <h1>Report Details</h1>
                <p className="case-record-muted">Case ID: {caseRow.case_id || caseRow.id}</p>
            </div>

            <section className="case-record-card">
                <h3>Interactive Flow</h3>
                <div className="case-steps-list">
                    {steps.map((step) => (
                        <div key={step.title} className={`case-step-item ${step.done ? 'done' : ''}`}>
                            <span className="case-step-dot" />
                            <span>{step.title}</span>
                        </div>
                    ))}
                </div>
            </section>

            {banner && <div className="case-record-banner">{banner}</div>}

            <div className="case-record-grid">
                <section className="case-record-card">
                    <h3>Patient</h3>
                    <div className="case-record-info-grid">
                        <div>
                            <label>Name</label>
                            <span>{caseRow.fname} {caseRow.lname}</span>
                        </div>
                        <div>
                            <label>Age</label>
                            <span>{caseRow.patient_age || 'N/A'}</span>
                        </div>
                        <div>
                            <label>Tooth</label>
                            <span>{caseRow.tooth_number || 'N/A'}</span>
                        </div>
                        <div>
                            <label>Status</label>
                            <span>{caseRow.status || 'Pending Analysis'}</span>
                        </div>
                    </div>
                </section>

                <section className="case-record-card">
                    <h3>Start Analysis</h3>
                    <p className="case-record-muted">Provide both files below, then start analysis for this case.</p>

                    <div className="case-upload-row">
                        <div>
                            <label className="case-upload-label">ARCH DCM</label>
                            <input
                                type="file"
                                accept=".dcm,.zip"
                                onChange={(e) => setArchFile(e.target.files?.[0] || null)}
                            />
                            <div className={`case-upload-status ${archUploaded ? 'ok' : 'missing'}`}>
                                {archUploaded ? <CheckCircle size={16} /> : <WarningCircle size={16} />}
                                {archUploaded ? 'ARCH uploaded' : 'ARCH missing'}
                            </div>
                        </div>
                    </div>

                    <div className="case-upload-row">
                        <div>
                            <label className="case-upload-label">IAN (DCM/JPG/PNG)</label>
                            <input
                                type="file"
                                accept=".dcm,.jpg,.jpeg,.png,.zip"
                                onChange={(e) => setIanFile(e.target.files?.[0] || null)}
                            />
                            <div className={`case-upload-status ${ianUploaded ? 'ok' : 'missing'}`}>
                                {ianUploaded ? <CheckCircle size={16} /> : <WarningCircle size={16} />}
                                {ianUploaded ? 'IAN uploaded' : 'IAN missing'}
                            </div>
                        </div>
                    </div>

                    <button
                        className="case-upload-btn"
                        onClick={handleStartAnalysis}
                        disabled={analyzing}
                    >
                        <FileArrowUp size={16} /> {analyzing ? 'Analyzing...' : 'Start Analysis'}
                    </button>
                </section>
            </div>

            <section className="case-record-card">
                <h3>Uploaded Files</h3>
                {files.length === 0 ? (
                    <p className="case-record-muted">No files uploaded for this case yet.</p>
                ) : (
                    <div className="case-files-list">
                        {files.map((file) => (
                            <div key={file.id} className="case-file-item">
                                <span className="case-file-name">{file.filename}</span>
                                <span className="case-file-meta">{inferRoleFromFilename(file.filename)} • {prettyDate(file.uploaded_at)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="case-record-card">
                <h3>Latest Analysis Summary</h3>
                {!analysis ? (
                    <p className="case-record-muted">No analysis result yet. Upload files and run analysis to populate report details.</p>
                ) : (
                    <>
                        <div className="case-result-grid">
                            <div className="case-result-panel">
                                <h4>ARCH Result</h4>
                                <ResultImage
                                    title="ARCH analysis"
                                    imageBase64={archResult?.opg_image_base64}
                                    overlays={archOverlays}
                                />
                            </div>

                            <div className="case-result-panel">
                                <h4>IAN Result</h4>
                                {ianResult ? (
                                    <>
                                        <ResultImage
                                            title="IAN analysis"
                                            imageBase64={ianResult.opg_image_base64}
                                            overlays={ianOverlays}
                                        />
                                    </>
                                ) : (
                                    <p className="case-record-muted">IAN result not available yet. Upload IAN file and run analysis again.</p>
                                )}
                            </div>
                        </div>

                        <div className="case-record-note">
                            The results look good, but AI is not 100% accurate. Please consider expert clinical judgment.
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}
