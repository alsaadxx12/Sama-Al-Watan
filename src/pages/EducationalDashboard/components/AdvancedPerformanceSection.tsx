import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { Target, Clock, Star, Award, TrendingUp, Zap, Activity } from 'lucide-react';

interface PerformanceGaugeProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  color: string;
  icon: React.ComponentType<any>;
  target?: number;
}

const PerformanceGauge: React.FC<PerformanceGaugeProps> = ({
  value,
  max,
  label,
  unit,
  color,
  icon: Icon,
  target
}) => {
  const { theme } = useTheme();
  const percentage = (value / max) * 100;
  const targetPercentage = target ? (target / max) * 100 : 0;
  
  // Determine gauge color based on percentage
  const getGaugeColor = (percent: number) => {
    if (percent >= 90) return 'from-green-500 to-emerald-500';
    if (percent >= 75) return 'from-blue-500 to-cyan-500';
    if (percent >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
      className={`p-6 rounded-2xl ${
        theme === 'dark' ? 'bg-gray-700/50 border border-gray-600' : 'bg-white border border-gray-200'
      } shadow-lg hover:shadow-xl transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} bg-opacity-20`}>
          <Icon className={`w-5 h-5 bg-gradient-to-br ${color} bg-clip-text text-transparent`} />
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r ${getGaugeColor(percentage)} text-white`}>
          {percentage.toFixed(1)}%
        </div>
      </div>

      {/* Gauge Visualization */}
      <div className="relative mb-4">
        <div className={`w-full h-4 rounded-full overflow-hidden ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
        }`}>
          <motion.div
            className={`h-full bg-gradient-to-r ${getGaugeColor(percentage)} relative`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            {percentage >= 90 && (
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            )}
          </motion.div>
          
          {/* Target Indicator */}
          {target && (
            <div 
              className="absolute top-0 w-1 h-full bg-gray-800 dark:bg-gray-200"
              style={{ left: `${targetPercentage}%` }}
            />
          )}
        </div>
      </div>

      {/* Value Display */}
      <div className="text-center">
        <h3 className={`text-3xl font-black mb-1 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {value.toLocaleString('ar-IQ')}{unit}
        </h3>
        <p className={`text-sm font-bold ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {label}
        </p>
        {target && (
          <p className={`text-xs mt-1 ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
          }`}>
            الهدف: {target.toLocaleString('ar-IQ')}{unit}
          </p>
        )}
      </div>
    </motion.div>
  );
};

const AdvancedPerformanceSection: React.FC = () => {
  const { theme } = useTheme();
  const [selectedView, setSelectedView] = useState<'gauges' | 'comparison'>('gauges');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 2000);
    return () => clearTimeout(timer);
  }, [selectedView]);

  const gaugeData = [
    {
      value: 94.5,
      max: 100,
      label: 'معدل النجاح',
      unit: '%',
      color: 'from-blue-500 to-cyan-500',
      icon: Target,
      target: 95
    },
    {
      value: 4.8,
      max: 5,
      label: 'رضا الطلاب',
      unit: '/5.0',
      color: 'from-yellow-500 to-orange-500',
      icon: Star,
      target: 5.0
    },
    {
      value: 1.8,
      max: 5,
      label: 'وقت الاستجابة',
      unit: 'ساعة',
      color: 'from-green-500 to-emerald-500',
      icon: Clock,
      target: 2.0
    },
    {
      value: 87.2,
      max: 100,
      label: 'إكمال الدورات',
      unit: '%',
      color: 'from-purple-500 to-pink-500',
      icon: Award,
      target: 90
    }
  ];

  const comparisonData = [
    {
      category: 'الجودة الأكاديمية',
      current: 94.5,
      previous: 89.2,
      industry: 85.0,
      icon: Target,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      category: 'رضا الطلاب',
      current: 4.8,
      previous: 4.5,
      industry: 4.2,
      icon: Star,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      category: 'كفاءة العمليات',
      current: 87.2,
      previous: 82.1,
      industry: 78.5,
      icon: Activity,
      color: 'from-purple-500 to-pink-500'
    },
    {
      category: 'سرعة الاستجابة',
      current: 1.8,
      previous: 2.4,
      industry: 3.2,
      icon: Zap,
      color: 'from-green-500 to-emerald-500'
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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              rotate: [0, 180],
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity,
              ease: "linear"
            }}
            className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg"
          >
            <Activity className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h2 className={`text-xl font-black ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              مؤشرات الأداء المتقدمة
            </h2>
            <p className={`text-sm font-bold ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              تحليل مفصل لجميع جوانب الأداء
            </p>
          </div>
        </div>

        {/* View Selector */}
        <div className="flex gap-2">
          {[
            { value: 'gauges', label: 'مقاييس', icon: '🎯' },
            { value: 'comparison', label: 'مقارنة', icon: '📊' }
          ].map((view) => (
            <motion.button
              key={view.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedView(view.value as any)}
              className={`px-4 py-2 rounded-xl text-sm font-black transition-all duration-300 flex items-center gap-2 ${
                selectedView === view.value
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                  : theme === 'dark' 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{view.icon}</span>
              <span>{view.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content Based on Selected View */}
      {selectedView === 'gauges' ? (
        <motion.div
          key="gauges"
          initial={{ opacity: 0 }}
          animate={{ opacity: isAnimating ? 0 : 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {gaugeData.map((gauge, index) => (
            <motion.div
              key={gauge.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isAnimating ? 0 : 1, y: isAnimating ? 20 : 0 }}
              transition={{ 
                duration: 0.4,
                delay: isAnimating ? 0 : 0.1 + index * 0.1
              }}
            >
              <PerformanceGauge {...gauge} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          key="comparison"
          initial={{ opacity: 0 }}
          animate={{ opacity: isAnimating ? 0 : 1 }}
          className="space-y-6"
        >
          {comparisonData.map((item, index) => (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isAnimating ? 0 : 1, x: isAnimating ? -20 : 0 }}
              transition={{ 
                duration: 0.4,
                delay: isAnimating ? 0 : 0.1 + index * 0.1
              }}
              className={`p-6 rounded-2xl ${
                theme === 'dark' ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50/80 border border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${item.color} bg-opacity-20`}>
                    <item.icon className={`w-5 h-5 bg-gradient-to-br ${item.color} bg-clip-text text-transparent`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-black ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {item.category}
                    </h3>
                  </div>
                </div>
                
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${
                  item.current > item.previous
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  <TrendingUp className={`w-3 h-3 ${
                    item.current > item.previous ? '' : 'rotate-180'
                  }`} />
                  <span>
                    {Math.abs(((item.current - item.previous) / item.previous) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Comparison Bars */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-bold ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>الحالي</span>
                  <span className={`font-bold text-white bg-gradient-to-r ${item.color} px-2 py-1 rounded`}>
                    {item.current}
                  </span>
                </div>
                
                <div className={`w-full h-2 rounded-full overflow-hidden ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
                }`}>
                  <motion.div
                    className={`h-full bg-gradient-to-r ${item.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.current / 100) * 100}%` }}
                    transition={{ duration: 1.5, delay: 0.5 + index * 0.2, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-bold ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>السابق</span>
                  <span className={`font-black ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {item.previous}
                  </span>
                </div>
                
                <div className={`w-full h-2 rounded-full overflow-hidden ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
                }`}>
                  <motion.div
                    className={`h-full bg-gray-500`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.previous / 100) * 100}%` }}
                    transition={{ duration: 1.5, delay: 0.5 + index * 0.2, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-bold ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>معدل الصناعة</span>
                  <span className={`font-black ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {item.industry}
                  </span>
                </div>
                
                <div className={`w-full h-2 rounded-full overflow-hidden ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
                }`}>
                  <motion.div
                    className={`h-full bg-gray-400`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.industry / 100) * 100}%` }}
                    transition={{ duration: 1.5, delay: 0.5 + index * 0.2, ease: "easeOut" }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Summary Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className={`mt-8 p-6 rounded-2xl text-center ${
          theme === 'dark' ? 'bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-700/30' : 'bg-gradient-to-r from-indigo-100/50 to-purple-100/50 border border-indigo-200/30'
        }`}
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-lg`}
          >
            A+
          </motion.div>
          <h3 className={`text-lg font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
            تقييم الأداء الشهري: استثنائي
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className={`p-3 rounded-xl ${
            theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-100'
          }`}>
            <p className={`font-bold ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
            }`}>
              🚀超越 الأهداف
            </p>
          </div>
          <div className={`p-3 rounded-xl ${
            theme === 'dark' ? 'bg-green-600/20' : 'bg-green-100'
          }`}>
            <p className={`font-bold ${
              theme === 'dark' ? 'text-green-400' : 'text-green-700'
            }`}>
              📈 نمو مستمر
            </p>
          </div>
          <div className={`p-3 rounded-xl ${
            theme === 'dark' ? 'bg-purple-600/20' : 'bg-purple-100'
          }`}>
            <p className={`font-bold ${
              theme === 'dark' ? 'text-purple-400' : 'text-purple-700'
            }`}>
              ⭐ قيادي في الصناعة
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdvancedPerformanceSection;