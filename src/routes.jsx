import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./shared/components/auth/ProtectedRoute";

// Auth pages
import LoginPage from "./features/auth/pages/LoginPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import VerificarCodigoPage from "./features/auth/pages/VerifyCodePage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";
import Error403 from "./features/auth/pages/403";

// Dashboard
import Dashboard from "./features/dashboard/pages/Dashboard";

// Convocatorias
import ConvocatoriasPage from "./features/Convocatorias/pages/ConvocatoriasPage";
import ConvocatoriaDetailPage from "./features/Convocatorias/pages/ConvocatoriaDetailPage";

// Seleccion
import SeleccionPage from "./features/Seleccion/pages/SeleccionPage";
import SeleccionConvocatoriaPage from "./features/Seleccion/pages/SeleccionConvocatoriaPage";
import AprendizDetailPage from "./features/Seleccion/pages/AprendizDetailPage";
import AprendizEditPage from "./features/Seleccion/pages/AprendizEditPage";
import ReporteTecnicoPage from "./features/Seleccion/pages/ReporteTecnicoPage";
import HistoricoConvocatoriasPage from "./features/Seleccion/pages/HistoricoConvocatoriasPage";
import HistoricoConvocatoriaDetailPage from "./features/Seleccion/pages/HistoricoConvocatoriaDetailPage";
import HistoricoAprendizDetailPage from "./features/Seleccion/pages/HistoricoAprendizDetailPage";

// Seguimiento
import SeguimientoPage from "./features/seguimiento/pages/SeguimientoPage";
import HistoricoAprendicesPage from "./features/Seguimiento/pages/HistoricoAprendicesPage";

// Roles
import RolesPage from "./features/Roles/pages/RolesPage";
import CreateRol from "./features/Roles/components/CreateRole";
import EditRol from "./features/Roles/components/EditRole";

// Usuarios
import UsuariosPage from "./features/Usuarios/pages/UsuariosPage";




export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/recuperar" element={<ForgotPasswordPage />} />
      <Route path="/login/verificar-codigo" element={<VerificarCodigoPage />} />
      <Route path="/login/restablecer-contrasena" element={<ResetPasswordPage />} />
      <Route path="/403" element={<Error403 />} />

      {/* Main routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute modulo="dashboard" accion="ver">
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Convocatorias */}
      <Route
        path="/convocatorias"
        element={
          <ProtectedRoute modulo="convocatorias" accion="ver">
            <ConvocatoriasPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/convocatorias/:id"
        element={
          <ProtectedRoute modulo="convocatorias" accion="editar">
            <ConvocatoriaDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Seleccion */}
      <Route
        path="/seleccion"
        element={
          <ProtectedRoute modulo="seleccion" accion="ver">
            <SeleccionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seleccion/historico"
        element={
          <ProtectedRoute modulo="seleccion" accion="ver">
            <HistoricoConvocatoriasPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seleccion/historico/:id"
        element={
          <ProtectedRoute modulo="seleccion" accion="ver">
            <HistoricoConvocatoriaDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seleccion/historico/:id/aprendiz/:aprendizId"
        element={
          <ProtectedRoute modulo="seleccion" accion="ver">
            <HistoricoAprendizDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seleccion/:id"
        element={
          <ProtectedRoute modulo="seleccion" accion="ver">
            <SeleccionConvocatoriaPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seleccion/:id/aprendiz/:aprendizId"
        element={
          <ProtectedRoute modulo="seleccion" accion="ver">
            <AprendizDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seleccion/:id/aprendiz/:aprendizId/editar"
        element={
          <ProtectedRoute modulo="seleccion" accion="editar">
            <AprendizEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seleccion/:id/reporte-tecnico"
        element={
          <ProtectedRoute modulo="seleccion" accion="gestionReporteTecnico">
            <ReporteTecnicoPage />
          </ProtectedRoute>
        }
      />

      {/* Seguimiento */}
      <Route
        path="/seguimiento"
        element={
          <ProtectedRoute modulo="seguimiento" accion="ver">
            <SeguimientoPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seguimiento/historico"
        element={
          <ProtectedRoute modulo="seguimiento" accion="ver">
            <HistoricoAprendicesPage />
          </ProtectedRoute>
        }
      />

      {/* Roles */}
      <Route
        path="/roles"
        element={
          <ProtectedRoute modulo="roles" accion="ver">
            <RolesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roles/crear"
        element={
          <ProtectedRoute modulo="roles" accion="crear">
            <CreateRol />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roles/editar/:id"
        element={
          <ProtectedRoute modulo="roles" accion="editar">
            <EditRol />
          </ProtectedRoute>
        }
      />

      {/* Usuarios */}
      <Route
        path="/usuarios"
        element={
          <ProtectedRoute modulo="usuarios" accion="ver">
            <UsuariosPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
