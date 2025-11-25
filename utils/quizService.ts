// Quiz service - connects to FastAPI backend with fallback to local tests
import { quizAPI, testConnection } from './api.jsx';
import { testLibrary } from './testSystem.js';

// Get all available quizzes (from backend + local fallback)
export const getAllQuizzes = async () => {
  try {
    // Try to get quizzes from backend first
    const connectionTest = await testConnection();
    if (connectionTest.success) {
      const backendQuizzes = await quizAPI.getAllQuizzes();
      if (backendQuizzes && backendQuizzes.length > 0) {
        return {
          success: true,
          quizzes: backendQuizzes,
          source: 'backend'
        };
      }
    }
    
    // Fallback to local quizzes
    return {
      success: true,
      quizzes: testLibrary,
      source: 'local',
      warning: 'Using local quizzes. Backend connection failed or no backend quizzes available.'
    };
    
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    // Fallback to local quizzes
    return {
      success: true,
      quizzes: testLibrary,
      source: 'local',
      warning: 'Using local quizzes due to error: ' + error.message
    };
  }
};

// Get a specific quiz by ID
export const getQuizById = async (quizId) => {
  try {
    // Try backend first
    const connectionTest = await testConnection();
    if (connectionTest.success) {
      try {
        const backendQuiz = await quizAPI.getQuiz(quizId);
        if (backendQuiz) {
          return {
            success: true,
            quiz: backendQuiz,
            source: 'backend'
          };
        }
      } catch (backendError) {
        console.log('Backend quiz not found, trying local:', backendError.message);
      }
    }
    
    // Fallback to local quiz
    const localQuiz = testLibrary.find(quiz => quiz.id === quizId);
    if (localQuiz) {
      return {
        success: true,
        quiz: localQuiz,
        source: 'local'
      };
    }
    
    throw new Error('Quiz not found');
    
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Submit quiz results
export const submitQuizResults = async (userId, quizId, answers, score) => {
  try {
    // Try to submit to backend first
    const connectionTest = await testConnection();
    if (connectionTest.success) {
      try {
        const results = {
          quizId,
          answers,
          score,
          completedAt: new Date().toISOString()
        };
        
        const response = await quizAPI.submitQuizResults(userId, quizId, results);
        return {
          success: true,
          result: response,
          source: 'backend'
        };
      } catch (backendError) {
        console.log('Backend submission failed, storing locally:', backendError.message);
      }
    }
    
    // Fallback to local storage
    const result = {
      id: Date.now().toString(),
      userId,
      quizId,
      answers,
      score,
      completedAt: new Date().toISOString()
    };
    
    // Store in localStorage
    const existingResults = getLocalQuizResults();
    existingResults.push(result);
    localStorage.setItem('quizResults', JSON.stringify(existingResults));
    
    return {
      success: true,
      result,
      source: 'local',
      warning: 'Stored locally. Backend not available.'
    };
    
  } catch (error) {
    console.error('Error submitting quiz results:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get user's quiz history
export const getUserQuizHistory = async (userId) => {
  try {
    // Try backend first
    const connectionTest = await testConnection();
    if (connectionTest.success) {
      try {
        const backendHistory = await quizAPI.getUserQuizHistory(userId);
        if (backendHistory && backendHistory.length > 0) {
          return {
            success: true,
            history: backendHistory,
            source: 'backend'
          };
        }
      } catch (backendError) {
        console.log('Backend history not available, using local:', backendError.message);
      }
    }
    
    // Fallback to local storage
    const localResults = getLocalQuizResults();
    const userResults = localResults.filter(result => result.userId === userId);
    
    return {
      success: true,
      history: userResults,
      source: 'local',
      warning: 'Using local quiz history. Backend not available.'
    };
    
  } catch (error) {
    console.error('Error fetching quiz history:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper function to get local quiz results
const getLocalQuizResults = () => {
  try {
    const resultsStr = localStorage.getItem('quizResults');
    return resultsStr ? JSON.parse(resultsStr) : [];
  } catch {
    return [];
  }
};

// Calculate quiz score
export const calculateQuizScore = (answers, quiz) => {
  if (!quiz || !quiz.questions || !answers) {
    return 0;
  }
  
  let correct = 0;
  const totalQuestions = quiz.questions.length;
  
  quiz.questions.forEach((question, index) => {
    const userAnswer = answers[question.id] || answers[index];
    if (userAnswer === question.correct) {
      correct++;
    }
  });
  
  return Math.round((correct / totalQuestions) * 100);
};

// Get quiz statistics
export const getQuizStatistics = async (userId) => {
  try {
    const historyResult = await getUserQuizHistory(userId);
    if (!historyResult.success) {
      return { success: false, error: historyResult.error };
    }
    
    const history = historyResult.history;
    const stats = {
      totalQuizzesCompleted: history.length,
      averageScore: history.length > 0 ? 
        Math.round(history.reduce((sum, result) => sum + result.score, 0) / history.length) : 0,
      bestScore: history.length > 0 ? Math.max(...history.map(r => r.score)) : 0,
      recentActivity: history.slice(-5).reverse(), // Last 5 results
      categoryBreakdown: {}
    };
    
    // Calculate category breakdown
    for (const result of history) {
      const quizResult = await getQuizById(result.quizId);
      if (quizResult.success && quizResult.quiz.category) {
        const category = quizResult.quiz.category;
        if (!stats.categoryBreakdown[category]) {
          stats.categoryBreakdown[category] = {
            count: 0,
            totalScore: 0,
            averageScore: 0
          };
        }
        stats.categoryBreakdown[category].count++;
        stats.categoryBreakdown[category].totalScore += result.score;
        stats.categoryBreakdown[category].averageScore = 
          Math.round(stats.categoryBreakdown[category].totalScore / stats.categoryBreakdown[category].count);
      }
    }
    
    return {
      success: true,
      statistics: stats,
      source: historyResult.source
    };
    
  } catch (error) {
    console.error('Error calculating quiz statistics:', error);
    return { success: false, error: error.message };
  }
};

export default {
  getAllQuizzes,
  getQuizById,
  submitQuizResults,
  getUserQuizHistory,
  calculateQuizScore,
  getQuizStatistics
};
