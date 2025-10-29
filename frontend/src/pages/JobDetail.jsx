import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { MapPin, Clock, DollarSign, Users, Calendar } from 'lucide-react'

const JobDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [application, setApplication] = useState({
    coverLetter: '',
    resumeUrl: ''
  })

  useEffect(() => {
    fetchJob()
    if (user?.role === 'student') {
      checkApplicationStatus()
    }
  }, [id, user])

  const fetchJob = async () => {
    try {
      const response = await axios.get(`/api/jobs/${id}`)
      setJob(response.data)
    } catch (error) {
      console.error('Error fetching job:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkApplicationStatus = async () => {
    try {
      const response = await axios.get('/api/applications/me')
      const existingApplication = response.data.applications?.find(
        app => app.jobId._id === id
      )
      setHasApplied(!!existingApplication)
    } catch (error) {
      console.error('Error checking application status:', error)
    }
  }

  const handleApply = async (e) => {
    e.preventDefault()
    
    if (!user) {
      navigate('/login')
      return
    }

    if (user.role !== 'student') {
      alert('Only students can apply for jobs')
      return
    }

    try {
      setApplying(true)
      await axios.post('/api/applications', {
        jobId: id,
        coverLetter: application.coverLetter,
        resumeUrl: application.resumeUrl
      })
      
      setHasApplied(true)
      alert('Application submitted successfully!')
    } catch (error) {
      console.error('Error applying:', error)
      alert(error.response?.data?.message || 'Failed to submit application')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-600 text-lg">Job not found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Job Header */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
            <p className="text-xl text-gray-600 font-medium">
              {job.company || job.companyId?.companyName}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            job.jobType === 'internship' ? 'bg-blue-100 text-blue-800' :
            job.jobType === 'full-time' ? 'bg-green-100 text-green-800' :
            'bg-purple-100 text-purple-800'
          }`}>
            {job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1).replace('-', ' ')}
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="flex items-center text-gray-600">
            <MapPin className="w-5 h-5 mr-2" />
            <span>{job.location}{job.isRemote && ' (Remote)'}</span>
          </div>
          
          {(job.salary || job.stipend) && (
            <div className="flex items-center text-gray-600">
              <DollarSign className="w-5 h-5 mr-2" />
              <span>
                {job.salary ? `$${job.salary.toLocaleString()}/year` : `$${job.stipend}/month`}
              </span>
            </div>
          )}
          
          <div className="flex items-center text-gray-600">
            <Calendar className="w-5 h-5 mr-2" />
            <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {job.skills.map((skill, index) => (
            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Job Description */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold mb-4">Job Description</h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
        </div>
      </div>

      {/* Eligibility */}
      {job.eligibility && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-4">Eligibility Criteria</h2>
          <div className="space-y-2">
            {job.eligibility.minCgpa && (
              <p className="text-gray-700">
                <strong>Minimum CGPA:</strong> {job.eligibility.minCgpa}
              </p>
            )}
            {job.eligibility.graduationYear?.length > 0 && (
              <p className="text-gray-700">
                <strong>Graduation Year:</strong> {job.eligibility.graduationYear.join(', ')}
              </p>
            )}
            {job.eligibility.departments?.length > 0 && (
              <p className="text-gray-700">
                <strong>Departments:</strong> {job.eligibility.departments.join(', ')}
              </p>
            )}
            {job.eligibility.verificationRequired && (
              <p className="text-yellow-700 bg-yellow-50 p-3 rounded">
                <strong>Note:</strong> Verified profile required to apply
              </p>
            )}
          </div>
        </div>
      )}

      {/* Application Form */}
      {user?.role === 'student' && !hasApplied && new Date(job.deadline) > new Date() && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-4">Apply for this Position</h2>
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter *
              </label>
              <textarea
                required
                rows={6}
                value={application.coverLetter}
                onChange={(e) => setApplication(prev => ({ ...prev, coverLetter: e.target.value }))}
                placeholder="Tell us why you're interested in this position..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume URL (optional)
              </label>
              <input
                type="url"
                value={application.resumeUrl}
                onChange={(e) => setApplication(prev => ({ ...prev, resumeUrl: e.target.value }))}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={applying}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {applying ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      )}

      {/* Application Status */}
      {hasApplied && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <p className="text-green-800 font-medium">
            ✓ You have already applied for this position. Check your applications page for status updates.
          </p>
        </div>
      )}

      {/* Deadline Passed */}
      {new Date(job.deadline) <= new Date() && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 font-medium">
            This job posting has expired. The application deadline has passed.
          </p>
        </div>
      )}
    </div>
  )
}

export default JobDetail