import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { doc, getDoc, collection, getDocs, updateDoc, serverTimestamp, query, orderBy, deleteDoc, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { usePrintSettings } from '../../hooks/usePrintSettings';
import { generateStatementHTML } from './components/StatementTemplate';
import { toast } from 'sonner';
import {
    ArrowRight, BookOpen, User, Calendar, Clock, Users, DollarSign, Phone,
    CheckCircle2, XCircle, Loader2, UserPlus, FileText, ChevronDown, ChevronUp,
    TrendingUp, BarChart3, Trash2, ChevronLeft, ChevronRight, Wallet
} from 'lucide-react';
import AddStudentModal from './components/AddStudentModal';
import { Course } from './hooks/useCourses';

interface Student {
    id: string;
    name: string;
    phone?: string;
    notes?: string;
    status: string;
    enrolledAt: any;
    attendance?: Record<string, 'present' | 'absent'>;
}

interface Voucher {
    id: string;
    number: string;
    date: any;
    amount: number;
    details?: string;
    notes?: string;
}

const formatCurrency = (amount?: number | null, currency?: string) => {
    if (!amount && amount !== 0) return null;
    return `${amount.toLocaleString('en-US')} ${currency === 'USD' ? '$' : 'IQD'}`;
};

const formatDate = (date: any) => {
    if (!date) return '—';
    try {
        const d = date?.toDate?.() || (date?.seconds ? new Date(date.seconds * 1000) : new Date(date));
        if (isNaN(d.getTime())) return '—';
        return d.toLocaleDateString('ar-EG');
    } catch (e) {
        return '—';
    }
};

export default function CourseDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { employee } = useAuth();
    const { settings: printSettings } = usePrintSettings();
    const isDark = theme === 'dark';

    const [course, setCourse] = useState<Course | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [studentPayments, setStudentPayments] = useState<Record<string, { paid: number; currency: string; vouchers: Voucher[] }>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [savingAttendance, setSavingAttendance] = useState<string | null>(null);
    const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
    const [deletingStudent, setDeletingStudent] = useState<string | null>(null);

    // Generate week navigation
    const [weekOffset, setWeekOffset] = useState(0);
    const weekDates = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (weekOffset * 7) - (6 - i));
            return d.toISOString().split('T')[0];
        });
    }, [weekOffset]);

    const fetchCourseData = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const courseDoc = await getDoc(doc(db, 'courses', id));
            let courseData: Course | null = null;
            if (courseDoc.exists()) {
                courseData = { id: courseDoc.id, ...courseDoc.data() } as Course;
                setCourse(courseData);
            }
            const studentsRef = collection(db, 'courses', id, 'students');
            const studentsQuery = query(studentsRef, orderBy('enrolledAt', 'desc'));
            const studentsSnapshot = await getDocs(studentsQuery);
            const studentsData = studentsSnapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            } as Student));
            setStudents(studentsData);

            // Fetch receipt vouchers for each student by name
            if (studentsData.length > 0) {
                const payments: Record<string, { paid: number; currency: string; vouchers: Voucher[] }> = {};
                const studentNames = studentsData.map(s => s.name);
                const courseCurrency = courseData?.currency || 'IQD';

                // Firestore 'in' queries support up to 30 items
                const batches = [];
                for (let i = 0; i < studentNames.length; i += 30) {
                    batches.push(studentNames.slice(i, i + 30));
                }

                for (const batch of batches) {
                    const vouchersQuery = query(
                        collection(db, 'vouchers'),
                        where('type', '==', 'receipt'),
                        where('companyName', 'in', batch)
                    );
                    const vouchersSnapshot = await getDocs(vouchersQuery);
                    vouchersSnapshot.docs.forEach(vDoc => {
                        const vData = vDoc.data();
                        const name = vData.companyName;
                        const student = studentsData.find(s => s.name === name);
                        if (student) {
                            if (!payments[student.id]) {
                                payments[student.id] = { paid: 0, currency: courseCurrency, vouchers: [] };
                            }
                            payments[student.id].paid += (vData.amount || 0);
                            payments[student.id].vouchers.push({
                                id: vDoc.id,
                                number: vData.voucherNumber || vData.number || String(vData.invoiceNumber) || '',
                                date: vData.date || vData.createdAt,
                                amount: vData.amount || 0,
                                details: vData.details || vData.notes || '—',
                                notes: vData.notes
                            });
                        }
                    });
                }
                // Sort vouchers by date for each student
                Object.keys(payments).forEach(sid => {
                    payments[sid].vouchers.sort((a, b) => {
                        const dateA = a.date?.toDate?.() || (a.date?.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date));
                        const dateB = b.date?.toDate?.() || (b.date?.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date));
                        return (dateB.getTime() || 0) - (dateA.getTime() || 0); // Descending order
                    });
                });
                setStudentPayments(payments);
            }
        } catch (err) {
            console.error('Error fetching course:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCourseData();
    }, [id]);

    const toggleAttendance = async (studentId: string, date: string, currentStatus?: string) => {
        if (!id) return;
        setSavingAttendance(studentId + date);
        const newStatus = currentStatus === 'present' ? 'absent' : 'present';
        try {
            const studentRef = doc(db, 'courses', id, 'students', studentId);
            await updateDoc(studentRef, {
                [`attendance.${date}`]: newStatus,
                updatedAt: serverTimestamp()
            });
            setStudents(prev => prev.map(s =>
                s.id === studentId
                    ? { ...s, attendance: { ...(s.attendance || {}), [date]: newStatus } }
                    : s
            ));
        } catch (err) {
            console.error('Error updating attendance:', err);
        } finally {
            setSavingAttendance(null);
        }
    };

    const handleDeleteStudent = async (studentId: string) => {
        if (!id || !confirm('هل أنت متأكد من حذف هذا الطالب؟')) return;
        setDeletingStudent(studentId);
        try {
            await deleteDoc(doc(db, 'courses', id, 'students', studentId));
            setStudents(prev => prev.filter(s => s.id !== studentId));
        } catch (err) {
            console.error('Error deleting student:', err);
        } finally {
            setDeletingStudent(null);
        }
    };

    const getAttendanceStats = (student: Student) => {
        if (!student.attendance) return { present: 0, absent: 0, total: 0, rate: 0 };
        const entries = Object.values(student.attendance);
        const present = entries.filter(v => v === 'present').length;
        const absent = entries.filter(v => v === 'absent').length;
        const total = entries.length;
        return { present, absent, total, rate: total > 0 ? Math.round((present / total) * 100) : 0 };
    };

    // Overall stats
    const overallStats = useMemo(() => {
        const totalStudents = students.length;
        const todayPresent = students.filter(s => s.attendance?.[selectedDate] === 'present').length;
        const todayAbsent = students.filter(s => s.attendance?.[selectedDate] === 'absent').length;
        const todayUnmarked = totalStudents - todayPresent - todayAbsent;
        return { totalStudents, todayPresent, todayAbsent, todayUnmarked };
    }, [students, selectedDate]);

    const handlePrintStatement = async (student: Student) => {
        if (!course) return;
        try {
            const data = {
                studentName: student.name,
                courseName: course.name,
                totalFee: course.feePerStudent || 0,
                currency: course.currency || 'IQD',
                vouchers: studentPayments[student.id]?.vouchers || []
            };

            const html = await generateStatementHTML(data, printSettings);

            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(html);
                printWindow.document.close();
                // Wait for styles/images to load
                setTimeout(() => {
                    printWindow.print();
                }, 1000);
            }
        } catch (error) {
            console.error("Error printing statement:", error);
            toast.error("حدث خطأ أثناء إعداد كشف الحساب للطباعة");
        }
    };

    if (isLoading) {
        return (
            <div className={`flex items-center justify-center h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                    <p className={`text-sm font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>جاري التحميل...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className={`flex flex-col items-center justify-center h-screen gap-4 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <BookOpen className="w-16 h-16 text-gray-400" />
                <p className="text-lg font-bold">الدورة غير موجودة</p>
                <button onClick={() => navigate('/courses')} className="text-blue-500 hover:underline font-bold">العودة للدورات</button>
            </div>
        );
    }

    const selectedDateObj = new Date(selectedDate);
    const formattedSelectedDate = selectedDateObj.toLocaleDateString('ar-IQ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <main className={`min-h-screen w-full pb-24 md:pb-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`} dir="rtl">

            {/* ═══════════ HERO HEADER ═══════════ */}
            <div className="relative overflow-hidden">
                {/* Background */}
                {course.imageUrl ? (
                    <div className="absolute inset-0">
                        <img src={course.imageUrl} alt="" className="w-full h-full object-cover" />
                        <div className={`absolute inset-0 ${isDark
                            ? 'bg-gradient-to-b from-gray-900/70 via-gray-900/85 to-gray-900'
                            : 'bg-gradient-to-b from-white/60 via-white/80 to-white'
                            } backdrop-blur-sm`} />
                    </div>
                ) : (
                    <div className={`absolute inset-0 ${isDark
                        ? 'bg-gradient-to-br from-indigo-950/50 via-gray-900 to-gray-900'
                        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-white'
                        }`} />
                )}

                <div className="relative p-4 md:p-6 lg:max-w-6xl lg:mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/courses')}
                        className={`p-2.5 rounded-2xl transition-all mb-4 ${isDark
                            ? 'bg-white/10 text-white/70 hover:bg-white/20 backdrop-blur-xl'
                            : 'bg-white/80 text-gray-600 hover:bg-white shadow-sm backdrop-blur-xl'
                            }`}
                    >
                        <ArrowRight className="w-5 h-5" />
                    </button>

                    {/* Course Info */}
                    <div className="flex flex-col md:flex-row items-start gap-5 mb-2">
                        {/* Image */}
                        {course.imageUrl && (
                            <div className="w-48 md:w-56 rounded-2xl overflow-hidden ring-4 ring-white/20 shadow-2xl flex-shrink-0">
                                <img src={course.imageUrl} alt={course.name} className="w-full h-auto object-contain" />
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <h1 className={`text-2xl md:text-3xl font-black leading-tight mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {course.name}
                            </h1>

                            {course.instructorName && (
                                <div className={`flex items-center gap-2 mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <User className="w-4 h-4" />
                                    <span className="text-sm font-bold">{course.instructorName}</span>
                                    {course.instructorPhone && (
                                        <>
                                            <span className="opacity-30">|</span>
                                            <Phone className="w-3.5 h-3.5" />
                                            <span className="text-xs font-bold">{course.instructorPhone}</span>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Info Pills */}
                            <div className="flex flex-wrap gap-2">
                                {course.feePerStudent && (
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black ${isDark ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'}`}>
                                        <DollarSign className="w-3.5 h-3.5" />
                                        {formatCurrency(course.feePerStudent, course.currency)}
                                    </div>
                                )}
                                {course.daysCount && (
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black ${isDark ? 'bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/20' : 'bg-orange-50 text-orange-700 ring-1 ring-orange-200'}`}>
                                        <Calendar className="w-3.5 h-3.5" />
                                        {course.daysCount} يوم
                                    </div>
                                )}
                                {course.maxStudents && (
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black ${isDark ? 'bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/20' : 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'}`}>
                                        <Users className="w-3.5 h-3.5" />
                                        {course.maxStudents} طالب
                                    </div>
                                )}
                                {course.lectureStartTime && (
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black ${isDark ? 'bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/20' : 'bg-purple-50 text-purple-700 ring-1 ring-purple-200'}`}>
                                        <Clock className="w-3.5 h-3.5" />
                                        {course.lectureStartTime}{course.lectureEndTime && ` - ${course.lectureEndTime}`}
                                    </div>
                                )}
                            </div>

                            {course.summary && (
                                <p className={`mt-3 text-xs leading-relaxed max-w-2xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {course.summary}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════ CONTENT ═══════════ */}
            <div className="p-4 md:p-6 lg:max-w-6xl lg:mx-auto space-y-5">

                {/* ─── Stats Cards ─── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'إجمالي الطلاب', value: overallStats.totalStudents, icon: Users, color: 'blue', gradient: isDark ? 'from-blue-900/30 to-blue-950/20' : 'from-blue-50 to-blue-100/50', iconBg: isDark ? 'bg-blue-500/20' : 'bg-blue-100', iconColor: 'text-blue-500' },
                        { label: 'حاضرون اليوم', value: overallStats.todayPresent, icon: CheckCircle2, color: 'emerald', gradient: isDark ? 'from-emerald-900/30 to-emerald-950/20' : 'from-emerald-50 to-emerald-100/50', iconBg: isDark ? 'bg-emerald-500/20' : 'bg-emerald-100', iconColor: 'text-emerald-500' },
                        { label: 'غائبون اليوم', value: overallStats.todayAbsent, icon: XCircle, color: 'red', gradient: isDark ? 'from-red-900/30 to-red-950/20' : 'from-red-50 to-red-100/50', iconBg: isDark ? 'bg-red-500/20' : 'bg-red-100', iconColor: 'text-red-500' },
                        { label: 'لم يُسجَّل', value: overallStats.todayUnmarked, icon: BarChart3, color: 'gray', gradient: isDark ? 'from-gray-800/60 to-gray-900/40' : 'from-gray-50 to-gray-100/50', iconBg: isDark ? 'bg-gray-700' : 'bg-gray-200', iconColor: isDark ? 'text-gray-400' : 'text-gray-500' },
                    ].map((stat, i) => (
                        <div key={i} className={`relative rounded-2xl border p-4 overflow-hidden bg-gradient-to-br ${stat.gradient} ${isDark ? 'border-gray-800' : 'border-gray-200/80'}`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className={`text-[10px] font-bold mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{stat.label}</p>
                                    <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                                </div>
                                <div className={`p-2 rounded-xl ${stat.iconBg}`}>
                                    <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ─── Attendance Section ─── */}
                <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-gray-800/40 border-gray-800' : 'bg-white border-gray-200'}`}>

                    {/* Section Header */}
                    <div className={`p-4 md:p-5 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 ${isDark ? 'border-gray-700/50' : 'border-gray-100'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${isDark ? 'bg-indigo-500/15' : 'bg-indigo-100'}`}>
                                <BarChart3 className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                            </div>
                            <div>
                                <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>سجل الحضور</h2>
                                <p className={`text-[10px] font-bold mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{formattedSelectedDate}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-black ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                {students.length}{course.maxStudents ? ` / ${course.maxStudents}` : ''}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className={`px-3 py-2 rounded-xl border text-xs font-bold ${isDark
                                    ? 'bg-gray-900/60 border-gray-700 text-white'
                                    : 'bg-gray-50 border-gray-200 text-gray-700'
                                    }`}
                            />
                            <button
                                onClick={() => setIsAddStudentOpen(true)}
                                className="px-4 py-2.5 bg-gradient-to-l from-indigo-600 to-blue-600 text-white rounded-xl font-black text-xs shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                            >
                                <UserPlus className="w-4 h-4" />
                                إضافة طالب
                            </button>
                        </div>
                    </div>

                    {/* Week Navigation Bar */}
                    <div className={`px-4 py-3 border-b flex items-center gap-2 ${isDark ? 'border-gray-700/50 bg-gray-800/30' : 'border-gray-100 bg-gray-50/50'}`}>
                        <button
                            onClick={() => setWeekOffset(w => w + 1)}
                            className={`p-1.5 rounded-lg transition-all ${isDark ? 'hover:bg-gray-700 text-gray-500' : 'hover:bg-gray-200 text-gray-400'}`}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <div className="flex-1 flex items-center justify-center gap-1">
                            {weekDates.map(date => {
                                const d = new Date(date);
                                const dayName = d.toLocaleDateString('ar-IQ', { weekday: 'short' });
                                const dayNum = d.getDate();
                                const isSelected = date === selectedDate;
                                const isToday = date === new Date().toISOString().split('T')[0];

                                return (
                                    <button
                                        key={date}
                                        onClick={() => setSelectedDate(date)}
                                        className={`flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl text-[10px] font-bold transition-all min-w-[40px] ${isSelected
                                            ? isDark
                                                ? 'bg-indigo-500/20 text-indigo-400 ring-2 ring-indigo-500/30'
                                                : 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-300'
                                            : isToday
                                                ? isDark ? 'bg-gray-700/50 text-white' : 'bg-gray-200/80 text-gray-700'
                                                : isDark ? 'text-gray-500 hover:bg-gray-700/30' : 'text-gray-400 hover:bg-gray-100'
                                            }`}
                                    >
                                        <span className="text-[9px]">{dayName}</span>
                                        <span className={`font-black text-xs ${isSelected ? '' : ''}`}>{dayNum}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setWeekOffset(w => Math.max(0, w - 1))}
                            disabled={weekOffset === 0}
                            className={`p-1.5 rounded-lg transition-all disabled:opacity-30 ${isDark ? 'hover:bg-gray-700 text-gray-500' : 'hover:bg-gray-200 text-gray-400'}`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {weekOffset > 0 && (
                            <button
                                onClick={() => { setWeekOffset(0); setSelectedDate(new Date().toISOString().split('T')[0]); }}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${isDark ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-50 text-blue-600'}`}
                            >
                                اليوم
                            </button>
                        )}
                    </div>

                    {/* Students Table */}
                    {students.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users className={`w-14 h-14 mx-auto mb-3 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
                            <p className={`font-black text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>لا يوجد طلاب مسجلين بعد</p>
                            <p className={`text-xs mt-1 mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>انقر "إضافة طالب" لبدء التسجيل</p>
                            <button
                                onClick={() => setIsAddStudentOpen(true)}
                                className="px-5 py-2.5 bg-gradient-to-l from-indigo-600 to-blue-600 text-white rounded-xl font-black text-xs shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
                            >
                                <UserPlus className="w-4 h-4" />
                                إضافة أول طالب
                            </button>
                        </div>
                    ) : (
                        <div>
                            {students.map((student, index) => {
                                const stats = getAttendanceStats(student);
                                const dateStatus = student.attendance?.[selectedDate];
                                const isExpanded = expandedStudent === student.id;
                                const isSaving = savingAttendance === student.id + selectedDate;

                                return (
                                    <div
                                        key={student.id}
                                        className={`border-b last:border-b-0 transition-colors ${isDark ? 'border-gray-700/30' : 'border-gray-100'} ${isExpanded ? isDark ? 'bg-gray-800/40' : 'bg-gray-50/50' : ''}`}
                                    >
                                        {/* Main Row */}
                                        <div className="flex items-center gap-3 px-4 py-3">
                                            {/* Index Badge */}
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${isDark ? 'bg-gray-700/60 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                                                {index + 1}
                                            </div>

                                            {/* Student Info */}
                                            <div className="flex-1 min-w-0" onClick={() => setExpandedStudent(isExpanded ? null : student.id)} style={{ cursor: 'pointer' }}>
                                                <div className="flex items-center gap-2">
                                                    <h4 className={`text-sm font-black truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                        {student.name}
                                                    </h4>
                                                    {student.phone && (
                                                        <span className={`text-[10px] font-bold hidden md:inline ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                                            {student.phone}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    {stats.total > 0 ? (
                                                        <>
                                                            {/* Mini Progress Bar */}
                                                            <div className={`w-16 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                                                <div
                                                                    className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-emerald-400 transition-all"
                                                                    style={{ width: `${stats.rate}%` }}
                                                                />
                                                            </div>
                                                            <span className={`text-[9px] font-black ${stats.rate >= 75 ? 'text-emerald-500' : stats.rate >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                                                {stats.rate}%
                                                            </span>
                                                            <span className={`text-[9px] font-bold ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                                                ({stats.present}✓ {stats.absent}✕)
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className={`text-[9px] font-bold ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>لا توجد بيانات حضور</span>
                                                    )}
                                                </div>
                                                {/* Payment Info */}
                                                {course.feePerStudent && (() => {
                                                    const fee = course.feePerStudent || 0;
                                                    const payment = studentPayments[student.id];
                                                    const paid = payment?.paid || 0;
                                                    const remaining = Math.max(0, fee - paid);
                                                    const paymentRate = fee > 0 ? Math.min(100, Math.round((paid / fee) * 100)) : 0;
                                                    const currencyLabel = course.currency === 'USD' ? '$' : 'IQD';
                                                    return (
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <Wallet className={`w-3 h-3 flex-shrink-0 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                                                            <span className={`text-[9px] font-black ${paid >= fee ? 'text-emerald-500' : paid > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                                                                {paid.toLocaleString('en-US')} {currencyLabel}
                                                            </span>
                                                            {remaining > 0 && (
                                                                <span className={`text-[9px] font-bold ${isDark ? 'text-red-400/70' : 'text-red-500/70'}`}>
                                                                    (متبقي: {remaining.toLocaleString('en-US')} {currencyLabel})
                                                                </span>
                                                            )}
                                                            {paid >= fee && (
                                                                <span className="text-[9px] font-black text-emerald-500">✓ مسدد</span>
                                                            )}
                                                            <div className={`w-12 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                                                <div
                                                                    className={`h-full rounded-full transition-all ${paid >= fee ? 'bg-gradient-to-l from-emerald-500 to-emerald-400' : paid > 0 ? 'bg-gradient-to-l from-amber-500 to-amber-400' : 'bg-red-400'}`}
                                                                    style={{ width: `${paymentRate}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>

                                            {/* Attendance Toggle */}
                                            <button
                                                onClick={() => toggleAttendance(student.id, selectedDate, dateStatus)}
                                                disabled={isSaving}
                                                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0 active:scale-90 ${isSaving ? 'opacity-50' : ''
                                                    } ${dateStatus === 'present'
                                                        ? isDark ? 'bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/20' : 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-200'
                                                        : dateStatus === 'absent'
                                                            ? isDark ? 'bg-red-500/20 text-red-400 ring-2 ring-red-500/20' : 'bg-red-100 text-red-600 ring-2 ring-red-200'
                                                            : isDark ? 'bg-gray-700/60 text-gray-500 hover:bg-gray-700 ring-2 ring-gray-700/50' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 ring-2 ring-gray-200'
                                                    }`}
                                            >
                                                {isSaving ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : dateStatus === 'present' ? (
                                                    <CheckCircle2 className="w-5 h-5" />
                                                ) : dateStatus === 'absent' ? (
                                                    <XCircle className="w-5 h-5" />
                                                ) : (
                                                    <div className={`w-5 h-5 rounded-full border-2 ${isDark ? 'border-gray-600' : 'border-gray-300'}`} />
                                                )}
                                            </button>

                                            {/* Expand */}
                                            <button
                                                onClick={() => setExpandedStudent(isExpanded ? null : student.id)}
                                                className={`p-1.5 rounded-lg transition-all ${isDark ? 'text-gray-600 hover:text-gray-400' : 'text-gray-300 hover:text-gray-500'}`}
                                            >
                                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </button>
                                        </div>

                                        {/* Expanded Panel */}
                                        {isExpanded && (
                                            <div className={`px-4 pb-4 pt-1 mr-11`}>
                                                {/* Week Grid */}
                                                <p className={`text-[9px] font-black mb-2 flex items-center gap-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                    <TrendingUp className="w-3 h-3" /> سجل الحضور الأسبوعي
                                                </p>
                                                <div className="flex flex-wrap gap-1.5 mb-3">
                                                    {weekDates.map(date => {
                                                        const status = student.attendance?.[date];
                                                        const dateObj = new Date(date);
                                                        const dayName = dateObj.toLocaleDateString('ar-IQ', { weekday: 'short' });
                                                        const dayNum = dateObj.getDate();
                                                        const isSavingThis = savingAttendance === student.id + date;

                                                        return (
                                                            <button
                                                                key={date}
                                                                onClick={() => toggleAttendance(student.id, date, status)}
                                                                disabled={isSavingThis}
                                                                className={`flex flex-col items-center gap-0.5 w-12 py-2 rounded-xl text-[9px] font-bold transition-all ${date === selectedDate ? 'ring-2 ring-blue-500/50' : ''
                                                                    } ${status === 'present'
                                                                        ? isDark ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/30' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                                        : status === 'absent'
                                                                            ? isDark ? 'bg-red-900/40 text-red-400 border border-red-700/30' : 'bg-red-100 text-red-700 border border-red-200'
                                                                            : isDark ? 'bg-gray-800/80 text-gray-600 border border-gray-700/30 hover:bg-gray-700/50' : 'bg-gray-50 text-gray-400 border border-gray-200 hover:bg-gray-100'
                                                                    }`}
                                                            >
                                                                <span>{dayName}</span>
                                                                <span className="font-black text-[11px]">{dayNum}</span>
                                                                <span className="text-[7px] mt-0.5">
                                                                    {status === 'present' ? '✓' : status === 'absent' ? '✕' : '—'}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                {/* Details Row */}
                                                <div className={`flex flex-col gap-4 mt-2 pt-4 border-t ${isDark ? 'border-gray-700/30' : 'border-gray-100'}`}>

                                                    {/* Financial Statement Section */}
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <p className={`text-[10px] font-black flex items-center gap-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                <Wallet className="w-3 h-3" /> كشف الحساب المالي
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-[10px] font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                                    إجمالي المدفوع: {studentPayments[student.id]?.paid?.toLocaleString() || 0} {course.currency === 'USD' ? '$' : 'IQD'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className={`rounded-2xl overflow-hidden border ${isDark ? 'bg-gray-900/40 border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
                                                            <table className="w-full text-right text-[10px]">
                                                                <thead>
                                                                    <tr className={`${isDark ? 'bg-gray-800/60' : 'bg-gray-50'} border-b ${isDark ? 'border-gray-700/50' : 'border-gray-100'}`}>
                                                                        <th className="px-3 py-2 font-black">رقم الوصل</th>
                                                                        <th className="px-3 py-2 font-black">التاريخ</th>
                                                                        <th className="px-3 py-2 font-black">المبلغ</th>
                                                                        <th className="px-3 py-2 font-black">التفاصيل</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                                                    {studentPayments[student.id]?.vouchers?.length > 0 ? (
                                                                        studentPayments[student.id].vouchers.map(v => (
                                                                            <tr key={v.id} className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-blue-50/50'} transition-colors`}>
                                                                                <td className="px-3 py-2 font-bold text-blue-500">{v.number}</td>
                                                                                <td className="px-3 py-2 font-bold opacity-70">
                                                                                    {formatDate(v.date)}
                                                                                </td>
                                                                                <td className="px-3 py-2 font-black text-emerald-500">{v.amount.toLocaleString()}</td>
                                                                                <td className="px-3 py-2 font-bold opacity-60" title={v.details || v.notes}>{v.details || v.notes || '—'}</td>
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td colSpan={4} className="px-3 py-6 text-center font-bold opacity-40">لا توجد دفعات مسجلة</td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                                <tfoot>
                                                                    <tr className={`${isDark ? 'bg-gray-800/30' : 'bg-gray-50/50'} border-t ${isDark ? 'border-gray-700/50' : 'border-gray-100'}`}>
                                                                        <td colSpan={2} className="px-3 py-2 font-black">المتبقي</td>
                                                                        <td className="px-3 py-2 font-black text-red-500">
                                                                            {Math.max(0, (course.feePerStudent || 0) - (studentPayments[student.id]?.paid || 0)).toLocaleString()} {course.currency === 'USD' ? '$' : 'IQD'}
                                                                        </td>
                                                                        <td></td>
                                                                    </tr>
                                                                </tfoot>
                                                            </table>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between border-t pt-4 mt-2 dark:border-white/5">
                                                        <div className="flex items-center gap-3">
                                                            {student.phone && (
                                                                <span className={`text-[10px] font-bold flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                                    <Phone className="w-3 h-3" /> {student.phone}
                                                                </span>
                                                            )}
                                                            {student.notes && (
                                                                <span className={`text-[10px] font-bold flex items-center gap-1 max-w-xs truncate ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                                    <FileText className="w-3 h-3 flex-shrink-0" /> {student.notes}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handlePrintStatement(student)}
                                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5 ${isDark ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                                            >
                                                                <FileText className="w-3.5 h-3.5" /> طباعة الكشف
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteStudent(student.id)}
                                                                disabled={deletingStudent === student.id}
                                                                className={`p-2 rounded-xl text-xs transition-all ${isDark ? 'text-red-500/60 hover:bg-red-500/10 hover:text-red-400' : 'text-red-400 hover:bg-red-50 hover:text-red-600'}`}
                                                            >
                                                                {deletingStudent === student.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Student Modal */}
            <AddStudentModal
                isOpen={isAddStudentOpen}
                onClose={() => setIsAddStudentOpen(false)}
                course={course}
                onStudentAdded={fetchCourseData}
            />
        </main>
    );
}
