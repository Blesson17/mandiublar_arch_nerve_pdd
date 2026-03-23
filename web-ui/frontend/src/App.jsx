import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Upload from './pages/Upload';
import Analysis from './pages/Analysis';
import SettingsLayout from './pages/settings/Layout';
import Appearance from './pages/settings/Appearance';
import Profile from './pages/settings/Profile';
import Billing from './pages/settings/Billing';
import Integrations from './pages/settings/Integrations';
import Notifications from './pages/settings/Notifications';
import Help from './pages/settings/Help';
import About from './pages/settings/About';
import Team from './pages/settings/Team';
import Language from './pages/settings/Language';
import Privacy from './pages/settings/Privacy';
import Reports from './pages/Reports';
import PageTransition from './components/PageTransition';
import RequireAuth from './components/RequireAuth';

const Placeholder = ({ title }) => (
    <PageTransition>
        <div className="page-header"><h1>{title}</h1><p>Coming Soon</p></div>
    </PageTransition>
);

function App() {
    // Initialize Theme
    React.useEffect(() => {
        const theme = localStorage.getItem('implantAI_theme');
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else if (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-mode');
        }
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={
                    <PageTransition>
                        <Login />
                    </PageTransition>
                } />

                <Route element={<RequireAuth />}>
                    <Route element={<DashboardLayout />}>
                        <Route path="/dashboard" element={
                            <PageTransition>
                                <Dashboard />
                            </PageTransition>
                        } />
                        <Route path="/upload" element={
                            <PageTransition>
                                <Upload />
                            </PageTransition>
                        } />
                        <Route path="/analysis" element={
                            <PageTransition>
                                <Analysis />
                            </PageTransition>
                        } />
                        <Route path="/reports" element={
                            <PageTransition>
                                <Reports />
                            </PageTransition>
                        } />
                        <Route path="/report" element={
                            <PageTransition>
                                <Reports />
                            </PageTransition>
                        } />

                        <Route path="/settings" element={<SettingsLayout />}>
                            <Route index element={<Navigate to="profile" replace />} />
                            <Route path="account" element={<Placeholder title="Account Settings" />} />
                            <Route path="profile" element={<Profile />} />
                            <Route path="users" element={<Navigate to="team" replace />} />
                            <Route path="team" element={<Team />} />
                            <Route path="notifications" element={<Notifications />} />
                            <Route path="privacy" element={<Privacy />} />
                            <Route path="integrations" element={<Integrations />} />
                            <Route path="billing" element={<Billing />} />
                            <Route path="appearance" element={
                                <PageTransition>
                                    <Appearance />
                                </PageTransition>
                            } />
                            <Route path="language" element={<Language />} />
                            <Route path="help" element={<Help />} />
                            <Route path="about" element={<About />} />
                            <Route path="delete-account" element={<Placeholder title="Delete Account" />} />
                        </Route>
                    </Route>
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
