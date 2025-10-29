import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import axios from 'axios'
import { Save, Plus, Trash2 } from 'lucide-react'

const JobForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      company: '',
      skills: [{ value: '' }],
      location: '',
      isRemote: false,
      jobType: 'internship',
      stipend: '',
      salary: '',
      deadline: '',
      eligibility: {
        minCgpa: '',
        graduationYear: [],
        departments: []
      }
    }
  })

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control,
    name: 'skills'
  })

  useEffect(() => {
    if (isEdit) {
      fetchJob()
    } else {
      setLoading(false)
    }
  }, [id, isEdit])

  const fetchJob = async () => {
    try {
      const response = await axios.get(`/api/jobs/${id}`)
      const job = response.data
      
      // Format data for form
      const formData = {
        ...job,
        skills: job.skills.map(skill => ({ value: skill })),
        deadline: new Date(job.deadline).toISOString().split('T')[0],
        eligibility: {
          minCgpa: job.eligibility?.minCgpa || '',
          graduationYear: job.eligibility?.graduationYear || [],
          departments: job.eligibility?.departments || []
        }
      }
      
      reset(formData)
    } catch (error) {
      console.error('Error fetching job:', error)
      setMessage('Failed to load job details')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      setSaving(true)
      setMessage('')

      // Format data for API
      const formattedData = {
        ...data,
        skills: data.skills.map(skill => skill.value).filter(Boolean),
        stipend: data.stipend ? parseFloat(data.stipend) : undefined,
        salary: data.salary ? parseFloat(data.salary) : undefined,
        eligibility: {
          ...data.eligibility,
          minCgpa: data.eligibility.minCgpa ? parseFloat(data.eligibility.minCgpa) : undefined
        }
      }

      if (isEdit) {
        await axios.put(`/api/jobs/${id}`, formattedData)
        setMessage('Job updated successfully!')
      } else {
        await axios.post('/api/jobs', formattedData)
        setMessage('Job posted successfully!')
        setTimeout(() => navigate('/company/jobs'), 2000)
      }
    } catch (error) {
      console.error('Error saving job:', error)
      setMessage(error.response?.data?.message || 'Failed to save job')
    } finally {
      setSaving(false)
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {isEdit ? 'Edit Job Posting' : 'Post New Job'}
        </h1>

        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.includes('success') 
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                {...register('title', { required: 'Job title is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Software Engineer Intern"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                {...register('company', { required: 'Company name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your company name"
              />
              {errors.company && (
                <p className="text-red-500 text-sm mt-1">{errors.company.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type *
              </label>
              <select
                {...register('jobType', { required: 'Job type is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="internship">Internship</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
              </select>
              {errors.jobType && (
                <p className="text-red-500 text-sm mt-1">{errors.jobType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                {...register('location', { required: 'Location is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., New York, NY"
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
              )}
            </div>
          </div>

          {/* Remote Work */}
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('isRemote')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Remote work available
            </label>
          </div>

          {/* Compensation */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stipend (for internships)
              </label>
              <input
                type="number"
                {...register('stipend')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Monthly stipend amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary (for full-time)
              </label>
              <input
                type="number"
                {...register('salary')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Annual salary"
              />
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application Deadline *
            </label>
            <input
              type="date"
              {...register('deadline', { required: 'Deadline is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.deadline && (
              <p className="text-red-500 text-sm mt-1">{errors.deadline.message}</p>
            )}
          </div>

          {/* Skills */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Required Skills *
              </label>
              <button
                type="button"
                onClick={() => appendSkill({ value: '' })}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Skill
              </button>
            </div>
            
            <div className="space-y-2">
              {skillFields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <input
                    type="text"
                    {...register(`skills.${index}.value`, { required: 'Skill is required' })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., JavaScript, Python, React"
                  />
                  {skillFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description *
            </label>
            <textarea
              rows={8}
              {...register('description', { required: 'Job description is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the role, responsibilities, and requirements..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Eligibility Criteria */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Eligibility Criteria</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum CGPA
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  {...register('eligibility.minCgpa')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 7.0"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/company/jobs')}
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : isEdit ? 'Update Job' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default JobForm