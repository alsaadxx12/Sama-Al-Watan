import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { TrendingUp, Award, Target, Zap } from 'lucide-react';

const QuickStatsCard: React.FC<{
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  color: string;
  trend?: number;
}> = ({ title, value, icon: Icon, color, trend }) => {
  const { theme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
      }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer ${
        theme === 'dark' ? 'bg-gray-800/80' : 'bg-white/90'
      } backdrop-blur-xl border border-gray-200/50 shadow-xl`}
    >
      {/* Background decoration */}
      <div className={`absolute -top-2 -right-2 w-20 h-20 rounded-full ${color} opacity-10 blur-xl`} />
      
      <div className="relative z-10">
        <div className={`inline-flex p-3 rounded-xl ${color} bg-opacity-20 mb-4`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        
        <h4 className={`text-sm font-bold mb-2 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {title}
        </h4>
        
        <p className={`text-2xl font-black ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {value}
        </p>
        
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${
            trend > 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            <TrendingUp className="w-3 h-3" />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      {/* Animated border effect */}
      <div className={`absolute inset-0 rounded-2xl border-2 ${color} opacity-0 hover:opacity-100 transition-opacity duration-300`} />
    </motion.div>
  );
};

const QuickStatsSection: React.FC = () => {
  const { theme } = useTheme();

  const quickStats = [
    {
      title: 'معدل النمو',
      value: '+12.5%',
      icon: TrendingUp,
      color: 'bg-green-500',
      trend: 12.5
    },
    {
      title: 'معدل الإنجاز',
      value: '94.2%',
      icon: Target,
      color: 'bg-blue-500',
      trend: 4.2
    },
    {
      title: 'الأداء الشهري',
      value: 'A+',
      icon: Award,
      color: 'bg-purple-500',
      trend: 8.7
    },
    {
      title: 'سرعة الاستجابة',
      value: '1.2s',
      icon: Zap,
      color: 'bg-orange-500',
      trend: -5.3
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      {quickStats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4,
            delay: 0.9 + index * 0.1
          }}
        >
          <QuickStatsCard {...stat} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default QuickStatsSection;