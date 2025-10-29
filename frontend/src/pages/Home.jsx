import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Briefcase, Users, Award, TrendingUp } from 'lucide-react'

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
        <h1 className="text-5xl font-bold mb-6">
          Internship & Placement Portal
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Connect students with opportunities, streamline recruitment, and build successful careers
        </p>
        {!user && (
          <div className="space-x-4">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Get Started
            </Link>
            <Link
              to="/jobs"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
            >
              Browse Jobs
            </Link>
          </div>
        )}
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <Briefcase className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Job Opportunities</h3>
          <p className="text-gray-600">
            Discover internships and full-time positions from top companies
          </p>
        </div>

        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Student Profiles</h3>
          <p className="text-gray-600">
            Build comprehensive profiles with skills, projects, and achievements
          </p>
        </div>

        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <Award className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Verification System</h3>
          <p className="text-gray-600">
            Faculty-verified credentials ensure authentic student profiles
          </p>
        </div>

        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <TrendingUp className="w-12 h-12 text-orange-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
          <p className="text-gray-600">
            Track placement trends and recruitment analytics
          </p>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="text-center py-16 bg-gray-100 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of students and recruiters on our platform
          </p>
          <Link
            to="/register"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Create Account
          </Link>
        </section>
      )}
    </div>
  )
}

export default Home