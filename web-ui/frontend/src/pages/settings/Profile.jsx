import React, { useState, useEffect } from 'react';
import { User, Envelope, Phone, Buildings, FloppyDisk } from '@phosphor-icons/react';
import { profileService } from '../../services/profileService';
import { authStore } from '../../services/authStore';

export default function Profile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        practice_name: '',
        bio: '',
        specialty: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await profileService.getProfile();
            setFormData({
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || '',
                practice_name: data.practice_name || '',
                bio: data.bio || '',
                specialty: data.specialty || ''
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            await profileService.updateProfile(formData);
            setMessage('Profile updated successfully!');
            authStore.setUserName(formData.name);
        } catch (err) {
            setMessage(err.message || 'Error connecting to server.');
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading profile...</div>;

    return (
        <div className="settings-card">
            <h2 className="card-title">My Profile</h2>

            {message && (
                <div style={{
                    padding: '1rem',
                    background: message.includes('success') ? '#DCFCE7' : '#FEE2E2',
                    color: message.includes('success') ? '#166534' : '#991B1B',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    fontSize: '0.9rem'
                }}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-field">
                        <label className="field-label">Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
                            <input
                                type="text"
                                name="name"
                                className="field-input"
                                style={{ paddingLeft: '2.5rem' }}
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-field">
                        <label className="field-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Envelope size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
                            <input
                                type="email"
                                name="email"
                                className="field-input"
                                style={{ paddingLeft: '2.5rem' }}
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-field">
                        <label className="field-label">Phone Number</label>
                        <div style={{ position: 'relative' }}>
                            <Phone size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
                            <input
                                type="tel"
                                name="phone"
                                className="field-input"
                                style={{ paddingLeft: '2.5rem' }}
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-field">
                        <label className="field-label">Practice Name</label>
                        <div style={{ position: 'relative' }}>
                            <Buildings size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
                            <input
                                type="text"
                                name="practice_name"
                                className="field-input"
                                style={{ paddingLeft: '2.5rem' }}
                                value={formData.practice_name}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-field">
                        <label className="field-label">Specialty</label>
                        <input
                            type="text"
                            name="specialty"
                            className="field-input"
                            placeholder="e.g. Oral Surgeon"
                            value={formData.specialty}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-field" style={{ marginBottom: '2rem' }}>
                    <label className="field-label">Professional Bio</label>
                    <textarea
                        name="bio"
                        className="field-input"
                        rows="4"
                        placeholder="Brief description for your patient reports..."
                        value={formData.bio}
                        onChange={handleChange}
                        style={{ resize: 'vertical' }}
                    ></textarea>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        type="submit"
                        className="new-case-btn"
                        disabled={saving}
                        style={{ padding: '0.75rem 2rem' }}
                    >
                        {saving ? 'Saving...' : (
                            <>
                                <FloppyDisk size={20} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
