const express = require('express')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const Job = require('../models/Job')
const Application = require('../models/Application')
const StudentProfile = require('../models/StudentProfile')
const { auth, authorize } = require('../middleware/auth')

const router = express.Router()

// Get user statistics
router.get('/stats/users', [auth, authorize('admin')], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true })
    const usersByRole = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ])

    const roleStats = usersByRole.reduce((acc, item) => {
      acc[item._id] = item.count
      return acc
    }, {})

    res.json({
      total: totalUsers,
      byRole: roleStats
    })
  } catch (error) {
    console.error('Get user stats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get job statistics
router.get('/stats/jobs', [auth, authorize('admin')], async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments()
    const activeJobs = await Job.countDocuments({ status: 'open' })
    const totalApplications = await Application.countDocuments()
    
    // Placement funnel
    const placementFunnel = await Application.aggregate([
      { $group: { _id: '$stage', count: { $sum: 1 } } }
    ])

    const funnelStats = placementFunnel.reduce((acc, item) => {
      acc[item._id] = item.count
      return acc
    }, {})

    // Calculate placement rate (offered / total applications)
    const placementRate = totalApplications > 0 
      ? Math.round((funnelStats.offered || 0) / totalApplications * 100)
      : 0

    // Skills demand
    const skillsDemand = await Job.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])

    // Company statistics
    const companyStats = await Job.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'companyId',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: '$company' },
      {
        $group: {
          _id: '$company.companyName',
          jobCount: { $sum: 1 }
        }
      },
      { $sort: { jobCount: -1 } },
      { $limit: 10 }
    ])

    res.json({
      total: totalJobs,
      active: activeJobs,
      applications: totalApplications,
      placementRate,
      funnel: funnelStats,
      skillsDemand,
      companyStats
    })
  } catch (error) {
    console.error('Get job stats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get all users
router.get('/users', [auth, authorize('admin')], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const query = {}
    
    if (req.query.role) {
      query.role = req.query.role
    }

    if (req.query.department) {
      query.department = req.query.department
    }

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ]
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await User.countDocuments(query)

    res.json({
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update user status
router.patch('/users/:id/status', [
  auth,
  authorize('admin'),
  body('isActive').isBoolean().withMessage('isActive must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { isActive } = req.body
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Prevent admin from deactivating themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot modify your own status' })
    }

    user.isActive = isActive
    await user.save()

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: user.toJSON()
    })
  } catch (error) {
    console.error('Update user status error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get placement analytics
router.get('/analytics/placement', [auth, authorize('admin')], async (req, res) => {
  try {
    const { batch, department } = req.query

    // Build match query
    const matchQuery = {}
    if (batch) {
      // Find students from specific graduation year
      const students = await StudentProfile.find({ graduationYear: parseInt(batch) })
      const studentIds = students.map(s => s.userId)
      matchQuery.studentId = { $in: studentIds }
    }

    // Placement funnel by batch/department
    const pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' }
    ]

    if (department) {
      pipeline.push({ $match: { 'student.department': department } })
    }

    pipeline.push(
      { $group: { _id: '$stage', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    )

    const placementFunnel = await Application.aggregate(pipeline)

    // Department-wise placement stats
    const departmentStats = await Application.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $group: {
          _id: {
            department: '$student.department',
            stage: '$stage'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.department',
          stages: {
            $push: {
              stage: '$_id.stage',
              count: '$count'
            }
          }
        }
      }
    ])

    res.json({
      placementFunnel,
      departmentStats
    })
  } catch (error) {
    console.error('Get placement analytics error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get company analytics
router.get('/analytics/companies', [auth, authorize('admin')], async (req, res) => {
  try {
    const companyStats = await Application.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      {
        $lookup: {
          from: 'users',
          localField: 'job.companyId',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: '$company' },
      {
        $group: {
          _id: {
            companyId: '$job.companyId',
            companyName: '$company.companyName',
            stage: '$stage'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            companyId: '$_id.companyId',
            companyName: '$_id.companyName'
          },
          stages: {
            $push: {
              stage: '$_id.stage',
              count: '$count'
            }
          },
          totalApplications: { $sum: '$count' }
        }
      },
      { $sort: { totalApplications: -1 } }
    ])

    res.json({ companyStats })
  } catch (error) {
    console.error('Get company analytics error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router