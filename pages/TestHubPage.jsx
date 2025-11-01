import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, User, Filter, Search, ChevronRight, X, ArrowLeft } from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import { getAvailableTests, getTestCategories, getDifficultyLevels } from '../utils/testSystem';

const API_BASE = 'http://localhost:8000/api';

const TestHubPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter and search states
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    maxTime: '',
    search: '',
    sortBy: ''
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/');
      return;
    }
    
    setUser(currentUser);
    loadTests();
  }, [navigate]);

  useEffect(() => {
    applyFilters();
  }, [tests, filters]);

  const loadTests = async () => {
    try {
      setLoading(true);
      // Fetch quizzes from database API
      const response = await fetch('http://localhost:8000/api/quizzes');
      if (!response.ok) throw new Error('Failed to fetch quizzes');
      
      const data = await response.json();
      // Transform database format to frontend format
      const transformedTests = (data.quizzes || []).map(quiz => ({
        id: quiz.id.toString(),
        title: quiz.title,
        description: quiz.description,
        category: quiz.specialization_name || 'General',
        difficulty: ['Beginner', 'Intermediate', 'Advanced', 'Expert'][quiz.difficulty - 1] || 'Beginner',
        estimatedTime: quiz.duration || 30,
        tags: [quiz.specialization_name || 'General'],
        questionCount: quiz.question_count || 0
      }));
      
      setTests(transformedTests);
      setLoading(false);
    } catch (error) {
      console.error('Error loading tests:', error);
      // Fallback to hardcoded tests if API fails
      try {
        const allTests = getAvailableTests();
        setTests(allTests);
      } catch (fallbackError) {
        setTests([]);
      }
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tests];
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(test => 
        test.title.toLowerCase().includes(searchLower) ||
        test.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(test => test.category === filters.category);
    }
    
    // Apply difficulty filter
    if (filters.difficulty) {
      filtered = filtered.filter(test => test.difficulty === filters.difficulty);
    }
    
    // Apply max time filter
    if (filters.maxTime) {
      filtered = filtered.filter(test => test.estimatedTime <= parseInt(filters.maxTime));
    }
    
    setFilteredTests(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      difficulty: '',
      maxTime: '',
      search: '',
      sortBy: ''
    });
  };

  const startTest = (test) => {
    navigate('/test-taking', { 
      state: { testId: test.id }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading tests...</p>
        </div>
      </div>
    );
  }

  const categories = getTestCategories();
  const difficulties = getDifficultyLevels();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Knowledge Tests Hub</h1>
                <p className="text-gray-600 mt-1">Explore and take comprehensive tests to enhance your skills</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {filteredTests.length} test{filteredTests.length !== 1 ? 's' : ''} available
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search tests by title, description, or tags..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {Object.values(filters).some(f => f !== '') && (
                <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {Object.values(filters).filter(f => f !== '').length}
                </span>
              )}
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Levels</option>
                    {difficulties.map(difficulty => (
                      <option key={difficulty} value={difficulty}>{difficulty}</option>
                    ))}
                  </select>
                </div>

                {/* Time Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Time</label>
                  <select
                    value={filters.maxTime}
                    onChange={(e) => handleFilterChange('maxTime', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Any Duration</option>
                    <option value="15">Up to 15 min</option>
                    <option value="30">Up to 30 min</option>
                    <option value="60">Up to 1 hour</option>
                  </select>
                </div>

                {/* Sort Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Default</option>
                    <option value="title">Title</option>
                    <option value="difficulty">Difficulty</option>
                    <option value="time">Duration</option>
                    <option value="category">Category</option>
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              {Object.values(filters).some(f => f !== '') && (
                <div className="mt-4">
                  <button
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tests Grid */}
        {filteredTests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {tests.length === 0 ? 'No Tests Available' : 'No Tests Match Your Filters'}
            </h3>
            <p className="text-gray-600 mb-4">
              {tests.length === 0 
                ? 'Tests are being prepared. Check back soon!'
                : 'Try adjusting your search criteria or clearing filters.'
              }
            </p>
            {tests.length > 0 && (
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTests.map((test) => (
              <div key={test.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        test.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                        test.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {test.difficulty}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        {test.category}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {test.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                    {test.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{test.estimatedTime} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{test.questions?.length || 0} questions</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {test.tags && test.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {test.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                        {test.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{test.tags.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => startTest(test)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    Start Test
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestHubPage;
