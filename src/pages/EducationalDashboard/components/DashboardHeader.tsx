import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Sun, Moon, Calendar } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { usePrintSettings } from '../../../hooks/usePrintSettings';

const DashboardHeader: React.FC = () => {
  const { theme } = useTheme();
  const { employee } = useAuth();
  const { settings: printSettings } = usePrintSettings();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 17) return 'مساء الخير';
    return 'مساء النور';
  };

  const getCurrentDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getTimeOfDayIcon = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) {
      return <Sun className="w-5 h-5 text-yellow-500" />;
    }
    return <Moon className="w-5 h-5 text-indigo-500" />;
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[2.5rem] p-6 md:p-10 mb-2 transition-all duration-500 ${theme === 'dark'
        ? 'bg-[#121215] border border-gray-800 shadow-2xl'
        : 'bg-white border border-gray-100 shadow-sm'
        }`}
    >
      {/* Sophisticated Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute -top-1/2 -left-1/4 w-full h-full rounded-full blur-[100px] opacity-20 ${theme === 'dark' ? 'bg-blue-600/30' : 'bg-blue-500/10'}`} />
        <div className={`absolute -bottom-1/2 -right-1/4 w-full h-full rounded-full blur-[100px] opacity-10 ${theme === 'dark' ? 'bg-indigo-600/30' : 'bg-indigo-500/10'}`} />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Welcome Section */}
          <div className="flex items-center gap-4 md:gap-6">
            <div className={`p-4 rounded-3xl transition-all duration-500 ${theme === 'dark' ? 'bg-gray-800/80 text-white shadow-inner' : 'bg-gray-50 text-gray-900 border border-gray-100 shadow-sm'}`}>
              {getTimeOfDayIcon()}
            </div>
            <div>
              <h1 className={`text-2xl md:text-4xl font-black mb-1.5 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {getGreeting()}، <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">{employee?.name || 'مرحباً بك'}</span>
              </h1>
              <p className={`text-xs md:text-sm font-bold opacity-60 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                مرحباً بك في لوحة تحكم مؤسسة سما الوطن الانسانية للتدريب والتطوير
              </p>
            </div>
          </div>

          {/* Date and Time Badge */}
          <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all ${theme === 'dark'
            ? 'bg-gray-800/30 border-gray-700/50 text-gray-300'
            : 'bg-gray-50/50 border-gray-100 text-gray-600'
            }`}>
            <Calendar className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
            <span className="text-xs md:text-sm font-black tracking-tight leading-none">
              {getCurrentDate()}
            </span>
          </div>
        </div>

        {/* Institution Badge */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border transition-all ${theme === 'dark'
            ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
            : 'bg-indigo-50 border-indigo-100 text-indigo-700 shadow-sm'
            }`}>
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-wider">
              {printSettings.companyNameLabel || 'مؤسسة سما الوطن الانسانية للتدريب والتطوير'}
            </span>
          </div>

          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] md:text-xs font-bold ${theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            }`}>
            • نظام متصل
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;