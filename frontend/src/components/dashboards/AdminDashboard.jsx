import { useState, useEffect } from 'react'
import axios from 'axios'
import { Users, Briefcase, TrendingUp, Settings } from 'lucide-react'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    placementRate: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // In a real app, you'd have admin-specific endpoints
      const [usersRes, jobsRes] = await Promise.all([
        axios.get('/api/admin/stats/users'),
        axios.get('/api/admin/stats/jobs')
      ])
      
      setStats({
        totalUsers: usersRes.data.total || 0,
        totalJobs: jobsRes.data.total || 0,
        totalApplications: jobsRes.data.applications || 0,
        placementRate: jobsRes.data.placementRate || 0
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set mock data for demo
      setStats({
        totalUsers: 150,
        totalJobs: 25,
        totalApplications: 300,
        placementRate: 75
      })
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
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Briefcase className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Settings className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Placement Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.placementRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Management Sections */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <div className="space-y-3">
            <Link
              to="/admin/students"
              className="block w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              Manage Students
            </Link>
            <Link
              to="/admin/companies"
              className="block w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              Manage Companies
            </Link>
            <Link
              to="/admin/jobs"
              className="block w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              Manage Job Postings
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">System Management</h2>
          <div className="space-y-3">
            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              Manage Departments
            </button>
            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              Manage Skills
            </button>
            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              System Settings
            </button>
          </div>
        </div>
      </div>

      {/* Analytics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Placement Analytics</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">85%</p>
            <p className="text-sm text-gray-600">Students with Complete Profiles</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">92%</p>
            <p className="text-sm text-gray-600">Application Response Rate</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">68%</p>
            <p className="text-sm text-gray-600">Interview Conversion Rate</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard