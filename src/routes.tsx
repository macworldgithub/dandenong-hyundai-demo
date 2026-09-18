import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './features/auth/LoginPage';
import { CommandCentre } from './features/dashboard/CommandCentre';
import { BankPage } from './features/bank/BankPage';
import { ApPage } from './features/ap/ApPage';
import { InventoryPage } from './features/inventory/InventoryPage';
import { GlPage } from './features/gl/GlPage';
import { AuditLogPage } from './features/audit/AuditLogPage';

export const AppRoutes: React.FC = () => {
  console.log('✓ AppRoutes rendering');
  
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Rooftop Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<CommandCentre />} />
          <Route path="/bank" element={<BankPage />} />
          <Route path="/ap" element={<ApPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/gl" element={<GlPage />} />
          <Route path="/audit" element={<AuditLogPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
