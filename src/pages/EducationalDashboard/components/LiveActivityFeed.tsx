import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';

const LiveActivityFeed: React.FC = () => {
  const { theme } = useTheme();

  const activities = [
    {
      id: 1,
      type: 'enrollment',
      title: 'طالب جديد مسجل',
      description: 'أحمد محمد سجل في دورة البرمجة',
      time: 'قبل دقيقتين',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      id: 2,
      type: 'achievement',
      title: 'إنجاز جديد',
      description: 'الدورة حققت 100% امتلاء',
      time: 'قبل 5 دقائق',
      icon: TrendingUp,
      color: 'bg-blue-500'
    },
    {
      id: 3,
      type: 'progress',
      title: 'تحديث تقدم',
      description: '15 طالب أكملوا الفصل الأول',
      time: 'قبل 10 دقائق',
      icon: BarChart3,
      color: 'bg-purple-500'
    },
    {
      id: 4,
      type: 'schedule',
      title: 'حصة قادمة',
      description: 'دورة التصميم تبدأ بعد ساعة',
      time: 'قبل 15 دقيقة',
      icon: Clock,
      color: 'bg-orange-500'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 1.0 }}
      className={`rounded-3xl p-8 ${
        theme === 'dark' ? 'bg-gray-800/60 border border-gray-700' : 'bg-white/80 border border-gray-200'
      } backdrop-blur-xl shadow-lg`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className={`text-xl font-black ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            النشاط المباشر
          </h2>
          <p className={`text-sm font-bold ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            آخر الأنشطة في المؤسسة
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.4, 
              ease: "easeOut",
              delay: 1.1 + index * 0.1
            }}
            className={`p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
              theme === 'dark' 
                ? 'bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600' 
                : 'bg-gray-50/80 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  delay: index * 0.2
                }}
                className={`p-2 rounded-xl ${activity.color} flex-shrink-0`}
              >
                <activity.icon className="w-4 h-4 text-white" />
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-black mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {activity.title}
                </h3>
                <p className={`text-xs font-bold mb-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {activity.description}
                </p>
                <p className={`text-xs font-bold ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  {activity.time}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-6 text-center"
      >
        <button className={`text-sm font-bold transition-colors ${
          theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
        }`}>
          عرض كل الأنشطة →
        </button>
      </motion.div>
    </motion.div>
  );
};

export default LiveActivityFeed;