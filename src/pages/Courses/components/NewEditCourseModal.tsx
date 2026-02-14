import { useState, useEffect } from 'react';
import { X, DollarSign, Phone, FileText, Users, Save, Loader2, BookOpen, Clock, Calendar, User } from 'lucide-react';
import { CourseFormData, Course } from '../hooks/useCourses';
import { useTheme } from '../../../contexts/ThemeContext';

interface NewEditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onUpdate: (id: string, data: Partial<Course>) => Promise<boolean | void>;
  isSubmitting: boolean;
}

const formatNumber = (value: string): string => {
  const num = value.replace(/[^0-9]/g, '');
  if (!num) return '';
  return Number(num).toLocaleString('en-US');
};

const parseNumber = (value: string): string => {
  return value.replace(/[^0-9]/g, '');
};

export default function NewEditCourseModal({
  isOpen,
  onClose,
  course,
  onUpdate,
  isSubmitting
}: NewEditCourseModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    instructorName: '',
    daysCount: '',
    maxStudents: '',
    lectureStartTime: '',
    lectureEndTime: '',
    feePerStudent: '',
    currency: 'IQD',
    instructorPhone: '',
    summary: '',
    paymentType: 'cash',
    courseId: '',
    whatsAppGroupId: null,
    whatsAppGroupName: null,
    phone: '',
    website: '',
    details: ''
  });

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name || '',
        instructorName: course.instructorName || '',
        daysCount: course.daysCount ? String(course.daysCount) : '',
        maxStudents: course.maxStudents ? String(course.maxStudents) : '',
        lectureStartTime: course.lectureStartTime || '',
        lectureEndTime: course.lectureEndTime || '',
        feePerStudent: course.feePerStudent ? String(course.feePerStudent) : '',
        currency: course.currency || 'IQD',
        instructorPhone: course.instructorPhone || '',
        summary: course.summary || '',
        paymentType: course.paymentType || 'cash',
        courseId: course.companyId || '',
        whatsAppGroupId: course.whatsAppGroupId || null,
        whatsAppGroupName: course.whatsAppGroupName || null,
        phone: course.phone || '',
        website: course.website || '',
        details: course.details || ''
      });
    }
  }, [course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course?.id) return;

    const updateData = {
      name: formData.name,
      instructorName: formData.instructorName || undefined,
      daysCount: formData.daysCount ? Number(formData.daysCount) : undefined,
      maxStudents: formData.maxStudents ? Number(formData.maxStudents) : undefined,
      lectureStartTime: formData.lectureStartTime || undefined,
      lectureEndTime: formData.lectureEndTime || undefined,
      feePerStudent: formData.feePerStudent ? Number(formData.feePerStudent) : undefined,
      currency: formData.currency || 'IQD',
      instructorPhone: formData.instructorPhone || undefined,
      summary: formData.summary || undefined,
      paymentType: formData.paymentType,
    };

    await onUpdate(course.id, updateData);
    onClose();
  };

  if (!isOpen) return null;

  const inputBase = `w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all text-sm font-bold text-center ${isDark
    ? 'bg-gray-900/60 border-gray-700/60 text-white placeholder-gray-600 focus:border-blue-500/60'
    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500/60 shadow-sm'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <BookOpen className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">تعديل بيانات الدورة</h2>
              <p className="text-xs text-gray-500 font-bold mt-0.5">تحديث معلومات الدورة التدريبية</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-red-500/10 hover:text-red-500 text-gray-400 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5" dir="rtl">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* ===== Right Column ===== */}
            <div className="space-y-5">
              {/* Course Name */}
              <div className="space-y-1.5">
                <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <BookOpen className="w-3.5 h-3.5" /> اسم الدورة <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="دورة المحاسبة المتقدمة"
                  required
                  className={inputBase}
                />
              </div>

              {/* Instructor Name */}
              <div className="space-y-1.5">
                <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <User className="w-3.5 h-3.5" /> أستاذ الدورة <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.instructorName}
                  onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
                  placeholder="اسم المحاضر"
                  required
                  className={inputBase}
                />
              </div>

              {/* Days & Max Students */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Calendar className="w-3.5 h-3.5" /> عدد الأيام
                  </label>
                  <input
                    type="number"
                    value={formData.daysCount}
                    onChange={(e) => setFormData({ ...formData, daysCount: e.target.value })}
                    placeholder="30"
                    className={inputBase}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Users className="w-3.5 h-3.5" /> الحد الأقصى للطلبة
                  </label>
                  <input
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                    placeholder="25"
                    className={inputBase}
                  />
                </div>
              </div>

              {/* Lecture Times */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Clock className="w-3.5 h-3.5" /> من الساعة
                  </label>
                  <input
                    type="time"
                    value={formData.lectureStartTime}
                    onChange={(e) => setFormData({ ...formData, lectureStartTime: e.target.value })}
                    className={inputBase}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Clock className="w-3.5 h-3.5" /> إلى الساعة
                  </label>
                  <input
                    type="time"
                    value={formData.lectureEndTime}
                    onChange={(e) => setFormData({ ...formData, lectureEndTime: e.target.value })}
                    className={inputBase}
                  />
                </div>
              </div>
            </div>

            {/* ===== Left Column ===== */}
            <div className="space-y-5">
              {/* Fee - Large Field */}
              <div className="space-y-1.5">
                <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <DollarSign className="w-3.5 h-3.5" /> مبلغ الدورة للطالب الواحد
                </label>
                <input
                  type="text"
                  value={formatNumber(formData.feePerStudent)}
                  onChange={(e) => setFormData({ ...formData, feePerStudent: parseNumber(e.target.value) })}
                  placeholder="500,000"
                  className={`w-full px-5 py-5 rounded-xl border-2 focus:outline-none transition-all text-2xl font-black text-center tracking-wider ${isDark
                    ? 'bg-gray-900/60 border-gray-700/60 text-white placeholder-gray-600 focus:border-emerald-500/60'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500/60 shadow-sm'
                    }`}
                />
              </div>

              {/* Currency Toggle */}
              <div className="space-y-1.5">
                <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  العملة
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, currency: 'IQD' })}
                    className={`py-3 rounded-xl border-2 font-black text-base transition-all duration-200 ${formData.currency === 'IQD'
                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                      : isDark ? 'border-gray-700 bg-gray-900/40 text-gray-400 hover:border-gray-600' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}
                  >
                    IQD
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, currency: 'USD' })}
                    className={`py-3 rounded-xl border-2 font-black text-base transition-all duration-200 ${formData.currency === 'USD'
                      ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : isDark ? 'border-gray-700 bg-gray-900/40 text-gray-400 hover:border-gray-600' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}
                  >
                    USD
                  </button>
                </div>
              </div>

              {/* Instructor Phone */}
              <div className="space-y-1.5">
                <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Phone className="w-3.5 h-3.5" /> رقم هاتف الأستاذ
                </label>
                <input
                  type="tel"
                  value={formData.instructorPhone}
                  onChange={(e) => setFormData({ ...formData, instructorPhone: e.target.value })}
                  placeholder="0770 000 0000"
                  className={inputBase}
                />
              </div>

              {/* Summary */}
              <div className="space-y-1.5">
                <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <FileText className="w-3.5 h-3.5" /> ملخص الدورة والشهادات
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="ملخص عن محتوى الدورة والشهادات المقدمة..."
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all text-sm font-bold text-center resize-none ${isDark
                    ? 'bg-gray-900/60 border-gray-700/60 text-white placeholder-gray-600 focus:border-blue-500/60'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500/60 shadow-sm'
                    }`}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-black text-base shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              حفظ التعديلات
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-8 py-4 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-2xl font-black text-base hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
