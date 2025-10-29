import { useAuth } from '../contexts/AuthContext'
import StudentDashboard from '../components/dashboards/StudentDashboard'
import CompanyDashboard from '../components/dashboards/CompanyDashboard'
import AdminDashboard from '../components/dashboards/AdminDashboard'

const Dashboard = () => {
  const { user } = useAuth()

  const renderDashboard = () => {
    switch (user?.role) {
      case 'student':
        return <StudentDashboard />
      case 'company':
        return <CompanyDashboard />
      case 'admin':
        return <AdminDashboard />
      default:
        return <div>Invalid role</div>
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)} Dashboard
        </p>
      </div>
      
      {renderDashboard()}
    </div>
  )
}

export default Dashboard