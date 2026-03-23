import React from 'react';
import { Check, CreditCard, Receipt } from '@phosphor-icons/react';

export default function Billing() {
    return (
        <div className="settings-card">
            <h2 className="card-title">Billing & Plans</h2>

            <div className="plan-card" style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.5rem', background: '#F8FAFC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <h3 style={{ margin: 0, color: '#1E293B' }}>Professional Plan</h3>
                        <div style={{ color: '#64748B', fontSize: '0.9rem' }}>Billed monthly</div>
                    </div>
                    <span className="status-badge status-ready" style={{ background: '#DCFCE7', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>Active</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#0F172A', marginBottom: '1.5rem' }}>
                    $299<span style={{ fontSize: '1rem', color: '#64748B', fontWeight: '400' }}>/mo</span>
                </div>

                <div className="feature-list" style={{ gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.9rem', color: '#334155' }}>
                        <Check size={18} color="#2563EB" weight="bold" /> Unlimited CBCT Uploads
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.9rem', color: '#334155' }}>
                        <Check size={18} color="#2563EB" weight="bold" /> Advanced AI Analysis
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.9rem', color: '#334155' }}>
                        <Check size={18} color="#2563EB" weight="bold" /> Priority Support
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="contact-btn" style={{ background: '#2563EB' }}>Manage Subscription</button>
                    <button className="contact-btn" style={{ background: 'white', border: '1px solid #CBD5E1', color: '#334155' }}>View Invoices</button>
                </div>
            </div>

            <h3 className="settings-group-title" style={{ paddingLeft: 0, marginTop: '2rem', marginBottom: '1rem' }}>Payment Method</h3>
            <div className="payment-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                <CreditCard size={32} color="#0F172A" />
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Visa ending in 4242</div>
                    <div style={{ color: '#64748B', fontSize: '0.85rem' }}>Expires 12/28</div>
                </div>
                <button style={{ color: '#2563EB', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer' }}>Edit</button>
            </div>
        </div>
    );
}
