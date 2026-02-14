import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { BarChart3, TrendingUp, TrendingDown, Activity, Users, Clock, Award, Star } from 'lucide-react';

interface PerformanceTrend {
  month: string;
  successRate: number;
  satisfaction: number;
  completionRate: number;
  responseTime: number;
  totalStudents: number;
}

const PerformanceTrends: React.FC = () => {
  const { theme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<'3months' | '6months' | '1year'>('3months');
  const [isLoading, setIsLoading] = useState(true);

  const [trends] = useState<PerformanceTrend[]>([
    {
      month: 'يناير',
      successRate: 89.2,
      satisfaction: 4.3,
      completionRate: 82.1,
      responseTime: 2.4,
      totalStudents: 245
    },
    {
      month: 'فبراير',
      successRate: 91.5,
      satisfaction: 4.5,
      completionRate: 84.3,
      responseTime: 2.2,
      totalStudents: 267
    },
    {
      month: 'مارس',
      successRate: 94.5,
      satisfaction: 4.8,
      completionRate: 87.2,
      responseTime: 1.8,
      totalStudents: 298
    }
  ]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [selectedPeriod]);

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-yellow-500';
  };

  const calculateChange = (current: number, previous: number) => {
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const renderMiniChart = (data: number[], color: string) => {
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;

    return (
      <div className="flex items-end justify-between h-8 gap-1">
        {data.map((value, index) => (
          <motion.div
            key={index}
            initial={{ height: 0 }}
            animate={{ height: `${((value - minValue) / range) * 100}%` }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className={`flex-1 rounded-t-sm ${color} opacity-80`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`rounded-3xl p-8 ${
          theme === 'dark' ? 'bg-gray-800/60 border border-gray-700' : 'bg-white/80 border border-gray-200'
        } backdrop-blur-xl shadow-lg`}
      >
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded-full w-1/3 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className={`p-6 rounded-2xl ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <div className="h-32 bg-gray-200 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 1.0 }}
      className={`rounded-3xl p-8 ${
        theme === 'dark' ? 'bg-gray-800/60 border border-gray-700' : 'bg-white/80 border border-gray-200'
      } backdrop-blur-xl shadow-lg`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              rotate: [0, 15, -15, 0],
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg"
          >
            <BarChart3 className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h2 className={`text-xl font-black ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              اتجاهات الأداء
            </h2>
            <p className={`text-sm font-bold ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              تحليل الأداء عبر الزمن
            </p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {[
            { value: '3months', label: '3 أشهر' },
            { value: '6months', label: '6 أشهر' },
            { value: '1year', label: 'سنة' }
          ].map((period) => (
            <motion.button
              key={period.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedPeriod(period.value as any)}
              className={`px-4 py-2 rounded-xl text-sm font-black transition-all duration-300 ${
                selectedPeriod === period.value
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : theme === 'dark' 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {period.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Trends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Success Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-6 rounded-2xl ${
            theme === 'dark' ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50/80 border border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 bg-opacity-20`}>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="font-bold text-green-500">
                {calculateChange(trends[trends.length - 1].successRate, trends[trends.length - 2].successRate)}%
              </span>
            </div>
          </div>
          
          <h3 className={`text-lg font-black mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {trends[trends.length - 1].successRate}%
          </h3>
          <p className={`text-xs font-bold mb-3 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            معدل النجاح
          </p>
          
          {renderMiniChart(trends.map(t => t.successRate), 'bg-blue-500')}
        </motion.div>

        {/* Satisfaction Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-6 rounded-2xl ${
            theme === 'dark' ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50/80 border border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 bg-opacity-20`}>
              <Star className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="font-bold text-green-500">
                {calculateChange(trends[trends.length - 1].satisfaction, trends[trends.length - 2].satisfaction)}%
              </span>
            </div>
          </div>
          
          <h3 className={`text-lg font-black mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {trends[trends.length - 1].satisfaction}/5.0
          </h3>
          <p className={`text-xs font-bold mb-3 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            رضا الطلاب
          </p>
          
          {renderMiniChart(trends.map(t => (t.satisfaction / 5) * 100), 'bg-yellow-500')}
        </motion.div>

        {/* Completion Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-6 rounded-2xl ${
            theme === 'dark' ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50/80 border border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 bg-opacity-20`}>
              <Award className="w-4 h-4 text-purple-500" />
            </div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="font-bold text-green-500">
                {calculateChange(trends[trends.length - 1].completionRate, trends[trends.length - 2].completionRate)}%
              </span>
            </div>
          </div>
          
          <h3 className={`text-lg font-black mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {trends[trends.length - 1].completionRate}%
          </h3>
          <p className={`text-xs font-bold mb-3 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            إكمال الدورات
          </p>
          
          {renderMiniChart(trends.map(t => t.completionRate), 'bg-purple-500')}
        </motion.div>

        {/* Response Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`p-6 rounded-2xl ${
            theme === 'dark' ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50/80 border border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 bg-opacity-20`}>
              <Clock className="w-4 h-4 text-green-500" />
            </div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingDown className="w-3 h-3 text-green-500" />
              <span className="font-bold text-green-500">
                {calculateChange(trends[trends.length - 1].responseTime, trends[trends.length - 2].responseTime)}%
              </span>
            </div>
          </div>
          
          <h3 className={`text-lg font-black mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {trends[trends.length - 1].responseTime}س
          </h3>
          <p className={`text-xs font-bold mb-3 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            وقت الاستجابة
          </p>
          
          {renderMiniChart(trends.map(t => (3 - t.responseTime) * 20), 'bg-green-500')}
        </motion.div>
      </div>

      {/* Student Growth Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`p-6 rounded-2xl ${
          theme === 'dark' ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50/80 border border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 bg-opacity-20`}>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <h3 className={`text-lg font-black ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                نمو الطلاب
              </h3>
              <p className={`text-xs font-bold ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                إجمالي الطلاب المسجلين
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-2xl font-black ${
              theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
            }`}>
              {trends[trends.length - 1].totalStudents}
            </div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="font-bold text-green-500">
                +{calculateChange(trends[trends.length - 1].totalStudents, trends[trends.length - 2].totalStudents)}%
              </span>
            </div>
          </div>
        </div>
        
        {/* Main Chart */}
        <div className={`h-32 flex items-end justify-between gap-2 ${
          theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-100/50'
        } rounded-xl p-4`}>
          {trends.map((trend, index) => (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: '100%' }}
              transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
              className="flex-1 flex flex-col items-center gap-2"
            >
              <div className={`w-full bg-gradient-to-t from-indigo-500 to-blue-500 rounded-t-sm relative`}
                style={{ height: `${(trend.totalStudents / 300) * 100}%` }}
              >
                {index === trends.length - 1 && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                )}
              </div>
              <span className={`text-xs font-bold ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {trend.month.substring(0, 3)}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Insights Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className={`mt-6 p-4 rounded-2xl text-center ${
          theme === 'dark' ? 'bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-700/30' : 'bg-gradient-to-r from-indigo-100/50 to-purple-100/50 border border-indigo-200/30'
        }`}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Activity className={`w-5 h-5 ${
            theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
          }`} />
          <p className={`text-sm font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
            رؤى الأداء
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className={`p-3 rounded-xl ${
            theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-100'
          }`}>
            <p className={`font-bold ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
            }`}>
              🎯 الأداء في تحسن مستمر
            </p>
          </div>
          <div className={`p-3 rounded-xl ${
            theme === 'dark' ? 'bg-green-600/20' : 'bg-green-100'
          }`}>
            <p className={`font-bold ${
              theme === 'dark' ? 'text-green-400' : 'text-green-700'
            }`}>
              📈 نمو طبيعي ومستقر
            </p>
          </div>
          <div className={`p-3 rounded-xl ${
            theme === 'dark' ? 'bg-purple-600/20' : 'bg-purple-100'
          }`}>
            <p className={`font-bold ${
              theme === 'dark' ? 'text-purple-400' : 'text-purple-700'
            }`}>
              ⭐ التقييم: A+ استثنائي
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PerformanceTrends;