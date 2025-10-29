const express = require('express')
const { body, validationResult, query } = require('express-validator')
const Application = require('../models/Application')
const Job = require('../models/Job')
const StudentProfile = require('../models/StudentProfile')
const { auth, authorize } = require('../middleware/auth')

const router = express.Router()

// Create application (student only)
router.post('/', [
  auth,
  authorize('student'),
  body('jobId').isMongoId().withMessage('Valid job ID is required'),
  body('coverLetter').trim().isLength({ min: 50 }).withMessage('Cover letter must be at least 50 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { jobId, coverLetter, resumeUrl, screeningAnswers } = req.body

    // Check if job exists and is open
    const job = await Job.findById(jobId)
    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Job is not accepting applications' })
    }

    if (new Date(job.deadline) <= new Date()) {
      return res.status(400).json({ message: 'Application deadline has passed' })
    }

    // Check if student already applied
    const existingApplication = await Application.findOne({
      jobId,
      studentId: req.user._id
    })

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' })
    }

    // Check eligibility
    const studentProfile = await StudentProfile.findOne({ userId: req.user._id })
    if (job.eligibility) {
      if (job.eligibility.minCgpa && studentProfile?.cgpa < job.eligibility.minCgpa) {
        return res.status(400).json({ message: 'CGPA requirement not met' })
      }

      if (job.eligibility.graduationYear?.length > 0 && 
          !job.eligibility.graduationYear.includes(studentProfile?.graduationYear)) {
        return res.status(400).json({ message: 'Graduation year requirement not met' })
      }

      // Check if profile is complete
    if (!studentProfile?.isProfileComplete) {
      return res.status(400).json({ message: 'Please complete your profile before applying' })
    }
    }

    // Create application
    const application = new Application({
      jobId,
      studentId: req.user._id,
      coverLetter,
      resumeUrl,
      screeningAnswers: screeningAnswers || [],
      stageHistory: [{
        stage: 'applied',
        changedBy: req.user._id,
        changedAt: new Date()
      }]
    })

    await application.save()

    const populatedApplication = await Application.findById(application._id)
      .populate('jobId', 'title company')
      .populate('studentId', 'name email')

    res.status(201).json({
      message: 'Application submitted successfully',
      application: populatedApplication
    })
  } catch (error) {
    console.error('Create application error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get student's applications
router.get('/me', [
  auth,
  authorize('student'),
  query('page').optional().isInt({ min: 1 }),
  query('status').optional()
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 10
    const skip = (page - 1) * limit

    const query = { studentId: req.user._id }
    if (req.query.status) {
      query.stage = req.query.status
    }

    const applications = await Application.find(query)
      .populate('jobId', 'title company location jobType deadline')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Application.countDocuments(query)

    res.json({
      applications,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (error) {
    console.error('Get applications error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get applications for a job (company only)
router.get('/job/:jobId', [
  auth,
  authorize('company'),
  query('page').optional().isInt({ min: 1 }),
  query('stage').optional()
], async (req, res) => {
  try {
    const { jobId } = req.params

    // Verify job belongs to company
    const job = await Job.findOne({ _id: jobId, companyId: req.user._id })
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' })
    }

    const page = parseInt(req.query.page) || 1
    const limit = 20
    const skip = (page - 1) * limit

    const query = { jobId }
    if (req.query.stage) {
      query.stage = req.query.stage
    }

    const applications = await Application.find(query)
      .populate('studentId', 'name email department')
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          model: 'User',
          select: 'name email department'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Application.countDocuments(query)

    // Get stage counts
    const stageCounts = await Application.aggregate([
      { $match: { jobId: job._id } },
      { $group: { _id: '$stage', count: { $sum: 1 } } }
    ])

    const stageStats = stageCounts.reduce((acc, item) => {
      acc[item._id] = item.count
      return acc
    }, {})

    res.json({
      applications,
      stageStats,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (error) {
    console.error('Get job applications error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update application stage (company only)
router.patch('/:id/stage', [
  auth,
  authorize('company'),
  body('stage').isIn(['applied', 'shortlisted', 'interview', 'offered', 'rejected']).withMessage('Invalid stage'),
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { stage, reason } = req.body
    const application = await Application.findById(req.params.id)
      .populate('jobId')

    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    // Verify job belongs to company
    if (application.jobId.companyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    // Update stage
    application.stage = stage
    application.stageHistory.push({
      stage,
      changedBy: req.user._id,
      changedAt: new Date(),
      reason
    })

    await application.save()

    res.json({
      message: 'Application stage updated successfully',
      application
    })
  } catch (error) {
    console.error('Update application stage error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Add review/scores (company only)
router.post('/:id/review', [
  auth,
  authorize('company'),
  body('note').optional().trim(),
  body('scores.aptitude').optional().isInt({ min: 0, max: 100 }),
  body('scores.technical').optional().isInt({ min: 0, max: 100 }),
  body('scores.communication').optional().isInt({ min: 0, max: 100 })
], async (req, res) => {
  try {
    const { note, scores } = req.body
    const application = await Application.findById(req.params.id)
      .populate('jobId')

    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    // Verify job belongs to company
    if (application.jobId.companyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    // Add review note
    if (note) {
      application.reviewerNotes.push({
        note,
        reviewer: req.user._id,
        createdAt: new Date()
      })
    }

    // Update scores
    if (scores) {
      application.scores = { ...application.scores, ...scores }
    }

    await application.save()

    res.json({
      message: 'Review added successfully',
      application
    })
  } catch (error) {
    console.error('Add review error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router