import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { LucideIcon } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: 'courses' | 'students' | 'instructors' | 'institution';
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  trend,
  isLoading = false
}) => {
  const { theme } = useTheme();

  const colorConfig = {
    courses: {
      gradient: 'from-blue-500 to-cyan-500',
      bgLight: 'bg-blue-500/10',
      textLight: 'text-blue-500',
      shadow: 'shadow-blue-500/25',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500'
    },
    students: {
      gradient: 'from-green-500 to-emerald-500',
      bgLight: 'bg-green-500/10',
      textLight: 'text-green-500',
      shadow: 'shadow-green-500/25',
      iconBg: 'bg-gradient-to-br from-green-500 to-emerald-500'
    },
    instructors: {
      gradient: 'from-purple-500 to-pink-500',
      bgLight: 'bg-purple-500/10',
      textLight: 'text-purple-500',
      shadow: 'shadow-purple-500/25',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500'
    },
    institution: {
      gradient: 'from-indigo-500 to-blue-500',
      bgLight: 'bg-indigo-500/10',
      textLight: 'text-indigo-500',
      shadow: 'shadow-indigo-500/25',
      iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-500'
    }
  };

  const config = colorConfig[color];

  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] p-6 md:p-8 transition-all duration-300 ${theme === 'dark'
          ? 'bg-[#121215] border border-gray-800 shadow-2xl'
          : 'bg-white border border-gray-100 shadow-sm'
        }`}
    >
      {/* Background Decorative Element */}
      <div className={`absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-br ${config.gradient} opacity-[0.03] rounded-full blur-3xl`} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-8">
          <div className={`p-3.5 rounded-2xl ${config.iconBg} shadow-lg shadow-${color}-500/10`}>
            <Icon className="w-6 h-6 text-white" />
          </div>

          {trend && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-tight ${trend.isPositive
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-500 border border-red-500/20'
              }`}>
              <span className="text-[12px]">{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h3 className={`text-[11px] font-black uppercase tracking-[0.1em] opacity-40 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
            {title}
          </h3>

          {isLoading ? (
            <div className={`h-10 w-24 rounded-xl animate-pulse ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
              }`} />
          ) : (
            <div className={`text-4xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
              {typeof value === 'number' ? (
                <AnimatedCounter
                  value={value}
                  duration={1200}
                />
              ) : (
                value
              )}
            </div>
          )}

          {subtitle && (
            <p className={`text-[10px] font-bold mt-3 opacity-60 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;