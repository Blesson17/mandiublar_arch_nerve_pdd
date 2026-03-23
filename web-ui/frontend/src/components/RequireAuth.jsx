import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authStore } from '../services/authStore';

const RequireAuth = () => {
    // Read token directly
    const token = authStore.getToken();
    const location = useLocation();

    // If no token, redirect to login
    if (!token) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // If token exists, render the child routes (Dashboard, etc.)
    return <Outlet />;
};

export default RequireAuth;
