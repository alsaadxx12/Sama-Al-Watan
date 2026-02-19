import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, addDoc, serverTimestamp, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    BookOpen,
    ArrowRight,
    LogOut,
    MapPin,
    Phone,
    Mail,
    X,
    CheckCircle2,
    Search,
    User,
    MessageCircle,
    Bot,
    Send,
    Edit3,
    Save,
    ChevronLeft,
    Sparkles,
    Filter,
    Award,
    Calendar,
    Clock,
    Menu,
    Tag
} from 'lucide-react';
import { usePrintSettings } from '../../hooks/usePrintSettings';
import { useTheme } from '../../contexts/ThemeContext';

interface StudentSession {
    id: string;
    name: string;
    email: string;
    phone: string;
    province: string;
}

const StudentDashboard = () => {
    const navigate = useNavigate();
    const { user, loginAnonymously, loading: authLoading } = useAuth();
    const { customSettings } = useTheme();
    const { settings: printSettings } = usePrintSettings();

    // Core state
    const [student, setStudent] = useState<StudentSession | null>(null);
    const [activeTab, setActiveTab] = useState<'courses' | 'profile' | 'chat'>('courses');

    // Courses state
    const [courses, setCourses] = useState<any[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isApplying, setIsApplying] = useState(false);
    const [appliedCourses, setAppliedCourses] = useState<string[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarSearch, setSidebarSearch] = useState('');
    const [firestoreCategories, setFirestoreCategories] = useState<{ id: string; name: string }[]>([]);

    // Chat state
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
        { role: 'ai', text: 'مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟ يمكنني الإجابة عن أسئلتك حول الدورات والتسجيل.' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Profile edit state
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', province: '' });

    // Certificates state
    const [certificates, setCertificates] = useState<any[]>([]);
    const [loadingCertificates, setLoadingCertificates] = useState(true);

    // Load student session
    useEffect(() => {
        const session = localStorage.getItem('student_session');
        if (session) {
            try {
                const parsed = JSON.parse(session);
                setStudent(parsed);
                setEditForm({ name: parsed.name, email: parsed.email, phone: parsed.phone, province: parsed.province });
            } catch {
                localStorage.removeItem('student_session');
                navigate('/');
            }
        } else {
            navigate('/');
        }
    }, [navigate]);

    // Anonymous auth
    useEffect(() => {
        if (!authLoading && !user) {
            loginAnonymously().catch(err => console.error('Anonymous login failed:', err));
        }
    }, [user, authLoading, loginAnonymously]);

    // Fetch categories from Firestore
    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'course_categories'), snap => {
            setFirestoreCategories(snap.docs.map(d => ({ id: d.id, name: d.data().name })));
        });
        return () => unsub();
    }, []);

    // Fetch courses
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const snapshot = await getDocs(query(collection(db, 'courses')));
                const allCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                allCourses.sort((a: any, b: any) => {
                    const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
                    const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
                    return Number(dateB) - Number(dateA);
                });
                setCourses(allCourses);
            } catch (err) {
                console.error('Error fetching courses:', err);
            } finally {
                setLoadingCourses(false);
            }
        };
        fetchCourses();
    }, []);

    // Fetch applied courses
    useEffect(() => {
        if (!student) return;
        const fetchApplied = async () => {
            try {
                const q = query(collection(db, 'course_applications'), where('studentAccountId', '==', student.id));
                const snapshot = await getDocs(q);
                setAppliedCourses(snapshot.docs.map(d => d.data().courseId));
            } catch (err) {
                console.error('Error:', err);
            }
        };
        fetchApplied();
    }, [student]);

    // Fetch certificates (enrolled courses for this student)
    useEffect(() => {
        if (!student) return;
        const fetchCertificates = async () => {
            setLoadingCertificates(true);
            try {
                // Get all courses then check subcollection for this student
                const coursesSnap = await getDocs(collection(db, 'courses'));
                const certs: any[] = [];
                for (const courseDoc of coursesSnap.docs) {
                    const studentsRef = collection(db, 'courses', courseDoc.id, 'students');
                    const q = query(studentsRef, where('phone', '==', student.phone));
                    const studentSnap = await getDocs(q);
                    if (!studentSnap.empty) {
                        const studentData = studentSnap.docs[0].data();
                        certs.push({
                            id: courseDoc.id,
                            courseName: courseDoc.data().name,
                            courseImage: courseDoc.data().imageUrl,
                            instructorName: courseDoc.data().instructorName,
                            enrolledAt: studentData.enrolledAt,
                            status: studentData.status || 'active'
                        });
                    }
                }
                setCertificates(certs);
            } catch (err) {
                console.error('Error fetching certificates:', err);
            } finally {
                setLoadingCertificates(false);
            }
        };
        fetchCertificates();
    }, [student]);

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // ──── Handlers ────

    const handleApply = async (course: any) => {
        if (!user || !student || isApplying || appliedCourses.includes(course.id)) return;
        setIsApplying(true);
        try {
            await addDoc(collection(db, 'course_applications'), {
                courseId: course.id,
                courseName: course.name,
                applicantName: student.name,
                phone: student.phone,
                province: student.province,
                email: student.email,
                studentAccountId: student.id,
                status: 'pending',
                createdAt: serverTimestamp(),
                userId: user.uid,
                isAnonymous: user.isAnonymous
            });
            setAppliedCourses([...appliedCourses, course.id]);
            toast.success('تم إرسال طلب التسجيل بنجاح!');
            setSelectedCourse(null);
        } catch {
            toast.error('حدث خطأ أثناء التسجيل');
        } finally {
            setIsApplying(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('student_session');
        navigate('/');
    };

    const handleSaveProfile = () => {
        if (!editForm.name || !editForm.email) {
            toast.error('الاسم والبريد الإلكتروني مطلوبان');
            return;
        }
        const updated = { ...student!, ...editForm };
        setStudent(updated);
        localStorage.setItem('student_session', JSON.stringify(updated));
        setIsEditingProfile(false);
        toast.success('تم تحديث الملف الشخصي');
    };

    const handleSendChat = () => {
        if (!chatInput.trim()) return;
        const userMsg = chatInput.trim();
        setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setChatInput('');

        // Simple AI response
        setTimeout(() => {
            let response = 'شكراً لرسالتك! هذه الميزة قيد التطوير حالياً. سنوفر لك مساعد ذكي متكامل قريباً.';
            const lower = userMsg.toLowerCase();
            if (lower.includes('دور') || lower.includes('كورس') || lower.includes('تدريب')) {
                response = `لدينا حالياً ${courses.length} دورة متوفرة. يمكنك تصفحها من خلال تبويب "الدورات". هل تحتاج مساعدة في اختيار دورة مناسبة؟`;
            } else if (lower.includes('تسجيل') || lower.includes('اشتراك')) {
                response = 'للتسجيل في دورة، انتقل إلى تبويب "الدورات"، اختر الدورة المطلوبة، ثم اضغط على "التسجيل في الدورة". سيتم مراجعة طلبك والتواصل معك.';
            } else if (lower.includes('سعر') || lower.includes('رسوم') || lower.includes('تكلفة')) {
                response = 'أسعار الدورات تختلف حسب الدورة. يمكنك مشاهدة سعر كل دورة في بطاقة الدورة. للاستفسار عن خصومات، تواصل مع الإدارة.';
            } else if (lower.includes('مرحبا') || lower.includes('هلا') || lower.includes('سلام')) {
                response = `مرحباً ${student?.name || ''}! كيف يمكنني مساعدتك اليوم؟`;
            }
            setChatMessages(prev => [...prev, { role: 'ai', text: response }]);
        }, 800);
    };

    // Use Firestore categories if available, otherwise derive from courses
    const categories = firestoreCategories.length > 0
        ? ['all', ...firestoreCategories.map(c => c.name)]
        : ['all', ...Array.from(new Set(courses.map((c: any) => c.category || c.type || 'عام').filter(Boolean)))];

    const filteredCourses = courses.filter(c => {
        const matchSearch = !searchTerm ||
            c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.instructorName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = selectedCategory === 'all' ||
            (c.category || c.type || 'عام') === selectedCategory;
        return matchSearch && matchCategory;
    });

    // Sidebar filtered categories
    const filteredSidebarCategories = firestoreCategories.filter(cat =>
        !sidebarSearch || cat.name.toLowerCase().includes(sidebarSearch.toLowerCase())
    );

    // Calculate hours between two time strings like "09:00" and "14:00"
    const calcHours = (start?: string, end?: string) => {
        if (!start || !end) return null;
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        const diff = (eh * 60 + em) - (sh * 60 + sm);
        if (diff <= 0) return null;
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        return mins > 0 ? `${hours}س ${mins}د` : `${hours} ساعة`;
    };

    if (!student) return null;

    // ══════════════════════════ RENDER ══════════════════════════

    return (
        <div className="min-h-screen bg-[#0a0e1a] font-['Tajawal'] text-white flex flex-col">
            {/* ═══════════ Header ═══════════ */}
            <header className="sticky top-0 z-50 bg-[#0a0e1a]/90 backdrop-blur-2xl border-b border-white/5 px-4 py-3">
                <div className="max-w-lg mx-auto flex items-center justify-between">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-xl hover:bg-white/5 transition-all"
                    >
                        <Menu className="w-5 h-5 text-slate-400" />
                    </button>
                    <div className="flex items-center gap-2">
                        {(customSettings.logoUrl || printSettings.logoUrl) ? (
                            <img
                                src={customSettings.logoUrl || printSettings.logoUrl!}
                                alt="Logo"
                                className="h-12 w-auto object-contain"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        ) : (
                            <span className="text-sm font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                                سما الوطن
                            </span>
                        )}
                    </div>
                    <div className="w-9" /> {/* Spacer */}
                </div>
            </header>

            {/* ═══════════ Categories Sidebar Drawer ═══════════ */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed top-0 right-0 bottom-0 w-72 z-[70] bg-[#0d1220] border-l border-white/10 flex flex-col shadow-2xl"
                        >
                            {/* Sidebar Header */}
                            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-sm font-black text-white flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-blue-400" />
                                    تصنيفات الدورات
                                </h3>
                                <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 transition-all">
                                    <X className="w-4 h-4 text-slate-500" />
                                </button>
                            </div>

                            {/* Sidebar Search */}
                            <div className="p-3">
                                <div className="relative">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                                    <input
                                        type="text"
                                        placeholder="البحث في التصنيفات..."
                                        value={sidebarSearch}
                                        onChange={(e) => setSidebarSearch(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pr-9 pl-3 py-2 text-white text-xs font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                                    />
                                </div>
                            </div>

                            {/* Category List */}
                            <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
                                {/* All */}
                                <button
                                    onClick={() => { setSelectedCategory('all'); setSidebarOpen(false); }}
                                    className={`w-full text-right px-3 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${selectedCategory === 'all'
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                        : 'text-slate-400 hover:bg-white/5'
                                        }`}
                                >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    الكل
                                    <span className="mr-auto text-[9px] opacity-60">{courses.length}</span>
                                </button>

                                {filteredSidebarCategories.map(cat => {
                                    const count = courses.filter((c: any) => (c.category || c.type || 'عام') === cat.name).length;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => { setSelectedCategory(cat.name); setSidebarOpen(false); }}
                                            className={`w-full text-right px-3 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${selectedCategory === cat.name
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                                : 'text-slate-400 hover:bg-white/5'
                                                }`}
                                        >
                                            <Tag className="w-3.5 h-3.5" />
                                            {cat.name}
                                            <span className="mr-auto text-[9px] opacity-60">{count}</span>
                                        </button>
                                    );
                                })}

                                {filteredSidebarCategories.length === 0 && sidebarSearch && (
                                    <div className="py-8 text-center">
                                        <Search className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                                        <p className="text-slate-600 font-bold text-[10px]">لا توجد تصنيفات مطابقة</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ═══════════ Content ═══════════ */}
            <div className="flex-1 overflow-y-auto pb-20">
                <div className="max-w-lg mx-auto px-4 pt-4">
                    <AnimatePresence mode="wait">
                        {/* ═══════════════ TAB: COURSES ═══════════════ */}
                        {activeTab === 'courses' && (
                            <motion.div
                                key="courses"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >

                                {/* Search */}
                                <div className="relative mb-3">
                                    <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                    <input
                                        type="text"
                                        placeholder="البحث عن دورة..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-[#111624]/80 border border-white/10 rounded-xl pr-10 pl-4 py-2.5 text-white text-xs font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                                    />
                                </div>

                                {/* Categories - Horizontal scroll */}
                                {categories.length > 1 && (
                                    <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setSelectedCategory(cat)}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black whitespace-nowrap transition-all shrink-0 ${selectedCategory === cat
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                                    : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'
                                                    }`}
                                            >
                                                {cat === 'all' ? 'الكل' : cat}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div className="p-3 rounded-xl bg-[#111624]/60 border border-white/5 text-center">
                                        <div className="text-lg font-black text-white">{courses.length}</div>
                                        <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">دورة متوفرة</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-[#111624]/60 border border-white/5 text-center">
                                        <div className="text-lg font-black text-emerald-400">{appliedCourses.length}</div>
                                        <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">تم التقديم</div>
                                    </div>
                                </div>

                                {/* Section Title */}
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500" />
                                    <h3 className="text-sm font-black text-white">الدورات المتوفرة</h3>
                                    <div className="flex-1 h-px bg-white/5" />
                                    <span className="text-[9px] text-slate-600 font-bold">{filteredCourses.length}</span>
                                </div>

                                {/* Course Cards */}
                                {loadingCourses ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(n => (
                                            <div key={n} className="h-28 bg-white/5 rounded-xl animate-pulse" />
                                        ))}
                                    </div>
                                ) : filteredCourses.length > 0 ? (
                                    <div className="space-y-2.5">
                                        {filteredCourses.map((course, i) => {
                                            const isApplied = appliedCourses.includes(course.id);
                                            return (
                                                <motion.div
                                                    key={course.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.04 }}
                                                    onClick={() => setSelectedCourse(course)}
                                                    className="bg-[#111624]/70 border border-white/5 rounded-xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                                                >
                                                    <div className="flex gap-3 p-2.5">
                                                        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 relative bg-slate-800">
                                                            {course.imageUrl ? (
                                                                <img src={course.imageUrl} alt={course.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-indigo-600/20 flex items-center justify-center">
                                                                    <BookOpen className="w-6 h-6 text-blue-500/30" />
                                                                </div>
                                                            )}
                                                            {isApplied && (
                                                                <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                                                                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0 py-0.5">
                                                            <h4 className="font-black text-xs text-white line-clamp-1 mb-1">{course.name}</h4>
                                                            <div className="flex items-center gap-1.5 mb-1">
                                                                <div className="w-1 h-1 rounded-full bg-blue-500" />
                                                                <span className="text-[9px] text-slate-500 font-bold truncate">
                                                                    {course.instructorName || 'مدرب معتمد'}
                                                                </span>
                                                            </div>
                                                            {/* Duration Info */}
                                                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                                {course.daysCount && (
                                                                    <span className="text-[8px] text-slate-500 font-bold flex items-center gap-0.5 bg-white/5 px-1.5 py-0.5 rounded">
                                                                        <Calendar className="w-2.5 h-2.5" />
                                                                        {course.daysCount} يوم
                                                                    </span>
                                                                )}
                                                                {calcHours(course.lectureStartTime, course.lectureEndTime) && (
                                                                    <span className="text-[8px] text-slate-500 font-bold flex items-center gap-0.5 bg-white/5 px-1.5 py-0.5 rounded">
                                                                        <Clock className="w-2.5 h-2.5" />
                                                                        {calcHours(course.lectureStartTime, course.lectureEndTime)}
                                                                    </span>
                                                                )}
                                                                {course.lectureStartTime && course.lectureEndTime && (
                                                                    <span className="text-[8px] text-amber-400/70 font-bold bg-amber-500/5 px-1.5 py-0.5 rounded">
                                                                        {course.lectureStartTime} ← {course.lectureEndTime}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[10px] font-black text-blue-400">
                                                                    {course.feePerStudent
                                                                        ? `${Number(course.feePerStudent).toLocaleString()} ${course.currency === 'USD' ? '$' : 'IQD'}`
                                                                        : 'مجاني'}
                                                                </span>
                                                                {isApplied ? (
                                                                    <span className="text-[8px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">تم التقديم ✓</span>
                                                                ) : (
                                                                    <span className="text-[8px] text-blue-400 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                                        التفاصيل <ArrowRight className="w-2.5 h-2.5" />
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center">
                                        <Search className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                                        <p className="text-slate-500 font-bold text-xs">لا توجد دورات مطابقة</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ═══════════════ TAB: PROFILE ═══════════════ */}
                        {activeTab === 'profile' && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4 pb-2"
                            >
                                {/* ── Profile Header Card ── */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05, type: 'spring', stiffness: 200, damping: 25 }}
                                    className="relative bg-gradient-to-br from-[#111624] via-[#0f1525] to-[#111624] border border-white/[0.06] rounded-3xl p-6 pt-8 overflow-hidden"
                                >
                                    {/* Background decorations */}
                                    <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-br from-blue-600/[0.08] via-indigo-600/[0.06] to-purple-600/[0.04]" />
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/[0.07] rounded-full blur-[50px]" />
                                    <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-500/[0.05] rounded-full blur-[40px]" />
                                    <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />

                                    {/* Avatar with animated ring */}
                                    <div className="relative text-center mb-5">
                                        <div className="relative w-24 h-24 mx-auto mb-4">
                                            {/* Rotating gradient ring */}
                                            <div className="absolute -inset-[3px] rounded-full" style={{
                                                background: 'conic-gradient(from 0deg, rgba(59,130,246,0.5), rgba(99,102,241,0.5), rgba(139,92,246,0.5), rgba(99,102,241,0.5), rgba(59,130,246,0.5))',
                                                animation: 'spin 4s linear infinite'
                                            }} />
                                            {/* Avatar glow */}
                                            <div className="absolute -inset-2 rounded-full bg-blue-500/20 blur-xl" />
                                            {/* Avatar */}
                                            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-blue-500/30 border-[3px] border-[#0f1525]">
                                                {student.name?.charAt(0)}
                                            </div>
                                            {/* Online dot */}
                                            <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#0f1525] rounded-full flex items-center justify-center">
                                                <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                                            </div>
                                        </div>
                                        <h2 className="text-xl font-black text-white mb-1" style={{ textShadow: '0 0 30px rgba(59,130,246,0.15)' }}>{student.name}</h2>
                                        <p className="text-xs text-slate-500 font-bold flex items-center justify-center gap-1.5">
                                            <Mail className="w-3 h-3" />
                                            {student.email}
                                        </p>
                                    </div>

                                    {/* Quick stats row inside header */}
                                    <div className="relative z-10 grid grid-cols-3 gap-2">
                                        {[
                                            { value: appliedCourses.length, label: 'طلبات', color: 'blue', icon: Send },
                                            { value: certificates.length, label: 'شهادات', color: 'amber', icon: Award },
                                            { value: courses.length, label: 'دورات', color: 'emerald', icon: BookOpen },
                                        ].map((s, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.15 + i * 0.07, type: 'spring', stiffness: 180 }}
                                                className="text-center p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] transition-all duration-300"
                                            >
                                                <div className={`w-8 h-8 rounded-xl bg-${s.color}-500/10 flex items-center justify-center mx-auto mb-2`}>
                                                    <s.icon className={`w-4 h-4 text-${s.color}-400`} />
                                                </div>
                                                <div className={`text-lg font-black text-${s.color}-400`}>{s.value}</div>
                                                <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">{s.label}</div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* ── Personal Info Card ── */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.12, type: 'spring', stiffness: 200, damping: 25 }}
                                    className="relative bg-[#111624]/80 border border-white/[0.06] rounded-2xl overflow-hidden"
                                >
                                    {/* Section header */}
                                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.04]">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500" />
                                            <h3 className="text-sm font-black text-white">المعلومات الشخصية</h3>
                                        </div>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                if (isEditingProfile) handleSaveProfile();
                                                else setIsEditingProfile(true);
                                            }}
                                            className={`flex items-center gap-1.5 text-[10px] font-black px-3.5 py-2 rounded-xl transition-all duration-300 ${isEditingProfile
                                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25'
                                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/15 hover:bg-blue-500/20'
                                                }`}
                                        >
                                            {isEditingProfile ? <><Save className="w-3.5 h-3.5" /> حفظ التعديلات</> : <><Edit3 className="w-3.5 h-3.5" /> تعديل</>}
                                        </motion.button>
                                    </div>

                                    <div className="p-4 space-y-1">
                                        {[
                                            { icon: User, label: 'الاسم', key: 'name' as const, color: 'blue' },
                                            { icon: Mail, label: 'البريد الإلكتروني', key: 'email' as const, color: 'indigo' },
                                            { icon: Phone, label: 'رقم الهاتف', key: 'phone' as const, color: 'emerald' },
                                            { icon: MapPin, label: 'المحافظة', key: 'province' as const, color: 'purple' },
                                        ].map((field, i) => (
                                            <motion.div
                                                key={field.key}
                                                initial={{ opacity: 0, x: 15 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.18 + i * 0.05 }}
                                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-all duration-300 group"
                                            >
                                                <div className={`w-10 h-10 rounded-xl bg-${field.color}-500/10 border border-${field.color}-500/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                                                    <field.icon className={`w-4.5 h-4.5 text-${field.color}-400`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mb-0.5">{field.label}</p>
                                                    {isEditingProfile ? (
                                                        <input
                                                            value={editForm[field.key]}
                                                            onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.value })}
                                                            className={`w-full bg-white/[0.04] border border-${field.color}-500/20 rounded-lg px-3 py-2 text-white text-xs font-bold outline-none focus:border-${field.color}-500/50 focus:bg-white/[0.06] transition-all`}
                                                        />
                                                    ) : (
                                                        <p className="text-xs font-bold text-white truncate">{student[field.key] || '—'}</p>
                                                    )}
                                                </div>
                                                {!isEditingProfile && (
                                                    <ChevronLeft className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-500 transition-colors shrink-0" />
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* ── Certificates Section ── */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 25 }}
                                    className="relative bg-[#111624]/80 border border-white/[0.06] rounded-2xl overflow-hidden"
                                >
                                    {/* Section header */}
                                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.04]">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-500 to-orange-500" />
                                            <h3 className="text-sm font-black text-white">الشهادات والدورات المكتملة</h3>
                                        </div>
                                        {certificates.length > 0 && (
                                            <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/15">{certificates.length}</span>
                                        )}
                                    </div>

                                    <div className="p-4">
                                        {loadingCertificates ? (
                                            <div className="space-y-3">
                                                {[1, 2].map(n => (
                                                    <div key={n} className="h-20 bg-white/[0.03] rounded-xl animate-pulse" />
                                                ))}
                                            </div>
                                        ) : certificates.length > 0 ? (
                                            <div className="space-y-3">
                                                {certificates.map((cert, i) => (
                                                    <motion.div
                                                        key={cert.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.25 + i * 0.06 }}
                                                        className="relative bg-gradient-to-br from-amber-500/[0.04] to-orange-500/[0.02] border border-amber-500/[0.08] rounded-xl p-4 group hover:border-amber-500/20 transition-all duration-300 overflow-hidden"
                                                    >
                                                        {/* Top accent line */}
                                                        <div className="absolute top-0 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-amber-500/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                                        <div className="flex items-start gap-3">
                                                            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 flex items-center justify-center shrink-0 border border-amber-500/10 group-hover:scale-105 transition-transform duration-300">
                                                                <Award className="w-5.5 h-5.5 text-amber-400" />
                                                                {cert.status === 'completed' && (
                                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#111624]">
                                                                        <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-black text-xs text-white line-clamp-1 mb-1">{cert.courseName}</h4>
                                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                                    <div className="w-1 h-1 rounded-full bg-amber-500" />
                                                                    <span className="text-[9px] text-slate-500 font-bold">{cert.instructorName || 'مدرب معتمد'}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-1.5 bg-white/[0.03] px-2 py-0.5 rounded-lg">
                                                                        <Calendar className="w-3 h-3 text-slate-600" />
                                                                        <span className="text-[8px] text-slate-600 font-bold">
                                                                            {cert.enrolledAt?.toDate?.() ? cert.enrolledAt.toDate().toLocaleDateString('ar-IQ') : 'تاريخ غير محدد'}
                                                                        </span>
                                                                    </div>
                                                                    <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg ${cert.status === 'completed'
                                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                                                                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/15'
                                                                        }`}>
                                                                        {cert.status === 'completed' ? 'مكتملة ✓' : 'قيد الدراسة'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-10 text-center">
                                                <div className="w-16 h-16 rounded-2xl bg-amber-500/[0.06] flex items-center justify-center mx-auto mb-3 border border-amber-500/[0.08]">
                                                    <Award className="w-8 h-8 text-slate-700" />
                                                </div>
                                                <p className="text-slate-500 font-bold text-xs mb-1">لا توجد شهادات حالياً</p>
                                                <p className="text-slate-600 font-bold text-[10px]">سجّل في دورة للحصول على شهادة</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>

                                {/* ── Logout ── */}
                                <motion.button
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleLogout}
                                    className="w-full bg-red-500/[0.06] border border-red-500/15 text-red-400 px-4 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 hover:bg-red-500/15 hover:border-red-500/25 transition-all duration-300 group"
                                >
                                    <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                                    تسجيل الخروج
                                </motion.button>
                            </motion.div>
                        )}

                        {/* ═══════════════ TAB: AI CHAT ═══════════════ */}
                        {activeTab === 'chat' && (
                            <motion.div
                                key="chat"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col"
                                style={{ height: 'calc(100vh - 130px)' }}
                            >
                                {/* Chat Header */}
                                <div className="flex items-center gap-3 mb-4 pt-2">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-white">المساعد الذكي</h3>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            <span className="text-[9px] text-emerald-400 font-bold">متصل الآن</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto space-y-3 pb-4">
                                    {chatMessages.map((msg, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                                        >
                                            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs font-bold leading-relaxed ${msg.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-bl-md'
                                                : 'bg-[#111624] border border-white/10 text-slate-300 rounded-br-md'
                                                }`}>
                                                {msg.role === 'ai' && (
                                                    <div className="flex items-center gap-1.5 mb-1.5">
                                                        <Sparkles className="w-3 h-3 text-purple-400" />
                                                        <span className="text-[8px] text-purple-400 font-black uppercase tracking-widest">AI</span>
                                                    </div>
                                                )}
                                                {msg.text}
                                            </div>
                                        </motion.div>
                                    ))}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Input */}
                                <div className="flex items-center gap-2 pb-2">
                                    <input
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                                        placeholder="اكتب رسالتك..."
                                        className="flex-1 bg-[#111624]/80 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-bold outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-600"
                                    />
                                    <button
                                        onClick={handleSendChat}
                                        disabled={!chatInput.trim()}
                                        className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 disabled:opacity-40 transition-all"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ═══════════ Bottom Navigation ═══════════ */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0e1a]/95 backdrop-blur-2xl border-t border-white/5">
                <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-4">
                    {([
                        { id: 'profile' as const, icon: User, label: 'البروفايل' },
                        { id: 'courses' as const, icon: BookOpen, label: 'الدورات' },
                        { id: 'chat' as const, icon: MessageCircle, label: 'الدردشة' },
                    ]).map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="relative flex flex-col items-center gap-0.5 py-1 px-5 rounded-xl transition-all"
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-blue-500/10 border border-blue-500/20 rounded-xl"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            <tab.icon className={`w-5 h-5 relative z-10 transition-colors ${activeTab === tab.id ? 'text-blue-400' : 'text-slate-600'
                                }`} />
                            <span className={`text-[9px] font-black relative z-10 transition-colors ${activeTab === tab.id ? 'text-blue-400' : 'text-slate-600'
                                }`}>
                                {tab.label}
                            </span>
                        </button>
                    ))}
                </div>
            </nav>

            {/* ═══════════ Course Detail Bottom Sheet ═══════════ */}
            <AnimatePresence>
                {selectedCourse && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-[#0a0e1a]/90 backdrop-blur-xl"
                        onClick={() => setSelectedCourse(null)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="absolute bottom-0 w-full max-h-[85vh] bg-[#111624] rounded-t-[2rem] border-t border-white/10 overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-[#111624] z-10">
                                <div className="w-10 h-1 rounded-full bg-white/20" />
                            </div>

                            <button
                                onClick={() => setSelectedCourse(null)}
                                className="absolute top-3 left-4 w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-red-500/20 hover:text-red-400 transition-all z-20"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Image */}
                            <div className="px-4">
                                <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-900/50 mb-4">
                                    {selectedCourse.imageUrl ? (
                                        <img src={selectedCourse.imageUrl} alt={selectedCourse.name} className="w-full h-full object-contain p-3" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-indigo-600/20 flex items-center justify-center">
                                            <BookOpen className="w-12 h-12 text-blue-500/20" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="px-5 pb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                        <span className="text-sm font-black text-white">
                                            {selectedCourse.feePerStudent ? Number(selectedCourse.feePerStudent).toLocaleString() : 'مجاني'}
                                        </span>
                                        {selectedCourse.feePerStudent && (
                                            <span className="text-[10px] font-bold text-emerald-400 mr-1">{selectedCourse.currency === 'USD' ? '$' : 'IQD'}</span>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-bold">{selectedCourse.instructorName || 'مدرب معتمد'}</span>
                                </div>

                                <h2 className="text-lg font-black text-white mb-2">{selectedCourse.name}</h2>
                                <p className="text-slate-400 text-xs leading-relaxed mb-5 text-right">
                                    {selectedCourse.summary || 'لا يوجد ملخص متاح لهذه الدورة.'}
                                </p>

                                {appliedCourses.includes(selectedCourse.id) ? (
                                    <div className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3.5 rounded-xl font-black text-center text-sm flex items-center justify-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        تم التقديم على هذه الدورة
                                    </div>
                                ) : (
                                    <motion.button
                                        onClick={() => handleApply(selectedCourse)}
                                        disabled={isApplying}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3.5 rounded-xl font-black text-sm transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-40"
                                    >
                                        {isApplying ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                جاري التسجيل...
                                            </span>
                                        ) : (
                                            <>التسجيل في الدورة <ArrowRight className="w-4 h-4" /></>
                                        )}
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentDashboard;
