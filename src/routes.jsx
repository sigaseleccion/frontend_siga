import { Routes, Route } from 'react-router-dom'

// Auth pages
import LoginPage from './features/auth/pages/LoginPage'
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage'

// Dashboard
import Dashboard from './features/dashboard/pages/Dashboard'

// Convocatorias
import ConvocatoriasPage from './features/Convocatorias/pages/ConvocatoriasPage'
import ConvocatoriaDetailPage from './features/Convocatorias/pages/ConvocatoriaDetailPage'

// Seleccion
import SeleccionPage from './features/Seleccion/pages/SeleccionPage'
import SeleccionConvocatoriaPage from './features/Seleccion/pages/SeleccionConvocatoriaPage'
import AprendizDetailPage from './features/Seleccion/pages/AprendizDetailPage'
import AprendizEditPage from './features/Seleccion/pages/AprendizEditPage'
import ReporteTecnicoPage from './features/Seleccion/pages/ReporteTecnicoPage'
import HistoricoConvocatoriasPage from './features/Seleccion/pages/HistoricoConvocatoriasPage'
import HistoricoConvocatoriaDetailPage from './features/Seleccion/pages/HistoricoConvocatoriaDetailPage'
import HistoricoAprendizDetailPage from './features/Seleccion/pages/HistoricoAprendizDetailPage'

// Seguimiento
import SeguimientoPage from './features/Seguimiento/pages/SeguimientoPage'
import HistoricoAprendicesPage from './features/Seguimiento/pages/HistoricoAprendicesPage'

// Roles
import RolesPage from './features/Roles/pages/RolesPage'

// Usuarios
import UsuariosPage from './features/Usuarios/pages/UsuariosPage'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/recuperar" element={<ForgotPasswordPage />} />
      
      {/* Main routes */}
      <Route path="/" element={<Dashboard />} />
      
      {/* Convocatorias */}
      <Route path="/convocatorias" element={<ConvocatoriasPage />} />
      <Route path="/convocatorias/:id" element={<ConvocatoriaDetailPage />} />
      
      {/* Seleccion */}
      <Route path="/seleccion" element={<SeleccionPage />} />
      <Route path="/seleccion/historico" element={<HistoricoConvocatoriasPage />} />
      <Route path="/seleccion/historico/:id" element={<HistoricoConvocatoriaDetailPage />} />
      <Route path="/seleccion/historico/:id/aprendiz/:aprendizId" element={<HistoricoAprendizDetailPage />} />
      <Route path="/seleccion/:id" element={<SeleccionConvocatoriaPage />} />
      <Route path="/seleccion/:id/aprendiz/:aprendizId" element={<AprendizDetailPage />} />
      <Route path="/seleccion/:id/aprendiz/:aprendizId/editar" element={<AprendizEditPage />} />
      <Route path="/seleccion/:id/reporte-tecnico" element={<ReporteTecnicoPage />} />
      
      {/* Seguimiento */}
      <Route path="/seguimiento" element={<SeguimientoPage />} />
      <Route path="/seguimiento/historico" element={<HistoricoAprendicesPage />} />
      
      {/* Roles */}
      <Route path="/roles" element={<RolesPage />} />
      
      {/* Usuarios */}
      <Route path="/usuarios" element={<UsuariosPage />} />
    </Routes>
  )
}
