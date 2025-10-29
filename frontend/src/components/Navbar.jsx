import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User, Briefcase, FileText } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            Placement Portal
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/jobs" className="text-gray-700 hover:text-blue-600 flex items-center">
              <Briefcase className="w-4 h-4 mr-1" />
              Jobs
            </Link>

            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
                
                {user.role === 'student' && (
                  <>
                    <Link to="/profile" className="text-gray-700 hover:text-blue-600 flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      Profile
                    </Link>
                    <Link to="/applications" className="text-gray-700 hover:text-blue-600 flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      Applications
                    </Link>
                  </>
                )}

                {user.role === 'company' && (
                  <Link to="/company/jobs" className="text-gray-700 hover:text-blue-600 flex items-center">
                    <Briefcase className="w-4 h-4 mr-1" />
                    My Jobs
                  </Link>
                )}

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {user.name} ({user.role})
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-600 flex items-center"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar