import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { Medal, Target, Clock, Star, TrendingUp, TrendingDown, Activity, Award } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

const PerformanceMetrics: React.FC = () => {
  const { theme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<number | null>(null);

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => setIsAnimating(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const [metrics, setMetrics] = useState([
    {
      id: 1,
      title: 'متوسط معدل النجاح',
      value: 94.5,
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
      change: 2.3,
      positive: true,
      target: 95,
      history: [92.1, 93.2, 94.5],
      description: 'نسبة النجاح عبر جميع الدورات'
    },
    {
      id: 2,
      title: 'وقت الاستجابة المتوسط',
      value: 1.8,
      icon: Clock,
      color: 'from-green-500 to-emerald-500',
      change: -15,
      positive: true,
      target: 2.0,
      history: [2.4, 2.1, 1.8],
      description: 'متوسط الوقت للاستجابة لاستفسارات الطلاب'
    },
    {
      id: 3,
      title: 'معدل رضا الطلاب',
      value: 4.8,
      icon: Star,
      color: 'from-yellow-500 to-orange-500',
      change: 0.3,
      positive: true,
      target: 5.0,
      history: [4.3, 4.5, 4.8],
      description: 'تقييم الرضا من 1 إلى 5 نقاط'
    },
    {
      id: 4,
      title: 'معدل إكمال الدورات',
      value: 87.2,
      icon: Medal,
      color: 'from-purple-500 to-pink-500',
      change: 5.7,
      positive: true,
      target: 90,
      history: [78.5, 82.1, 87.2],
      description: 'نسبة الطلاب الذين يكملون دوراتهم'
    }
  ]);

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 95) return 'bg-green-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatValue = (value: number, metric: any) => {
    if (metric.title.includes('%')) {
      return `${value}%`;
    } else if (metric.title.includes('رضا')) {
      return `${value}/5.0`;
    } else if (metric.title.includes('الوقت')) {
      return `${value} ساعة`;
    }
    return value.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.9 }}
      className={`rounded-3xl p-8 ${theme === 'dark' ? 'bg-gray-800/60 border border-gray-700' : 'bg-white/80 border border-gray-200'
        } backdrop-blur-xl shadow-lg`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="p-3 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 shadow-lg"
          >
            <Activity className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h2 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
              مؤشرات الأداء المتقدمة
            </h2>
            <p className={`text-sm font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
              تحليل شامل لجودة التعليم والإنجاز
            </p>
          </div>
        </div>

        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-black"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span>مباشر</span>
        </motion.div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: isAnimating ? 1 : 0,
              scale: isAnimating ? 1 : 0.9
            }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
              delay: 1.0 + index * 0.1
            }}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
            }}
            onClick={() => setSelectedMetric(selectedMetric === metric.id ? null : metric.id)}
            className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${selectedMetric === metric.id
                ? theme === 'dark' ? 'bg-gray-700/80' : 'bg-gray-100'
                : theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50/80'
              } border ${selectedMetric === metric.id
                ? theme === 'dark' ? 'border-blue-500' : 'border-blue-300'
                : theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
              }`}
          >
            {/* Metric Header */}
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.color} bg-opacity-20`}>
                <metric.icon className={`w-6 h-6 bg-gradient-to-br ${metric.color} bg-clip-text text-transparent`} />
              </div>

              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-black ${metric.positive
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                {metric.positive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{Math.abs(metric.change)}%</span>
              </div>
            </div>

            {/* Metric Value */}
            <div className="mb-3">
              <h3 className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                <AnimatedCounter
                  value={metric.value}
                  duration={2000}
                  suffix={metric.title.includes('%') ? '%' : metric.title.includes('رضا') ? '/5.0' : metric.title.includes('الوقت') ? ' ساعة' : ''}
                />
              </h3>
              <p className={`text-sm font-bold mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                {metric.title}
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`}>
                {metric.description}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className={`font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                  الهدف: {formatValue(metric.target, metric)}
                </span>
                <span className={`font-black ${getProgressPercentage(metric.value, metric.target) >= 95 ? 'text-green-500' :
                    getProgressPercentage(metric.value, metric.target) >= 80 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                  {getProgressPercentage(metric.value, metric.target).toFixed(1)}%
                </span>
              </div>
              <div className={`w-full h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                <motion.div
                  className={`h-full bg-gradient-to-r ${metric.color} relative`}
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgressPercentage(metric.value, metric.target)}%` }}
                  transition={{ duration: 1.5, delay: 1.5 + index * 0.2, ease: "easeOut" }}
                >
                  {getProgressPercentage(metric.value, metric.target) >= 95 && (
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  )}
                </motion.div>
              </div>
            </div>

            {/* Mini Chart */}
            {selectedMetric === metric.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className={`pt-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                  }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className={`font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                    التاريخ الماضي
                  </span>
                </div>
                <div className="flex items-end justify-between h-16 gap-2">
                  {metric.history.map((value, historyIndex) => (
                    <motion.div
                      key={historyIndex}
                      initial={{ height: 0 }}
                      animate={{ height: `${(value / metric.target) * 100}%` }}
                      transition={{ duration: 0.5, delay: historyIndex * 0.1 }}
                      className={`flex-1 rounded-t-sm bg-gradient-to-t ${metric.color} opacity-80`}
                      title={`${value} (${historyIndex === 0 ? '3 أشهر' : historyIndex === 1 ? 'شهرين' : 'شهري'})`}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Overall Performance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className={`p-6 rounded-2xl text-center ${theme === 'dark' ? 'bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-700/30' : 'bg-gradient-to-r from-purple-100/50 to-blue-100/50 border border-purple-200/30'
          }`}
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <Award className={`w-8 h-8 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
              }`} />
          </motion.div>
          <div>
            <p className={`text-lg font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent`}>
              أداء المؤسسة الشهري
            </p>
            <p className={`text-xs font-bold ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'
              }`}>
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <div className={`px-4 py-2 rounded-xl text-sm font-black ${theme === 'dark' ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-700'
            }`}>
            🎯 التقدم: ممتاز
          </div>
          <div className={`px-4 py-2 rounded-xl text-sm font-black ${theme === 'dark' ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-700'
            }`}>
            📈 النمو: +18.5%
          </div>
          <div className={`px-4 py-2 rounded-xl text-sm font-black ${theme === 'dark' ? 'bg-yellow-600/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
            }`}>
            ⭐ التقييم: A+
          </div>
        </div>

        <p className={`text-xs mt-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
          جميع المؤشرات في التحسن المستمر وأعلى من الأهداف المحددة
        </p>
      </motion.div>
    </motion.div>
  );
};

export default PerformanceMetrics;