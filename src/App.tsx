import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import LandingPage from './components/LandingPage';
import JobList from './components/JobList';
import JobDetails from './components/JobDetails';
import MyApplications from './components/MyApplications';
import SavedJobs from './components/SavedJobs';
import Notifications from './components/Notifications';
import Profile from './components/Profile';
import Settings from './components/Settings';
import UserDashboard from './components/UserDashboard';
import EmployerDashboard from './components/EmployerDashboard';
import EmployerJobs from './components/EmployerJobs';
import CreateEditJob from './components/CreateEditJob';
import JobApplications from './components/JobApplications';
import JobAnalytics from './components/JobAnalytics';
import ScreeningQuestions from './components/ScreeningQuestions';
import ExportData from './components/ExportData';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import EmployerRoute from './components/EmployerRoute';
import AdminDashboard from './components/AdminDashboard';
import AdminJobs from './components/AdminJobs';
import AdminApplications from './components/AdminApplications';
import UserManagement from './components/UserManagement';
import AuditLogs from './components/AuditLogs';
import SearchAnalytics from './components/SearchAnalytics';
import useAuthStore from './stores/authStore';
import './App.css';

function App() {
  const { getCurrentUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Try to get current user on app load if token exists
    if (isAuthenticated()) {
      getCurrentUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetails />} />

          {/* Authenticated - User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <MyApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved-jobs"
            element={
              <ProtectedRoute>
                <SavedJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Employer Routes */}
          <Route
            path="/employer/dashboard"
            element={
              <EmployerRoute>
                <EmployerDashboard />
              </EmployerRoute>
            }
          />
          <Route
            path="/employer/jobs"
            element={
              <EmployerRoute>
                <EmployerJobs />
              </EmployerRoute>
            }
          />
          <Route
            path="/employer/jobs/new"
            element={
              <EmployerRoute>
                <CreateEditJob />
              </EmployerRoute>
            }
          />
          <Route
            path="/employer/jobs/:id/edit"
            element={
              <EmployerRoute>
                <CreateEditJob />
              </EmployerRoute>
            }
          />
          <Route
            path="/employer/jobs/:id/applications"
            element={
              <EmployerRoute>
                <JobApplications />
              </EmployerRoute>
            }
          />
          <Route
            path="/employer/jobs/:id/analytics"
            element={
              <EmployerRoute>
                <JobAnalytics />
              </EmployerRoute>
            }
          />
          <Route
            path="/employer/jobs/:id/screening"
            element={
              <EmployerRoute>
                <ScreeningQuestions />
              </EmployerRoute>
            }
          />
          <Route
            path="/employer/export"
            element={
              <EmployerRoute>
                <ExportData />
              </EmployerRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin-panel/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin-panel/users"
            element={
              <AdminRoute>
                <UserManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/admin-panel/audit"
            element={
              <AdminRoute>
                <AuditLogs />
              </AdminRoute>
            }
          />
          <Route
            path="/admin-panel/search"
            element={
              <AdminRoute>
                <SearchAnalytics />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/jobs"
            element={
              <AdminRoute>
                <AdminJobs />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/applications"
            element={
              <AdminRoute>
                <AdminApplications />
              </AdminRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
