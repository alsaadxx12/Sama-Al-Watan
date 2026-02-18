import { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, addDoc, serverTimestamp, doc, getDoc, where, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
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
    Mail,
    User,
    UserPlus,
    Phone,
    Lock,
    ChevronLeft,
    ChevronRight,
    Megaphone,
    Newspaper
} from 'lucide-react';
import { usePrintSettings } from '../../hooks/usePrintSettings';

// ═══════════════════ Certificates Carousel Component ═══════════════════
interface CertSlide {
    pageUrl: string;
    title: string;
    logoUrl: string;
    certIndex: number;
    pageIndex: number;
    totalPages: number;
    rotation: number;
}

const CertificatesCarousel = ({ slides }: { slides: CertSlide[] }) => {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(1);
    const [isPaused, setIsPaused] = useState(false);

    // Auto-play with hover pause
    useEffect(() => {
        if (slides.length <= 1 || isPaused) return;
        const timer = setInterval(() => {
            setDirection(1);
            setCurrent(prev => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [slides.length, isPaused]);

    const goTo = (index: number) => {
        setDirection(index > current ? 1 : -1);
        setCurrent(index);
    };

    const prev = () => { setDirection(-1); setCurrent(c => (c - 1 + slides.length) % slides.length); };
    const next = () => { setDirection(1); setCurrent(c => (c + 1) % slides.length); };

    const slide = slides[current];

    const variants = {
        enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.95 }),
        center: { x: 0, opacity: 1, scale: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0, scale: 0.95 }),
    };

    return (
        <section className="py-20 px-4 md:px-8 relative overflow-hidden">
            {/* Background Glow Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-gradient-to-r from-amber-500/[0.08] via-orange-500/[0.05] to-yellow-500/[0.08] rounded-full blur-[150px]" />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/[0.05] rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/[0.05] rounded-full blur-[120px]" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-400 text-sm font-black mb-6 shadow-lg shadow-amber-500/5">
                        <Award className="w-4 h-4" />
                        <span>اعتماداتنا وشهاداتنا</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                        شهادات{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400">
                            واعتمادات رسمية
                        </span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg font-medium">
                        نفخر بحصولنا على اعتمادات من جهات رسمية ومحلية ودولية تعزز جودة برامجنا التدريبية
                    </p>
                </motion.div>

                {/* Carousel Container — pause on hover */}
                <div
                    className="relative group/carousel"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {/* Prev/Next Arrows */}
                    {slides.length > 1 && (
                        <>
                            <button
                                onClick={prev}
                                className="absolute left-2 md:-left-16 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:from-amber-500/30 hover:to-orange-500/20 hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300"
                            >
                                <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                                onClick={next}
                                className="absolute right-2 md:-right-16 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:from-amber-500/30 hover:to-orange-500/20 hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300"
                            >
                                <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            </button>
                        </>
                    )}

                    {/* Glowing Border Container */}
                    <div className="relative rounded-3xl p-[2px] bg-gradient-to-br from-amber-400/30 via-transparent to-orange-400/30 shadow-2xl shadow-amber-500/10 group-hover/carousel:from-amber-400/50 group-hover/carousel:to-orange-400/50 group-hover/carousel:shadow-amber-500/20 transition-all duration-500">
                        {/* Inner Container */}
                        <div className="relative rounded-3xl bg-gradient-to-br from-[#0f1629]/95 via-[#111827]/95 to-[#0f1629]/95 backdrop-blur-2xl overflow-hidden">
                            {/* Shimmer accent line at top */}
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent z-10" />

                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.div
                                    key={current}
                                    custom={direction}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                                    className="flex flex-col"
                                    style={{ height: '550px' }}
                                >
                                    {/* Certificate Image — Fixed Height */}
                                    <div className="flex-1 p-5 md:p-8 pb-0 flex items-center justify-center min-h-0">
                                        <div className="rounded-2xl overflow-hidden bg-white shadow-xl shadow-black/20 w-full h-full flex items-center justify-center">
                                            <img
                                                src={slide.pageUrl}
                                                alt={slide.title || 'شهادة'}
                                                className="max-w-full max-h-full object-contain"
                                                style={{ transform: slide.rotation ? `rotate(${slide.rotation}deg)` : undefined }}
                                            />
                                        </div>
                                    </div>

                                    {/* Title + Page Info — Fixed Bottom */}
                                    <div className="p-4 md:p-5 text-center flex-shrink-0">
                                        <div className="flex items-center justify-center gap-4 flex-wrap">
                                            {slide.logoUrl && (
                                                <div className="bg-white/5 border border-white/10 rounded-xl p-2 backdrop-blur-sm">
                                                    <img
                                                        src={slide.logoUrl}
                                                        alt="شعار الجهة المانحة"
                                                        className="h-10 w-auto object-contain"
                                                    />
                                                </div>
                                            )}
                                            <div>
                                                {slide.title && (
                                                    <h3 className="text-lg font-black text-white">{slide.title}</h3>
                                                )}
                                                {slide.totalPages > 1 && (
                                                    <p className="text-xs text-amber-400/80 font-bold mt-0.5">
                                                        صفحة {slide.pageIndex + 1} من {slide.totalPages}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Pause indicator */}
                    {isPaused && slides.length > 1 && (
                        <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white/60 text-[10px] font-bold flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            مؤقت
                        </div>
                    )}

                    {/* Navigation Dots */}
                    {slides.length > 1 && (
                        <div className="flex items-center justify-center gap-2.5 mt-8">
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goTo(i)}
                                    className={`rounded-full transition-all duration-500 ${i === current
                                        ? 'w-10 h-3 bg-gradient-to-r from-amber-400 to-orange-400 shadow-lg shadow-amber-500/30'
                                        : 'w-3 h-3 bg-white/15 hover:bg-white/30 hover:scale-125'
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

const LandingPage = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading, loginAnonymously } = useAuth();
    const { customSettings } = useTheme();
    const { settings: printSettings } = usePrintSettings();
    const [courses, setCourses] = useState<any[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Lenis Smooth Scrolling
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Override smooth scroll clicks to use lenis
        const handleAnchorClick = (e: Event) => {
            const target = (e.target as HTMLElement).closest('button[data-scroll-to]');
            if (target) {
                const id = target.getAttribute('data-scroll-to');
                if (id) {
                    const el = document.getElementById(id);
                    if (el) lenis.scrollTo(el, { offset: -80 });
                }
            }
        };
        document.addEventListener('click', handleAnchorClick);

        return () => {
            lenis.destroy();
            document.removeEventListener('click', handleAnchorClick);
        };
    }, []);

    // Registration State
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Account Creation Modal State
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [accountForm, setAccountForm] = useState({ name: '', email: '', phone: '', password: '', province: '' });
    const [isCreatingAccount, setIsCreatingAccount] = useState(false);

    // Contact info from settings
    const [contactInfo, setContactInfo] = useState<{ email: string; phones: string[] }>({
        email: '',
        phones: []
    });

    // Announcements
    const [announcements, setAnnouncements] = useState<any[]>([]);

    // Fetch contact info from system_settings
    useEffect(() => {
        const fetchContactInfo = async () => {
            try {
                const settingsRef = doc(db, 'system_settings', 'global');
                const settingsDoc = await getDoc(settingsRef);
                if (settingsDoc.exists()) {
                    const data = settingsDoc.data();
                    setContactInfo({
                        email: data.contactEmail || '',
                        phones: data.contactPhones || []
                    });
                }
            } catch (error) {
                console.error('Error fetching contact info:', error);
            }
        };
        fetchContactInfo();
    }, []);

    // Trigger anonymous login if not already logged in
    useEffect(() => {
        if (!authLoading && !user) {
            console.log("Triggering anonymous login for Landing Page...");
            loginAnonymously().catch(err => console.error("Failed to login anonymously:", err));
        }
    }, [user, authLoading, loginAnonymously]);

    // When user clicks submit, show account creation modal
    const handleRegister = () => {
        setAccountForm({ name: '', email: '', phone: '', password: '', province: '' });
        setShowAccountModal(true);
    };

    // Step 2: Create student account (application is done from dashboard)
    const handleCreateAccount = async () => {
        if (!user || isCreatingAccount) return;
        if (!accountForm.name || !accountForm.email || !accountForm.phone || !accountForm.password || !accountForm.province) {
            toast.error('يرجى ملء جميع الحقول');
            return;
        }
        if (accountForm.password.length < 6) {
            toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        setIsCreatingAccount(true);
        try {
            // Check if account already exists with this email
            const existingQ = query(
                collection(db, 'student_accounts'),
                where('email', '==', accountForm.email)
            );
            const existingSnap = await getDocs(existingQ);

            let studentId: string;

            if (!existingSnap.empty) {
                studentId = existingSnap.docs[0].id;
                toast.info('تم العثور على حسابك، جاري تسجيل الدخول...');
            } else {
                // Create new student account
                const studentDoc = await addDoc(collection(db, 'student_accounts'), {
                    name: accountForm.name,
                    email: accountForm.email,
                    phone: accountForm.phone,
                    password: accountForm.password,
                    province: accountForm.province,
                    createdAt: serverTimestamp(),
                    userId: user.uid
                });
                studentId = studentDoc.id;
            }

            // Store student session in localStorage
            localStorage.setItem('student_session', JSON.stringify({
                id: studentId,
                name: accountForm.name,
                email: accountForm.email,
                phone: accountForm.phone,
                province: accountForm.province
            }));

            toast.success('تم إنشاء حسابك بنجاح!');
            setShowAccountModal(false);
            setSelectedCourse(null);
            navigate('/student-dashboard');
        } catch (err) {
            console.error('Error creating account:', err);
            toast.error('حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة لاحقاً');
        } finally {
            setIsCreatingAccount(false);
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

    // Fetch announcements
    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const snap = await getDocs(collection(db, 'landing_announcements'));
                const all = snap.docs
                    .map(d => ({ id: d.id, ...d.data() } as any))
                    .filter((a: any) => a.isActive === true)
                    .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
                setAnnouncements(all);
            } catch (err) {
                console.error('Failed to fetch announcements:', err);
            }
        };
        fetchAnnouncements();
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
            <nav className="fixed top-0 w-full z-50 bg-[#0a0e1a]/80 backdrop-blur-2xl border-b border-white/5 px-4 md:px-8 py-2">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(user ? '/educational-dashboard' : '/login')}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 text-sm"
                    >
                        {user ? 'لوحة التحكم' : 'تسجيل الدخول'}
                    </motion.button>

                    {/* Navigation Links — Desktop */}
                    <div className="hidden md:flex items-center gap-6">
                        {[
                            { label: 'الرئيسية', target: 'hero-section' },
                            { label: 'الدورات', target: 'courses-section' },
                            { label: 'رؤيتنا', target: 'vision-section' },
                            { label: 'الشهادات', target: 'certificates-section' },
                            { label: 'الأخبار', target: 'announcements-section' },
                            { label: 'تواصل معنا', target: 'contact-section' },
                        ].map(link => (
                            <button
                                key={link.target}
                                data-scroll-to={link.target}
                                className="text-slate-400 hover:text-white text-sm font-bold transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 hover:after:w-full after:h-[2px] after:bg-blue-500 after:transition-all after:duration-300"
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        {(customSettings.logoUrl || printSettings.logoUrl) ? (
                            <img
                                src={customSettings.logoUrl || printSettings.logoUrl}
                                alt="Logo"
                                className="w-auto object-contain transition-all duration-500 hover:scale-105 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                style={{ height: `${Math.max(customSettings.logoSize || 44, 56)}px` }}
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
            <section id="hero-section" className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 md:px-8 overflow-hidden">
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

            {/* ═══════════════════════════ Certificates Section ═══════════════════════════ */}
            <div id="certificates-section">
                {customSettings.certificates && customSettings.certificates.length > 0 && (() => {
                    // Build flat list of all slides: each page from each certificate
                    const allSlides: { pageUrl: string; title: string; logoUrl: string; certIndex: number; pageIndex: number; totalPages: number }[] = [];
                    customSettings.certificates.forEach((cert: any, ci: number) => {
                        const pages = cert.pages && cert.pages.length > 0 ? cert.pages : (cert.imageUrl ? [cert.imageUrl] : []);
                        pages.forEach((pageUrl: string, pi: number) => {
                            allSlides.push({ pageUrl, title: cert.title || '', logoUrl: cert.logoUrl || '', certIndex: ci, pageIndex: pi, totalPages: pages.length, rotation: cert.rotation || 0 });
                        });
                    });
                    if (allSlides.length === 0) return null;

                    return <CertificatesCarousel slides={allSlides} />;
                })()}
            </div>

            {/* ═══════════════════════════ Real Courses Section ═══════════════════════════ */}
            <section id="courses-section" className="py-24 px-4 md:px-8 relative overflow-hidden bg-gradient-to-b from-transparent via-blue-500/5 to-transparent">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none opacity-50" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-black mb-6 shadow-lg shadow-blue-500/10">
                            <Sparkles className="w-4 h-4 text-blue-400" />
                            <span>ابدأ رحلتك الآن</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                            أحدث الدورات{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                                التدريبية المتاحة
                            </span>
                        </h2>
                        <p className="text-slate-400 max-w-3xl mx-auto text-lg leading-relaxed font-medium">نقدم لك نخبة من البرامج التدريبية المصممة بعناية لتلبية طموحاتك المهنية وتعزيز مهاراتك في سوق العمل المتطور.</p>
                    </motion.div>

                    {loadingCourses ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className="h-[450px] bg-white/5 border border-white/5 rounded-[3rem] animate-pulse" />
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
                                        className="group relative bg-[#111624]/80 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 hover:bg-[#161c2d] transition-all duration-700 shadow-2xl cursor-pointer hover:shadow-blue-500/20"
                                    >
                                        <div className="aspect-[16/10] overflow-hidden relative">
                                            <motion.div
                                                layoutId={`image-${course.id}`}
                                                className="w-full h-full"
                                            >
                                                {course.imageUrl ? (
                                                    <div className="w-full h-full relative group-hover:scale-110 transition-transform duration-1000">
                                                        <img
                                                            src={course.imageUrl}
                                                            alt={course.name}
                                                            className="w-full h-full object-cover relative z-10"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-indigo-600/20 flex items-center justify-center">
                                                        <BookOpen className="w-16 h-16 text-blue-500/30" />
                                                    </div>
                                                )}
                                            </motion.div>

                                            <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-blue-600/90 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                                                {course.paymentType === 'cash' ? 'نقدي' : 'آجل'}
                                            </div>

                                            {course.feePerStudent && (
                                                <div className="absolute bottom-6 left-6 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl text-xs font-black shadow-xl z-30 border border-white/20 uppercase tracking-widest transform group-hover:scale-110 transition-transform">
                                                    {Number(course.feePerStudent).toLocaleString()} {course.currency === 'USD' ? '$' : 'IQD'}
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-gradient-to-t from-[#111624] via-transparent to-transparent opacity-60" />
                                        </div>

                                        <div className="p-8">
                                            <div className="flex items-center gap-3 mb-5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                                                <motion.span
                                                    layoutId={`instructor-${course.id}`}
                                                    className="text-white/50 text-[11px] font-black uppercase tracking-widest group-hover:text-blue-400 transition-colors"
                                                >
                                                    {course.instructorName || 'مدرب معتمد'}
                                                </motion.span>
                                            </div>

                                            <motion.h3
                                                layoutId={`title-${course.id}`}
                                                className="text-2xl font-black mb-4 text-white group-hover:text-blue-400 transition-colors line-clamp-1"
                                            >
                                                {course.name}
                                            </motion.h3>

                                            <p className="text-slate-400 text-base leading-relaxed mb-8 line-clamp-2 h-12 group-hover:text-slate-300 transition-colors font-medium">
                                                {course.summary || 'لا يوجد ملخص متاح لهذه الدورة حالياً، انضم إلينا لمعرفة التفاصيل.'}
                                            </p>

                                            <div className="flex items-center justify-between pt-6 border-t border-white/10">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-1">رسوم التسجيل</span>
                                                    <motion.span
                                                        layoutId={`fee-${course.id}`}
                                                        className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors"
                                                    >
                                                        {course.feePerStudent ? `${Number(course.feePerStudent).toLocaleString()} ${course.currency === 'USD' ? '$' : 'IQD'}` : 'اتصل بنا'}
                                                    </motion.span>
                                                </div>
                                                <div className="w-14 h-14 rounded-[1.5rem] bg-blue-600 border border-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:scale-110 group-hover:rotate-[-45deg] transition-all duration-700 shadow-xl shadow-blue-600/30">
                                                    <ArrowRight className="w-6 h-6 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className={`col-span-full py-24 text-center rounded-[3.5rem] border-2 border-dashed ${fetchError?.includes('صلاحية') ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5 border-white/10'}`}>
                                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 ${fetchError?.includes('صلاحية') ? 'bg-red-500/10' : 'bg-blue-500/10 shadow-inner'}`}>
                                        {fetchError?.includes('صلاحية') ? (
                                            <AlertCircle className="w-12 h-12 text-red-400" />
                                        ) : (
                                            <BookOpen className="w-12 h-12 text-blue-400" />
                                        )}
                                    </div>
                                    <h3 className="text-3xl font-black mb-4 text-white">
                                        {fetchError || 'لا توجد دورات متاحة حالياً'}
                                    </h3>
                                    <p className="text-slate-400 max-w-xl mx-auto font-bold text-lg px-6">
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
                            className="mt-20 text-center"
                        >
                            <button
                                onClick={() => navigate(user ? '/educational-dashboard' : '/login')}
                                className="inline-flex items-center gap-4 bg-white/5 hover:bg-blue-600/10 border border-white/10 hover:border-blue-500 text-slate-300 hover:text-blue-400 px-10 py-4 rounded-2xl transition-all font-black text-lg uppercase tracking-widest group shadow-2xl"
                            >
                                <span>استكشف جميع الدورات</span>
                                <div className="w-10 h-px bg-slate-700 group-hover:w-16 group-hover:bg-blue-500 transition-all duration-500" />
                                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500" />
                            </button>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* ═══════════════════════════ Vision & Mission ═══════════════════════════ */}

            <section id="vision-section" className="py-20 px-4 md:px-8 bg-white/[0.02] border-y border-white/5">
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

            {/* ═══════════════════════════ Announcements Section ═══════════════════════════ */}
            {announcements.length > 0 && (
                <section id="announcements-section" className="py-28 px-4 md:px-8 relative overflow-hidden">
                    {/* Background Effects */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/[0.07] rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
                        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-500/[0.05] rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-500/[0.03] rounded-full blur-[140px]" />
                        {/* Grid Pattern */}
                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(245,158,11,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                    </div>

                    <div className="max-w-7xl mx-auto relative z-10">
                        {/* Section Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-100px' }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="text-center mb-16"
                        >
                            {/* Animated Badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-rose-500/20 border border-amber-500/30 text-amber-300 text-sm font-black mb-8 shadow-xl shadow-amber-500/10 backdrop-blur-xl"
                            >
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
                                </span>
                                <Newspaper className="w-4 h-4 text-amber-400" />
                                <span>آخر الأخبار والمستجدات</span>
                            </motion.div>

                            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.1]">
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3, duration: 0.6 }}
                                    className="block"
                                >
                                    أخبار وإعلانات
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4, duration: 0.6 }}
                                    className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400"
                                    style={{ WebkitBackgroundClip: 'text' }}
                                >
                                    المؤسسة
                                </motion.span>
                            </h2>
                            <motion.p
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                                className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
                            >
                                تابع آخر المستجدات والإعلانات الخاصة بمؤسستنا
                            </motion.p>
                        </motion.div>

                        {/* Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {announcements.map((ann, i) => (
                                <motion.div
                                    key={ann.id}
                                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    viewport={{ once: true, margin: '-50px' }}
                                    transition={{ delay: i * 0.15, duration: 0.7, type: 'spring', stiffness: 100, damping: 15 }}
                                    whileHover={{ y: -8, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
                                    className="group relative"
                                >
                                    {/* Card Glow Border */}
                                    <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-orange-500/0 group-hover:from-amber-500/50 group-hover:via-orange-500/30 group-hover:to-rose-500/50 transition-all duration-700 opacity-0 group-hover:opacity-100 blur-[1px]" />

                                    <div className="relative bg-[#0d1117]/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden group-hover:border-white/[0.15] transition-all duration-700 shadow-2xl group-hover:shadow-amber-500/[0.08] h-full flex flex-col">

                                        {/* Image Area */}
                                        {ann.imageUrl ? (
                                            <div className="aspect-[16/10] overflow-hidden relative bg-[#0a0e18]">
                                                <motion.img
                                                    src={ann.imageUrl}
                                                    alt={ann.title}
                                                    className="w-full h-full object-contain"
                                                    whileHover={{ scale: 1.05 }}
                                                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                                />
                                                {/* Image Overlay Effects */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/30 to-transparent" />
                                                <div className="absolute inset-0 bg-gradient-to-l from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                                {/* Shimmer Effect on hover */}
                                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
                                                </div>

                                                {/* Badge */}
                                                <div className="absolute top-4 right-4">
                                                    <motion.div
                                                        initial={{ opacity: 0, x: 20 }}
                                                        whileInView={{ opacity: 1, x: 0 }}
                                                        viewport={{ once: true }}
                                                        transition={{ delay: i * 0.15 + 0.3 }}
                                                        className="px-3.5 py-1.5 rounded-xl bg-amber-500/90 backdrop-blur-xl text-[10px] font-black uppercase tracking-[0.15em] text-white shadow-xl shadow-amber-500/30 flex items-center gap-1.5"
                                                    >
                                                        <Megaphone className="w-3 h-3" />
                                                        إعلان
                                                    </motion.div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* No Image Decorative Header */
                                            <div className="relative h-32 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 overflow-hidden">
                                                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(245,158,11,0.3) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                                                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0d1117] to-transparent" />
                                                <motion.div
                                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                                    animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                                                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                                >
                                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-500/20 flex items-center justify-center backdrop-blur-xl border border-amber-500/20">
                                                        <Megaphone className="w-7 h-7 text-amber-400" />
                                                    </div>
                                                </motion.div>
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className="p-6 flex-1 flex flex-col">
                                            <h3 className="text-lg md:text-xl font-black mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-amber-300 group-hover:to-orange-300 transition-all duration-500 line-clamp-2 leading-relaxed">
                                                {ann.title}
                                            </h3>
                                            {ann.description && (
                                                <p className="text-slate-400/80 text-sm leading-relaxed line-clamp-3 flex-1">
                                                    {ann.description}
                                                </p>
                                            )}

                                            {/* Read More Indicator */}
                                            <div className="mt-4 pt-4 border-t border-white/[0.05]">
                                                <div className="flex items-center gap-2 text-amber-400/60 group-hover:text-amber-400 transition-colors duration-500">
                                                    <span className="text-xs font-bold">قراءة المزيد</span>
                                                    <motion.div
                                                        className="flex items-center"
                                                        animate={{ x: [0, -4, 0] }}
                                                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                                    >
                                                        <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                                                    </motion.div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Decorative Bottom Line */}
                        <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.8, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="mt-16 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent mx-auto max-w-lg"
                        />
                    </div>
                </section>
            )}

            {/* ═══════════════════════════ Contact & Map ═══════════════════════════ */}
            <section id="contact-section" className="py-20 px-4 md:px-8 bg-white/[0.02] border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-5xl font-black mb-4">
                            تواصل{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">معنا</span>
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">يسعدنا تواصلكم معنا في أي وقت</p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Info Cards */}
                        <div className="space-y-6">
                            {customSettings.contactAddress && (
                                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">العنوان</h4>
                                        <p className="text-slate-400 text-sm">{customSettings.contactAddress}</p>
                                    </div>
                                </div>
                            )}
                            {customSettings.contactPhone && (
                                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">الهاتف</h4>
                                        <p className="text-slate-400 text-sm" dir="ltr">{customSettings.contactPhone}</p>
                                    </div>
                                </div>
                            )}
                            {customSettings.contactEmail && (
                                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-6 h-6 text-amber-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">البريد الإلكتروني</h4>
                                        <p className="text-slate-400 text-sm" dir="ltr">{customSettings.contactEmail}</p>
                                    </div>
                                </div>
                            )}
                            {!customSettings.contactAddress && !customSettings.contactPhone && !customSettings.contactEmail && (
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                                    <MapPin className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                                    <p className="text-slate-500 text-sm font-bold">أضف معلومات الاتصال من صفحة التخصيص</p>
                                </div>
                            )}
                        </div>

                        {/* Map */}
                        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ height: '350px' }}>
                            <iframe
                                title="موقع المؤسسة"
                                width="100%"
                                height="100%"
                                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.95) contrast(0.9)' }}
                                loading="lazy"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${(customSettings.mapLng || 44.3661) - 0.02},${(customSettings.mapLat || 33.3152) - 0.02},${(customSettings.mapLng || 44.3661) + 0.02},${(customSettings.mapLat || 33.3152) + 0.02}&layer=mapnik&marker=${customSettings.mapLat || 33.3152},${customSettings.mapLng || 44.3661}`}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════ Footer ═══════════════════════════ */}
            <footer className="border-t border-white/5 pt-16 pb-8 bg-[#060912] px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                        <div className="col-span-1 border-r-0 md:border-r border-white/5 pr-0 md:pr-8">
                            <div className="mb-6">
                                {customSettings.logoUrl ? (
                                    <img
                                        src={customSettings.logoUrl}
                                        alt="Logo"
                                        className="h-14 w-auto object-contain"
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
                                {[
                                    { label: 'الرئيسية', target: 'hero-section' },
                                    { label: 'الدورات', target: 'courses-section' },
                                    { label: 'رؤيتنا', target: 'vision-section' },
                                    { label: 'تواصل معنا', target: 'contact-section' },
                                ].map(link => (
                                    <li key={link.target}>
                                        <button
                                            onClick={() => document.getElementById(link.target)?.scrollIntoView({ behavior: 'smooth' })}
                                            className="hover:text-blue-400 transition-colors"
                                        >
                                            {link.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="col-span-1">
                            <h4 className="font-black text-lg mb-6">اتصل بنا</h4>
                            <ul className="space-y-4 text-sm font-bold text-slate-500">
                                <li className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                    <span>{customSettings.contactAddress || 'العراق، بغداد'}</span>
                                </li>
                                {customSettings.contactEmail && (
                                    <li className="flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                        <span className="text-blue-400" dir="ltr">{customSettings.contactEmail}</span>
                                    </li>
                                )}
                                <li className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                    <span dir="ltr">{customSettings.contactPhone || '+964 000 000 0000'}</span>
                                </li>
                            </ul>
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
                            className="w-full max-w-4xl bg-[#111624] rounded-[2.5rem] border border-white/10 shadow-[0_0_100px_rgba(37,99,235,0.15)] overflow-hidden relative"
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

                            <div className="grid grid-cols-1 lg:grid-cols-2 lg:h-[80vh]">
                                {/* Left Side: Visual */}
                                <div className="h-64 lg:h-full relative overflow-hidden bg-slate-900/50 border-b lg:border-b-0 lg:border-l border-white/5">
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
                                                    className="w-full h-full object-contain relative z-10 p-8"
                                                />
                                                {/* Aesthetic blurred background filler */}
                                                <div className="absolute inset-0 opacity-20 blur-2xl pointer-events-none scale-110">
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
                                <div className="flex flex-col h-[65vh] lg:h-full relative">
                                    {/* Scrollable content area — only course info + description */}
                                    <div className="flex-1 overflow-y-auto p-6 md:p-8 description-scrollbar">
                                        {/* Price Badge - Compact */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5 relative overflow-hidden group"
                                        >
                                            <div className="flex items-center justify-center gap-3 relative z-10">
                                                <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-[0.2em]">رسوم التسجيل</span>
                                                <span className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                                                    {selectedCourse.feePerStudent ? Number(selectedCourse.feePerStudent).toLocaleString() : 'اتصل بنا'}
                                                </span>
                                                <span className="text-sm font-bold text-emerald-400">{selectedCourse.currency === 'USD' ? '$' : 'IQD'}</span>
                                            </div>
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-[40px] rounded-full -mr-12 -mt-12 group-hover:bg-emerald-500/20 transition-colors duration-700" />
                                        </motion.div>

                                        {/* Instructor + Status */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.15 }}
                                            className="flex items-center justify-between mb-3 px-1"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                                <motion.span
                                                    layoutId={`instructor-${selectedCourse.id}`}
                                                    className="text-slate-400 text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    {selectedCourse.instructorName || 'مدرب معتمد'}
                                                </motion.span>
                                            </div>
                                            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[8px] text-emerald-400 font-extrabold uppercase tracking-widest">متاحة للتسجيل</span>
                                            </div>
                                        </motion.div>

                                        {/* Course Title */}
                                        <motion.h2
                                            layoutId={`title-${selectedCourse.id}`}
                                            className="text-xl md:text-2xl font-black mb-4 leading-tight text-white"
                                        >
                                            {selectedCourse.name}
                                        </motion.h2>

                                        {/* Description — takes all remaining scroll space */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.25 }}
                                        >
                                            <p className="text-slate-400 text-sm leading-relaxed text-right">
                                                {selectedCourse.summary || 'نحن نقدم برامج تدريبية تركز على بناء الشخصية وتطوير المهارات القيادية والمهنية لتمكين الفرد من خدمة نفسه ومجتمعه.'}
                                            </p>
                                        </motion.div>

                                        {isSubmitted && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-center mt-6"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                                                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                                </div>
                                                <h3 className="text-base font-black text-white mb-1">تم استلام طلبك بنجاح!</h3>
                                                <p className="text-emerald-400/70 font-bold text-xs">سيتم التواصل معكم في أقرب وقت عبر رقم الهاتف المسجل.</p>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Fixed Bottom: Submit Button */}
                                    {!isSubmitted && (
                                        <div className="border-t border-white/5 bg-[#0d1120] p-4 md:p-5 flex-shrink-0">
                                            <motion.button
                                                onClick={handleRegister}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3.5 rounded-2xl font-black text-base transition-all shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3 hover:shadow-blue-500/50"
                                            >
                                                <span>إرسال طلب التسجيل</span>
                                                <ArrowRight className="w-5 h-5" />
                                            </motion.button>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══════════════════════════ Account Creation Modal ═══════════════════════════ */}
            <AnimatePresence>
                {showAccountModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0a0e1a]/95 backdrop-blur-3xl"
                        onClick={() => setShowAccountModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="w-full max-w-md bg-[#111624] rounded-[2.5rem] border border-white/10 shadow-[0_0_100px_rgba(37,99,235,0.2)] overflow-hidden relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="relative p-6 pb-4 border-b border-white/5">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                                <button
                                    onClick={() => setShowAccountModal(false)}
                                    className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-red-500/20 hover:text-red-400 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="flex flex-col items-center gap-3 text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/25">
                                        <UserPlus className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white">إنشاء حساب طالب</h3>
                                        <p className="text-xs text-slate-500 font-bold mt-1">يجب إنشاء حساب لإتمام التسجيل في الدورة</p>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <div className="p-6 space-y-4">
                                {/* Name */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest text-center block">الاسم الكامل</label>
                                    <div className="relative">
                                        <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                        <input
                                            value={accountForm.name}
                                            onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                                            placeholder="أدخل اسمك الكامل..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pr-11 pl-4 py-3 text-white text-sm font-bold outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-slate-600 text-center"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest text-center block">البريد الإلكتروني</label>
                                    <div className="relative">
                                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                        <input
                                            type="email"
                                            value={accountForm.email}
                                            onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                                            placeholder="example@email.com"
                                            dir="ltr"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pr-11 pl-4 py-3 text-white text-sm font-bold outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-slate-600 text-center"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest text-center block">رقم الهاتف</label>
                                    <div className="relative">
                                        <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                        <input
                                            type="tel"
                                            value={accountForm.phone}
                                            onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                                            placeholder="07xxxxxxxx"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pr-11 pl-4 py-3 text-white text-sm font-bold outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-slate-600 text-center"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest text-center block">كلمة المرور</label>
                                    <div className="relative">
                                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                        <input
                                            type="password"
                                            value={accountForm.password}
                                            onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                                            placeholder="6 أحرف على الأقل"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pr-11 pl-4 py-3 text-white text-sm font-bold outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-slate-600 text-center"
                                        />
                                    </div>
                                </div>

                                {/* Province */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest text-center block">المحافظة</label>
                                    <div className="relative">
                                        <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                        <select
                                            value={accountForm.province}
                                            onChange={(e) => setAccountForm({ ...accountForm, province: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pr-11 pl-4 py-3 text-white text-sm font-bold outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all appearance-none cursor-pointer text-center"
                                        >
                                            <option value="" className="bg-[#111624]">اختر المحافظة...</option>
                                            {['بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'كركوك', 'بابل', 'الأنبار', 'ذي قار', 'القادسية', 'ديالى', 'واسط', 'ميسان', 'صلاح الدين', 'المثنى', 'دهوك', 'السليمانية'].map(p => (
                                                <option key={p} value={p} className="bg-[#111624]">{p}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Submit */}
                                <motion.button
                                    onClick={handleCreateAccount}
                                    disabled={isCreatingAccount || !accountForm.name || !accountForm.email || !accountForm.phone || !accountForm.password || !accountForm.province}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-2xl font-black text-base transition-all shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-blue-500/50 mt-2"
                                >
                                    {isCreatingAccount ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            جاري إنشاء الحساب...
                                        </span>
                                    ) : (
                                        <>
                                            <UserPlus className="w-5 h-5" />
                                            <span>إنشاء الحساب والتسجيل</span>
                                        </>
                                    )}
                                </motion.button>
                            </div>

                            {/* Decorative */}
                            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LandingPage;
