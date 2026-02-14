import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import useTopCourses, { TopCourse } from '../hooks/useTopCourses';
import { TrendingUp, Users, DollarSign, Clock, Layout } from 'lucide-react';

const TopCoursesSection: React.FC = () => {
  const { theme } = useTheme();
  const { courses, isLoading, error } = useTopCourses(5);
  const isDark = theme === 'dark';

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`rounded-[2.5rem] p-8 ${isDark ? 'bg-[#121215] border border-gray-800' : 'bg-white border border-gray-100'
          } shadow-xl`}
      >
        <div className={`text-center ${isDark ? 'text-red-400' : 'text-red-600'}`}>
          <h3 className="text-lg font-black mb-2">حدث خطأ</h3>
          <p>{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`rounded-[2.5rem] p-6 md:p-10 ${isDark ? 'bg-[#121215] border border-gray-800' : 'bg-white border border-gray-100'
        } shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] relative overflow-hidden`}
    >
      {/* Background Decorative Element */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full blur-[120px] opacity-[0.05] ${isDark ? 'bg-orange-500' : 'bg-orange-200'}`} />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                الدورات الأكثر طلباً
              </h2>
              <p className={`text-sm font-bold opacity-60 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                أفضل 5 دورات حسب تفاعل الطلاب ونسب التسجيل
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`h-64 rounded-3xl animate-pulse ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {courses.map((course: TopCourse, index: number) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`group relative flex flex-col rounded-[2rem] p-5 transition-all duration-500 border overflow-hidden ${isDark
                  ? 'bg-gray-900/40 border-gray-800 hover:bg-gray-800/60 hover:border-gray-700'
                  : 'bg-gray-50/50 border-gray-200 hover:bg-white hover:shadow-2xl hover:border-transparent'
                  }`}
              >
                {/* Ranking Badge */}
                <div className="absolute top-4 right-4 z-20">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-xl font-black text-sm shadow-lg ${isDark ? 'bg-gray-800 text-blue-400' : 'bg-white text-blue-600'
                    }`}>
                    {index + 1}
                  </div>
                </div>

                {/* Course Image Section */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-5 bg-gray-200 dark:bg-gray-800">
                  {course.imageUrl ? (
                    <img
                      src={course.imageUrl}
                      alt={course.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 p-2"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
                      <Layout className={`w-12 h-12 ${isDark ? 'text-gray-700' : 'text-gray-200'}`} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Course Content */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="mb-3">
                      {index === 0 && (
                        <span className="inline-block px-2 py-0.5 rounded-lg text-[9px] font-black bg-orange-500/10 text-orange-500 mb-1 leading-none">
                          الأعلى طلباً
                        </span>
                      )}
                      <h3 className={`text-sm font-black leading-tight line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {course.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <div className={`p-1.5 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-200/50'}`}>
                        <Clock className="w-3 h-3 text-indigo-500" />
                      </div>
                      <span className={`text-[10px] font-bold truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {course.instructorName || 'غير محدد'}
                      </span>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-500" />
                        <span className={`text-[11px] font-black ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {course.studentCount}
                        </span>
                      </div>
                      {course.feePerStudent && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                          <span className="text-[10px] font-black text-indigo-500">
                            {course.feePerStudent.toLocaleString('ar-IQ')} {course.currency}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Capacity Bar */}
                    {course.maxStudents !== undefined && course.maxStudents > 0 && (
                      <div className="pt-1">
                        <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-wider mb-1 opacity-60">
                          <span>اكتمال التسجيل</span>
                          <span>{course.enrollmentRate.toFixed(0)}%</span>
                        </div>
                        <div className={`h-1 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(course.enrollmentRate, 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full rounded-full ${course.enrollmentRate >= 80 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TopCoursesSection;