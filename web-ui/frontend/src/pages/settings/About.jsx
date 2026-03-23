import React from 'react';
import { ShieldCheck, FileText } from '@phosphor-icons/react';

export default function About() {
    return (
        <div className="settings-card">
            <div className="about-hero">
                <div className="app-logo-large">AI</div>
                <div className="app-name">ImplantAI</div>
                <div className="app-tagline">Advanced Surgical Planning & Diagnostics</div>
                <div className="version-pill">v1.0.2-beta</div>
            </div>

            <div className="sys-info-grid" style={{ marginTop: '2rem' }}>
                <div className="sys-row" style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <span className="sys-label">Build Date</span>
                    <span className="sys-value">Feb 19, 2026</span>
                </div>
                <div className="sys-row" style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <span className="sys-label">Environment</span>
                    <span className="sys-value">Production</span>
                </div>
                <div className="sys-row">
                    <span className="sys-label">License</span>
                    <span className="sys-value">Enterprise Seat</span>
                </div>
            </div>

            <div style={{ marginTop: '3rem' }}>
                <div className="legal-list">
                    <div className="legal-item">
                        <span className="legal-label">Terms of Service</span>
                        <CaretRightIcon />
                    </div>
                    <div className="legal-item">
                        <span className="legal-label">Privacy Policy</span>
                        <CaretRightIcon />
                    </div>
                    <div className="legal-item">
                        <span className="legal-label">Third-Party Licenses</span>
                        <CaretRightIcon />
                    </div>
                </div>
                <div className="copyright">
                    © 2026 ImplantAI Inc. All rights reserved.
                </div>
            </div>
        </div>
    );
}

const CaretRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#94A3B8" viewBox="0 0 256 256">
        <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
    </svg>
);
