# Internship & Placement Portal

A comprehensive MERN stack application for managing internships and placements in educational institutions. The portal connects students with companies through a streamlined platform where students can build profiles and apply for opportunities, companies can post jobs and manage applications, and administrators can oversee the entire system.

## Features

### 🎓 Student Features
- **Profile Management**: Build comprehensive profiles with skills, projects, and achievements
- **Job Discovery**: Browse and search internships/jobs with advanced filters
- **Application Tracking**: Apply to positions and track application status
- **Document Verification**: Submit documents for faculty verification
- **Dashboard**: View application statistics and recent activities

### 🏢 Company Features
- **Job Posting**: Create detailed job postings with eligibility criteria
- **Application Management**: Review applications with pipeline stages
- **Candidate Evaluation**: Score candidates and add reviewer notes
- **Dashboard**: Monitor job postings and application statistics

### 🔧 Admin Features
- **User Management**: Manage students and companies
- **System Analytics**: View placement statistics and trends
- **Job Oversight**: Monitor all job postings and applications
- **Dashboard**: Comprehensive system overview and metrics

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **helmet** and **cors** for security

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **React Hook Form** for form management
- **React Query** for data fetching
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API calls

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd internship-placement-portal
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
MONGODB_URI=mongodb://localhost:27017/placement-portal
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
NODE_ENV=development
```

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas cloud connection
```

### 5. Run the Application
```bash
# Development mode (runs both backend and frontend)
npm run dev

# Or run separately:
# Backend only
npm run server

# Frontend only (in another terminal)
npm run client
```

### 6. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Jobs
- `GET /api/jobs` - Get all jobs (public)
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create job (recruiter)
- `PUT /api/jobs/:id` - Update job (recruiter)
- `DELETE /api/jobs/:id` - Delete job (recruiter)
- `GET /api/jobs/recruiter/mine` - Get recruiter's jobs

### Applications
- `POST /api/applications` - Submit application (student)
- `GET /api/applications/me` - Get student's applications
- `GET /api/applications/job/:jobId` - Get job applications (recruiter)
- `PATCH /api/applications/:id/stage` - Update application stage (recruiter)
- `POST /api/applications/:id/review` - Add review/scores (recruiter)

### Profiles
- `GET /api/profiles/me` - Get student profile
- `PUT /api/profiles/me` - Update student profile
- `GET /api/profiles` - Get all profiles (admin/faculty)
- `GET /api/profiles/:id` - Get profile by ID

### Verifications
- `POST /api/verifications` - Submit verification (student)
- `GET /api/verifications/me` - Get student's verifications
- `GET /api/verifications` - Get all verifications (faculty)
- `PATCH /api/verifications/:id` - Review verification (faculty)

### Admin
- `GET /api/admin/stats/users` - User statistics
- `GET /api/admin/stats/jobs` - Job statistics
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/:id/status` - Update user status
- `GET /api/admin/analytics/placement` - Placement analytics
- `GET /api/admin/analytics/recruiters` - Recruiter analytics

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['student', 'recruiter', 'faculty', 'admin'],
  department: String,
  isActive: Boolean,
  timestamps: true
}
```

### Job Model
```javascript
{
  recruiterId: ObjectId,
  title: String,
  description: String,
  company: String,
  skills: [String],
  eligibility: {
    minCgpa: Number,
    graduationYear: [Number],
    departments: [String],
    verificationRequired: Boolean
  },
  location: String,
  isRemote: Boolean,
  jobType: ['internship', 'full-time', 'part-time'],
  salary/stipend: Number,
  deadline: Date,
  status: ['open', 'closed', 'draft'],
  timestamps: true
}
```

### Application Model
```javascript
{
  jobId: ObjectId,
  studentId: ObjectId,
  coverLetter: String,
  resumeUrl: String,
  stage: ['applied', 'shortlisted', 'interview', 'offered', 'rejected'],
  scores: {
    aptitude: Number,
    technical: Number,
    communication: Number
  },
  reviewerNotes: [{
    note: String,
    reviewer: ObjectId,
    createdAt: Date
  }],
  stageHistory: [Object],
  timestamps: true
}
```

## User Roles & Permissions

### Student
- Create and manage profile
- Browse and apply for jobs
- Track application status
- Submit documents for verification

### Recruiter
- Post and manage job listings
- Review applications and manage hiring pipeline
- Score candidates and add notes
- View recruitment analytics

### Faculty
- Review and verify student documents
- Approve/reject verification requests
- View verification statistics

### Admin
- Manage all users and roles
- View system-wide analytics
- Manage departments and skills
- Oversee platform operations

## Security Features

- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control (RBAC)
- **Password Security**: bcrypt hashing
- **Rate Limiting**: API rate limiting
- **Input Validation**: Server-side validation
- **Security Headers**: Helmet.js integration
- **CORS**: Configured for frontend domain

## Development Guidelines

### Code Structure
```
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   └── App.jsx      # Main app component
│   └── public/          # Static assets
└── package.json         # Root package.json
```

### Best Practices
- Use environment variables for configuration
- Implement proper error handling
- Add input validation on both client and server
- Follow RESTful API conventions
- Use meaningful commit messages
- Write clean, documented code

## Deployment

### Backend Deployment
1. Set up MongoDB Atlas or cloud database
2. Configure environment variables
3. Deploy to platforms like Heroku, Railway, or DigitalOcean
4. Set up proper logging and monitoring

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to platforms like Vercel, Netlify, or AWS S3
3. Configure API base URL for production

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

Built with ❤️ using the MERN stack