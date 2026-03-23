import React, { useState, useEffect } from 'react';
import { Sun, Moon, Desktop, Check } from '@phosphor-icons/react';

export default function Appearance() {
    const [theme, setTheme] = useState(localStorage.getItem('implantAI_theme') || 'light');
    const [accent, setAccent] = useState(localStorage.getItem('implantAI_accent') || '#2563EB');
    const [compact, setCompact] = useState(localStorage.getItem('implantAI_compact') === 'true');
    const [tooltips, setTooltips] = useState(localStorage.getItem('implantAI_tooltips') !== 'false');
    const [animations, setAnimations] = useState(localStorage.getItem('implantAI_animations') !== 'false');

    useEffect(() => {
        localStorage.setItem('implantAI_theme', theme);
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
            if (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.body.classList.add('dark-mode');
            }
        }
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('implantAI_accent', accent);
        document.documentElement.style.setProperty('--primary-blue', accent);
    }, [accent]);

    const toggle = (key, val, setVal) => {
        const newVal = !val;
        setVal(newVal);
        localStorage.setItem(key, newVal);
    };

    return (
        <div className="settings-card">
            <h3 className="card-title">Theme</h3>
            <div className="theme-grid">
                <div className={`theme-card ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>
                    <div className="theme-preview light"><Sun weight="fill" /></div>
                    <div className="theme-label">Light</div>
                </div>
                <div className={`theme-card ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>
                    <div className="theme-preview dark"><Moon weight="fill" /></div>
                    <div className="theme-label">Dark</div>
                </div>
                <div className={`theme-card ${theme === 'system' ? 'active' : ''}`} onClick={() => setTheme('system')}>
                    <div className="theme-preview system"><Desktop weight="bold" /></div>
                    <div className="theme-label">System</div>
                </div>
            </div>

            <h3 className="card-title" style={{ marginTop: '2rem' }}>Accent Color</h3>
            <div className="color-row">
                {['#2563EB', '#7C3AED', '#059669', '#DC2626', '#EA580C', '#0891B2'].map(color => (
                    <div
                        key={color}
                        className={`color-dot ${accent === color ? 'active' : ''}`}
                        style={{ background: color }}
                        onClick={() => setAccent(color)}
                    ></div>
                ))}
            </div>

            <h3 className="card-title" style={{ marginTop: '2rem' }}>Display</h3>

            <div className="toggle-row">
                <div className="toggle-info">
                    <h5>Compact Mode</h5>
                    <p>Reduce spacing for more content</p>
                </div>
                <div className="check-box-wrapper" onClick={() => toggle('implantAI_compact', compact, setCompact)}>
                    <div className={`custom-check ${compact ? 'checked' : ''}`}>
                        <Check weight="bold" />
                    </div>
                </div>
            </div>

            <div className="toggle-row">
                <div className="toggle-info">
                    <h5>Show Tooltips</h5>
                    <p>Display helpful hints on hover</p>
                </div>
                <div className="check-box-wrapper" onClick={() => toggle('implantAI_tooltips', tooltips, setTooltips)}>
                    <div className={`custom-check ${tooltips ? 'checked' : ''}`}>
                        <Check weight="bold" />
                    </div>
                </div>
            </div>

            <div className="toggle-row">
                <div className="toggle-info">
                    <h5>Animations</h5>
                    <p>Enable UI animations</p>
                </div>
                <div className="check-box-wrapper" onClick={() => toggle('implantAI_animations', animations, setAnimations)}>
                    <div className={`custom-check ${animations ? 'checked' : ''}`}>
                        <Check weight="bold" />
                    </div>
                </div>
            </div>

        </div>
    );
}
