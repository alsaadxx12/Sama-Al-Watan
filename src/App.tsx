import { useEffect, lazy, Suspense, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ExchangeRateProvider } from './contexts/ExchangeRateContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { GlobalModalsProvider } from './contexts/GlobalModalsContext';
import Layout from './components/Layout';
import PageTransition from './components/PageTransition';
import LandingPage from './pages/Landing/LandingPage';
import LoginPage from './pages/Login';
import AuthGuard from './components/AuthGuard';
import PermissionGuard from './components/PermissionGuard';
import GlobalApiSync from './components/GlobalApiSync';
import AppErrorBoundary from './components/AppErrorBoundary';
import ConnectivityManager from './components/ConnectivityManager';
import SplashScreen from './components/SplashScreen';
import { checkAndCalculateEmployeeOfTheMonth } from './lib/services/employeeOfTheMonthService';

const EducationalDashboard = lazy(() => import('./pages/EducationalDashboard'));
const Courses = lazy(() => import('./pages/Courses'));
const CourseDetail = lazy(() => import('./pages/Courses/CourseDetail'));
const InstructorDetail = lazy(() => import('./pages/Courses/InstructorDetail'));
const AddCoursePage = lazy(() => import('./pages/Courses/AddCoursePage'));
const PublicCourseInfo = lazy(() => import('./pages/Courses/PublicCourseInfo'));
const Employees = lazy(() => import('./pages/Employees'));
const Accounts = lazy(() => import('./pages/Accounts'));
const Safes = lazy(() => import('./pages/Safes'));
const PublicVoucher = lazy(() => import('./pages/PublicVoucher'));
const Attendance = lazy(() => import('./pages/Attendance'));
const StandaloneAttendance = lazy(() => import('./pages/StandaloneAttendance'));
const AttendanceReports = lazy(() => import('./pages/AttendanceReports'));
const Branches = lazy(() => import('./pages/Branches'));
const Departments = lazy(() => import('./pages/Departments'));
const ProfilePage = lazy(() => import('./pages/Profile'));
const Leaves = lazy(() => import('./pages/Leaves'));
const PersonalNotificationSettings = lazy(() => import('./pages/PersonalNotificationSettings'));
const SecurityPage = lazy(() => import('./pages/Security'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const Expenses = lazy(() => import('./pages/Expenses/index'));
const CourseApplications = lazy(() => import('./pages/CourseApplications/index'));
const Relationships = lazy(() => import('./pages/Relationships/index'));
const CategoryDetail = lazy(() => import('./pages/Relationships/CategoryDetail'));
const StudentProfile = lazy(() => import('./pages/Relationships/StudentProfile'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard/index'));

const LoadingFallback = () => {
  const { theme } = useTheme();

  return (
    <div className={`flex items-center justify-center h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>جاري التحميل...</p>
      </div>
    </div>
  );
};

function RootRedirect() {
  const { user, isAnonymous } = useAuth();
  const isAppMode = window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Only redirect to staff area if real user (not anonymous)
  if (user && !isAnonymous) {
    return <Navigate to="/educational-dashboard" />;
  }

  // If mobile or app mode, go to login, else go to landing
  if (isAppMode) {
    return <LoginPage />;
  }

  return <LandingPage />;
}

function AppRoutes() {
  const { user, isAnonymous, loading } = useAuth();
  const { customSettings } = useTheme();

  // Dynamically update favicon to match the site logo
  useEffect(() => {
    const logoUrl = customSettings.logoUrl;
    if (!logoUrl) return;
    const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    if (link) {
      link.href = logoUrl;
    }
    // Also update apple-touch-icon
    const appleLinks = document.querySelectorAll("link[rel='apple-touch-icon']");
    appleLinks.forEach((el) => {
      (el as HTMLLinkElement).href = logoUrl;
    });
  }, [customSettings.logoUrl]);

  useEffect(() => {
    checkAndCalculateEmployeeOfTheMonth();
  }, []);

  if (loading) {
    return <LoadingFallback />;
  }

  const isStaff = user && !isAnonymous;

  return (
    <Routes>
      <Route path="/login" element={isStaff ? <Navigate to="/educational-dashboard" /> : <LoginPage />} />
      <Route path="/" element={<RootRedirect />} />
      <Route path="/voucher/:voucherId" element={<Suspense fallback={<LoadingFallback />}><PublicVoucher /></Suspense>} />
      <Route path="/student-dashboard" element={<Suspense fallback={<LoadingFallback />}><StudentDashboard /></Suspense>} />
      <Route path="/course-info/:id" element={<Suspense fallback={<LoadingFallback />}><PublicCourseInfo /></Suspense>} />

      <Route
        path="/attendance-standalone"
        element={
          <AuthGuard>
            <Suspense fallback={<LoadingFallback />}>
              <StandaloneAttendance />
            </Suspense>
          </AuthGuard>
        }
      />

      <Route
        path="/*"
        element={
          <AuthGuard>
            <ExchangeRateProvider>
              <Layout>
                <PageTransition>
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>

                      <Route path="/educational-dashboard" element={<PermissionGuard requiredPermissions={{ page: 'dashboard', actions: ['view'] }}><EducationalDashboard /></PermissionGuard>} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/courses" element={<PermissionGuard requiredPermissions={{ page: 'companies', actions: ['view'] }}><Courses /></PermissionGuard>} />
                      <Route path="/courses/add" element={<PermissionGuard requiredPermissions={{ page: 'companies', actions: ['view'] }}><AddCoursePage /></PermissionGuard>} />
                      <Route path="/courses/:id" element={<PermissionGuard requiredPermissions={{ page: 'companies', actions: ['view'] }}><CourseDetail /></PermissionGuard>} />
                      <Route path="/course-applications" element={<PermissionGuard requiredPermissions={{ page: 'companies', actions: ['view'] }}><CourseApplications /></PermissionGuard>} />
                      <Route path="/instructors/:id" element={<PermissionGuard requiredPermissions={{ page: 'companies', actions: ['view'] }}><InstructorDetail /></PermissionGuard>} />
                      <Route path="/employees" element={<PermissionGuard requiredPermissions={{ page: 'employees', actions: ['view'] }}><Employees /></PermissionGuard>} />
                      <Route path="/departments" element={<PermissionGuard requiredPermissions={{ page: 'departments', actions: ['view'] }}><Departments /></PermissionGuard>} />
                      <Route path="/accounts" element={<PermissionGuard requiredPermissions={{ page: 'accounts', actions: ['view'] }}><Accounts /></PermissionGuard>} />
                      <Route path="/safes" element={<PermissionGuard requiredPermissions={{ page: 'safes', actions: ['view'] }}><Safes /></PermissionGuard>} />
                      <Route path="/expenses" element={<PermissionGuard requiredPermissions={{ page: 'accounts', actions: ['view'] }}><Expenses /></PermissionGuard>} />
                      <Route path="/attendance" element={<PermissionGuard requiredPermissions={{ page: 'تسجيل الحضور', actions: ['view'] }}><Attendance /></PermissionGuard>} />
                      <Route path="/attendance-reports" element={<PermissionGuard requiredPermissions={{ page: 'تقارير الحضور', actions: ['view'] }}><AttendanceReports /></PermissionGuard>} />
                      <Route path="/branches" element={<PermissionGuard requiredPermissions={{ page: 'الفروع', actions: ['view'] }}><Branches /></PermissionGuard>} />
                      <Route path="/leaves" element={<Leaves />} />
                      <Route path="/security" element={<SecurityPage />} />
                      <Route path="/notification-settings" element={<PersonalNotificationSettings />} />
                      <Route path="/settings" element={<PermissionGuard requiredPermissions={{ page: 'settings', actions: ['view'] }}><SettingsPage /></PermissionGuard>} />
                      <Route path="/relationships" element={<Relationships />} />
                      <Route path="/relationships/students/:studentId" element={<Suspense fallback={<LoadingFallback />}><StudentProfile /></Suspense>} />
                      <Route path="/relationships/:category" element={<Suspense fallback={<LoadingFallback />}><CategoryDetail /></Suspense>} />

                      <Route path="*" element={<Navigate to="/educational-dashboard" />} />
                    </Routes>
                  </Suspense>
                </PageTransition>
              </Layout>
            </ExchangeRateProvider>
          </AuthGuard>
        }
      />
    </Routes>
  );
}

import { Toaster } from 'sonner';

import NotificationManager from './components/NotificationManager';

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('splash_shown');
  });

  const handleSplashFinish = useCallback(() => {
    sessionStorage.setItem('splash_shown', 'true');
    setShowSplash(false);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppErrorBoundary>
          <ThemeProvider>
            <LanguageProvider>
              <NotificationProvider>
                <GlobalModalsProvider>
                  <Toaster position="top-center" richColors />
                  <ConnectivityManager />
                  <GlobalApiSync />
                  <NotificationManager />
                  {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
                  <AppRoutes />
                </GlobalModalsProvider>
              </NotificationProvider>
            </LanguageProvider>
          </ThemeProvider>
        </AppErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}
