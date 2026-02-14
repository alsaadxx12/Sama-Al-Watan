import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import useFeaturedInstructor from '../hooks/useFeaturedInstructor';
import { Trophy, Users, BookOpen, Award } from 'lucide-react';

const FeaturedInstructorSection: React.FC = () => {
  const { theme } = useTheme();
  const { instructor, isLoading, error } = useFeaturedInstructor();

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`rounded-3xl p-8 ${theme === 'dark' ? 'bg-gray-800/60 border border-gray-700' : 'bg-white/80 border border-gray-200'
          } backdrop-blur-xl`}
      >
        <div className={`text-center ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
          <h3 className="text-lg font-black mb-2">حدث خطأ</h3>
          <p>{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
      className={`rounded-3xl p-8 ${theme === 'dark' ? 'bg-gray-800/60 border border-gray-700' : 'bg-white/80 border border-gray-200'
        } backdrop-blur-xl shadow-lg`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
          <Award className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
            الأستاذ المتميز
          </h2>
          <p className={`text-sm font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
            الأستاذ الأعلى أداءً هذا الشهر
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse">
          <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                }`} />
              <div className="flex-1">
                <div className={`h-6 w-1/2 rounded-lg mb-2 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                  }`} />
                <div className={`h-4 w-3/4 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                  }`} />
              </div>
            </div>
            <div className={`mt-4 grid grid-cols-2 gap-4`}>
              {[...Array(2)].map((_, index) => (
                <div key={index} className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                  }`}>
                  <div className={`h-4 w-3/4 rounded-lg mb-2 ${theme === 'dark' ? 'bg-gray-500' : 'bg-gray-300'
                    }`} />
                  <div className={`h-8 w-1/2 rounded-lg ${theme === 'dark' ? 'bg-gray-500' : 'bg-gray-300'
                    }`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : instructor ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Trophy Badge */}
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <div className="p-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 shadow-xl">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            </motion.div>
          </div>

          {/* Instructor Profile */}
          <div className={`text-center mb-6`}>
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl font-black shadow-xl`}>
              {instructor.name.charAt(0)}
            </div>
            <h3 className={`text-2xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
              {instructor.name}
            </h3>
            <p className={`text-sm font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
              أستاذ مميز في برامجنا التدريبية
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`p-4 rounded-2xl text-center ${theme === 'dark' ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-blue-100 border border-blue-200'
                }`}
            >
              <Users className={`w-6 h-6 mb-2 mx-auto ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`} />
              <p className={`text-2xl font-black mb-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`}>
                {instructor.totalStudents.toLocaleString('ar-IQ')}
              </p>
              <p className={`text-xs font-bold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-500'
                }`}>
                طالب إجمالي
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`p-4 rounded-2xl text-center ${theme === 'dark' ? 'bg-green-600/20 border border-green-500/30' : 'bg-green-100 border border-green-200'
                }`}
            >
              <BookOpen className={`w-6 h-6 mb-2 mx-auto ${theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`} />
              <p className={`text-2xl font-black mb-1 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`}>
                {instructor.coursesCount}
              </p>
              <p className={`text-xs font-bold ${theme === 'dark' ? 'text-green-300' : 'text-green-500'
                }`}>
                دورة نشطة
              </p>
            </motion.div>
          </div>

          {/* Top Courses */}
          {instructor.courses.length > 0 && (
            <div>
              <h4 className={`text-sm font-bold mb-3 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                أفضل دوراته
              </h4>
              <div className="space-y-2">
                {instructor.courses.slice(0, 3).map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className={`flex items-center justify-between p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${theme === 'dark' ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                        }`}>
                        {index + 1}
                      </div>
                      <span className={`text-sm font-black ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        {course.name}
                      </span>
                    </div>
                    <span className={`text-xs font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                      {course.studentCount} طالب
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
          <Trophy className={`w-12 h-12 mx-auto mb-4 opacity-50 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`} />
          <p className="font-bold">لا يوجد أساتذة حالياً</p>
          <p className="text-sm mt-1">سيتم عرض الأستاذ الأعلى أداءً هنا</p>
        </div>
      )}
    </motion.div>
  );
};

export default FeaturedInstructorSection;