import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
    User,
    HardDrive,
    Bell,
    ShieldCheck,
    Users,
    Plugs,
    CreditCard,
    Palette,
    Globe,
    Question,
    Info,
    Trash
} from '@phosphor-icons/react';
import '../../styles/settings.css';

export default function SettingsLayout() {
    return (
        <>
            <div className="page-header">
                <h1>Settings</h1>
            </div>

            <div className="settings-container">
                {/* Settings Sidebar */}
                <div className="settings-sidebar">

                    <div>
                        <div className="settings-group-title">Account</div>
                        <NavLink to="profile" className={({ isActive }) => `settings-nav-item ${isActive ? 'active' : ''}`}>
                            <User size={18} /> My Profile
                        </NavLink>
                        <NavLink to="account" className={({ isActive }) => `settings-nav-item ${isActive ? 'active' : ''}`}>
                            <HardDrive size={18} /> Account Settings
                        </NavLink>
                        <NavLink to="notifications" className={({ isActive }) => `settings-nav-item ${isActive ? 'active' : ''}`}>
                            <Bell size={18} /> Notifications
                        </NavLink>
                        <NavLink to="privacy" className={({ isActive }) => `settings-nav-item ${isActive ? 'active' : ''}`}>
                            <ShieldCheck size={18} /> Privacy & Security
                        </NavLink>
                    </div>

                    <div>
                        <div className="settings-group-title">Workspace</div>
                        <NavLink to="team" className={({ isActive }) => `settings-nav-item ${isActive ? 'active' : ''}`}>
                            <Users size={18} /> Team Members
                        </NavLink>
                        <NavLink to="integrations" className={({ isActive }) => `settings-nav-item ${isActive ? 'active' : ''}`}>
                            <Plugs size={18} /> Integrations
                        </NavLink>
                        <NavLink to="billing" className={({ isActive }) => `settings-nav-item ${isActive ? 'active' : ''}`}>
                            <CreditCard size={18} /> Billing & Plans
                        </NavLink>
                    </div>

                    <div>
                        <div className="settings-group-title">Preferences</div>
                        <NavLink to="appearance" className={({ isActive }) => `settings-nav-item ${isActive ? 'active' : ''}`}>
                            <Palette size={18} /> Appearance
                        </NavLink>
                        <NavLink to="language" className={({ isActive }) => `settings-nav-item ${isActive ? 'active' : ''}`}>
                            <Globe size={18} /> Language & Region
                        </NavLink>
                    </div>

                    <div>
                        <div className="settings-group-title">Support</div>
                        <NavLink to="help" className={({ isActive }) => `settings-nav-item ${isActive ? 'active' : ''}`}>
                            <Question size={18} /> Help & Support
                        </NavLink>
                        <NavLink to="about" className={({ isActive }) => `settings-nav-item ${isActive ? 'active' : ''}`}>
                            <Info size={18} /> About
                        </NavLink>
                    </div>

                    <div>
                        <div className="settings-group-title">Danger Zone</div>
                        <NavLink to="delete-account" className="settings-nav-item delete-account">
                            <Trash size={18} /> Delete Account
                        </NavLink>
                    </div>

                </div>

                {/* Settings Content */}
                <div className="settings-content">
                    <Outlet />
                </div>
            </div>
        </>
    );
}
