const mongoose = require('mongoose')

const jobSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  skills: [{
    type: String,
    required: true,
    trim: true
  }],
  eligibility: {
    minCgpa: {
      type: Number,
      min: 0,
      max: 10
    },
    graduationYear: [Number],
    departments: [String],
    verificationRequired: {
      type: Boolean,
      default: false
    }
  },
  location: {
    type: String,
    required: true
  },
  isRemote: {
    type: Boolean,
    default: false
  },
  jobType: {
    type: String,
    enum: ['internship', 'full-time', 'part-time'],
    required: true
  },
  stipend: Number,
  salary: Number,
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'draft'],
    default: 'open'
  },
  maxApplications: Number,
  screeningQuestions: [{
    question: String,
    required: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
})

// Indexes for efficient queries
jobSchema.index({ status: 1, createdAt: -1 })
jobSchema.index({ skills: 1 })
jobSchema.index({ location: 1 })
jobSchema.index({ companyId: 1 })
jobSchema.index({ deadline: 1 })
jobSchema.index({ 'eligibility.graduationYear': 1 })

module.exports = mongoose.model('Job', jobSchema)