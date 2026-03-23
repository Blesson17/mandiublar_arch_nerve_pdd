import React, { useState } from 'react';
import { Bell, Envelope, ChatCircleDots, Monitor } from '@phosphor-icons/react';

export default function Notifications() {
    const [toggles, setToggles] = useState({
        email_analysis: true,
        email_marketing: false,
        push_analysis: true,
        push_messages: true
    });

    const toggle = (key) => setToggles(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className="settings-card">
            <h2 className="card-title">Notifications</h2>

            <h3 className="settings-group-title" style={{ paddingLeft: 0, marginTop: '1.5rem', marginBottom: '0.5rem' }}>Email Notifications</h3>
            <div className="toggle-row">
                <div className="toggle-info">
                    <h5>Analysis Complete</h5>
                    <p>Get notified when a case analysis is ready.</p>
                </div>
                <div className="switch" onClick={() => toggle('email_analysis')}>
                    <input type="checkbox" checked={toggles.email_analysis} readOnly />
                    <span className="slider round"></span>
                </div>
            </div>
            <div className="toggle-row">
                <div className="toggle-info">
                    <h5>Marketing & Updates</h5>
                    <p>Receive news about new features and updates.</p>
                </div>
                <div className="switch" onClick={() => toggle('email_marketing')}>
                    <input type="checkbox" checked={toggles.email_marketing} readOnly />
                    <span className="slider round"></span>
                </div>
            </div>

            <h3 className="settings-group-title" style={{ paddingLeft: 0, marginTop: '2rem', marginBottom: '0.5rem' }}>Push Notifications</h3>
            <div className="toggle-row">
                <div className="toggle-info">
                    <h5>Analysis Alerts</h5>
                    <p>Instant browser alerts for finished reports.</p>
                </div>
                <div className="switch" onClick={() => toggle('push_analysis')}>
                    <input type="checkbox" checked={toggles.push_analysis} readOnly />
                    <span className="slider round"></span>
                </div>
            </div>
            <div className="toggle-row">
                <div className="toggle-info">
                    <h5>New Messages</h5>
                    <p>Notifications for support or team messages.</p>
                </div>
                <div className="switch" onClick={() => toggle('push_messages')}>
                    <input type="checkbox" checked={toggles.push_messages} readOnly />
                    <span className="slider round"></span>
                </div>
            </div>
        </div>
    );
}
