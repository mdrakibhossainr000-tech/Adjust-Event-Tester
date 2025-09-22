import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';

// Page imports
import GameEventManager from './pages/game-event-manager';
import Login from './pages/auth/Login';
import NotFound from './pages/NotFound';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route 
              path="/game-event-manager" 
              element={
                <ProtectedRoute>
                  <GameEventManager />
                </ProtectedRoute>
              } 
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/game-event-manager" replace />} />
            
            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
