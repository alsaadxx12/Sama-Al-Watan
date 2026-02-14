import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowRight, User, Phone, Mail, BookOpen, Calendar, Users,
    CheckCircle2, XCircle, Loader2, ChevronDown, ChevronRight,
    Wallet, FileText, TrendingUp, TrendingDown, Clock, AlertCircle
} from 'lucide-react';
import { doc, getDoc, collection, collectionGroup, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';

/* ─── types ─── */
interface CourseEnrollment {
    courseId: string;
    courseName: string;
    courseNameAr?: string;
    price: number;
    currency: string;
    enrolledAt: any;
    status: string;
    attendance: Record<string, 'present' | 'absent'>;
    paid: number;
    vouchers: VoucherRecord[];
}

interface VoucherRecord {
    id: string;
    number: string;
    date: any;
    amount: number;
    details: string;
    type: string;
}

/* ─── helpers ─── */
const formatCurrency = (amount: number, currency: string = 'IQD') =>
    `${amount.toLocaleString('en-US')} ${currency === 'USD' ? '$' : 'د.ع'}`;

const formatDate = (date: any) => {
    if (!date) return '—';
    try {
        const d = date?.toDate?.() || (date?.seconds ? new Date(date.seconds * 1000) : new Date(date));
        if (isNaN(d.getTime())) return '—';
        return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return '—'; }
};

/* ─── component ─── */
const StudentProfile = () => {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();

    const [student, setStudent] = useState<any>(null);
    const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

    useEffect(() => {
        if (studentId) fetchStudentData();
    }, [studentId]);

    const fetchStudentData = async () => {
        if (!studentId) return;
        setIsLoading(true);
        try {
            // 1. Find student across all courses (collectionGroup)
            const allStudents = await getDocs(collectionGroup(db, 'students'));
            let studentDoc: any = null;
            const courseEnrollments: CourseEnrollment[] = [];

            // Collect all course references where this student appears
            const studentCourses: { courseId: string; studentData: any }[] = [];

            for (const sDoc of allStudents.docs) {
                if (sDoc.id === studentId) {
                    const data = sDoc.data();
                    if (!studentDoc) {
                        studentDoc = { id: sDoc.id, ...data };
                    }
                    // Get parent course ID from path: courses/{courseId}/students/{studentId}
                    const pathParts = sDoc.ref.path.split('/');
                    const courseId = pathParts[1]; // courses/{courseId}/students/...
                    studentCourses.push({ courseId, studentData: { id: sDoc.id, ...data } });
                }
            }

            if (!studentDoc) {
                setIsLoading(false);
                return;
            }
            setStudent(studentDoc);

            // 2. Fetch course details + vouchers for each enrollment
            for (const { courseId, studentData } of studentCourses) {
                const courseDoc = await getDoc(doc(db, 'courses', courseId));
                const courseData = courseDoc.exists() ? courseDoc.data() : null;

                // Fetch vouchers for this student
                let paid = 0;
                const vouchers: VoucherRecord[] = [];

                try {
                    const vQuery = query(
                        collection(db, 'vouchers'),
                        where('companyName', '==', studentDoc.name),
                        orderBy('date', 'desc')
                    );
                    const vSnap = await getDocs(vQuery);
                    vSnap.docs.forEach(vDoc => {
                        const vData = vDoc.data();
                        const amount = vData.amount || 0;
                        if (vData.type === 'receipt') paid += amount;
                        vouchers.push({
                            id: vDoc.id,
                            number: vData.voucherNumber || vData.number || '',
                            date: vData.date || vData.createdAt,
                            amount,
                            details: vData.details || vData.notes || '',
                            type: vData.type || 'receipt'
                        });
                    });
                } catch (err) {
                    console.error('Error fetching vouchers:', err);
                }

                courseEnrollments.push({
                    courseId,
                    courseName: courseData?.name || 'دورة غير معروفة',
                    courseNameAr: courseData?.nameAr || courseData?.name || '',
                    price: courseData?.price || 0,
                    currency: courseData?.currency || 'IQD',
                    enrolledAt: studentData.enrolledAt,
                    status: studentData.status || 'active',
                    attendance: studentData.attendance || {},
                    paid,
                    vouchers
                });
            }

            setEnrollments(courseEnrollments);
        } catch (err) {
            console.error('Error fetching student:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate totals
    const totalDebt = enrollments.reduce((s, e) => s + e.price, 0);
    const totalPaid = enrollments.reduce((s, e) => s + e.paid, 0);
    const totalBalance = totalDebt - totalPaid;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-gray-400 font-bold animate-pulse">جاري تحميل البيانات...</p>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <AlertCircle className="w-12 h-12 text-gray-300" />
                <p className="text-gray-500 font-bold text-lg">الطالب غير موجود</p>
                <button onClick={() => navigate('/relationships/students')} className="text-blue-600 font-bold text-sm hover:underline">← العودة</button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20" dir="rtl">
            {/* header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/relationships/students')}
                        className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
                    >
                        <ArrowRight className="w-5 h-5 text-gray-500" />
                    </button>
                    <div className="p-3.5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg">
                        <User className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">{student.name}</h1>
                        <div className="flex items-center gap-3 mt-1">
                            {student.phone && (
                                <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> {student.phone}
                                </span>
                            )}
                            {student.email && (
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Mail className="w-3 h-3" /> {student.email}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* financial summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-pink-500" />
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                            <TrendingDown className="w-5 h-5 text-rose-600" />
                        </div>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-wider">إجمالي الديون</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900 dark:text-white font-mono">{formatCurrency(totalDebt)}</p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-wider">إجمالي المقبوض</span>
                    </div>
                    <p className="text-2xl font-black text-emerald-600 font-mono">{formatCurrency(totalPaid)}</p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${totalBalance > 0 ? 'from-amber-500 to-orange-500' : 'from-blue-500 to-indigo-500'}`} />
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-xl ${totalBalance > 0 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                            <Wallet className={`w-5 h-5 ${totalBalance > 0 ? 'text-amber-600' : 'text-blue-600'}`} />
                        </div>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-wider">الرصيد المتبقي</span>
                    </div>
                    <p className={`text-2xl font-black font-mono ${totalBalance > 0 ? 'text-amber-600' : 'text-blue-600'}`}>{formatCurrency(totalBalance)}</p>
                </div>
            </div>

            {/* courses & attendance */}
            <div className="space-y-4">
                <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    الدورات المسجلة
                    <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[11px] font-black rounded-lg">
                        {enrollments.length}
                    </span>
                </h2>

                {enrollments.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-12 text-center">
                        <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 font-bold">لم يسجل في أي دورة بعد</p>
                    </div>
                ) : (
                    enrollments.map(enrollment => {
                        const isExpanded = expandedCourse === enrollment.courseId;
                        const attendanceDays = Object.keys(enrollment.attendance).sort().reverse();
                        const presentCount = Object.values(enrollment.attendance).filter(v => v === 'present').length;
                        const totalDays = attendanceDays.length;
                        const attendanceRate = totalDays ? Math.round((presentCount / totalDays) * 100) : 0;
                        const remaining = enrollment.price - enrollment.paid;

                        return (
                            <div key={enrollment.courseId} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-sm">
                                {/* course header */}
                                <button
                                    onClick={() => setExpandedCourse(isExpanded ? null : enrollment.courseId)}
                                    className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl">
                                            <BookOpen className="w-5 h-5" />
                                        </div>
                                        <div className="text-right">
                                            <h3 className="text-sm font-black text-gray-900 dark:text-white">{enrollment.courseNameAr || enrollment.courseName}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {formatDate(enrollment.enrolledAt)}
                                                </span>
                                                <span className={`px-2 py-0.5 text-[10px] font-black rounded-md ${enrollment.status === 'active'
                                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                                                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                                                    }`}>
                                                    {enrollment.status === 'active' ? 'نشط' : enrollment.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        {/* quick stats */}
                                        <div className="hidden md:flex items-center gap-4 text-xs">
                                            <div className="text-center">
                                                <p className="font-black text-gray-900 dark:text-white font-mono">{formatCurrency(enrollment.price, enrollment.currency)}</p>
                                                <p className="text-[9px] text-gray-400 font-bold">الرسوم</p>
                                            </div>
                                            <div className="w-px h-8 bg-gray-100 dark:bg-gray-800" />
                                            <div className="text-center">
                                                <p className="font-black text-emerald-600 font-mono">{formatCurrency(enrollment.paid, enrollment.currency)}</p>
                                                <p className="text-[9px] text-gray-400 font-bold">المدفوع</p>
                                            </div>
                                            <div className="w-px h-8 bg-gray-100 dark:bg-gray-800" />
                                            <div className="text-center">
                                                <p className={`font-black font-mono ${remaining > 0 ? 'text-rose-600' : 'text-blue-600'}`}>{formatCurrency(remaining, enrollment.currency)}</p>
                                                <p className="text-[9px] text-gray-400 font-bold">المتبقي</p>
                                            </div>
                                            <div className="w-px h-8 bg-gray-100 dark:bg-gray-800" />
                                            <div className="text-center">
                                                <p className={`font-black ${attendanceRate >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>{attendanceRate}%</p>
                                                <p className="text-[9px] text-gray-400 font-bold">الحضور</p>
                                            </div>
                                        </div>
                                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>

                                {/* expanded details */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 dark:border-gray-800">
                                        {/* attendance section */}
                                        <div className="px-6 py-5">
                                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" /> سجل الحضور
                                                <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md font-black mr-2">
                                                    {presentCount}/{totalDays} يوم
                                                </span>
                                            </h4>
                                            {totalDays === 0 ? (
                                                <p className="text-xs text-gray-400 font-bold py-4 text-center">لا توجد سجلات حضور بعد</p>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {attendanceDays.slice(0, 30).map(day => (
                                                        <div
                                                            key={day}
                                                            className={`flex flex-col items-center px-3 py-2 rounded-xl text-[10px] font-bold border ${enrollment.attendance[day] === 'present'
                                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800'
                                                                    : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800'
                                                                }`}
                                                        >
                                                            {enrollment.attendance[day] === 'present'
                                                                ? <CheckCircle2 className="w-3.5 h-3.5 mb-0.5" />
                                                                : <XCircle className="w-3.5 h-3.5 mb-0.5" />
                                                            }
                                                            <span>{new Date(day).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}</span>
                                                        </div>
                                                    ))}
                                                    {attendanceDays.length > 30 && (
                                                        <span className="text-[10px] text-gray-400 font-bold self-center">+{attendanceDays.length - 30} يوم آخر</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* vouchers / payments */}
                                        <div className="px-6 py-5 border-t border-gray-50 dark:border-gray-800/50">
                                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                <FileText className="w-3.5 h-3.5" /> كشف الحساب
                                            </h4>
                                            {enrollment.vouchers.length === 0 ? (
                                                <p className="text-xs text-gray-400 font-bold py-4 text-center">لا توجد عمليات مالية</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {/* debt row */}
                                                    <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-rose-50/50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-900/20">
                                                        <span className="text-xs font-bold text-rose-600">رسوم الدورة</span>
                                                        <span className="text-xs text-gray-500 font-bold">{formatDate(enrollment.enrolledAt)}</span>
                                                        <span className="text-xs font-black text-rose-600 font-mono text-center">{formatCurrency(enrollment.price, enrollment.currency)}</span>
                                                        <span className="text-xs font-bold text-gray-400 text-center">مدين</span>
                                                    </div>
                                                    {/* payment rows */}
                                                    {enrollment.vouchers.filter(v => v.type === 'receipt').map(voucher => (
                                                        <div key={voucher.id} className="grid grid-cols-4 gap-4 px-4 py-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                                                            <span className="text-xs font-bold text-emerald-600">سند قبض #{voucher.number}</span>
                                                            <span className="text-xs text-gray-500 font-bold">{formatDate(voucher.date)}</span>
                                                            <span className="text-xs font-black text-emerald-600 font-mono text-center">{formatCurrency(voucher.amount, enrollment.currency)}</span>
                                                            <span className="text-xs font-bold text-gray-400 text-center">دائن</span>
                                                        </div>
                                                    ))}
                                                    {/* balance row */}
                                                    <div className={`grid grid-cols-4 gap-4 px-4 py-3 rounded-xl border ${remaining > 0 ? 'bg-amber-50/50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20' : 'bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20'}`}>
                                                        <span className={`text-xs font-black ${remaining > 0 ? 'text-amber-600' : 'text-blue-600'}`}>الرصيد المتبقي</span>
                                                        <span className="text-xs text-gray-400">—</span>
                                                        <span className={`text-xs font-black font-mono text-center ${remaining > 0 ? 'text-amber-600' : 'text-blue-600'}`}>{formatCurrency(remaining, enrollment.currency)}</span>
                                                        <span className="text-xs font-bold text-gray-400 text-center">{remaining > 0 ? 'مستحق' : 'مسدد'}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default StudentProfile;
