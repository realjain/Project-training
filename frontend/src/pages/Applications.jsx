import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { FileText, MapPin, Calendar, ExternalLink } from 'lucide-react'

const Applications = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  })

  useEffect(() => {
    fetchApplications()
  }, [filter, pagination.current])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.current,
        limit: 10
      })

      if (filter !== 'all') {
        params.append('status', filter)
      }

      const response = await axios.get(`/api/applications/me?${params}`)
      setApplications(response.data.applications || [])
      setPagination(response.data.pagination || { current: 1, pages: 1, total: 0 })
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800'
      case 'shortlisted':
        return 'bg-yellow-100 text-yellow-800'
      case 'interview':
        return 'bg-purple-100 text-purple-800'
      case 'offered':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }))
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          </div>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value)
              setPagination(prev => ({ ...prev, current: 1 }))
            }}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Applications</option>
            <option value="applied">Applied</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview">Interview</option>
            <option value="offered">Offered</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((application) => (
              <div key={application._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      <Link 
                        to={`/jobs/${application.jobId._id}`}
                        className="hover:text-blue-600 flex items-center"
                      >
                        {application.jobId.title}
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </Link>
                    </h3>
                    <p className="text-gray-600 font-medium">{application.jobId.company}</p>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.stage)}`}>
                    {application.stage.charAt(0).toUpperCase() + application.stage.slice(1)}
                  </span>
                </div>

                <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {application.jobId.location}
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Applied: {new Date(application.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Deadline: {new Date(application.jobId.deadline).toLocaleDateString()}
                  </div>
                </div>

                {/* Cover Letter Preview */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                  <p className="text-gray-700 text-sm line-clamp-3">
                    {application.coverLetter}
                  </p>
                </div>

                {/* Scores (if available) */}
                {(application.scores?.aptitude || application.scores?.technical || application.scores?.communication) && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Evaluation Scores</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {application.scores.aptitude && (
                        <div>
                          <span className="text-gray-600">Aptitude:</span>
                          <span className="ml-2 font-medium">{application.scores.aptitude}/100</span>
                        </div>
                      )}
                      {application.scores.technical && (
                        <div>
                          <span className="text-gray-600">Technical:</span>
                          <span className="ml-2 font-medium">{application.scores.technical}/100</span>
                        </div>
                      )}
                      {application.scores.communication && (
                        <div>
                          <span className="text-gray-600">Communication:</span>
                          <span className="ml-2 font-medium">{application.scores.communication}/100</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Interview Schedule (if available) */}
                {application.interviewSchedule?.date && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Interview Schedule</h4>
                    <div className="text-sm text-gray-700">
                      <p><strong>Date:</strong> {new Date(application.interviewSchedule.date).toLocaleDateString()}</p>
                      {application.interviewSchedule.time && (
                        <p><strong>Time:</strong> {application.interviewSchedule.time}</p>
                      )}
                      {application.interviewSchedule.location && (
                        <p><strong>Location:</strong> {application.interviewSchedule.location}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Recent Notes */}
                {application.reviewerNotes?.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Latest Feedback</h4>
                    <div className="text-sm text-gray-700">
                      {application.reviewerNotes.slice(-1).map((note, index) => (
                        <div key={index} className="bg-blue-50 p-3 rounded">
                          <p>{note.note}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't applied to any jobs yet." 
                : `No applications with status "${filter}".`}
            </p>
            <Link
              to="/jobs"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
            >
              Browse Jobs
            </Link>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center space-x-2 mt-8">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
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

export default Applications