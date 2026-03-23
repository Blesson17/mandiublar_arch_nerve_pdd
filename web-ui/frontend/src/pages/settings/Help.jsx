import React from 'react';
import { CaretRight, Question, BookOpen, ChatCircleText, Phone } from '@phosphor-icons/react';

export default function Help() {
    return (
        <div className="settings-card">
            <h2 className="card-title">Help & Support</h2>

            <div className="doc-list">
                <div className="doc-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <BookOpen size={24} color="#2563EB" />
                        <div>
                            <div className="doc-label">Documentation</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Guides on how to use ImplantAI</div>
                        </div>
                    </div>
                    <CaretRight className="doc-icon" />
                </div>
                <div className="doc-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Question size={24} color="#2563EB" />
                        <div>
                            <div className="doc-label">FAQs</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Common questions and answers</div>
                        </div>
                    </div>
                    <CaretRight className="doc-icon" />
                </div>
            </div>

            <h3 className="settings-group-title" style={{ paddingLeft: 0, marginTop: '2rem', marginBottom: '1rem' }}>Contact Us</h3>
            <p className="support-text">
                Our support team is available Mon-Fri, 9am - 5pm EST. <br />
                For urgent clinical issues, please call our emergency line.
            </p>

            <div className="support-actions">
                <button className="contact-btn">
                    <ChatCircleText size={20} style={{ marginRight: '0.5rem', marginBottom: '-4px' }} />
                    Start Live Chat
                </button>
                <div className="live-chat-link">
                    <Phone size={18} style={{ marginRight: '0.5rem', marginBottom: '-3px' }} />
                    +1 (555) 123-4567
                </div>
            </div>
        </div>
    );
}
