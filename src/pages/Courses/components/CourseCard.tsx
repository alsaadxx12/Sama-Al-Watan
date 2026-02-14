import { BookOpen, Pencil, Trash2, User, Clock, Calendar, Users, UserPlus, Phone, Eye } from 'lucide-react';
import { Course } from '../hooks/useCourses';
import { useTheme } from '../../../contexts/ThemeContext';

interface CourseCardProps {
  course: Course;
  gridView?: 'grid' | 'compact' | 'list';
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
  onAddStudent?: (course: Course) => void;
  onViewDetails?: (course: Course) => void;
  studentCount?: number;
}

const formatCurrency = (amount?: number, currency?: string) => {
  if (!amount) return null;
  const formatted = amount.toLocaleString('en-US');
  return `${formatted} ${currency === 'USD' ? '$' : 'IQD'}`;
};

export default function CourseCard({
  course,
  gridView = 'grid',
  onEdit,
  onDelete,
  onAddStudent,
  onViewDetails,
  studentCount,
}: CourseCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // List view
  if (gridView === 'list') {
    return (
      <div className={`rounded-2xl border overflow-hidden transition-all hover:shadow-lg ${isDark
        ? 'bg-gray-800/60 border-gray-700 hover:border-gray-600'
        : 'bg-white border-gray-200 hover:border-gray-300'
        }`}>
        <div className="flex items-stretch" dir="rtl">
          {/* Image */}
          {course.imageUrl && (
            <div className={`w-28 h-auto flex-shrink-0 relative ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <img src={course.imageUrl} alt={course.name} className="w-full h-full object-contain relative z-10" />
              {/* Subtle background blur for aesthetic */}
              <div className="absolute inset-0 opacity-20 blur-sm pointer-events-none">
                <img src={course.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          <div className="flex-1 p-4 flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className={`text-base font-black ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{course.name}</h3>
                {course.instructorName && (
                  <span className={`text-xs font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>• {course.instructorName}</span>
                )}
              </div>
              <div className="flex items-center gap-4 flex-wrap text-xs">
                {course.feePerStudent && (
                  <span className={`font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {formatCurrency(course.feePerStudent, course.currency)}
                  </span>
                )}
                {course.daysCount && (
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{course.daysCount} يوم</span>
                )}
                {course.maxStudents && (
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{course.maxStudents} طالب</span>
                )}
                {course.lectureStartTime && course.lectureEndTime && (
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{course.lectureStartTime} - {course.lectureEndTime}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {onViewDetails && (
                <button onClick={() => onViewDetails(course)} className={`p-2 rounded-xl transition-all ${isDark ? 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30' : 'bg-violet-100 text-violet-600 hover:bg-violet-200'}`} title="تفاصيل الدورة">
                  <Eye className="w-3.5 h-3.5" />
                </button>
              )}
              {onAddStudent && (
                <button onClick={() => onAddStudent(course)} className={`p-2 rounded-xl transition-all ${isDark ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'}`} title="إضافة طالب">
                  <UserPlus className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={() => onEdit(course)} className={`p-2 rounded-xl transition-all ${isDark ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}>
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onDelete(course)} className={`p-2 rounded-xl transition-all ${isDark ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid / Compact view
  return (
    <div className={`group rounded-3xl border overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 flex flex-col h-[460px] ${isDark
      ? 'bg-gradient-to-b from-[#1e293b] to-[#0f172a] border-gray-700/50 hover:border-blue-500/50'
      : 'bg-white border-gray-100 hover:border-blue-200'
      }`}>

      {/* Course Image Section */}
      <div className={`relative w-full h-44 overflow-hidden shrink-0 ${isDark ? 'bg-gray-900/40' : 'bg-gray-50'}`}>
        {course.imageUrl ? (
          <>
            {/* Main Image */}
            <img src={course.imageUrl} alt={course.name} className="w-full h-full object-contain relative z-10 transition-transform duration-700 group-hover:scale-110" />

            {/* Blurred background filler */}
            <div className="absolute inset-0 opacity-40 blur-xl pointer-events-none scale-125">
              <img src={course.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
          </>
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-blue-900/20 to-indigo-900/20' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
            <BookOpen className={`w-16 h-16 ${isDark ? 'text-blue-500/20' : 'text-blue-200'}`} />
          </div>
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-20 opacity-60" />

        {/* Currency Badge */}
        {course.currency && (
          <div className="absolute top-4 left-4 px-2.5 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg text-[10px] font-black text-white z-30 tracking-widest">
            {course.currency}
          </div>
        )}

        {/* Price Badge - Premium Floating Style */}
        {course.feePerStudent && (
          <div className="absolute bottom-4 right-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-500/30 z-30 border border-white/10">
            {formatCurrency(course.feePerStudent, course.currency)}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col min-h-0" dir="rtl">
        {/* Name + Instructor */}
        <div className="mb-2">
          <h3 className={`text-base font-black leading-tight mb-2 line-clamp-2 h-[2.5rem] ${isDark ? 'text-white group-hover:text-blue-400' : 'text-gray-800'} transition-colors`}>
            {course.name}
          </h3>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${isDark ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
              <User className="w-3 h-3" />
              <span>{course.instructorName || 'مدرب المؤسسة'}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid - Fixed Height */}
        <div className="grid grid-cols-2 gap-2 mb-3 bg-gray-500/5 p-2.5 rounded-2xl border border-gray-500/10">
          <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <span className="font-bold">{course.daysCount || 0} يوم</span>
          </div>
          <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="font-bold">{course.maxStudents || 0} طالب</span>
          </div>
          <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="font-bold truncate">{course.lectureStartTime || '--:--'}</span>
          </div>
          <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
              <Phone className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <span className="font-bold truncate">{course.instructorPhone || 'غير مدرج'}</span>
          </div>
        </div>

        {/* Summary - Fixed Height */}
        <p className={`text-[11px] leading-relaxed line-clamp-3 mb-4 h-11 ${isDark ? 'text-gray-500 font-medium' : 'text-gray-400 font-medium'}`}>
          {course.summary || 'لا يوجد وصف متاح لهذه الدورة، يرجى التواصل مع إدارة المؤسسة لمزيد من التفاصيل حول محاور الدورة.'}
        </p>

        {/* Footer Actions - Pushed to Bottom */}
        <div className={`mt-auto pt-3 border-t flex items-center justify-between ${isDark ? 'border-gray-700/50' : 'border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <Calendar className="w-3 h-3" />
              <span>{new Date(course.createdAt).toLocaleDateString('en-GB')}</span>
            </div>
            {studentCount !== undefined && studentCount > 0 && (
              <div className={`px-2.5 py-1 rounded-full text-[10px] font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20`}>
                {studentCount} مسجل
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(course)}
                className={`p-2.5 rounded-xl transition-all ${isDark
                  ? 'bg-violet-500/10 text-violet-400 hover:bg-violet-500 hover:text-white'
                  : 'bg-violet-50 text-violet-600 hover:bg-violet-600 hover:text-white'
                  }`}
                title="تفاصيل"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            {onAddStudent && (
              <button
                onClick={() => onAddStudent(course)}
                className={`p-2.5 rounded-xl transition-all ${isDark
                  ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                  }`}
                title="طلاب"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onEdit(course)}
              className={`p-2.5 rounded-xl transition-all ${isDark
                ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
                }`}
              title="تعديل"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(course)}
              className={`p-2.5 rounded-xl transition-all ${isDark
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white'
                : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'
                }`}
              title="حذف"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
