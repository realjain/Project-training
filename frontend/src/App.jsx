import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import Profile from './pages/Profile'
import Applications from './pages/Applications'
import CompanyJobs from './pages/CompanyJobs'
import JobForm from './pages/JobForm'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:id" element={<JobDetail />} />

          <Route path="dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="applications" element={
            <ProtectedRoute>
              <Applications />
            </ProtectedRoute>
          } />

          {/* Company Routes */}
          <Route path="company/jobs" element={
            <ProtectedRoute roles={['company']}>
              <CompanyJobs />
            </ProtectedRoute>
          } />

          <Route path="company/jobs/new" element={
            <ProtectedRoute roles={['company']}>
              <JobForm />
            </ProtectedRoute>
          } />

          <Route path="company/jobs/:id/edit" element={
            <ProtectedRoute roles={['company']}>
              <JobForm />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App