import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { authService } from '../services/authService';
import { authStore } from '../services/authStore';
import { API_BASE_URL } from '../config/env';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const [mode, setMode] = useState('signin');
    const [showPassword, setShowPassword] = useState(false);

    // Auth State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [practice, setPractice] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [connected, setConnected] = useState(false);

    // Initial Health Check
    useEffect(() => {
        const checkConnection = async () => {
            try {
                await authService.health();
                setConnected(true);
            } catch (e) {
                setConnected(false);
            }
        };
        checkConnection();

        // Handle OAuth Callback via URL params (e.g. ?token=...)
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        if (token) {
            authStore.setSession({ token });
            // Optionally fetch user profile if token doesn't contain user info in URL
            navigate('/dashboard');
        }
    }, [location]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Build Payload
            if (mode === 'signin') {
                await authService.login(email, password);
            } else {
                await authService.register({
                    name,
                    email,
                    phone: 'N/A',
                    practice_name: practice || 'Private Practice',
                    password
                });
            }

            const origin = location.state?.from?.pathname || '/dashboard';
            navigate(origin, { replace: true });
        } catch (err) {
            setError(err.message || 'Unable to connect to server. Please ensure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // Redirect to Backend OAuth endpoint
        window.location.href = `${API_BASE_URL}/auth/google`;
    };

    return (
        <div className="login-page-wrapper">
            <div className="login-card-container">
                {/* LEFT PANEL - Form Section */}
                <div className="form-section">
                    <div className="brand-header-mobile">
                        <img src="/favicon.svg" alt="Logo" style={{ width: '24px', height: '24px' }} />
                        <span>ImplantAI</span>
                    </div>

                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#64748B' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: connected ? '#10B981' : '#EF4444' }}></div>
                        API {connected ? 'Online' : 'Offline'}
                    </div>

                    <div className="form-header">
                        <h2>{mode === 'signin' ? 'Log In' : 'Create Account'}</h2>
                        <p>{mode === 'signin' ? 'Access your clinical dashboard securely.' : 'Start your free trial today.'}</p>
                    </div>

                    {error && <div style={{ color: 'var(--danger-red)', marginBottom: '1rem', fontSize: '0.9rem', background: '#FEF2F2', padding: '0.5rem', borderRadius: '8px', border: '1px solid #FECACA' }}>{error}</div>}

                    <form className="auth-form" onSubmit={handleLogin}>
                        {mode === 'signup' && (
                            <>
                                <div className="input-group">
                                    <label>Full Name</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Dr. John Doe" />
                                </div>
                                <div className="input-group">
                                    <label>Practice Name</label>
                                    <input type="text" value={practice} onChange={e => setPractice(e.target.value)} placeholder="City Dental Clinic" />
                                </div>
                            </>
                        )}

                        <div className="input-group">
                            <label>Email Address</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@clinic.com" />
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeSlash /> : <Eye />}
                                </button>
                            </div>
                        </div>

                        {mode === 'signin' && (
                            <div className="form-actions">
                                <label className="remember-me">
                                    <input type="checkbox" />
                                    <span className="checkmark"></span>
                                    Remember me
                                </label>
                                <a href="#" className="forgot-pass">Forgot password?</a>
                            </div>
                        )}

                        {mode === 'signup' && (
                            <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
                                <label className="remember-me">
                                    <input type="checkbox" required />
                                    <span className="checkmark"></span>
                                    I agree to Terms & Conditions
                                </label>
                            </div>
                        )}

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Processing...' : (mode === 'signin' ? 'Log In' : 'Create Account')}
                        </button>
                    </form>

                    <div className="form-divider"><span>OR</span></div>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                        {mode === 'signin' ?
                            <p>Don't have an account? <a href="#" style={{ color: 'var(--primary-blue)', fontWeight: 600, textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); setMode('signup'); setError(''); }}>Sign Up</a></p> :
                            <p>Already have an account? <a href="#" style={{ color: 'var(--primary-blue)', fontWeight: 600, textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); setMode('signin'); setError(''); }}>Log In</a></p>
                        }
                    </div>
                </div>

                {/* RIGHT PANEL - Visual Section */}
                <div className="visual-section" style={{ overflow: 'hidden' }}>
                    <div className="tooth-outline" style={{
                        animation: 'pulse-glow 4s infinite ease-in-out'
                    }}></div>
                    <div className="visual-content">
                        <div className="visual-logo">
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '12px', display: 'flex' }}>
                                <img src="/favicon.svg" alt="Logo" style={{ width: '32px', height: '32px' }} />
                            </div>
                            <span>ImplantAI</span>
                        </div>
                        <div className="visual-text">
                            <h1>Precision Implant Planning with AI</h1>
                            <p>Track arch form. Identify nerve pathway. Measure safely. The future of dental imaging is here.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
