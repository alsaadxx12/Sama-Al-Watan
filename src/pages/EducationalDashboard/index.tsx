import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import DashboardHeader from './components/DashboardHeader';
import MainStatsSection from './components/MainStatsSection';
import TopCoursesSection from './components/TopCoursesSection';
import FeaturedInstructorSection from './components/FeaturedInstructorSection';
import LiveActivityFeed from './components/LiveActivityFeed';
import QuickActionPanel from './components/QuickActionPanel';

const EducationalDashboard: React.FC = () => {
  const { theme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastUpdated] = useState<Date>(new Date());

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${theme === 'dark'
      ? 'bg-[#0a0a0c]'
      : 'bg-[#f8fafc]'
      }`}>

      {/* Subtle Background Decorative Elements - Static and Performant */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 transition-all duration-1000 ${theme === 'dark' ? 'bg-indigo-500' : 'bg-indigo-300'}`} />
        <div className={`absolute -bottom-[10%] -left-[10%] w-[30%] h-[30%] rounded-full blur-[100px] opacity-10 transition-all duration-1000 ${theme === 'dark' ? 'bg-purple-500' : 'bg-purple-300'}`} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-10">

        {/* Dashboard Header */}
        <DashboardHeader />

        {/* Quick Actions Row */}
        <QuickActionPanel />

        {/* Main Statistics */}
        <MainStatsSection />

        {/* Advanced Sections */}
        <TopCoursesSection />
        <FeaturedInstructorSection />

        {/* Live Activity Feed */}
        <LiveActivityFeed />

        {/* Footer Stats */}
        <div
          className={`mt-4 p-6 rounded-3xl text-center border transition-all ${theme === 'dark'
            ? 'bg-gray-900/40 border-gray-800/50 text-gray-400'
            : 'bg-white/40 border-gray-200/50 text-gray-500'
            } backdrop-blur-md`}
        >
          <p className="text-sm font-bold">
            آخر تحديث: {lastUpdated.toLocaleTimeString('ar-IQ')}
          </p>
          <p className="text-[10px] font-bold mt-2 opacity-60 uppercase tracking-widest">
            © {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Notification Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed top-20 right-6 w-80 rounded-3xl p-6 z-50 ${theme === 'dark'
              ? 'bg-gray-900/90 border border-gray-800 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]'
              : 'bg-white/90 border border-gray-100 shadow-xl'
              } backdrop-blur-xl`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                الإشعارات
              </h3>
              <button
                onClick={() => setShowNotifications(false)}
                className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div className={`p-4 rounded-2xl border ${theme === 'dark'
                ? 'bg-blue-500/10 border-blue-500/20'
                : 'bg-blue-50 border-blue-100'
                }`}>
                <p className={`text-sm font-black ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
                  }`}>
                  🎓 تم تحديث لوحة التعليم
                </p>
                <p className={`text-xs mt-1 font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                  الإحصائيات محدّثة أتوماتيكياً
                </p>
              </div>

              <div className={`p-4 rounded-2xl border ${theme === 'dark'
                ? 'bg-green-500/10 border-green-500/20'
                : 'bg-green-50 border-green-100'
                }`}>
                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-700'
                  }`}>
                  📈 نمو في عدد الطلاب
                </p>
                <p className={`text-xs mt-1 font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                  زيادة 12% هذا الشهر
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EducationalDashboard;