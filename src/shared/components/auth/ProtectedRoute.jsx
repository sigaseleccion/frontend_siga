"use client";

import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/auth/AuthContext";
import { tienePermiso } from "../../utils/auth/permissions";
import Layout from "../Layout";
import { HeaderProvider } from "../../contexts/HeaderContext";
import { isTokenExpired } from "../../utils/auth/isTokenExpired";

export default function ProtectedRoute({ children, modulo, accion }) {
  const { auth, loading } = useAuth();

  if (loading) return null;

  if (!auth?.token || isTokenExpired(auth.token)) {
    return <Navigate to="/login" replace />;
  }

  if (modulo && accion) {
    const autorizado = tienePermiso(auth, modulo, accion);
    if (!autorizado) {
      return <Navigate to="/403" />;
    }
  }

  return (
    <HeaderProvider>
      <Layout>{children}</Layout>
    </HeaderProvider>
  );
}
