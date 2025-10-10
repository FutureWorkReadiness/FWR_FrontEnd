import React from 'react';
import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../utils/auth';

export default function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    // Redirect to landing page if not logged in
    return <Navigate to="/" replace />;
  }

  return children;
}
