import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ParentFlowProvider } from './context/ParentFlowContext';
import { Layout } from './components/layout/Layout';
import { ParentFlowGuard } from './components/flow/ParentFlowGuard';
import { ParentAppReadyGate } from './components/flow/ParentAppReadyGate';

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
import { ParentManageChildren } from './pages/parent/ParentManageChildren';
import { ParentOnboardingProfile } from './pages/parent/onboarding/ParentOnboardingProfile';
import { ParentOnboardingChild } from './pages/parent/onboarding/ParentOnboardingChild';
import { ParentOnboardingComplete } from './pages/parent/onboarding/ParentOnboardingComplete';

const ProtectedRoute = ({
  children,
  role,
  allowRoles,
}: {
  children: React.ReactNode;
  role?: 'parent' | 'student';
  allowRoles?: Array<'parent' | 'student'>;
}) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (allowRoles && !allowRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/parent/login" element={<ParentAuth />} />
      <Route path="/student/login" element={<StudentAuth />} />

      {/* Student routes */}
      <Route element={<Layout />}>
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
            <ProtectedRoute allowRoles={['parent', 'student']}>
              <QuizPlayer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/quiz/result"
          element={
            <ProtectedRoute allowRoles={['parent', 'student']}>
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
      </Route>

      {/* Parent routes — centralized onboarding + flow guard */}
      <Route
        path="/parent"
        element={
          <ProtectedRoute role="parent">
            <ParentFlowProvider>
              <ParentFlowGuard />
            </ParentFlowProvider>
          </ProtectedRoute>
        }
      >
        <Route path="onboarding/profile" element={<ParentOnboardingProfile />} />
        <Route path="onboarding/child" element={<ParentOnboardingChild />} />
        <Route path="onboarding/complete" element={<ParentOnboardingComplete />} />

        <Route element={<Layout />}>
          <Route index element={<Navigate to="/parent/dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <ParentAppReadyGate>
                <ParentDashboard />
              </ParentAppReadyGate>
            }
          />
          <Route
            path="reports"
            element={
              <ParentAppReadyGate>
                <ParentReports />
              </ParentAppReadyGate>
            }
          />
          <Route
            path="settings"
            element={
              <ParentAppReadyGate>
                <ParentSettings />
              </ParentAppReadyGate>
            }
          />
          <Route
            path="settings/children"
            element={
              <ParentAppReadyGate>
                <ParentManageChildren />
              </ParentAppReadyGate>
            }
          />
          <Route
            path="insights"
            element={
              <ParentAppReadyGate>
                <EmotionalInsights />
              </ParentAppReadyGate>
            }
          />
        </Route>
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
