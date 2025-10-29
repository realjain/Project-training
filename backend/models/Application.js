const mongoose = require('mongoose')

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverLetter: {
    type: String,
    required: true
  },
  resumeUrl: String,
  screeningAnswers: [{
    question: String,
    answer: String
  }],
  stage: {
    type: String,
    enum: ['applied', 'shortlisted', 'interview', 'offered', 'rejected', 'withdrawn'],
    default: 'applied'
  },
  scores: {
    aptitude: {
      type: Number,
      min: 0,
      max: 100
    },
    technical: {
      type: Number,
      min: 0,
      max: 100
    },
    communication: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  reviewerNotes: [{
    note: String,
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  stageHistory: [{
    stage: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    reason: String
  }],
  interviewSchedule: {
    date: Date,
    time: String,
    location: String,
    interviewerNotes: String
  }
}, {
  timestamps: true
})

// Compound indexes for efficient queries
applicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true })
applicationSchema.index({ studentId: 1, createdAt: -1 })
applicationSchema.index({ jobId: 1, stage: 1 })
applicationSchema.index({ stage: 1, createdAt: -1 })

module.exports = mongoose.model('Application', applicationSchema)