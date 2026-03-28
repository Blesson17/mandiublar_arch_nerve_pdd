import React, { useState } from 'react';
import { CaretRight, Lock, Eye, EyeSlash, ShieldCheck, DeviceMobile } from '@phosphor-icons/react';

export default function Privacy() {
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="settings-card">
            <h2 className="card-title">Privacy & Security</h2>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
                <h3 className="settings-group-title" style={{ paddingLeft: 0, marginBottom: '1rem', color: '#1E293B', fontSize: '1rem' }}>Change Password</h3>
                <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '1rem' }}>
                    <div className="form-field">
                        <label className="field-label">Current Password</label>
                        <input type="password" className="field-input" placeholder="Enter current password" />
                    </div>
                    <div className="form-grid">
                        <div className="form-field">
                            <label className="field-label">New Password</label>
                            <input type="password" className="field-input" placeholder="Enter new password" />
                        </div>
                        <div className="form-field">
                            <label className="field-label">Confirm Password</label>
                            <input type="password" className="field-input" placeholder="Confirm new password" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            className="new-case-btn"
                            style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
                            onClick={() => alert('Password update feature is coming soon!')}
                        >
                            Update Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
