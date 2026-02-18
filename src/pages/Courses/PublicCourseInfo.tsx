import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User, Calendar, Clock, DollarSign, Users, FileText, Loader2, AlertCircle } from 'lucide-react';
import { usePrintSettings } from '../../hooks/usePrintSettings';
import { useTheme } from '../../contexts/ThemeContext';

const PublicCourseInfo: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { customSettings } = useTheme();
    const { settings: printSettings } = usePrintSettings();
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourse = async () => {
            if (!id) { setError('رابط غير صالح'); setLoading(false); return; }
            try {
                const docRef = doc(db, 'courses', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setCourse({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setError('الدورة غير موجودة');
                }
            } catch (err) {
                console.error('Error fetching course:', err);
                setError('حدث خطأ أثناء جلب بيانات الدورة');
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id]);

    const formatTime = (time: string) => {
        if (!time) return '';
        const [h, m] = time.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${m} ${ampm}`;
    };

    const formatCurrency = (amount: number, currency: string) => {
        return `${currency} ${amount?.toLocaleString() || 0}`;
    };

    const logoUrl = customSettings.logoUrl || printSettings.logoUrl;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
                    <h2 className="text-xl font-black text-white">{error || 'الدورة غير موجودة'}</h2>
                    <button onClick={() => navigate('/')} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
                        العودة للصفحة الرئيسية
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0e1a] font-['Tajawal'] text-white" dir="rtl">
            {/* Header */}
            <header className="bg-[#0a0e1a]/90 backdrop-blur-xl border-b border-white/5 px-4 py-4">
                <div className="max-w-3xl mx-auto flex items-center justify-center">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="h-14 w-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    ) : (
                        <span className="text-lg font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">سما الوطن</span>
                    )}
                </div>
            </header>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                {/* Course Image */}
                {course.imageUrl && (
                    <div className="rounded-2xl overflow-hidden border border-white/10">
                        <img src={course.imageUrl} alt={course.name} className="w-full h-64 md:h-80 object-cover" />
                    </div>
                )}

                {/* Course Title */}
                <div className="text-center space-y-2">
                    {course.category && (
                        <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-black">{course.category}</span>
                    )}
                    <h1 className="text-3xl md:text-4xl font-black">{course.name}</h1>
                    {course.instructorName && (
                        <p className="text-slate-400 font-bold flex items-center justify-center gap-2">
                            <User className="w-4 h-4" /> {course.instructorName}
                        </p>
                    )}
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {course.feePerStudent && (
                        <div className="bg-[#111624] border border-white/5 rounded-xl p-4 text-center">
                            <DollarSign className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                            <p className="text-lg font-black text-emerald-400">{formatCurrency(course.feePerStudent, course.currency || 'IQD')}</p>
                            <p className="text-[10px] text-slate-500 font-bold">رسوم الدورة</p>
                        </div>
                    )}
                    {course.daysCount && (
                        <div className="bg-[#111624] border border-white/5 rounded-xl p-4 text-center">
                            <Calendar className="w-5 h-5 text-orange-400 mx-auto mb-2" />
                            <p className="text-lg font-black">{course.daysCount}</p>
                            <p className="text-[10px] text-slate-500 font-bold">يوم</p>
                        </div>
                    )}
                    {course.lectureStartTime && course.lectureEndTime && (
                        <div className="bg-[#111624] border border-white/5 rounded-xl p-4 text-center">
                            <Clock className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                            <p className="text-sm font-black">{formatTime(course.lectureStartTime)} - {formatTime(course.lectureEndTime)}</p>
                            <p className="text-[10px] text-slate-500 font-bold">وقت المحاضرة</p>
                        </div>
                    )}
                    {course.maxStudents && (
                        <div className="bg-[#111624] border border-white/5 rounded-xl p-4 text-center">
                            <Users className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                            <p className="text-lg font-black">{course.maxStudents}</p>
                            <p className="text-[10px] text-slate-500 font-bold">الحد الأقصى</p>
                        </div>
                    )}
                </div>

                {/* Summary */}
                {course.summary && (
                    <div className="bg-[#111624] border border-white/5 rounded-2xl p-6 space-y-3">
                        <h3 className="font-black flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-400" /> عن الدورة
                        </h3>
                        <p className="text-slate-300 font-bold text-sm leading-7 whitespace-pre-wrap">{course.summary}</p>
                    </div>
                )}

                {/* CTA */}
                <div className="text-center pt-4 space-y-3">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full max-w-sm mx-auto py-4 rounded-xl font-black text-base bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        سجّل الآن
                    </button>
                    <p className="text-[10px] text-slate-600 font-bold">سيتم توجيهك لإنشاء حسابك والتقديم</p>
                </div>
            </div>
        </div>
    );
};

export default PublicCourseInfo;
