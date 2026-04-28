import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import CodeEntryPage from './pages/CodeEntryPage.jsx'
import DeliveryShellPage from './pages/DeliveryShellPage.jsx'
import DeliveryStepPage from './pages/DeliveryStepPage.jsx'

import AdminLoginPage from './pages/AdminLoginPage.jsx'
import ResearcherDashboardPage from './pages/ResearcherDashboardPage.jsx'
import InterventionListPage from './pages/InterventionListPage.jsx'
import BuilderPage from './pages/BuilderPage.jsx'
import AccessCodeManagementPage from './pages/AccessCodeManagementPage.jsx'

function AdminRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route index element={<AdminLoginPage />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute requiredRole="researcher">
              <ResearcherDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="interventions"
          element={
            <ProtectedRoute requiredRole="admin">
              <InterventionListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="interventions/:id"
          element={
            <ProtectedRoute requiredRole="admin">
              <BuilderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="codes"
          element={
            <ProtectedRoute requiredRole="researcher">
              <AccessCodeManagementPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CodeEntryPage />} />
      <Route path="/session/:sessionId" element={<DeliveryShellPage />}>
        <Route index element={null} />
        <Route path="step" element={<DeliveryStepPage />} />
      </Route>
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
