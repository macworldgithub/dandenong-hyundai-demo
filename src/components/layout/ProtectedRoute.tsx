import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { clearStoredSession, getStoredToken, isTokenExpired } from "../../lib/authSession";

export const ProtectedRoute: React.FC = () => {
  const token = getStoredToken();

  console.log("✓ ProtectedRoute check - Token:", token ? "exists" : "missing");

  if (!token) {
    console.log("→ Redirecting to /login (no token)");
    return <Navigate to="/login" replace />;
  }

  if (isTokenExpired(token)) {
    clearStoredSession();
    console.log("→ Redirecting to /login (expired token)");
    return <Navigate to="/login" replace />;
  }

  console.log("→ Rendering protected content");
  return <Outlet />;
};
