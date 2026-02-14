import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    ArrowRight,
    Heart,
    BookOpen,
    Users,
    Shield,
    Sparkles,
    Briefcase,
    Globe,
    Award,
    CheckCircle2,
    Handshake,
    GraduationCap,
    Lightbulb,
    Target,
    MapPin,
    AlertCircle,
    X,
    CalendarDays,
    Clock3,
    DollarSign as PriceIcon
} from 'lucide-react';
import { usePrintSettings } from '../../hooks/usePrintSettings';

const LandingPage = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading, loginAnonymously } = useAuth();
    const { customSettings } = useTheme();
    const { settings: printSettings } = usePrintSettings();
    const [courses, setCourses] = useState<any[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Registration Form State
    const [regForm, setRegForm] = useState({ name: '', phone: '', province: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Trigger anonymous login if not already logged in
    useEffect(() => {
        if (!authLoading && !user) {
            console.log("Triggering anonymous login for Landing Page...");
            loginAnonymously().catch(err => console.error("Failed to login anonymously:", err));
        }
    }, [user, authLoading, loginAnonymously]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'course_applications'), {
                courseId: selectedCourse.id,
                courseName: selectedCourse.name,
                applicantName: regForm.name,
                phone: regForm.phone,
                province: regForm.province,
                status: 'pending',
                createdAt: serverTimestamp(),
                userId: user.uid,
                isAnonymous: user.isAnonymous
            });
            setIsSubmitted(true);
            setRegForm({ name: '', phone: '', province: '' });
        } catch (err) {
            console.error("Error submitting application:", err);
            toast.error("حدث خطأ أثناء إرسال طلبك، يرجى المحاولة لاحقاً");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const fetchCourses = async () => {
            console.log("Starting to fetch courses for landing page...");
            setFetchError(null);
            try {
                const collectionsToFetch = ['courses'];
                let allFetched: any[] = [];
                let permissionDenied = false;

                for (const collName of collectionsToFetch) {
                    try {
                        const q = query(collection(db, collName));
                        const snapshot = await getDocs(q);
                        console.log(`Fetched ${snapshot.size} items from ${collName}`);

                        const docs = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data(),
                            _source: collName
                        }));
                        allFetched = [...allFetched, ...docs];
                    } catch (err: any) {
                        console.error(`Error fetching from ${collName}:`, err);
                        if (err.code === 'permission-denied') {
                            permissionDenied = true;
                        }
                    }
                }

                if (permissionDenied && allFetched.length === 0) {
                    setFetchError('لا توجد صلاحية للوصول للبيانات (يجب السماح بالقراءة العامة في قواعد بيانات Firebase)');
                } else if (allFetched.length === 0) {
                    setFetchError('لا توجد بيانات حالياً في المجموعات المختارة');
                }

                // Sort by date, newest first
                const sortedCourses = allFetched.sort((a, b) => {
                    const dateA = a.createdAt?.toDate?.() || (a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt || 0));
                    const dateB = b.createdAt?.toDate?.() || (b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt || 0));
                    return Number(dateB) - Number(dateA);
                });

                console.log(`Total courses available for display: ${sortedCourses.length}`);
                setCourses(sortedCourses.slice(0, 6));
            } catch (error) {
                console.error("Critical error in fetchCourses:", error);
                setFetchError('حدث خطأ غير متوقع أثناء جلب البيانات');
            } finally {
                setLoadingCourses(false);
            }
        };
        fetchCourses();
    }, []);

    const stats = [
        { label: 'طالب ومستفيد', value: '5000+', icon: Users, color: 'blue' },
        { label: 'دورة تدريبية', value: '120+', icon: BookOpen, color: 'emerald' },
        { label: 'شراكة إنسانية', value: '45+', icon: Handshake, color: 'amber' },
        { label: 'برنامج تطويري', value: '30+', icon: Target, color: 'rose' },
    ];

    const courseCategories = [
        {
            title: 'الإدارة والقيادة',
            description: 'تطوير المهارات القيادية والإدارية للمؤسسات والأفراد.',
            icon: Briefcase,
            color: 'from-blue-500 to-indigo-600'
        },
        {
            title: 'التطوير المهني',
            description: 'دورات تخصصية لرفع الكفاءة المهنية في مختلف المجالات.',
            icon: GraduationCap,
            color: 'from-emerald-500 to-teal-600'
        },
        {
            title: 'ريادة الأعمال',
            description: 'دعم وتدريب الشباب لبدء مشاريعهم الخاصة وإدارتها بنجاح.',
            icon: Lightbulb,
            color: 'from-amber-500 to-orange-600'
        },
        {
            title: 'المهارات الناعمة',
            description: 'تعزيز مهارات التواصل، حل المشكلات، والعمل الجماعي.',
            icon: Sparkles,
            color: 'from-rose-500 to-pink-600'
        },
        {
            title: 'التكنولوجيا والرقمنة',
            description: 'مواكبة التحول الرقمي وتعلم البرامج والتقنيات الحديثة.',
            icon: Globe,
            color: 'from-purple-500 to-violet-600'
        },
        {
            title: 'إدارة المشاريع الإنسانية',
            description: 'تأهيل الكوادر للعمل في المؤسسات الإغاثية والإنسانية.',
            icon: Heart,
            color: 'from-indigo-500 to-blue-600'
        }
    ];

    return (
        <div className="min-h-screen bg-[#0a0e1a] font-['Tajawal'] text-white overflow-x-hidden selection:bg-blue-500/30">
            {/* ═══════════════════════════ Navigation ═══════════════════════════ */}
            <nav className="fixed top-0 w-full z-50 bg-[#0a0e1a]/80 backdrop-blur-2xl border-b border-white/5 px-4 md:px-8 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(user ? '/educational-dashboard' : '/login')}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 text-sm"
                    >
                        {user ? 'لوحة التحكم' : 'تسجيل الدخول'}
                    </motion.button>
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        {(customSettings.logoUrl || printSettings.logoUrl) ? (
                            <img
                                src={customSettings.logoUrl || printSettings.logoUrl}
                                alt="Logo"
                                className="w-auto object-contain transition-all duration-500 hover:scale-105"
                                style={{ height: `${customSettings.logoSize || 44}px` }}
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.classList.add('fallback-logo');
                                }}
                            />
                        ) : (
                            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent font-black text-xl">
                                مؤسسة سما الوطن الانسانية للتدريب والتطوير
                            </span>
                        )}
                    </div>
                </div>
            </nav>

            {/* ═══════════════════════════ Hero Section ═══════════════════════════ */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 md:px-8 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/8 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-right"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-6">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>خطوة نحو مستقبل أفضل</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-[1.2]">
                                مؤسسة سما الوطن الانسانية للتدريب والتطوير
                            </h1>
                            <p className="text-slate-400 text-lg md:text-xl mb-8 leading-relaxed max-w-xl">
                                نسعى لتمكين الأفراد والمجتمعات من خلال تعليم متميز، برامج تطويرية شاملة، ومبادرات إنسانية تترك أثراً مستداماً.
                            </p>
                            <div className="flex flex-wrap items-center gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/login')}
                                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 transition-all flex items-center gap-3"
                                >
                                    <span>انضم إلينا الآن</span>
                                    <ArrowRight className="w-5 h-5" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black text-lg transition-all"
                                >
                                    تعرف على برامجنا
                                </motion.button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="relative hidden lg:block"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-[3rem] blur-3xl animate-pulse" />
                            <div className="relative rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-xl p-8 overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                                <div className="grid grid-cols-2 gap-4">
                                    {stats.map((stat, i) => (
                                        <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all text-center">
                                            <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center mx-auto mb-4`}>
                                                <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                                            </div>
                                            <div className="text-2xl font-black mb-1">{stat.value}</div>
                                            <div className="text-xs text-slate-500 font-bold uppercase">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════ Vision & Mission ═══════════════════════════ */}
            <section className="py-20 px-4 md:px-8 bg-white/[0.02] border-y border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            {/* Decorative elements */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />

                            <div className="relative z-10 p-8 md:p-12 rounded-[3.5rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 backdrop-blur-md shadow-2xl overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                <div className="flex flex-col items-center text-center space-y-8">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full scale-125" />
                                        {(customSettings.logoUrl || printSettings.logoUrl) ? (
                                            <img
                                                src={customSettings.logoUrl || printSettings.logoUrl}
                                                alt="Logo"
                                                className="h-32 w-auto drop-shadow-[0_0_20px_rgba(59,130,246,0.5)] relative z-10 transition-transform duration-700 group-hover:scale-110"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.parentElement!.classList.add('fallback-active');
                                                }}
                                            />
                                        ) : (
                                            <div className="w-32 h-32 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl relative z-10 group-hover:rotate-6 transition-transform duration-700">
                                                <span className="text-white font-black text-xl px-4 text-center">
                                                    مؤسسة سما الوطن الانسانية للتدريب والتطوير
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest">
                                            <Award className="w-4 h-4" />
                                            <span>الجودة والتميز</span>
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-black text-white">إبداع وبناء إنساني مستدام</h3>
                                        <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">نحن نؤمن بأن التعليم هو المفتاح الحقيقي لتطوير المجتمعات وبناء مستقبل أفضل للجميع.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="space-y-12">
                            {[
                                {
                                    title: 'رؤيتنا',
                                    desc: 'أن نكون المؤسسة الرائدة في العراق في مجال التطوير البشري، ونموذجاً يحتذى به في العمل الإنساني والتعليمي.',
                                    icon: Target,
                                    color: 'emerald',
                                    delay: 0.1
                                },
                                {
                                    title: 'رسالتنا',
                                    desc: 'تقديم برامج تعليمية وتنموية عالية الجودة، تركز على بناء الشخصية وتطوير المهارات القيادية والمهنية لتمكين الفرد من خدمة نفسه ومجتمعه.',
                                    icon: Users,
                                    color: 'blue',
                                    delay: 0.2
                                },
                                {
                                    title: 'قيمنا',
                                    desc: 'الإخلاص، التمكين، الإبداع، العمل الجماعي.',
                                    icon: Heart,
                                    color: 'purple',
                                    delay: 0.3,
                                    isValues: true
                                }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: item.delay }}
                                    className="group flex gap-6"
                                >
                                    <div className={`w-16 h-16 rounded-2xl bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-${item.color}-500/5`}>
                                        <item.icon className={`w-8 h-8 text-${item.color}-400`} />
                                    </div>
                                    <div className="pt-2">
                                        <h4 className="text-xl font-black mb-3 text-white group-hover:text-blue-400 transition-colors uppercase tracking-wide">{item.title}</h4>
                                        {item.isValues ? (
                                            <div className="flex flex-wrap gap-2">
                                                {['الإخلاص', 'التمكين', 'الإبداع', 'العمل الجماعي'].map((val, i) => (
                                                    <span key={i} className="px-4 py-1.5 bg-white/5 rounded-xl text-xs font-black border border-white/5 text-slate-400 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/20 transition-all cursor-default">
                                                        {val}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-slate-400 leading-relaxed text-sm md:text-base font-medium">{item.desc}</p>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════ Course Categories ═══════════════════════════ */}
            <section className="py-24 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-4">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>مجالات التدريب</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black mb-4">
                            برامج تدريبية{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                                عالمية المستوى
                            </span>
                        </h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">نقدم مجموعة واسعة من الدورات المتخصصة التي تلبي احتياجات سوق العمل وتساهم في التطوير الشخصي والمهني.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courseCategories.map((cat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -10, scale: 1.02 }}
                                className="group p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 relative overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-10 blur-[80px] transition-opacity duration-500`} />
                                <div className={`w-16 h-16 rounded-[1.25rem] bg-gradient-to-br ${cat.color} flex items-center justify-center mb-6 shadow-lg shadow-black/20 text-white group-hover:scale-110 transition-transform`}>
                                    <cat.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-black mb-3 text-white group-hover:text-blue-400 transition-colors">{cat.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-6">{cat.description}</p>
                                <div className="flex items-center gap-2 text-xs font-black text-blue-400 group-hover:gap-4 transition-all uppercase tracking-widest">
                                    <span>المزيد من التفاصيل</span>
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════ Why Choose Us ═══════════════════════════ */}
            <section className="py-24 px-4 md:px-8 bg-gradient-to-b from-transparent to-white/[0.01]">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-gradient-to-br from-blue-900/40 via-indigo-900/20 to-transparent border border-white/10 rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-black mb-8 leading-tight">لماذا يختار الملتحقون مؤسسة سما الوطن الانسانية للتدريب والتطوير؟</h2>
                                <div className="space-y-6">
                                    {[
                                        { title: 'مدربون خبراء', desc: 'نخبة من الأكاديميين والمهنيين ذوي الخبرة الطويلة.', icon: Award },
                                        { title: 'شهادات معتمدة', desc: 'نوفر شهادات رسمية تدعم الملف الشخصي في سوق العمل.', icon: CheckCircle2 },
                                        { title: 'منهجية حديثة', desc: 'نعتمد أحدث الأساليب التدريبية التفاعلية والعملية.', icon: Shield },
                                        { title: 'بيئة تعليمية متميزة', desc: 'قاعات مجهزة بأحدث الوسائل التعليمية المريحة.', icon: Sparkles },
                                    ].map((feature, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: 20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex gap-4"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/10">
                                                <feature.icon className="w-6 h-6 text-blue-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-lg mb-1">{feature.title}</h4>
                                                <p className="text-slate-500 text-sm">{feature.desc}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative h-full">
                                <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full" />
                                <div className="grid grid-cols-2 gap-8 h-full">
                                    {[
                                        {
                                            src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800",
                                            alt: "Expert Training",
                                            color: "blue",
                                            delay: 0,
                                            offset: "mt-10"
                                        },
                                        {
                                            src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800",
                                            alt: "Collaboration",
                                            color: "indigo",
                                            delay: 0.1,
                                            offset: ""
                                        },
                                        {
                                            src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
                                            alt: "Students",
                                            color: "purple",
                                            delay: 0.2,
                                            offset: ""
                                        },
                                        {
                                            src: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
                                            alt: "Modern Environment",
                                            color: "blue",
                                            delay: 0.3,
                                            offset: "-mt-10"
                                        }
                                    ].map((img, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 40, scale: 0.9 }}
                                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{
                                                delay: img.delay,
                                                duration: 0.8,
                                                type: "spring",
                                                bounce: 0.3
                                            }}
                                            whileHover={{
                                                y: -15,
                                                rotate: i % 2 === 0 ? 1 : -1,
                                                transition: { duration: 0.3 }
                                            }}
                                            className={`relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl group/img ${img.offset}`}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/60 z-10 opacity-0 group-hover/img:opacity-100 transition-opacity duration-700" />
                                            <img
                                                src={img.src}
                                                alt={img.alt}
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover/img:scale-110"
                                            />
                                            <div className={`absolute inset-0 bg-${img.color}-500/10 group-hover/img:bg-transparent transition-colors duration-500`} />
                                            <div className="absolute bottom-6 right-6 left-6 z-20 translate-y-4 opacity-0 group-hover/img:translate-y-0 group-hover/img:opacity-100 transition-all duration-500">
                                                <span className="text-white font-black text-sm uppercase tracking-widest">{img.alt}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════ Real Courses Section ═══════════════════════════ */}
            <section className="py-24 px-4 md:px-8 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black mb-4">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>اكتشف مهاراتك</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black mb-4">
                            الدورات التدريبية التي{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                                نقدمها
                            </span>
                        </h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">نعتمد أرقى المعايير التدريبية لضمان حصولك على تجربة تعليمية فريدة ومثمرة في كافة التخصصات.</p>
                    </motion.div>

                    {loadingCourses ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className="h-[400px] bg-white/5 border border-white/5 rounded-[2.5rem] animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {courses.length > 0 ? (
                                courses.map((course, i) => (
                                    <motion.div
                                        key={course.id}
                                        layoutId={`course-${course.id}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        onClick={() => setSelectedCourse(course)}
                                        className="group relative bg-[#111624]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-blue-500/40 hover:bg-[#161c2d] transition-all duration-500 shadow-2xl cursor-pointer"
                                    >
                                        <div className="aspect-[16/10] overflow-hidden relative">
                                            <motion.div
                                                layoutId={`image-${course.id}`}
                                                className="w-full h-full"
                                            >
                                                {course.imageUrl ? (
                                                    <div className="w-full h-full relative group-hover:scale-105 transition-transform duration-700">
                                                        {/* Main Image */}
                                                        <img
                                                            src={course.imageUrl}
                                                            alt={course.name}
                                                            className="w-full h-full object-contain relative z-10"
                                                        />
                                                        {/* Aesthetic blurred background filler */}
                                                        <div className="absolute inset-0 opacity-40 blur-md pointer-events-none scale-110">
                                                            <img src={course.imageUrl} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-indigo-600/20 flex items-center justify-center">
                                                        <BookOpen className="w-12 h-12 text-blue-500/30" />
                                                    </div>
                                                )}
                                            </motion.div>

                                            <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest text-blue-400">
                                                {course.paymentType === 'cash' ? 'نقدي' : 'آجل'}
                                            </div>

                                            {/* Price badge on image - Premium Glassmorphic Style */}
                                            {course.feePerStudent && (
                                                <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 backdrop-blur-md text-white rounded-xl text-[10px] font-black shadow-[0_4px_12px_rgba(16,185,129,0.3)] z-30 border border-white/10 uppercase tracking-widest">
                                                    {Number(course.feePerStudent).toLocaleString()} {course.currency === 'USD' ? '$' : 'IQD'}
                                                </div>
                                            )}

                                            {/* Hover Glow */}
                                            <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20" />
                                        </div>

                                        <div className="p-8">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                                <motion.span
                                                    layoutId={`instructor-${course.id}`}
                                                    className="text-white/40 text-[10px] font-black uppercase tracking-widest group-hover:text-blue-400 transition-colors"
                                                >
                                                    {course.instructorName || 'مدرب معتمد'}
                                                </motion.span>
                                            </div>

                                            <motion.h3
                                                layoutId={`title-${course.id}`}
                                                className="text-xl font-black mb-3 text-white group-hover:text-blue-400 transition-colors line-clamp-1"
                                            >
                                                {course.name}
                                            </motion.h3>

                                            <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-2 h-10 group-hover:text-slate-400 transition-colors">
                                                {course.summary || 'لا يوجد ملخص متاح لهذه الدورة حالياً، انضم إلينا لمعرفة التفاصيل.'}
                                            </p>

                                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-1">رسوم الدورة</span>
                                                    <motion.span
                                                        layoutId={`fee-${course.id}`}
                                                        className="text-xl font-black text-white"
                                                    >
                                                        {course.feePerStudent ? `${Number(course.feePerStudent).toLocaleString()} ${course.currency === 'USD' ? '$' : 'IQD'}` : 'اتصل بنا'}
                                                    </motion.span>
                                                </div>
                                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 group-hover:rotate-[-45deg] transition-all duration-500">
                                                    <ArrowRight className="w-5 h-5 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className={`col-span-full py-20 text-center rounded-[3rem] border border-dashed ${fetchError?.includes('صلاحية') ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5 border-white/5'}`}>
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${fetchError?.includes('صلاحية') ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
                                        {fetchError?.includes('صلاحية') ? (
                                            <AlertCircle className="w-10 h-10 text-red-400 opacity-50" />
                                        ) : (
                                            <BookOpen className="w-10 h-10 text-blue-400 opacity-50" />
                                        )}
                                    </div>
                                    <h3 className="text-2xl font-black mb-2">
                                        {fetchError || 'لا توجد دورات متاحة حالياً'}
                                    </h3>
                                    <p className="text-slate-500 max-w-md mx-auto font-bold">
                                        {fetchError?.includes('صلاحية')
                                            ? 'يرجى التأكد من تحديث قواعد حماية Firebase لكي يتمكن الزوار غير المسجلين من رؤية الدورات.'
                                            : 'يرجى التأكد من إضافة الدورات في لوحة التحكم وتعيين البيانات بشكل صحيح.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {courses.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="mt-16 text-center"
                        >
                            <button
                                onClick={() => navigate(user ? '/educational-dashboard' : '/login')}
                                className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-all font-black text-sm uppercase tracking-widest group"
                            >
                                <span>عرض كافة الدورات للمؤسسة</span>
                                <div className="w-8 h-px bg-slate-800 group-hover:w-12 group-hover:bg-blue-500 transition-all" />
                            </button>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* ═══════════════════════════ CTA Section ═══════════════════════════ */}
            <section className="px-4 md:px-8 py-20">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative rounded-[3rem] overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4djJjOC44MzYgMCAxNiA3LjE2NCAxNiAxNnMyLjE2NCAxNi0xNiAxNnYyYzkuOTQgMCAxOC04LjA2IDE4LTE4eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

                        <div className="relative z-10 p-12 md:p-20 text-center">
                            <GraduationCap className="w-16 h-16 text-white/40 mx-auto mb-6" />
                            <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
                                هل أنت جاهز لبدء رحلة التطوير؟
                            </h2>
                            <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                                انضم إلى آلاف الطلاب والمتميزين الذين اختاروا مؤسسة سما الوطن الانسانية للتدريب والتطوير.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <motion.button
                                    onClick={() => navigate(user ? '/educational-dashboard' : '/login')}
                                    className="w-full sm:w-auto bg-white text-blue-600 px-12 py-4 rounded-2xl font-black text-xl hover:bg-blue-50 transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center justify-center gap-3"
                                >
                                    <span>{user ? 'دخول لوحة التحكم' : 'سجل الآن مجاناً'}</span>
                                    <ArrowRight className="w-5 h-5" />
                                </motion.button>
                                <button className="w-full sm:w-auto px-12 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-black text-xl transition-all">
                                    تواصل معنا
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════ Footer ═══════════════════════════ */}
            <footer className="border-t border-white/5 pt-16 pb-8 bg-[#060912] px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-1 border-r-0 md:border-r border-white/5 pr-0 md:pr-8">
                            <div className="mb-6">
                                {customSettings.logoUrl ? (
                                    <img
                                        src={customSettings.logoUrl}
                                        alt="Logo"
                                        className="h-12 w-auto object-contain"
                                        onError={(e) => e.currentTarget.style.display = 'none'}
                                    />
                                ) : (
                                    <span className="text-xl font-black text-white">مؤسسة سما الوطن الانسانية للتدريب والتطوير</span>
                                )}
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed font-bold">
                                مؤسسة سما الوطن الانسانية للتدريب والتطوير، مؤسسة غير ربحية تهدف لرفع كفاءة الفرد العراقي وبناء قدراته المهنية والإنسانية.
                            </p>
                        </div>
                        <div className="col-span-1">
                            <h4 className="font-black text-lg mb-6">روابط سريعة</h4>
                            <ul className="space-y-4 text-sm font-bold text-slate-500">
                                <li><a href="#" className="hover:text-blue-400 transition-colors">عن المؤسسة</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">برامجنا التدريبية</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">المبادرات الإنسانية</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">تواصل معنا</a></li>
                            </ul>
                        </div>
                        <div className="col-span-1">
                            <h4 className="font-black text-lg mb-6">اتصل بنا</h4>
                            <ul className="space-y-4 text-sm font-bold text-slate-500">
                                <li className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-blue-500" />
                                    <span>العراق، بغداد</span>
                                </li>
                                <li className="flex items-center gap-3 underline">
                                    <span>info@sama-alwatan.org</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span>+964 000 000 0000</span>
                                </li>
                            </ul>
                        </div>
                        <div className="col-span-1">
                            <h4 className="font-black text-lg mb-6">النشرة الإخبارية</h4>
                            <p className="text-xs text-slate-500 mb-4 font-bold">اشترك لتصلك أحدث أخبار الدورات والمبادرات الإنسانية.</p>
                            <div className="flex gap-2">
                                <input type="email" placeholder="بريدك الإلكتروني" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-blue-500" />
                                <button className="p-2 bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5 text-[10px] text-slate-600 font-extrabold uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <span>جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
                            <div className="w-1 h-1 rounded-full bg-slate-800" />
                            <span>مؤسسة سما الوطن الانسانية للتدريب والتطوير</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <a href="#" className="hover:text-blue-500 transition-colors">سياسة الخصوصية</a>
                            <a href="#" className="hover:text-blue-500 transition-colors">الشروط والأحكام</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* ═══════════════════════════ Course Details Overlay ═══════════════════════════ */}
            <AnimatePresence>
                {selectedCourse && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-[#0a0e1a]/90 backdrop-blur-2xl overflow-y-auto"
                        onClick={() => setSelectedCourse(null)}
                    >
                        <motion.div
                            layoutId={`course-${selectedCourse.id}`}
                            className="w-full max-w-5xl bg-[#111624] rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(37,99,235,0.15)] overflow-hidden relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => {
                                    setSelectedCourse(null);
                                    setIsSubmitted(false);
                                }}
                                className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-red-500/20 hover:text-red-400 transition-all z-20"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="grid grid-cols-1 lg:grid-cols-2">
                                {/* Left Side: Visual */}
                                <div className="aspect-square lg:aspect-auto relative overflow-hidden bg-slate-900/50">
                                    <motion.div
                                        layoutId={`image-${selectedCourse.id}`}
                                        className="w-full h-full"
                                    >
                                        {selectedCourse.imageUrl ? (
                                            <div className="w-full h-full relative">
                                                {/* Main Image */}
                                                <img
                                                    src={selectedCourse.imageUrl}
                                                    alt={selectedCourse.name}
                                                    className="w-full h-full object-contain relative z-10"
                                                />
                                                {/* Aesthetic blurred background filler */}
                                                <div className="absolute inset-0 opacity-30 blur-xl pointer-events-none scale-110">
                                                    <img src={selectedCourse.imageUrl} alt="" className="w-full h-full object-cover" />
                                                </div>

                                                {/* Price badge removed from image per user request to move to top content side */}
                                            </div>
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-indigo-600/20 flex items-center justify-center">
                                                <BookOpen className="w-24 h-24 text-blue-500/20" />
                                            </div>
                                        )}
                                    </motion.div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#111624] via-transparent to-transparent opacity-60 lg:hidden" />
                                </div>

                                {/* Right Side: Content */}
                                <div className="p-6 md:p-10 lg:p-14 flex flex-col justify-center">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="mb-8 p-6 rounded-[2rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 relative overflow-hidden group"
                                    >
                                        <div className="flex flex-col items-center gap-1 relative z-10 text-center">
                                            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-[0.2em] mb-1">رسوم التسجيل</span>
                                            <div className="flex items-end justify-center gap-3">
                                                <span className="text-5xl md:text-6xl font-black text-white tracking-tighter">
                                                    {selectedCourse.feePerStudent ? Number(selectedCourse.feePerStudent).toLocaleString() : 'اتصل بنا'}
                                                </span>
                                                <span className="text-xl font-bold text-emerald-400 mb-2">{selectedCourse.currency === 'USD' ? '$' : 'IQD'}</span>
                                            </div>
                                        </div>

                                        {/* Background Decor */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-colors duration-700" />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="flex items-center justify-between mb-4 px-2"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                            <motion.span
                                                layoutId={`instructor-${selectedCourse.id}`}
                                                className="text-slate-400 text-xs font-black uppercase tracking-widest"
                                            >
                                                {selectedCourse.instructorName || 'مدرب معتمد'}
                                            </motion.span>
                                        </div>
                                        {/* Status moved to the top */}
                                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                            <span className="text-[9px] text-slate-300 font-extrabold uppercase tracking-widest">متاحة للتسجيل</span>
                                        </div>
                                    </motion.div>

                                    <motion.h2
                                        layoutId={`title-${selectedCourse.id}`}
                                        className="text-3xl md:text-4xl font-black mb-4 leading-tight text-white"
                                    >
                                        {selectedCourse.name}
                                    </motion.h2>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="mb-6"
                                    >
                                        <div className="max-h-[140px] overflow-y-auto pr-4 description-scrollbar">
                                            <p className="text-slate-400 text-base leading-relaxed">
                                                {selectedCourse.summary || 'نحن نقدم برامج تدريبية تركز على بناء الشخصية وتطوير المهارات القيادية والمهنية لتمكين الفرد من خدمة نفسه ومجتمعه.'}
                                            </p>
                                        </div>
                                    </motion.div>

                                    {/* Removed redundant Quick Info Grid */}

                                    {isSubmitted ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-6 text-center"
                                        >
                                            <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                                                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                                            </div>
                                            <h3 className="text-lg font-black text-white mb-2">تم استلام طلبك بنجاح!</h3>
                                            <p className="text-emerald-400/70 font-bold text-sm">سيتم التواصل معكم في أقرب وقت عبر رقم الهاتف المسجل.</p>
                                        </motion.div>
                                    ) : (
                                        <form onSubmit={handleRegister} className="space-y-3 pt-6 border-t border-white/5">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mr-1">الاسم الكامل</span>
                                                <input
                                                    required
                                                    value={regForm.name}
                                                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                                                    placeholder="أدخل اسمك الكامل هنا..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mr-1">رقم الهاتف</span>
                                                    <input
                                                        required
                                                        type="tel"
                                                        value={regForm.phone}
                                                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                                                        placeholder="07XXXXXXXX"
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mr-1">المحافظة</span>
                                                    <select
                                                        required
                                                        value={regForm.province}
                                                        onChange={(e) => setRegForm({ ...regForm, province: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all appearance-none"
                                                    >
                                                        <option value="" className="bg-slate-900">اختر المحافظة...</option>
                                                        {['بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'كركوك', 'بابل', 'الأنبار', 'ذي قار', 'القادسية', 'ديالى', 'واسط', 'ميسان', 'صلاح الدين', 'المثنى', 'دهوك', 'السليمانية'].map(p => (
                                                            <option key={p} value={p} className="bg-slate-900">{p}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
                                                <div className="flex-1 w-full sm:w-auto">
                                                    <motion.button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                                    >
                                                        {isSubmitting ? (
                                                            <span className="flex items-center gap-2">
                                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                جاري الإرسال...
                                                            </span>
                                                        ) : (
                                                            <>
                                                                <span>إرسال طلب</span>
                                                                <ArrowRight className="w-5 h-5" />
                                                            </>
                                                        )}
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LandingPage;
