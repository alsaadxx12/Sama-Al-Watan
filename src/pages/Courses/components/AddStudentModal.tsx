import React from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, Phone, FileText, Loader2, Sparkles, BookOpen, Calendar, Clock, Users, User, DollarSign } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useTheme } from '../../../contexts/ThemeContext';
import { Course } from '../hooks/useCourses';

interface AddStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    course: Course | null;
    onStudentAdded?: () => void;
}

interface StudentFormData {
    name: string;
    phone: string;
    notes: string;
}

const formatCurrency = (amount?: number | null, currency?: string) => {
    if (!amount) return null;
    return `${amount.toLocaleString('en-US')} ${currency === 'USD' ? '$' : 'IQD'}`;
};

export default function AddStudentModal({
    isOpen,
    onClose,
    course,
    onStudentAdded
}: AddStudentModalProps) {
    const { theme } = useTheme();
    const { employee } = useAuth();
    const isDark = theme === 'dark';

    const [formData, setFormData] = React.useState<StudentFormData>({
        name: '',
        phone: '',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!isOpen) {
            setFormData({ name: '', phone: '', notes: '' });
            setError(null);
            setSuccess(null);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!employee || !course) {
            setError('لم يتم العثور على بيانات الموظف أو الدورة');
            return;
        }

        if (!formData.name.trim()) {
            setError('يرجى إدخال اسم الطالب');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const studentsRef = collection(db, 'courses', course.id, 'students');
            const q = query(studentsRef, where('name', '==', formData.name.trim()));
            const existing = await getDocs(q);

            if (!existing.empty) {
                throw new Error('هذا الطالب مسجل بالفعل في هذه الدورة');
            }

            if (course.maxStudents) {
                const allStudents = await getDocs(studentsRef);
                if (allStudents.size >= course.maxStudents) {
                    throw new Error(`وصل عدد الطلاب للحد الأقصى (${course.maxStudents} طالب)`);
                }
            }

            const studentData = {
                name: formData.name.trim(),
                phone: formData.phone.trim() || null,
                notes: formData.notes.trim() || null,
                courseFee: course.feePerStudent || 0,
                currency: course.currency || 'IQD',
                status: 'active',
                enrolledAt: serverTimestamp(),
                enrolledBy: employee.name,
                enrolledById: employee.id || ''
            };

            await addDoc(studentsRef, studentData);

            setSuccess('تم تسجيل الطالب بنجاح ✓');

            if (onStudentAdded) {
                onStudentAdded();
            }

            setTimeout(() => {
                onClose();
            }, 1200);
        } catch (error: any) {
            console.error('Error adding student:', error);
            setError(error instanceof Error ? error.message : 'فشل في تسجيل الطالب');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !course) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" dir="rtl">
            {/* Dark overlay covering entire site */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className={`relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border-2 animate-in fade-in zoom-in duration-300 ${isDark
                ? 'bg-gray-900/95 border-gray-700/80 shadow-black/40'
                : 'bg-white/95 border-blue-200/60 shadow-blue-900/10'
                } backdrop-blur-xl`}
                style={{
                    boxShadow: isDark
                        ? '0 25px 60px -12px rgba(0,0,0,0.5), 0 0 30px rgba(59,130,246,0.08)'
                        : '0 25px 60px -12px rgba(30,64,175,0.15), 0 0 30px rgba(59,130,246,0.08)'
                }}
            >

                {/* Course Info Header */}
                <div className={`relative overflow-hidden ${isDark ? 'bg-gradient-to-bl from-blue-900/40 via-indigo-900/30 to-gray-900' : 'bg-gradient-to-bl from-blue-50 via-indigo-50 to-white'}`}>
                    <div className="flex flex-col items-center gap-3 py-5 px-4">
                        {/* Course Image — Large & No container */}
                        {course.imageUrl ? (
                            <div className="w-52 h-52 overflow-hidden">
                                <img src={course.imageUrl} alt={course.name} className="w-full h-full object-contain" />
                            </div>
                        ) : (
                            <div className={`w-52 h-52 flex items-center justify-center ${isDark ? 'bg-blue-900/20' : 'bg-blue-100/60'}`}>
                                <BookOpen className={`w-16 h-16 ${isDark ? 'text-blue-500/40' : 'text-blue-300'}`} />
                            </div>
                        )}

                        {/* Course Details — Centered */}
                        <div className="text-center">
                            <h3 className={`text-lg font-black leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {course.name}
                            </h3>
                            {course.instructorName && (
                                <div className={`flex items-center justify-center gap-1.5 text-xs font-bold mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <User className="w-3 h-3 flex-shrink-0" />
                                    <span>{course.instructorName}</span>
                                </div>
                            )}
                            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-2">
                                {course.feePerStudent && (
                                    <span className={`text-xs font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                        <DollarSign className="w-3 h-3 inline" /> {formatCurrency(course.feePerStudent, course.currency)}
                                    </span>
                                )}
                                {course.daysCount && (
                                    <span className={`text-xs font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        <Calendar className="w-3 h-3 inline" /> {course.daysCount} يوم
                                    </span>
                                )}
                                {course.maxStudents && (
                                    <span className={`text-xs font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        <Users className="w-3 h-3 inline" /> {course.maxStudents} طالب
                                    </span>
                                )}
                                {course.lectureStartTime && (
                                    <span className={`text-xs font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        <Clock className="w-3 h-3 inline" /> {course.lectureStartTime}{course.lectureEndTime && ` - ${course.lectureEndTime}`}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className={`absolute top-3 left-3 p-1.5 rounded-xl transition-all ${isDark ? 'hover:bg-white/10 text-gray-500' : 'hover:bg-black/5 text-gray-400'} hover:text-red-500`}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Title Bar */}
                <div className={`px-5 py-3 flex items-center justify-center gap-2.5 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                    <div className={`p-2 rounded-xl ${isDark ? 'bg-indigo-500/15' : 'bg-indigo-100/80'}`}>
                        <UserPlus className={`w-4 h-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    </div>
                    <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>تسجيل طالب جديد</span>
                </div>

                {/* Form */}
                <div className="p-5 space-y-4">
                    {/* Messages */}
                    {error && (
                        <div className={`p-3 rounded-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top duration-200 ${isDark ? 'bg-red-900/30 text-red-300 border border-red-700/40' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                            <X className="w-3.5 h-3.5 flex-shrink-0" />
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className={`p-3 rounded-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top duration-200 ${isDark ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-700/40' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                            <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                            {success}
                        </div>
                    )}

                    {/* Student Name */}
                    <div className="space-y-1.5">
                        <label className={`flex items-center justify-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <UserPlus className="w-3 h-3" /> اسم الطالب <span className="text-red-400 text-[10px]">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="الاسم الكامل"
                            autoFocus
                            className={`w-full px-4 py-3.5 rounded-2xl border-2 focus:outline-none transition-all text-sm font-bold text-center ${isDark
                                ? 'bg-gray-800/60 border-gray-700/50 text-white placeholder-gray-600 focus:border-indigo-500/60 focus:bg-gray-800/80'
                                : 'bg-gray-50/80 border-gray-200/80 text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:bg-white'
                                }`}
                        />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                        <label className={`flex items-center justify-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Phone className="w-3 h-3" /> رقم الهاتف
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="0770 000 0000"
                            className={`w-full px-4 py-3.5 rounded-2xl border-2 focus:outline-none transition-all text-sm font-bold text-center ${isDark
                                ? 'bg-gray-800/60 border-gray-700/50 text-white placeholder-gray-600 focus:border-indigo-500/60 focus:bg-gray-800/80'
                                : 'bg-gray-50/80 border-gray-200/80 text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:bg-white'
                                }`}
                        />
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                        <label className={`flex items-center justify-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <FileText className="w-3 h-3" /> ملاحظات
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="ملاحظات إضافية..."
                            rows={2}
                            className={`w-full px-4 py-3 rounded-2xl border-2 focus:outline-none transition-all text-sm font-bold text-center resize-none ${isDark
                                ? 'bg-gray-800/60 border-gray-700/50 text-white placeholder-gray-600 focus:border-indigo-500/60 focus:bg-gray-800/80'
                                : 'bg-gray-50/80 border-gray-200/80 text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:bg-white'
                                }`}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting || !formData.name.trim()}
                            className="flex-1 py-3.5 bg-gradient-to-l from-indigo-600 to-blue-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-40 disabled:scale-100 disabled:shadow-none flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                            تسجيل الطالب
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
