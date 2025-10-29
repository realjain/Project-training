const express = require('express')
const { body, validationResult, query } = require('express-validator')
const Job = require('../models/Job')
const Application = require('../models/Application')
const { auth, authorize } = require('../middleware/auth')

const router = express.Router()

// Get all jobs (public)
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('search').optional().trim(),
  query('skills').optional(),
  query('location').optional().trim(),
  query('jobType').optional().isIn(['internship', 'full-time', 'part-time'])
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Build query
    const query = { status: 'open', deadline: { $gte: new Date() } }

    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { company: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ]
    }

    if (req.query.skills) {
      const skills = req.query.skills.split(',').map(s => s.trim())
      query.skills = { $in: skills }
    }

    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: 'i' }
    }

    if (req.query.jobType) {
      query.jobType = req.query.jobType
    }

    const jobs = await Job.find(query)
      .populate('companyId', 'name companyName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Job.countDocuments(query)

    res.json({
      jobs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (error) {
    console.error('Get jobs error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('companyId', 'name companyName')

    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }

    res.json(job)
  } catch (error) {
    console.error('Get job error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create job (company only)
router.post('/', [
  auth,
  authorize('company'),
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('company').trim().isLength({ min: 2 }).withMessage('Company name is required'),
  body('skills').isArray({ min: 1 }).withMessage('At least one skill is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('jobType').isIn(['internship', 'full-time', 'part-time']).withMessage('Invalid job type'),
  body('deadline').isISO8601().withMessage('Valid deadline is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const jobData = {
      ...req.body,
      companyId: req.user._id,
      deadline: new Date(req.body.deadline)
    }

    // Validate deadline is in future
    if (jobData.deadline <= new Date()) {
      return res.status(400).json({ message: 'Deadline must be in the future' })
    }

    const job = new Job(jobData)
    await job.save()

    const populatedJob = await Job.findById(job._id)
      .populate('companyId', 'name companyName')

    res.status(201).json({
      message: 'Job created successfully',
      job: populatedJob
    })
  } catch (error) {
    console.error('Create job error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get company's jobs
router.get('/company/mine', [
  auth,
  authorize('company'),
  query('page').optional().isInt({ min: 1 }),
  query('status').optional().isIn(['open', 'closed', 'draft'])
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 10
    const skip = (page - 1) * limit

    const query = { companyId: req.user._id }
    if (req.query.status) {
      query.status = req.query.status
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Job.countDocuments(query)

    // Get application counts for each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({ jobId: job._id })
        return {
          ...job.toObject(),
          applicationCount
        }
      })
    )

    res.json({
      jobs: jobsWithCounts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (error) {
    console.error('Get recruiter jobs error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update job
router.put('/:id', [
  auth,
  authorize('company'),
  body('title').optional().trim().isLength({ min: 3 }),
  body('description').optional().trim().isLength({ min: 10 }),
  body('deadline').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const job = await Job.findOne({ _id: req.params.id, companyId: req.user._id })
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' })
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        job[key] = req.body[key]
      }
    })

    if (req.body.deadline) {
      job.deadline = new Date(req.body.deadline)
      if (job.deadline <= new Date()) {
        return res.status(400).json({ message: 'Deadline must be in the future' })
      }
    }

    await job.save()

    res.json({
      message: 'Job updated successfully',
      job
    })
  } catch (error) {
    console.error('Update job error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete job
router.delete('/:id', [auth, authorize('company')], async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, companyId: req.user._id })
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' })
    }

    // Check if there are applications
    const applicationCount = await Application.countDocuments({ jobId: job._id })
    if (applicationCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete job with existing applications. Close the job instead.' 
      })
    }

    await Job.findByIdAndDelete(req.params.id)

    res.json({ message: 'Job deleted successfully' })
  } catch (error) {
    console.error('Delete job error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router