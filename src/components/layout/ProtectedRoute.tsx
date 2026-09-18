import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute: React.FC = () => {
  const token = localStorage.getItem('token');
  
  console.log('✓ ProtectedRoute check - Token:', token ? 'exists' : 'missing');

  if (!token) {
    console.log('→ Redirecting to /login (no token)');
    return <Navigate to="/login" replace />;
  }

  console.log('→ Rendering protected content');
  return <Outlet />;
};
