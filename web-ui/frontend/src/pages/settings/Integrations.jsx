import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, PuzzlePiece, CalendarCheck, CloudArrowUp } from '@phosphor-icons/react';

export default function Integrations() {
    return (
        <div className="settings-card">
            <h2 className="card-title">Connected Apps</h2>

            <div className="integration-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <IntegrationItem
                    icon={<CalendarCheck size={28} color="#EA4335" />}
                    name="Google Calendar"
                    desc="Sync appointment schedules"
                    connected={true}
                />
                <IntegrationItem
                    icon={<CloudArrowUp size={28} color="#0061FF" />}
                    name="Dropbox"
                    desc="Auto-backup CBCT scans"
                    connected={false}
                />
                <IntegrationItem
                    icon={<PuzzlePiece size={28} color="#6366F1" />}
                    name="Dentrix"
                    desc="Practice management software"
                    connected={false}
                />
            </div>
        </div>
    );
}

const IntegrationItem = ({ icon, name, desc, connected }) => {
    const [isOn, setIsOn] = useState(connected);

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {icon}
                <div>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem', color: '#1E293B' }}>{name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{desc}</div>
                </div>
            </div>
            <button
                onClick={() => setIsOn(!isOn)}
                style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: isOn ? '1px solid #CBD5E1' : '1px solid #2563EB',
                    background: isOn ? 'white' : '#2563EB',
                    color: isOn ? '#64748B' : 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                }}>
                {isOn ? 'Disconnect' : 'Connect'}
            </button>
        </div>
    );
};
