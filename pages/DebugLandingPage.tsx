import React from 'react';
import { Link } from 'react-router-dom';

export default function DebugLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">🚀</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Future Work Readiness
              </span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/onboarding" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                Get Started
              </Link>
              <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                Dashboard
              </Link>
              <Link to="/tests" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                Tests
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700 text-sm font-semibold">System Status: All Systems Operational</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome to Future Work Readiness
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Your comprehensive platform for career assessment and development. 
            Discover your potential and build skills for tomorrow's workforce.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/onboarding"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              🎯 Start Assessment
            </Link>
            <Link 
              to="/dashboard"
              className="bg-white text-gray-700 px-8 py-3 rounded-xl font-semibold border-2 border-gray-200 hover:border-blue-400 hover:text-blue-600 transition-all duration-300"
            >
              📊 View Dashboard
            </Link>
          </div>
        </div>

        {/* Debug Status Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">React Framework</h3>
                <p className="text-sm text-green-600 font-medium">Active & Mounted</p>
              </div>
            </div>
            <p className="text-gray-600">React components are rendering correctly with full functionality.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎨</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Tailwind CSS</h3>
                <p className="text-sm text-blue-600 font-medium">Styles Applied</p>
              </div>
            </div>
            <p className="text-gray-600">Modern styling framework is loaded and responsive design is active.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🔗</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Routing System</h3>
                <p className="text-sm text-purple-600 font-medium">Navigation Ready</p>
              </div>
            </div>
            <p className="text-gray-600">React Router is configured for smooth page transitions.</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-100">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            🚀 Quick Actions
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              to="/simple-test"
              className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105 border border-gray-100"
            >
              <div className="text-2xl mb-2">🧪</div>
              <h3 className="font-semibold text-gray-800 mb-1">Simple Test</h3>
              <p className="text-sm text-gray-600">Quick system check</p>
            </Link>
            
            <Link 
              to="/connection-test"
              className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105 border border-gray-100"
            >
              <div className="text-2xl mb-2">🔌</div>
              <h3 className="font-semibold text-gray-800 mb-1">Connection Test</h3>
              <p className="text-sm text-gray-600">API connectivity</p>
            </Link>
            
            <Link 
              to="/database-test"
              className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105 border border-gray-100"
            >
              <div className="text-2xl mb-2">🗃️</div>
              <h3 className="font-semibold text-gray-800 mb-1">Database Test</h3>
              <p className="text-sm text-gray-600">Data operations</p>
            </Link>
            
            <Link 
              to="/test-hub"
              className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105 border border-gray-100"
            >
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-semibold text-gray-800 mb-1">Test Hub</h3>
              <p className="text-sm text-gray-600">Assessment center</p>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              © 2024 Future Work Readiness Platform. All systems operational.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
