import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Plus, Edit, Trash2, Eye, Users } from 'lucide-react'

const CompanyJobs = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  })

  useEffect(() => {
    fetchJobs()
  }, [filter, pagination.current])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.current,
        limit: 10
      })

      if (filter !== 'all') {
        params.append('status', filter)
      }

      const response = await axios.get(`/api/jobs/company/mine?${params}`)
      setJobs(response.data.jobs || [])
      setPagination(response.data.pagination || { current: 1, pages: 1, total: 0 })
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return

    try {
      await axios.delete(`/api/jobs/${jobId}`)
      fetchJobs() // Refresh the list
    } catch (error) {
      console.error('Error deleting job:', error)
      alert(error.response?.data?.message || 'Failed to delete job')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-red-100 text-red-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Job Postings</h1>
          
          <Link
            to="/company/jobs/new"
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Link>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value)
              setPagination(prev => ({ ...prev, current: 1 }))
            }}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Jobs</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job._id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-gray-600">{job.company}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Posted: {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {job.applicationCount || 0} applications
                    </div>
                    <div>
                      Deadline: {new Date(job.deadline).toLocaleDateString()}
                    </div>
                    <div>
                      {job.location}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/jobs/${job._id}`}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Link>
                    
                    <Link
                      to={`/company/jobs/${job._id}/edit`}
                      className="flex items-center text-green-600 hover:text-green-800"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Link>

                    <Link
                      to={`/company/jobs/${job._id}/applications`}
                      className="flex items-center text-purple-600 hover:text-purple-800"
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Applications
                    </Link>
                    
                    <button
                      onClick={() => handleDelete(job._id)}
                      className="flex items-center text-red-600 hover:text-red-800"
                      disabled={job.applicationCount > 0}
                      title={job.applicationCount > 0 ? 'Cannot delete job with applications' : 'Delete job'}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Job Postings</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't posted any jobs yet." 
                : `No jobs with status "${filter}".`}
            </p>
            <Link
              to="/company/jobs/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
            >
              Post Your First Job
            </Link>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center space-x-2 mt-8">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setPagination(prev => ({ ...prev, current: page }))}
                className={`px-4 py-2 rounded-md ${
                  page === pagination.current
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CompanyJobs