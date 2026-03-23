import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { List } from '@phosphor-icons/react';
import Sidebar from '../components/Sidebar';
import '../styles/dashboard.css';

export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="dashboard-layout">
            {/* Mobile Header Toggle */}
            <button
                className="mobile-nav-toggle"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                <List size={24} weight="bold" />
            </button>

            {/* Overlay for mobile when sidebar is open */}
            {isSidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
