import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
    ArrowRight, User, Phone, Mail, BookOpen, MapPin, Briefcase,
    GraduationCap, Loader2, Calendar, Clock, Users, DollarSign, Eye
} from 'lucide-react';

interface InstructorData {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    specialization?: string;
    bio?: string;
    location?: string;
    imageUrl?: string;
    createdAt: any;
}

interface CourseData {
    id: string;
    name: string;
    daysCount?: number;
    maxStudents?: number;
    feePerStudent?: number;
    currency?: string;
    lectureStartTime?: string;
    lectureEndTime?: string;
    imageUrl?: string;
    _collectionName?: string;
}

export default function InstructorDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [instructor, setInstructor] = useState<InstructorData | null>(null);
    const [courses, setCourses] = useState<CourseData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const docSnap = await getDoc(doc(db, 'instructors', id));
                if (docSnap.exists()) {
                    const data = { id: docSnap.id, ...docSnap.data() } as InstructorData;
                    setInstructor(data);

                    // Find courses taught by this instructor
                    const coursesSnap = await getDocs(collection(db, 'courses'));
                    const linkedCourses = coursesSnap.docs
                        .filter(c => c.data().instructorName === data.name)
                        .map(c => ({ id: c.id, ...c.data() } as CourseData));
                    setCourses(linkedCourses);
                }
            } catch (err) {
                console.error('Error fetching instructor:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, [id]);

    if (isLoading) {
        return (
            <div className={`flex items-center justify-center h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
                    <p className={`text-sm font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>جاري التحميل...</p>
                </div>
            </div>
        );
    }

    if (!instructor) {
        return (
            <div className={`flex flex-col items-center justify-center h-screen gap-4 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <GraduationCap className="w-16 h-16 text-gray-400" />
                <p className="text-lg font-bold">الأستاذ غير موجود</p>
                <button onClick={() => navigate('/courses')} className="text-purple-500 hover:underline font-bold">العودة</button>
            </div>
        );
    }

    return (
        <main className={`min-h-screen w-full pb-24 md:pb-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`} dir="rtl">

            {/* ═══ HERO ═══ */}
            <div className={`relative overflow-hidden ${isDark ? 'bg-gradient-to-bl from-purple-900/30 via-gray-900 to-gray-900' : 'bg-gradient-to-bl from-purple-50 via-white to-white'}`}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-8">
                    {/* Back */}
                    <button
                        onClick={() => navigate('/courses')}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl mb-6 text-xs font-black transition-all ${isDark
                            ? 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
                            : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                            }`}
                    >
                        العودة <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* Avatar */}
                        {instructor.imageUrl ? (
                            <img
                                src={instructor.imageUrl}
                                alt={instructor.name}
                                className="w-28 h-28 rounded-3xl object-cover ring-4 ring-purple-500/20 shadow-2xl"
                            />
                        ) : (
                            <div className={`w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl ${isDark ? 'bg-purple-500/15 ring-4 ring-purple-500/20' : 'bg-purple-100 ring-4 ring-purple-200'}`}>
                                <User className={`w-12 h-12 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
                            </div>
                        )}

                        <div className="text-center sm:text-right flex-1">
                            <h1 className={`text-2xl sm:text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {instructor.name}
                            </h1>
                            {instructor.specialization && (
                                <div className={`flex items-center justify-center sm:justify-start gap-2 mt-2 text-sm font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                                    <Briefcase className="w-4 h-4" />
                                    {instructor.specialization}
                                </div>
                            )}
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3">
                                {instructor.location && (
                                    <span className={`flex items-center gap-1.5 text-xs font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        <MapPin className="w-3.5 h-3.5" /> {instructor.location}
                                    </span>
                                )}
                                {instructor.phone && (
                                    <span className={`flex items-center gap-1.5 text-xs font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        <Phone className="w-3.5 h-3.5" /> {instructor.phone}
                                    </span>
                                )}
                                {instructor.email && (
                                    <span className={`flex items-center gap-1.5 text-xs font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        <Mail className="w-3.5 h-3.5" /> {instructor.email}
                                    </span>
                                )}
                            </div>

                            {/* Stats pills */}
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
                                <div className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black ${isDark ? 'bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20' : 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100'}`}>
                                    <BookOpen className="w-3.5 h-3.5" />
                                    {courses.length} دورة
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-6 space-y-6">

                {/* ═══ BIO ═══ */}
                {instructor.bio && (
                    <div className={`rounded-2xl p-6 border ${isDark ? 'bg-gray-800/40 border-gray-700/40' : 'bg-white border-gray-200/80'} shadow-sm`}>
                        <h2 className={`text-sm font-black mb-3 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <GraduationCap className="w-4 h-4 text-purple-500" />
                            السيرة الذاتية
                        </h2>
                        <p className={`text-sm font-bold leading-relaxed whitespace-pre-line ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {instructor.bio}
                        </p>
                    </div>
                )}

                {/* ═══ COURSES ═══ */}
                <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-gray-800/40 border-gray-700/40' : 'bg-white border-gray-200/80'} shadow-sm`}>
                    <div className={`px-6 py-4 flex items-center justify-between border-b ${isDark ? 'border-gray-700/40' : 'border-gray-100'}`}>
                        <h2 className={`text-sm font-black flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <BookOpen className="w-4 h-4 text-indigo-500" />
                            الدورات التي يُدرّسها
                        </h2>
                        <span className={`text-xs font-black px-3 py-1 rounded-full ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                            {courses.length}
                        </span>
                    </div>

                    {courses.length === 0 ? (
                        <div className="p-12 text-center">
                            <BookOpen className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
                            <p className={`font-black text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>لم يتم ربط أي دورة بهذا الأستاذ بعد</p>
                            <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>تأكد من أن اسم المدرس في الدورة يطابق اسم الأستاذ</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700/30">
                            {courses.map(course => (
                                <div
                                    key={course.id}
                                    className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer`}
                                    onClick={() => navigate(`/courses/${course.id}`)}
                                >
                                    {/* Image */}
                                    {course.imageUrl ? (
                                        <img src={course.imageUrl} alt={course.name} className="w-14 h-14 rounded-xl object-cover ring-2 ring-gray-200/50 dark:ring-gray-700/50 flex-shrink-0" />
                                    ) : (
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                                            <BookOpen className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} />
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <h3 className={`text-sm font-black truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.name}</h3>
                                        <div className="flex flex-wrap items-center gap-3 mt-1">
                                            {course.daysCount && (
                                                <span className={`text-[10px] font-bold flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                    <Calendar className="w-3 h-3" /> {course.daysCount} يوم
                                                </span>
                                            )}
                                            {course.maxStudents && (
                                                <span className={`text-[10px] font-bold flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                    <Users className="w-3 h-3" /> {course.maxStudents} طالب
                                                </span>
                                            )}
                                            {course.feePerStudent && (
                                                <span className={`text-[10px] font-black flex items-center gap-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                                    <DollarSign className="w-3 h-3" /> {course.feePerStudent.toLocaleString('en-US')} {course.currency === 'USD' ? '$' : 'IQD'}
                                                </span>
                                            )}
                                            {course.lectureStartTime && (
                                                <span className={`text-[10px] font-bold flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                    <Clock className="w-3 h-3" /> {course.lectureStartTime}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <Eye className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
