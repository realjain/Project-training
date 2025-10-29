# 🚀 Setup Instructions for Windows

## Quick Setup (Recommended)

1. **Double-click `setup.bat`** - This will automatically install everything
2. **Wait for installation to complete**
3. **Run the application using one of the methods below**

## Running the Application

### Method 1: Automatic (Both servers together)
```cmd
npm run dev
```

### Method 2: Manual (Separate terminals)
- **Terminal 1:** Double-click `start-backend.bat` OR run `npm run server`
- **Terminal 2:** Double-click `start-frontend.bat` OR run `npm run client`

## Access Your Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

## Manual Setup (If setup.bat doesn't work)

1. **Install Backend:**
```cmd
npm install
```

2. **Install Frontend:**
```cmd
cd frontend
npm install --legacy-peer-deps
cd ..
```

3. **Create Environment File:**
```cmd
copy .env.example .env
```

4. **Start Application:**
```cmd
npm run dev
```

## Database Setup

Make sure you have MongoDB installed and running:
- **Local MongoDB:** Start `mongod` service
- **MongoDB Atlas:** Update `.env` file with your connection string

## Troubleshooting

If you get dependency errors:
1. Delete `node_modules` folders manually
2. Run `setup.bat` again
3. Or use `npm install --legacy-peer-deps` for frontend

## Features Available

### 👨‍🎓 Students
- Register and login
- Build profile with skills and projects
- Browse and apply for jobs
- Track application status

### 🏢 Companies
- Register and login
- Post job opportunities
- Manage applications
- Review candidates

### 🧑‍💼 Admin
- Manage all users
- View system analytics
- Oversee job postings

## Default Login (After seeding)
- **Admin:** admin@portal.com / admin123
- **Student:** student@test.com / student123
- **Company:** company@test.com / company123