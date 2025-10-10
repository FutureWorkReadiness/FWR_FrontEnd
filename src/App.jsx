import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import existing pages
import LandingPage from '../pages/LandingPage';
import SimpleLandingPage from '../pages/SimpleLandingPage';
import OnboardingPage from '../pages/OnboardingPage';
import SimpleOnboardingPage from '../pages/SimpleOnboardingPage';
import DashboardPage from '../pages/DashboardPage';
import TestHubPage from '../pages/TestHubPage';
import TestPage from '../pages/TestPage';

// Import components
import ProtectedRoute from '../components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tests" 
          element={
            <ProtectedRoute>
              <TestHubPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;