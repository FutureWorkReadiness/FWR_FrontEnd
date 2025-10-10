import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Zap, PlayCircle, Target, Award, TrendingUp, Clock, User, LogOut } from 'lucide-react';
import { getCurrentUser, logoutUser } from '../utils/auth';
import { getSpecializationRecommendations, getUserSpecializationPath } from '../utils/industryHierarchy';

export default function DashboardPage() {
  const navigate = useNavigate();
  
  // Get current user data
  const currentUser = getCurrentUser();
  const userIndustryData = currentUser?.industry;
  
  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  // Get user's specialization path and recommendations
  let userPath = null;
  let currentRecommendation = null;

  if (userIndustryData && typeof userIndustryData === 'object') {
    // New hierarchical structure
    userPath = getUserSpecializationPath(
      userIndustryData.industry,
      userIndustryData.branch,
      userIndustryData.specialization
    );
    currentRecommendation = getSpecializationRecommendations(
      userIndustryData.industry,
      userIndustryData.branch,
      userIndustryData.specialization
    );
  } else if (userIndustryData && typeof userIndustryData === 'string') {
    // Legacy single industry selection - provide default recommendation
    currentRecommendation = {
      title: `Advanced ${userIndustryData} Skills`,
      description: `Continue developing your expertise in ${userIndustryData}.`,
      category: 'Technical'
    };
    userPath = { fullPath: userIndustryData };
  } else {
    // No industry selected - default recommendation
    currentRecommendation = {
      title: 'Complete Your Profile',
      description: 'Complete your onboarding to get personalized recommendations.',
      category: 'Setup'
    };
    userPath = { fullPath: 'Not specified' };
  }  // Get user scores or use defaults for new users
  const readinessScore = currentUser?.readinessScore || 0;
  const technicalScore = currentUser?.technicalScore || 0;
  const softSkillsScore = currentUser?.softSkillsScore || 0;
  const leadershipScore = currentUser?.leadershipScore || 0;
  const recentActivities = currentUser?.recentActivity || [];

  const quickAccessCards = [
    {
      id: 'knowledge-test',
      title: 'Take a Knowledge Test',
      description: 'Test your understanding of key concepts',
      icon: BookOpen,
      color: 'bg-blue-500',
      onClick: () => navigate('/tests')
    },
    {
      id: 'skill-exercise',
      title: 'Try a Skill-Based Exercise',
      description: 'Practice hands-on skills',
      icon: Zap,
      color: 'bg-green-500',
      onClick: () => navigate('/tests') // Will be updated when skill exercises are created
    },
    {
      id: 'simulation',
      title: 'Run a Real-World Simulation',
      description: 'Experience realistic scenarios',
      icon: PlayCircle,
      color: 'bg-purple-500',
      onClick: () => navigate('/tests') // Will be updated when simulations are created
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Welcome back, {currentUser?.name}!
            </h1>
            <div className="flex items-center space-x-2 text-gray-600">
              <Target className="w-4 h-4" />
              <span className="text-sm">Specialization: {userPath?.fullPath}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Readiness Score Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Future of Work Readiness Score</h2>
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-40 h-40">
                  <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 144 144">
                    {/* Background circle */}
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      stroke="#3b82f6"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 60}`}
                      strokeDashoffset={`${2 * Math.PI * 60 * (1 - readinessScore / 100)}`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-slate-800">{readinessScore}%</div>
                      <div className="text-sm text-gray-600">Ready</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{technicalScore}%</div>
                  <div className="text-sm text-gray-600">Technical</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{softSkillsScore}%</div>
                  <div className="text-sm text-gray-600">Soft Skills</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{leadershipScore}%</div>
                  <div className="text-sm text-gray-600">Leadership</div>
                </div>
              </div>
            </div>

            {/* Recommended Next Step */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center mb-3">
                <Target className="w-6 h-6 mr-2" />
                <h2 className="text-xl font-semibold">Recommended Next Step</h2>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">{currentRecommendation.title}</h3>
                <p className="mb-2">{currentRecommendation.description}</p>
                <span className="inline-block bg-white bg-opacity-20 text-white text-sm px-3 py-1 rounded-full">
                  {currentRecommendation.category} Focus
                </span>
              </div>
              <button
                onClick={() => navigate('/tests')}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Start Test
              </button>
            </div>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickAccessCards.map((card) => {
                const IconComponent = card.icon;
                return (
                  <div
                    key={card.id}
                    onClick={card.onClick}
                    className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
                  >
                    <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">{card.title}</h3>
                    <p className="text-gray-600 text-sm">{card.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Navigation Menu */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Quick Navigation</h2>
              <nav className="space-y-2">
                <button
                  onClick={() => navigate('/tests')}
                  className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <BookOpen className="w-5 h-5 mr-3 text-blue-500" />
                  <span>Tests</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <TrendingUp className="w-5 h-5 mr-3 text-green-500" />
                  <span>Skills</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Target className="w-5 h-5 mr-3 text-purple-500" />
                  <span>Goals</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Award className="w-5 h-5 mr-3 text-orange-500" />
                  <span>Badges</span>
                </button>
              </nav>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {activity.type === 'test' && <BookOpen className="w-5 h-5 text-blue-500" />}
                        {activity.type === 'badge' && <Award className="w-5 h-5 text-orange-500" />}
                        {activity.type === 'simulation' && <PlayCircle className="w-5 h-5 text-purple-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">{activity.title}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <p className="text-xs text-gray-500">{activity.time}</p>
                          {activity.score && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              {activity.score}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2">No activity yet</p>
                    <p className="text-sm text-gray-400">Start taking tests to see your progress here!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
