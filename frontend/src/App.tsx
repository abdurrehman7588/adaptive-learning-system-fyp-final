import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';

// Pages
import { LandingPage } from './pages/landing/LandingPage';
import { ParentAuth } from './pages/auth/ParentAuth';
import { StudentAuth } from './pages/auth/StudentAuth';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { QuizList } from './pages/student/QuizList';
import { QuizPlayer } from './pages/student/QuizPlayer';
import { QuizResultPage } from './pages/student/QuizResultPage';
import { StudentRewards } from './pages/student/StudentRewards';
import { StudentProfile } from './pages/student/StudentProfile';
import { ParentDashboard } from './pages/parent/ParentDashboard';
import { EmotionalInsights } from './pages/parent/EmotionalInsights';
import { ParentReports } from './pages/parent/ParentReports';
import { ParentSettings } from './pages/parent/ParentSettings';

// Protected Route Wrapper
const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: 'parent' | 'student' }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/parent/login" element={<ParentAuth />} />
      <Route path="/student/login" element={<StudentAuth />} />

      {/* Protected Routes inside Layout */}
      <Route element={<Layout />}>
        {/* Student Routes */}
        <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/quizzes"
          element={
            <ProtectedRoute role="student">
              <QuizList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/quiz/:quizId"
          element={
            <ProtectedRoute role="student">
              <QuizPlayer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/quiz/result"
          element={
            <ProtectedRoute role="student">
              <QuizResultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/rewards"
          element={
            <ProtectedRoute role="student">
              <StudentRewards />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute role="student">
              <StudentProfile />
            </ProtectedRoute>
          }
        />

        {/* Parent Routes */}
        <Route path="/parent" element={<Navigate to="/parent/dashboard" replace />} />
        <Route
          path="/parent/dashboard"
          element={
            <ProtectedRoute role="parent">
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/reports"
          element={
            <ProtectedRoute role="parent">
              <ParentReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/settings"
          element={
            <ProtectedRoute role="parent">
              <ParentSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/insights"
          element={
            <ProtectedRoute role="parent">
              <EmotionalInsights />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
