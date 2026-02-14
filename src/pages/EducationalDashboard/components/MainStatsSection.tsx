import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import StatsCard from './StatsCard';
import { useEducationStats } from '../../../hooks/useEducationStats';
import { BookOpen, Users, GraduationCap, Building } from 'lucide-react';

const MainStatsSection: React.FC = () => {
  const { theme } = useTheme();
  const { totalCourses, totalStudentsInCourses, totalStudentsInInstitution, totalInstructors, isLoading, error } = useEducationStats();

  const stats = [
    {
      title: 'إجمالي الدورات المتوفرة',
      value: totalCourses,
      icon: BookOpen,
      color: 'courses' as const,
      subtitle: isLoading ? 'جاري التحميل...' : 'دورة متاحة للطلاب'
    },
    {
      title: 'الطلاب في الدورات',
      value: totalStudentsInCourses,
      icon: Users,
      color: 'students' as const,
      subtitle: isLoading ? 'جاري التحميل...' : 'طالب مسجل حالياً'
    },
    {
      title: 'إجمالي طلاب المؤسسة',
      value: totalStudentsInInstitution,
      icon: Building,
      color: 'institution' as const,
      subtitle: isLoading ? 'جاري التحميل...' : 'طالب مسجل في الإحصائيات'
    },
    {
      title: 'إجمالي الأساتذة',
      value: totalInstructors,
      icon: GraduationCap,
      color: 'instructors' as const,
      subtitle: isLoading ? 'جاري التحميل...' : 'أستاذ مؤهل'
    }
  ];

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center p-12"
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
            delay: index * 0.1
          }}
        >
          <StatsCard
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            subtitle={stat.subtitle}
            isLoading={isLoading}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default MainStatsSection;