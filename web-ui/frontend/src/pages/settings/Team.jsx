import React from 'react';
import { UserPlus, DotsThreeVertical } from '@phosphor-icons/react';

export default function Team() {
    return (
        <div className="settings-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="card-title" style={{ margin: 0 }}>Team Members</h2>
                <button className="new-case-btn" style={{ padding: '0.6rem 1rem', fontSize: '0.9rem' }}>
                    <UserPlus size={18} /> Invite Member
                </button>
            </div>

            <div className="team-list">
                <TeamRow name="Dr. Sarah Wilson" email="sarah.w@implantai.com" role="Admin" avatar="SW" />
                <TeamRow name="Dr. James Carter" email="james.c@implantai.com" role="Surgeon" avatar="JC" />
                <TeamRow name="Emily Chen" email="emily.c@implantai.com" role="Assistant" avatar="EC" />
            </div>
        </div>
    );
}

const TeamRow = ({ name, email, role, avatar }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '0.9rem' }}>
                {avatar}
            </div>
            <div>
                <div style={{ fontWeight: '600', fontSize: '0.95rem', color: '#1E293B' }}>{name}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>{email}</div>
            </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#475569', background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px' }}>{role}</span>
            <DotsThreeVertical size={20} color="#94A3B8" style={{ cursor: 'pointer' }} />
        </div>
    </div>
);
