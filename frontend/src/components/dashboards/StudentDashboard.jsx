import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Briefcase, FileText, User, CheckCircle } from 'lucide-react'

const StudentDashboard = () => {
  const [stats, setStats] = useState({
    applications: 0,
    interviews: 0,
    offers: 0
  })
  const [recentApplications, setRecentApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [applicationsRes] = await Promise.all([
        axios.get('/api/applications/me?limit=5')
      ])

      const applications = applicationsRes.data.applications || []
      setRecentApplications(applications)

      // Calculate stats
      setStats({
        applications: applications.length,
        interviews: applications.filter(app => app.stage === 'interview').length,
        offers: applications.filter(app => app.stage === 'offered').length
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.applications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <User className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Interviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.interviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Offers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.offers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            to="/jobs"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <Briefcase className="w-6 h-6 text-blue-600 mr-3" />
            <span className="font-medium">Browse Jobs</span>
          </Link>
          
          <Link
            to="/profile"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <User className="w-6 h-6 text-green-600 mr-3" />
            <span className="font-medium">Update Profile</span>
          </Link>
          
          <Link
            to="/applications"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <FileText className="w-6 h-6 text-purple-600 mr-3" />
            <span className="font-medium">My Applications</span>
          </Link>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Applications</h2>
        {recentApplications.length > 0 ? (
          <div className="space-y-4">
            {recentApplications.map((application) => (
              <div key={application._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium">{application.jobId?.title}</h3>
                  <p className="text-sm text-gray-600">{application.jobId?.company}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    application.stage === 'applied' ? 'bg-blue-100 text-blue-800' :
                    application.stage === 'shortlisted' ? 'bg-yellow-100 text-yellow-800' :
                    application.stage === 'interview' ? 'bg-purple-100 text-purple-800' :
                    application.stage === 'offered' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {application.stage.charAt(0).toUpperCase() + application.stage.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No applications yet. Start by browsing available jobs!</p>
        )}
      </div>
    </div>
  )
}

export default StudentDashboard