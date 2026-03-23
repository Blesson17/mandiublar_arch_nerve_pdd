import React from 'react';
import { Globe, Clock } from '@phosphor-icons/react';

export default function Language() {
    return (
        <div className="settings-card">
            <h2 className="card-title">Language & Region</h2>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
                <div className="form-row">
                    <div className="label-group">
                        <div className="label-main">Display Language</div>
                        <div className="label-desc">Select the language for the interface.</div>
                    </div>
                    <select className="select-input" defaultValue="en">
                        <option value="en">English (US)</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                    </select>
                </div>
            </div>

            <div className="form-group">
                <div className="form-row">
                    <div className="label-group">
                        <div className="label-main">Time Zone</div>
                        <div className="label-desc">Set your local time zone for reports.</div>
                    </div>
                    <select className="select-input" defaultValue="est">
                        <option value="pst">Pacific Time (UTC-8)</option>
                        <option value="mst">Mountain Time (UTC-7)</option>
                        <option value="cst">Central Time (UTC-6)</option>
                        <option value="est">Eastern Time (UTC-5)</option>
                        <option value="gmt">London (GMT)</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
