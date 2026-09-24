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
import PreviewPage from './pages/PreviewPage.jsx'
import TestingDashboardPage from './pages/TestingDashboardPage.jsx'
import TestingSandboxPage from './pages/TestingSandboxPage.jsx'
import SetPasswordPage from './pages/SetPasswordPage.jsx'
import AdminTeamPage from './pages/AdminTeamPage.jsx'
import AdminExportsPage from './pages/AdminExportsPage.jsx'
import AdminFeedbackPage from './pages/AdminFeedbackPage.jsx'
import DemoPage from './pages/DemoPage.jsx'
import DemoSandboxPage from './pages/DemoSandboxPage.jsx'
import VariantPreviewPage from './pages/VariantPreviewPage.jsx'
import IRBPreviewPage from './pages/IRBPreviewPage.jsx'
import GainsDemoPage from './pages/GainsDemoPage.jsx'
import GainsTraversalPage from './pages/GainsTraversalPage.jsx'
import GainsClimbPage from './pages/GainsClimbPage.jsx'
import GainsFirstLightPage from './pages/GainsFirstLightPage.jsx'
import GainsZone1Page from './pages/GainsZone1Page.jsx'
import GainsZone2Page from './pages/GainsZone2Page.jsx'
import GainsZone3Page from './pages/GainsZone3Page.jsx'
import GainsZone4Page from './pages/GainsZone4Page.jsx'
import GainsPretestPage from './pages/GainsPretestPage.jsx'
import GainsPosttestPage from './pages/GainsPosttestPage.jsx'
import GainsVideosPage from './pages/GainsVideosPage.jsx'
import GainsBodyMapPage from './pages/GainsBodyMapPage.jsx'
import GainsMindfulPage from './pages/GainsMindfulPage.jsx'
import GainsGuardianPage from './pages/GainsGuardianPage.jsx'
import ResilientDemoPage from './pages/ResilientDemoPage.jsx'
import ResilientDesignSystemPage from './pages/ResilientDesignSystemPage.jsx'

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
        <Route
          path="exports"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminExportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="team"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminTeamPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="feedback"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminFeedbackPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="testing"
          element={
            <ProtectedRoute requiredRole="admin">
              <TestingDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="testing/:activityId"
          element={
            <ProtectedRoute requiredRole="admin">
              <TestingSandboxPage />
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
      <Route path="/set-password" element={<SetPasswordPage />} />
      {/* TEMP public demo. Remove these routes when no longer needed. */}
      <Route path="/demo" element={<DemoPage />} />
      <Route path="/demo/sandbox/:activityId" element={<DemoSandboxPage />} />
      {/* Sam-variant capability demo (Draft 67, ship-dark) — unlisted,
          shared by link. */}
      <Route path="/demo/variant-preview" element={<VariantPreviewPage />} />
      {/* IRB Review Preview (Draft 53) — unlisted linear walkthrough of the
          full participant flow. Not linked from nav or /demo. */}
      <Route path="/irb-preview" element={<IRBPreviewPage />} />
      {/* GAINS Teens demo — internal review surface for The Long Light,
          unlisted, shared by link (Draft 7 in Gains for Teens notes). */}
      <Route path="/gains-demo" element={<GainsDemoPage />} />
      <Route path="/gains-demo/traversal" element={<GainsTraversalPage />} />
      <Route path="/gains-demo/climb" element={<GainsClimbPage />} />
      <Route path="/gains-demo/firstlight" element={<GainsFirstLightPage />} />
      {/* Walkable-zone prototypes (GAINS Draft 68, Zone 3 added Draft 80). */}
      <Route path="/gains-demo/zone1" element={<GainsZone1Page />} />
      <Route path="/gains-demo/zone2" element={<GainsZone2Page />} />
      <Route path="/gains-demo/zone3" element={<GainsZone3Page />} />
      <Route path="/gains-demo/zone4" element={<GainsZone4Page />} />
      {/* Dedicated 9:16 pages for the review cards (GAINS Draft 71). */}
      <Route path="/gains-demo/pretest" element={<GainsPretestPage />} />
      <Route path="/gains-demo/posttest" element={<GainsPosttestPage />} />
      <Route path="/gains-demo/videos" element={<GainsVideosPage />} />
      <Route path="/gains-demo/bodymap" element={<GainsBodyMapPage />} />
      <Route path="/gains-demo/mindful" element={<GainsMindfulPage />} />
      <Route path="/gains-demo/guardian" element={<GainsGuardianPage />} />
      {/* Resilient Roots review hub + its dedicated pages (Resilient Roots Draft 1). */}
      <Route path="/resilient-demo" element={<ResilientDemoPage />} />
      <Route path="/resilient-demo/design-system" element={<ResilientDesignSystemPage />} />
      {/* The Plan now ships as the seventh activity (Draft 39). The
          /the-plan entry point (montage closer CTA) redirects into the
          sandbox-hosted activity. */}
      <Route path="/the-plan" element={<Navigate to="/demo/sandbox/plan" replace />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route
        path="/preview/:id"
        element={
          <AuthProvider>
            <ProtectedRoute requiredRole="admin">
              <PreviewPage />
            </ProtectedRoute>
          </AuthProvider>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
