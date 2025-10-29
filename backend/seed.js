const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./models/User')
const StudentProfile = require('./models/StudentProfile')
require('dotenv').config()

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-portal')
    console.log('Connected to MongoDB')

    // Clear existing data
    await User.deleteMany({})
    await StudentProfile.deleteMany({})
    console.log('Cleared existing data')

    // Create Admin User
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = new User({
      name: 'System Admin',
      email: 'admin@portal.com',
      password: adminPassword,
      role: 'admin'
    })
    await admin.save()

    // Create Sample Student
    const studentPassword = await bcrypt.hash('student123', 10)
    const student = new User({
      name: 'John Doe',
      email: 'student@test.com',
      password: studentPassword,
      role: 'student',
      department: 'Computer Science'
    })
    await student.save()

    // Create Student Profile
    const studentProfile = new StudentProfile({
      userId: student._id,
      program: 'B.Tech Computer Science',
      graduationYear: 2025,
      cgpa: 8.5,
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      projects: [{
        title: 'E-commerce Website',
        description: 'Full-stack e-commerce application with React and Node.js',
        technologies: ['React', 'Node.js', 'MongoDB'],
        url: 'https://github.com/johndoe/ecommerce'
      }],
      resumeUrl: 'https://example.com/resume.pdf',
      isProfileComplete: true
    })
    await studentProfile.save()

    // Create Sample Company
    const companyPassword = await bcrypt.hash('company123', 10)
    const company = new User({
      name: 'Tech Corp',
      email: 'company@test.com',
      password: companyPassword,
      role: 'company',
      companyName: 'Tech Corp Solutions'
    })
    await company.save()

    console.log('Sample data created successfully!')
    console.log('\nLogin Credentials:')
    console.log('Admin: admin@portal.com / admin123')
    console.log('Student: student@test.com / student123')
    console.log('Company: company@test.com / company123')

    process.exit(0)
  } catch (error) {
    console.error('Error seeding data:', error)
    process.exit(1)
  }
}

seedData()