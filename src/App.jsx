import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import ProtectedRoute from './layouts/ProtectedRoute'
import DashboardPage from './pages/DashboardPage'
import AuthorityDashboardPage from './pages/AuthorityDashboardPage'
import IssueDetailsPage from './pages/IssueDetailsPage'
import NotificationsPage from './pages/NotificationsPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import ReportIssuePage from './pages/ReportIssuePage'
import SignupPage from './pages/SignupPage'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <>
      <Toaster />
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/home" element={<DashboardPage />} />
        <Route path="/issues/new" element={<ReportIssuePage />} />
        <Route path="/issues/:issueId" element={<IssueDetailsPage />} />
        <Route path="/authority" element={<AuthorityDashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}

export default App
