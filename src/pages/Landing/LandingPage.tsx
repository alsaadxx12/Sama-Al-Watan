import { useState, useEffect } from 'react';
import Lenis from 'lenis';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, addDoc, serverTimestamp, doc, getDoc, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
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
    Newspaper,
    Sun,
    Moon
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
    const { theme } = useTheme();
    const isDarkCert = theme === 'dark';
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
                    <div className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r border text-sm font-black mb-6 shadow-lg ${isDarkCert ? 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-400 shadow-amber-500/5' : 'from-amber-500/8 to-orange-500/8 border-amber-400/25 text-amber-600 shadow-amber-200/20'}`}>
                        <Award className="w-4 h-4" />
                        <span>اعتماداتنا وشهاداتنا</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                        شهادات{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400">
                            واعتمادات رسمية
                        </span>
                    </h2>
                    <p className={`max-w-2xl mx-auto text-lg font-medium ${isDarkCert ? 'text-slate-400' : 'text-slate-600'}`}>
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
                                className={`absolute left-2 md:-left-16 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full backdrop-blur-xl border flex items-center justify-center transition-all duration-300 ${isDarkCert ? 'bg-gradient-to-br from-white/15 to-white/5 border-white/20 text-white hover:from-amber-500/30 hover:to-orange-500/20 hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-500/20' : 'bg-white/90 border-slate-200 text-slate-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 shadow-md'}`}
                            >
                                <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                                onClick={next}
                                className={`absolute right-2 md:-right-16 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full backdrop-blur-xl border flex items-center justify-center transition-all duration-300 ${isDarkCert ? 'bg-gradient-to-br from-white/15 to-white/5 border-white/20 text-white hover:from-amber-500/30 hover:to-orange-500/20 hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-500/20' : 'bg-white/90 border-slate-200 text-slate-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 shadow-md'}`}
                            >
                                <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            </button>
                        </>
                    )}

                    {/* Glowing Border Container */}
                    <div className={`relative rounded-3xl p-[2px] shadow-2xl group-hover/carousel:shadow-amber-500/20 transition-all duration-500 ${isDarkCert ? 'bg-gradient-to-br from-amber-400/30 via-transparent to-orange-400/30 shadow-amber-500/10 group-hover/carousel:from-amber-400/50 group-hover/carousel:to-orange-400/50' : 'bg-gradient-to-br from-amber-300/40 via-slate-200 to-orange-300/40 shadow-slate-200/50 group-hover/carousel:from-amber-400/60 group-hover/carousel:to-orange-400/60'}`}>
                        {/* Inner Container */}
                        <div className={`relative rounded-3xl backdrop-blur-2xl overflow-hidden ${isDarkCert ? 'bg-gradient-to-br from-[#0f1629]/95 via-[#111827]/95 to-[#0f1629]/95' : 'bg-white'}`}>
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
                                        <div className={`rounded-2xl overflow-hidden shadow-xl w-full h-full flex items-center justify-center ${isDarkCert ? 'bg-white shadow-black/20' : 'bg-white shadow-slate-200/50 border border-slate-100'}`}>
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
                                                    <h3 className={`text-lg font-black ${isDarkCert ? 'text-white' : 'text-slate-800'}`}>{slide.title}</h3>
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
                                        : isDarkCert ? 'w-3 h-3 bg-white/15 hover:bg-white/30 hover:scale-125' : 'w-3 h-3 bg-slate-300 hover:bg-amber-400 hover:scale-125'
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

// ═══════════════════ Trainer Certificates Carousel Component ═══════════════════
interface TrainerSlide {
    pageUrl: string;
    name: string;
    title: string;
    pageIndex: number;
    totalPages: number;
}

const TrainerCertificatesCarousel = ({ slides }: { slides: TrainerSlide[] }) => {
    const { theme } = useTheme();
    const isDarkTC = theme === 'dark';
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
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-gradient-to-r rounded-full blur-[150px] ${isDarkTC ? 'from-emerald-500/[0.08] via-teal-500/[0.05] to-cyan-500/[0.08]' : 'from-emerald-500/[0.05] via-teal-500/[0.03] to-cyan-500/[0.05]'}`} />
                <div className={`absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px] ${isDarkTC ? 'bg-emerald-500/[0.05]' : 'bg-emerald-500/[0.03]'}`} />
                <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[120px] ${isDarkTC ? 'bg-teal-500/[0.05]' : 'bg-teal-500/[0.03]'}`} />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r border text-sm font-black mb-6 shadow-lg ${isDarkTC ? 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-500/5' : 'from-emerald-500/8 to-teal-500/8 border-emerald-400/25 text-emerald-600 shadow-emerald-200/20'}`}>
                        <GraduationCap className="w-4 h-4" />
                        <span>فريق التدريب</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                        شهادات{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                            المدربين
                        </span>
                    </h2>
                    <p className={`max-w-2xl mx-auto text-lg font-medium ${isDarkTC ? 'text-slate-400' : 'text-slate-600'}`}>
                        نخبة من المدربين المؤهلين الحاصلين على شهادات معتمدة محلياً ودولياً
                    </p>
                </motion.div>

                {/* Carousel Container */}
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
                                className={`absolute left-2 md:-left-16 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full backdrop-blur-xl border flex items-center justify-center transition-all duration-300 ${isDarkTC ? 'bg-gradient-to-br from-white/15 to-white/5 border-white/20 text-white hover:from-emerald-500/30 hover:to-teal-500/20 hover:border-emerald-400/40 hover:shadow-lg hover:shadow-emerald-500/20' : 'bg-white/90 border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 shadow-md'}`}
                            >
                                <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                                onClick={next}
                                className={`absolute right-2 md:-right-16 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full backdrop-blur-xl border flex items-center justify-center transition-all duration-300 ${isDarkTC ? 'bg-gradient-to-br from-white/15 to-white/5 border-white/20 text-white hover:from-emerald-500/30 hover:to-teal-500/20 hover:border-emerald-400/40 hover:shadow-lg hover:shadow-emerald-500/20' : 'bg-white/90 border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 shadow-md'}`}
                            >
                                <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            </button>
                        </>
                    )}

                    {/* Glowing Border Container */}
                    <div className={`relative rounded-3xl p-[2px] shadow-2xl group-hover/carousel:shadow-emerald-500/20 transition-all duration-500 ${isDarkTC ? 'bg-gradient-to-br from-emerald-400/30 via-transparent to-teal-400/30 shadow-emerald-500/10 group-hover/carousel:from-emerald-400/50 group-hover/carousel:to-teal-400/50' : 'bg-gradient-to-br from-emerald-300/40 via-slate-200 to-teal-300/40 shadow-slate-200/50 group-hover/carousel:from-emerald-400/60 group-hover/carousel:to-teal-400/60'}`}>
                        {/* Inner Container */}
                        <div className={`relative rounded-3xl backdrop-blur-2xl overflow-hidden ${isDarkTC ? 'bg-gradient-to-br from-[#0f1629]/95 via-[#111827]/95 to-[#0f1629]/95' : 'bg-white'}`}>
                            {/* Shimmer accent line at top */}
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent z-10" />

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
                                    style={{ height: '650px' }}
                                >
                                    {/* Certificate Image — Fixed Height */}
                                    <div className="flex-1 p-5 md:p-8 pb-0 flex items-center justify-center min-h-0">
                                        <div className={`rounded-2xl overflow-hidden shadow-xl w-full h-full flex items-center justify-center ${isDarkTC ? 'bg-white shadow-black/20' : 'bg-white shadow-slate-200/50 border border-slate-100'}`}>
                                            <img
                                                src={slide.pageUrl}
                                                alt={slide.name ? `شهادة ${slide.name}` : 'شهادة المدرب'}
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        </div>
                                    </div>

                                    {/* Trainer Info — Fixed Bottom */}
                                    <div className="p-4 md:p-5 text-center flex-shrink-0">
                                        <div className="flex items-center justify-center gap-4 flex-wrap">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/15">
                                                <GraduationCap className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                {slide.name && (
                                                    <h3 className={`text-lg font-black ${isDarkTC ? 'text-white' : 'text-slate-800'}`}>{slide.name}</h3>
                                                )}
                                                <div className="flex items-center gap-3 justify-center">
                                                    {slide.title && (
                                                        <p className={`text-sm font-medium ${isDarkTC ? 'text-emerald-400/80' : 'text-emerald-600'}`}>{slide.title}</p>
                                                    )}
                                                    {slide.totalPages > 1 && (
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDarkTC ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-50 text-emerald-600'}`}>
                                                            صفحة {slide.pageIndex + 1} من {slide.totalPages}
                                                        </span>
                                                    )}
                                                </div>
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
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            مؤقت
                        </div>
                    )}

                    {/* Page Counter Badge */}
                    {slides.length > 1 && (
                        <div className={`absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full text-xs font-black backdrop-blur-xl ${isDarkTC ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                            {current + 1} / {slides.length}
                        </div>
                    )}

                    {/* Navigation Dots */}
                    {slides.length > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goTo(i)}
                                    className={`rounded-full transition-all duration-500 ${i === current
                                        ? 'w-10 h-3 bg-gradient-to-r from-emerald-400 to-teal-400 shadow-lg shadow-emerald-500/30'
                                        : isDarkTC ? 'w-3 h-3 bg-white/15 hover:bg-white/30 hover:scale-125' : 'w-3 h-3 bg-slate-300 hover:bg-emerald-400 hover:scale-125'
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
    const { customSettings, theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const { settings: printSettings } = usePrintSettings();
    const [courses, setCourses] = useState<any[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Scroll state for navbar
    const [scrolled, setScrolled] = useState(false);
    const { scrollY } = useScroll();
    useMotionValueEvent(scrollY, 'change', (latest) => {
        setScrolled(latest > 50);
    });

    // Intro splash state
    const [showIntro, setShowIntro] = useState(true);
    const [introPhase, setIntroPhase] = useState(0); // 0=logo, 1=text, 2=exit

    // Lenis Smooth Scrolling — enhanced config
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.4,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            lerp: 0.08,
            touchMultiplier: 1.5,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Override smooth scroll clicks to use lenis
        const handleAnchorClick = (e: Event) => {
            const target = (e.target as HTMLElement).closest('button[data-scroll-to], [data-scroll-to]');
            if (target) {
                const id = target.getAttribute('data-scroll-to');
                if (id) {
                    const el = document.getElementById(id);
                    if (el) lenis.scrollTo(el, { offset: -80, duration: 1.5 });
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
        <div className={`min-h-screen font-['Tajawal'] overflow-x-hidden selection:bg-blue-500/30 transition-colors duration-500 ${isDark ? 'bg-[#0a0e1a] text-white' : 'bg-[#f8fafc] text-slate-900'}`}>
            {/* ═══════════════════ INTRO SPLASH SCREEN ═══════════════════ */}
            <AnimatePresence>
                {showIntro && (
                    <motion.div
                        key="intro-splash"
                        className={`fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden ${isDark ? 'bg-[#0a0e1a]' : 'bg-[#f8fafc]'}`}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {/* Background ambient effects */}
                        <div className="absolute inset-0 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 2 }}
                                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] ${isDark ? 'bg-blue-600/[0.06]' : 'bg-blue-400/[0.08]'}`}
                            />
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 2, delay: 0.3 }}
                                className={`absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full blur-[100px] ${isDark ? 'bg-indigo-600/[0.05]' : 'bg-indigo-400/[0.06]'}`}
                            />
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 2, delay: 0.5 }}
                                className={`absolute bottom-[30%] left-[20%] w-[250px] h-[250px] rounded-full blur-[80px] ${isDark ? 'bg-purple-600/[0.04]' : 'bg-purple-400/[0.05]'}`}
                            />
                            {/* Dot pattern */}
                            <div className={`absolute inset-0 ${isDark ? 'opacity-[0.02]' : 'opacity-[0.03]'}`} style={{ backgroundImage: `radial-gradient(${isDark ? 'rgba(59,130,246,0.5)' : 'rgba(59,130,246,0.3)'} 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />
                        </div>

                        {/* Logo with animated ring */}
                        <motion.div
                            initial={{ scale: 0, opacity: 0, rotate: -30 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 150, damping: 20, delay: 0.2 }}
                            className="relative mb-10"
                            onAnimationComplete={() => setIntroPhase(1)}
                        >
                            <div className="relative w-32 h-32">
                                {/* Rotating gradient ring */}
                                <div className="absolute -inset-[4px] rounded-full opacity-70" style={{
                                    background: 'conic-gradient(from 0deg, rgba(59,130,246,0.6), rgba(99,102,241,0.5), rgba(139,92,246,0.6), rgba(99,102,241,0.5), rgba(59,130,246,0.6))',
                                    animation: 'spin 3s linear infinite'
                                }} />
                                {/* Outer glow */}
                                <div className={`absolute -inset-6 rounded-full blur-2xl ${isDark ? 'bg-blue-500/15' : 'bg-blue-400/20'}`} />
                                {/* Logo image or fallback */}
                                <div className={`relative w-full h-full rounded-full border-[3px] flex items-center justify-center overflow-hidden ${isDark ? 'bg-[#0a0e1a] border-[#0f1525]' : 'bg-white border-blue-100'}`}>
                                    {(customSettings.logoUrl || printSettings.logoUrl) ? (
                                        <img src={customSettings.logoUrl || printSettings.logoUrl} alt="Logo" className="w-[85%] h-[85%] object-contain" />
                                    ) : (
                                        <GraduationCap className="w-14 h-14 text-blue-400" />
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Organization Name */}
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={introPhase >= 1 ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="text-3xl md:text-5xl font-black mb-4 text-center px-4"
                            style={{ textShadow: isDark ? '0 0 60px rgba(59,130,246,0.2)' : '0 0 60px rgba(59,130,246,0.1)' }}
                        >
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" style={{ WebkitBackgroundClip: 'text' }}>
                                مؤسسة سما الوطن
                            </span>
                        </motion.h1>

                        {/* Tagline */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={introPhase >= 1 ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.7, delay: 0.3 }}
                            className={`text-sm md:text-lg font-bold mb-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                            onAnimationComplete={() => {
                                if (introPhase >= 1) setIntroPhase(2);
                            }}
                        >
                            الانسانية للتدريب والتطوير
                        </motion.p>

                        {/* Progress bar / loading indicator */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={introPhase >= 1 ? { opacity: 1 } : {}}
                            transition={{ delay: 0.5 }}
                            className={`relative w-48 h-1 rounded-full overflow-hidden ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`}
                        >
                            <motion.div
                                initial={{ width: '0%' }}
                                animate={introPhase >= 1 ? { width: '100%' } : {}}
                                transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.3 }}
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                                onAnimationComplete={() => {
                                    setTimeout(() => setShowIntro(false), 300);
                                }}
                            />
                        </motion.div>

                        {/* Floating particles */}
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={`intro-particle-${i}`}
                                className={`absolute w-1 h-1 rounded-full ${isDark ? 'bg-blue-400/30' : 'bg-blue-500/20'}`}
                                initial={{
                                    x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800) - 400,
                                    y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 600) - 300,
                                    opacity: 0
                                }}
                                animate={{
                                    y: [0, -30, 0],
                                    opacity: [0, 0.6, 0],
                                }}
                                transition={{
                                    duration: 3 + i * 0.5,
                                    repeat: Infinity,
                                    delay: i * 0.4
                                }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══════════════════ FIXED NAVBAR ═══════════════════ */}
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={!showIntro ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className="fixed top-0 w-full z-50"
            >
                <div className={`transition-all duration-500 ${isDark
                    ? (scrolled ? 'bg-[#0a0e1a]/98 shadow-2xl shadow-black/40' : 'bg-[#0a0e1a]/90')
                    : (scrolled ? 'bg-white/95 shadow-lg shadow-slate-200/50' : 'bg-white/80')
                    }`} style={{ backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)' }}>
                    {/* Subtle bottom border line */}
                    <div className={`absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent ${isDark ? 'via-blue-500/20' : 'via-blue-500/15'} to-transparent`} />

                    <motion.div
                        animate={{ paddingTop: scrolled ? 8 : 14, paddingBottom: scrolled ? 8 : 14 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="relative z-10 flex items-center justify-between px-4 md:px-10 max-w-[1600px] mx-auto"
                    >
                        {/* CTA Button + Theme Toggle */}
                        <div className="flex items-center gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59,130,246,0.4)' }}
                                whileTap={{ scale: 0.93 }}
                                onClick={() => navigate(user ? '/educational-dashboard' : '/login')}
                                className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite] text-white px-6 py-2.5 rounded-xl font-black transition-all shadow-lg shadow-blue-500/20 text-sm group"
                            >
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                <span className="relative z-10 flex items-center gap-2">
                                    {user ? 'لوحة التحكم' : 'تسجيل الدخول'}
                                    <ArrowRight className="w-3.5 h-3.5 rotate-180 opacity-70 group-hover:opacity-100 group-hover:-translate-x-0.5 transition-all duration-300" />
                                </span>
                            </motion.button>

                            {/* Theme Toggle Button */}
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleTheme}
                                className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isDark
                                    ? 'bg-white/[0.06] hover:bg-white/[0.12] text-amber-400'
                                    : 'bg-slate-100 hover:bg-slate-200 text-indigo-600'
                                    }`}
                                title={isDark ? 'الوضع الصباحي' : 'الوضع الليلي'}
                            >
                                <motion.div
                                    key={theme}
                                    initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                >
                                    {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
                                </motion.div>
                            </motion.button>
                        </div>

                        {/* Navigation Links — Desktop */}
                        <div className="hidden md:flex items-center gap-0.5">
                            {[
                                { label: 'الرئيسية', target: 'hero-section' },
                                { label: 'الدورات', target: 'courses-section' },
                                { label: 'رؤيتنا', target: 'vision-section' },
                                { label: 'الشهادات', target: 'certificates-section' },
                                { label: 'الأخبار', target: 'announcements-section' },
                                { label: 'تواصل معنا', target: 'contact-section' },
                            ].map((link, idx) => (
                                <motion.button
                                    key={link.target}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + idx * 0.06, duration: 0.5 }}
                                    data-scroll-to={link.target}
                                    className={`relative text-sm font-bold transition-all duration-300 px-4 py-2 rounded-lg group ${isDark
                                        ? 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                        }`}
                                >
                                    <span className="relative z-10">{link.label}</span>
                                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0 group-hover:w-6 h-[2px] bg-gradient-to-r from-blue-400 to-indigo-400 transition-all duration-300 rounded-full" />
                                </motion.button>
                            ))}
                        </div>

                        {/* Logo */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
                            className="flex items-center gap-4 cursor-pointer group"
                            data-scroll-to="hero-section"
                        >
                            {(customSettings.logoUrl || printSettings.logoUrl) ? (
                                <div className="relative">
                                    <div className={`absolute -inset-2 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isDark ? 'bg-blue-500/10' : 'bg-blue-400/15'}`} />
                                    <img
                                        src={customSettings.logoUrl || printSettings.logoUrl}
                                        alt="Logo"
                                        className="w-auto object-contain relative z-10 transition-all duration-500 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(59,130,246,0.2)] group-hover:drop-shadow-[0_0_25px_rgba(59,130,246,0.4)]"
                                        style={{ height: `${Math.max(customSettings.logoSize || 44, scrolled ? 36 : 48)}px` }}
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.parentElement!.classList.add('fallback-logo');
                                        }}
                                    />
                                </div>
                            ) : (
                                <span className={`bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 bg-clip-text text-transparent font-black text-xl`} style={{ WebkitBackgroundClip: 'text' }}>
                                    مؤسسة سما الوطن الانسانية للتدريب والتطوير
                                </span>
                            )}
                        </motion.div>
                    </motion.div>
                </div>
            </motion.nav>
            <section id="hero-section" className="relative pt-32 pb-20 md:pt-48 md:pb-36 px-4 md:px-8 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className={`absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full blur-[180px] animate-pulse ${isDark ? 'bg-blue-600/[0.07]' : 'bg-blue-400/[0.1]'}`} style={{ animationDuration: '6s' }} />
                    <div className={`absolute bottom-[-20%] left-[-15%] w-[700px] h-[700px] rounded-full blur-[150px] animate-pulse ${isDark ? 'bg-indigo-600/[0.06]' : 'bg-indigo-400/[0.08]'}`} style={{ animationDuration: '8s', animationDelay: '2s' }} />
                    <div className={`absolute top-[20%] left-[40%] w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse ${isDark ? 'bg-purple-600/[0.04]' : 'bg-purple-400/[0.06]'}`} style={{ animationDuration: '7s', animationDelay: '1s' }} />
                    {/* Dot grid pattern */}
                    <div className={`absolute inset-0 ${isDark ? 'opacity-[0.03]' : 'opacity-[0.04]'}`} style={{ backgroundImage: `radial-gradient(${isDark ? 'rgba(59,130,246,0.5)' : 'rgba(59,130,246,0.25)'} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
                    {/* Radial fade */}
                    <div className={`absolute inset-0 ${isDark ? 'bg-[radial-gradient(ellipse_at_center,transparent_0%,#0a0e1a_75%)]' : 'bg-[radial-gradient(ellipse_at_center,transparent_0%,#f8fafc_80%)]'}`} />
                    {/* Diagonal lines accent */}
                    <div className={`absolute inset-0 ${isDark ? 'opacity-[0.015]' : 'opacity-[0.02]'}`} style={{ backgroundImage: `repeating-linear-gradient(45deg, ${isDark ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.15)'} 0, ${isDark ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.15)'} 1px, transparent 0, transparent 50%)`, backgroundSize: '60px 60px' }} />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            className="text-right"
                        >
                            {/* Badge with pulsing dot */}
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                                className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r border text-xs font-black mb-8 backdrop-blur-xl relative overflow-hidden ${isDark ? 'from-blue-500/10 via-indigo-500/10 to-purple-500/10 border-blue-400/20 text-blue-300' : 'from-blue-500/8 via-indigo-500/8 to-purple-500/8 border-blue-400/25 text-blue-600'}`}
                            >
                                {/* Shimmer sweep on badge */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" style={{ backgroundSize: '200% 100%', animation: 'shimmer 3s linear infinite' }} />
                                <div className="relative flex items-center gap-2.5">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-400" />
                                    </span>
                                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                                    <span>خطوة نحو مستقبل أفضل</span>
                                </div>
                            </motion.div>

                            {/* Title with enhanced typography */}
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 leading-[1.12]"
                            >
                                <span className="block" style={{ textShadow: '0 0 80px rgba(59,130,246,0.15)' }}>مؤسسة سما الوطن</span>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-[shimmer_4s_linear_infinite] bg-[length:200%_100%]" style={{ WebkitBackgroundClip: 'text' }}>
                                    الانسانية للتدريب والتطوير
                                </span>
                            </motion.h1>

                            {/* Description with subtle decoration */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.7 }}
                                className="relative mb-10"
                            >
                                <div className="absolute right-0 top-0 bottom-0 w-[3px] rounded-full bg-gradient-to-b from-blue-500/50 via-indigo-500/30 to-transparent" />
                                <p className={`text-lg md:text-xl leading-relaxed max-w-xl pr-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                    نسعى لتمكين الأفراد والمجتمعات من خلال تعليم متميز، برامج تطويرية شاملة، ومبادرات إنسانية تترك أثراً مستداماً.
                                </p>
                            </motion.div>

                            {/* CTA Buttons — enhanced */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8, duration: 0.7 }}
                                className="flex flex-wrap items-center gap-4"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/login')}
                                    className="relative px-9 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite] text-white rounded-2xl font-black text-lg transition-all flex items-center gap-3 overflow-hidden group"
                                >
                                    {/* Outer glow ring */}
                                    <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-blue-400/40 to-indigo-400/40 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                                    {/* Deep shadow */}
                                    <div className="absolute inset-0 rounded-2xl shadow-[0_8px_32px_rgba(59,130,246,0.35)] group-hover:shadow-[0_12px_50px_rgba(59,130,246,0.5)] transition-shadow duration-500" />
                                    {/* Shimmer sweep */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                    <span className="relative z-10">انضم إلينا الآن</span>
                                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:-translate-x-1 transition-transform duration-300" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05, borderColor: 'rgba(99,102,241,0.4)' }}
                                    whileTap={{ scale: 0.95 }}
                                    data-scroll-to="courses-section"
                                    className={`px-9 py-4 border rounded-2xl font-black text-lg transition-all duration-500 backdrop-blur-xl relative overflow-hidden group ${isDark ? 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.08] text-white' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-sm'}`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-indigo-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <span className="relative z-10">تعرف على برامجنا</span>
                                </motion.button>
                            </motion.div>
                        </motion.div>

                        {/* Stats Cards — Premium Redesign */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="relative hidden lg:block"
                        >
                            {/* Animated outer glow */}
                            <div className="absolute -inset-3 rounded-[3.5rem] bg-gradient-to-br from-blue-500/15 via-indigo-500/8 to-purple-500/15 blur-[40px] animate-pulse" style={{ animationDuration: '4s' }} />

                            {/* Main wrapper with gradient border */}
                            <div className="relative rounded-[3rem] p-[1px] overflow-hidden">
                                {/* Rotating conic gradient border */}
                                <div className="absolute inset-0" style={{
                                    background: 'conic-gradient(from 0deg, transparent 0%, rgba(59,130,246,0.35) 10%, transparent 20%, rgba(99,102,241,0.25) 35%, transparent 50%, rgba(139,92,246,0.3) 65%, transparent 80%, rgba(59,130,246,0.35) 90%, transparent 100%)',
                                    animation: 'spin 10s linear infinite'
                                }} />

                                {/* Inner container */}
                                <div className={`relative rounded-[calc(3rem-1px)] p-8 overflow-hidden ${isDark ? 'bg-gradient-to-br from-[#0c1018] via-[#0f1525] to-[#0c1220]' : 'bg-white/90 shadow-xl shadow-slate-200/50'}`} style={{ backdropFilter: 'blur(40px)' }}>
                                    {/* Decorative elements */}
                                    <div className="absolute top-0 left-[8%] right-[8%] h-[1px] bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
                                    <div className="absolute bottom-0 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
                                    {/* Floating orbs */}
                                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-500/[0.06] rounded-full blur-[60px]" />
                                    <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-indigo-500/[0.05] rounded-full blur-[50px]" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/[0.03] rounded-full blur-[40px]" />
                                    {/* Diagonal decorative line */}
                                    <div className="absolute top-0 right-0 w-[200px] h-[200px] opacity-[0.04]" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.8) 0%, transparent 60%)' }} />

                                    {/* Stats title */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7, duration: 0.6 }}
                                        className="text-center mb-6"
                                    >
                                        <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.25em]">إنجازاتنا بالأرقام</p>
                                    </motion.div>

                                    <div className="grid grid-cols-2 gap-5 relative z-10">
                                        {stats.map((stat, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 25, scale: 0.9 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                transition={{ delay: 0.8 + i * 0.12, type: 'spring', stiffness: 130, damping: 18 }}
                                                whileHover={{ y: -8, scale: 1.04, transition: { duration: 0.3, type: 'spring', stiffness: 300 } }}
                                                className={`relative p-6 rounded-2xl transition-all duration-500 text-center group overflow-hidden ${isDark ? 'bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] hover:border-white/[0.12]' : 'bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-md'}`}
                                            >
                                                {/* Top accent bar */}
                                                <div className={`absolute top-0 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-transparent via-${stat.color}-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:left-[10%] group-hover:right-[10%]`} />
                                                {/* Corner glow */}
                                                <div className={`absolute -top-6 -right-6 w-20 h-20 bg-${stat.color}-500/[0.08] rounded-full blur-[25px] opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                                                {/* Icon with ring */}
                                                <div className="relative mx-auto mb-4 w-16 h-16">
                                                    {/* Animated ring */}
                                                    <div className={`absolute inset-0 rounded-2xl border-2 border-${stat.color}-500/10 group-hover:border-${stat.color}-500/25 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110`} />
                                                    <div className={`relative w-full h-full rounded-2xl bg-gradient-to-br from-${stat.color}-500/20 to-${stat.color}-600/5 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-${stat.color}-500/10 transition-all duration-500`}>
                                                        <stat.icon className={`w-7 h-7 text-${stat.color}-400 group-hover:scale-110 transition-transform duration-300`} />
                                                    </div>
                                                </div>

                                                {/* Value with emphasis */}
                                                <div className={`text-3xl font-black mb-1.5 transition-colors duration-500 ${isDark ? `text-white group-hover:text-${stat.color}-300` : `text-slate-800 group-hover:text-${stat.color}-600`}`} style={{ fontVariantNumeric: 'tabular-nums' }}>{stat.value}</div>
                                                {/* Label */}
                                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] group-hover:text-slate-400 transition-colors duration-500">{stat.label}</div>
                                            </motion.div>
                                        ))}
                                    </div>
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
                    const allSlides: CertSlide[] = [];
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

            {/* ═══════════════════════════ Trainer Certificates Section ═══════════════════════════ */}
            {customSettings.trainerCertificates && customSettings.trainerCertificates.length > 0 && (() => {
                // Flatten all pages from all trainers into one list
                const allTrainerSlides: { pageUrl: string; name: string; title: string; pageIndex: number; totalPages: number }[] = [];
                customSettings.trainerCertificates.forEach((tc: any) => {
                    const pages = tc.certificatePages && tc.certificatePages.length > 0 ? tc.certificatePages : (tc.imageUrl ? [tc.imageUrl] : []);
                    pages.forEach((pageUrl: string, pi: number) => {
                        allTrainerSlides.push({ pageUrl, name: tc.name || '', title: tc.title || '', pageIndex: pi, totalPages: pages.length });
                    });
                });
                if (allTrainerSlides.length === 0) return null;

                return <TrainerCertificatesCarousel slides={allTrainerSlides} />;
            })()}

            {/* ═══════════════════════════ Board Accreditations Section ═══════════════════════════ */}
            {customSettings.boardAccreditations && customSettings.boardAccreditations.length > 0 && (
                <section className="py-24 px-4 md:px-8 relative overflow-hidden">
                    {/* Background Effects */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] ${isDark ? 'bg-violet-500/[0.06]' : 'bg-violet-500/[0.04]'}`} />
                        <div className={`absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] ${isDark ? 'bg-indigo-500/[0.05]' : 'bg-indigo-500/[0.03]'}`} />
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
                            <div className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r border text-sm font-black mb-6 shadow-lg ${isDark ? 'from-violet-500/10 to-indigo-500/10 border-violet-500/20 text-violet-400 shadow-violet-500/5' : 'from-violet-500/8 to-indigo-500/8 border-violet-400/25 text-violet-600 shadow-violet-200/20'}`}>
                                <Shield className="w-4 h-4" />
                                <span>اعتمادات معتمدة</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                                الاعتمادات{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-purple-400" style={{ WebkitBackgroundClip: 'text' }}>
                                    الدولية
                                </span>
                            </h2>
                            <p className={`max-w-2xl mx-auto text-lg font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                معتمدون من أرقى المؤسسات الأكاديمية والمهنية عالمياً
                            </p>
                        </motion.div>

                        {/* Board Cards Grid */}
                        <div className={`grid gap-8 ${customSettings.boardAccreditations.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}>
                            {customSettings.boardAccreditations.map((board: any, i: number) => (
                                <motion.div
                                    key={board.id}
                                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    viewport={{ once: true, margin: '-50px' }}
                                    transition={{ delay: i * 0.15, duration: 0.7, type: 'spring', stiffness: 100, damping: 18 }}
                                    whileHover={{ y: -6, transition: { duration: 0.3 } }}
                                    className="group"
                                >
                                    <div className={`relative rounded-3xl overflow-hidden border transition-all duration-500 h-full ${isDark ? 'bg-gradient-to-br from-white/[0.04] to-white/[0.01] border-white/[0.06] hover:border-violet-500/25 hover:shadow-lg hover:shadow-violet-500/10' : 'bg-white border-slate-200 hover:border-violet-400/40 shadow-sm hover:shadow-xl hover:shadow-violet-100/50'}`}>
                                        {/* Shimmer line */}
                                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        <div className="p-8">
                                            <div className="flex items-start gap-5">
                                                {board.logoUrl ? (
                                                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white flex items-center justify-center shrink-0 shadow-lg border border-slate-200 dark:border-slate-700">
                                                        <img src={board.logoUrl} alt={board.name} className="w-full h-full object-contain p-1" />
                                                    </div>
                                                ) : (
                                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/30 transition-shadow`}>
                                                        <Shield className="w-7 h-7 text-white" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    {board.name && (
                                                        <h3 className={`text-xl font-black mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>{board.name}</h3>
                                                    )}
                                                    {board.description && (
                                                        <p className={`text-sm leading-relaxed font-medium whitespace-pre-line ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                                            {board.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bottom gradient accent */}
                                        <div className={`h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ═══════════════════════════ Real Courses Section ═══════════════════════════ */}
            <section id="courses-section" className="py-24 px-4 md:px-8 relative overflow-hidden bg-gradient-to-b from-transparent via-blue-500/5 to-transparent">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none opacity-50" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-center mb-16"
                    >
                        <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r border text-xs font-black mb-6 backdrop-blur-xl ${isDark ? 'from-blue-500/15 to-indigo-500/15 border-blue-500/25 text-blue-300' : 'from-blue-500/10 to-indigo-500/10 border-blue-400/25 text-blue-600'}`}>
                            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                            <span>ابدأ رحلتك الآن</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                            أحدث الدورات{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400" style={{ WebkitBackgroundClip: 'text' }}>
                                التدريبية المتاحة
                            </span>
                        </h2>
                        <p className={`max-w-3xl mx-auto text-lg leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>نقدم لك نخبة من البرامج التدريبية المصممة بعناية لتلبية طموحاتك المهنية وتعزيز مهاراتك في سوق العمل المتطور.</p>
                    </motion.div>

                    {loadingCourses ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className={`h-[450px] border rounded-[3rem] animate-pulse ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'}`} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {courses.length > 0 ? (
                                courses.map((course, i) => (
                                    <motion.div
                                        key={course.id}
                                        layoutId={`course-${course.id}`}
                                        initial={{ opacity: 0, y: 40, scale: 0.92 }}
                                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                        viewport={{ once: true, margin: '-50px' }}
                                        transition={{ delay: i * 0.15, type: 'spring', stiffness: 100, damping: 18 }}
                                        onClick={() => setSelectedCourse(course)}
                                        className={`group relative backdrop-blur-3xl border rounded-3xl overflow-hidden transition-all duration-700 shadow-2xl cursor-pointer hover:-translate-y-2 ${isDark ? 'bg-[#0d1220]/90 border-white/[0.06] hover:border-blue-500/30 hover:shadow-blue-500/10' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-blue-100/50'}`}
                                    >
                                        {/* Top gradient accent */}
                                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                        {/* Hover glow orb */}
                                        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/[0.05] rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                        <div className="aspect-[16/10] overflow-hidden relative">
                                            <motion.div
                                                layoutId={`image-${course.id}`}
                                                className="w-full h-full"
                                            >
                                                {course.imageUrl ? (
                                                    <div className="w-full h-full relative overflow-hidden">
                                                        <img
                                                            src={course.imageUrl}
                                                            alt={course.name}
                                                            className="w-full h-full object-cover relative z-10 group-hover:scale-110 transition-transform duration-[1200ms] ease-out"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-blue-600/20 via-indigo-600/15 to-purple-600/10 flex items-center justify-center">
                                                        <BookOpen className="w-16 h-16 text-blue-500/30" />
                                                    </div>
                                                )}
                                            </motion.div>

                                            <div className="absolute top-5 left-5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                                                {course.paymentType === 'cash' ? 'نقدي' : 'آجل'}
                                            </div>

                                            {course.feePerStudent && (
                                                <div className="absolute bottom-5 left-5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-xs font-black shadow-xl z-30 border border-white/20 uppercase tracking-widest transform group-hover:scale-105 transition-transform duration-500">
                                                    {Number(course.feePerStudent).toLocaleString()} {course.currency === 'USD' ? '$' : 'IQD'}
                                                </div>
                                            )}

                                            <div className={`absolute inset-0 bg-gradient-to-t via-20% to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-700 ${isDark ? 'from-[#0d1220] via-[#0d1220]/20' : 'from-white via-white/20'}`} />
                                        </div>

                                        <div className="p-7">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                                <motion.span
                                                    layoutId={`instructor-${course.id}`}
                                                    className={`text-[11px] font-black uppercase tracking-widest transition-colors duration-500 ${isDark ? 'text-white/40 group-hover:text-blue-400' : 'text-slate-400 group-hover:text-blue-600'}`}
                                                >
                                                    {course.instructorName || 'مدرب معتمد'}
                                                </motion.span>
                                            </div>

                                            <motion.h3
                                                layoutId={`title-${course.id}`}
                                                className={`text-xl font-black mb-3 transition-colors duration-500 line-clamp-1 ${isDark ? 'text-white group-hover:text-blue-400' : 'text-slate-800 group-hover:text-blue-600'}`}
                                            >
                                                {course.name}
                                            </motion.h3>

                                            <p className={`text-sm leading-relaxed mb-6 line-clamp-2 h-10 transition-colors duration-500 font-medium ${isDark ? 'text-slate-500 group-hover:text-slate-400' : 'text-slate-500 group-hover:text-slate-600'}`}>
                                                {course.summary || 'لا يوجد ملخص متاح لهذه الدورة حالياً، انضم إلينا لمعرفة التفاصيل.'}
                                            </p>

                                            <div className={`flex items-center justify-between pt-5 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-slate-600 font-extrabold uppercase tracking-widest mb-1">رسوم التسجيل</span>
                                                    <motion.span
                                                        layoutId={`fee-${course.id}`}
                                                        className={`text-xl font-black transition-colors duration-500 ${isDark ? 'text-white group-hover:text-blue-400' : 'text-slate-800 group-hover:text-blue-600'}`}
                                                    >
                                                        {course.feePerStudent ? `${Number(course.feePerStudent).toLocaleString()} ${course.currency === 'USD' ? '$' : 'IQD'}` : 'اتصل بنا'}
                                                    </motion.span>
                                                </div>
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-[-45deg] transition-all duration-700 shadow-lg shadow-blue-600/20 border border-blue-500/30">
                                                    <ArrowRight className="w-5 h-5 text-white" />
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
                                    <h3 className={`text-3xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
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
                                className={`inline-flex items-center gap-4 border px-10 py-4 rounded-2xl transition-all font-black text-lg uppercase tracking-widest group shadow-2xl ${isDark ? 'bg-white/5 hover:bg-blue-600/10 border-white/10 hover:border-blue-500 text-slate-300 hover:text-blue-400' : 'bg-white hover:bg-blue-50 border-slate-200 hover:border-blue-400 text-slate-600 hover:text-blue-600'}`}
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

            <section id="vision-section" className="py-28 px-4 md:px-8 relative overflow-hidden">
                {/* Background effects */}
                <div className={`absolute inset-0 pointer-events-none ${isDark ? 'bg-white/[0.01]' : 'bg-slate-50/50'}`} />
                <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${isDark ? 'via-white/[0.08]' : 'via-slate-200'} to-transparent`} />
                <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${isDark ? 'via-white/[0.08]' : 'via-slate-200'} to-transparent`} />
                <div className="absolute top-[10%] right-[-5%] w-[600px] h-[600px] bg-blue-500/[0.04] rounded-full blur-[150px] pointer-events-none" />
                <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-indigo-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/[0.02] rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Section header */}
                    <motion.div
                        initial={{ opacity: 0, y: 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-center mb-20"
                    >
                        <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r border text-xs font-black mb-6 backdrop-blur-xl ${isDark ? 'from-blue-500/15 to-indigo-500/15 border-blue-500/25 text-blue-300' : 'from-blue-500/10 to-indigo-500/10 border-blue-400/25 text-blue-600'}`}>
                            <Target className="w-3.5 h-3.5" />
                            <span>من نحن</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black mb-4">
                            رؤيتنا ورسالتنا{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400" style={{ WebkitBackgroundClip: 'text' }}>
                                وقيمنا
                            </span>
                        </h2>
                        <p className={`max-w-2xl mx-auto font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>نؤمن بأن التعليم هو المفتاح الحقيقي لتطوير المجتمعات وبناء مستقبل أفضل للجميع</p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        {/* Logo showcase card */}
                        <motion.div
                            initial={{ opacity: 0, x: -40, scale: 0.9 }}
                            whileInView={{ opacity: 1, x: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            className="relative lg:sticky lg:top-32"
                        >
                            {/* Outer glow */}
                            <div className="absolute -inset-2 rounded-[3.5rem] bg-gradient-to-br from-blue-500/15 via-indigo-500/5 to-purple-500/15 blur-[30px] animate-pulse" style={{ animationDuration: '4s' }} />

                            {/* Rotating border */}
                            <div className="relative rounded-[3rem] p-[1px] overflow-hidden">
                                <div className="absolute inset-0 rounded-[3rem]" style={{
                                    background: 'conic-gradient(from 0deg, transparent 0%, rgba(59,130,246,0.35) 15%, transparent 30%, rgba(139,92,246,0.25) 50%, transparent 65%, rgba(59,130,246,0.35) 80%, transparent 100%)',
                                    animation: 'spin 10s linear infinite'
                                }} />

                                <div className={`relative rounded-[3rem] backdrop-blur-3xl p-10 md:p-14 overflow-hidden group hover:shadow-2xl transition-all duration-700 ${isDark ? 'bg-gradient-to-br from-[#0d1220]/95 via-[#111827]/95 to-[#0d1220]/95 hover:shadow-blue-500/5' : 'bg-white shadow-xl shadow-slate-200/50 hover:shadow-blue-100/50'}`}>
                                    {/* Inner highlights */}
                                    <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/8 rounded-full blur-[50px]" />
                                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/6 rounded-full blur-[40px]" />
                                    {/* Radial spotlight */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-blue-500/[0.04] rounded-full blur-[60px]" />
                                    {/* Grid pattern */}
                                    <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                                    {/* Decorative corner dots */}
                                    <div className="absolute top-6 left-6 w-2 h-2 rounded-full bg-blue-500/30" />
                                    <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-blue-500/30" />
                                    <div className="absolute bottom-6 left-6 w-2 h-2 rounded-full bg-indigo-500/30" />
                                    <div className="absolute bottom-6 right-6 w-2 h-2 rounded-full bg-indigo-500/30" />

                                    <div className="flex flex-col items-center text-center space-y-8 relative z-10">
                                        {/* Logo with animated glow ring */}
                                        <div className="relative">
                                            <div className="absolute inset-[-20px] rounded-full border border-blue-500/10 animate-pulse" style={{ animationDuration: '3s' }} />
                                            <div className="absolute inset-[-35px] rounded-full border border-blue-500/5 animate-pulse" style={{ animationDuration: '5s' }} />
                                            <div className="absolute inset-0 bg-blue-500/15 blur-[35px] rounded-full scale-150" />
                                            {(customSettings.logoUrl || printSettings.logoUrl) ? (
                                                <img
                                                    src={customSettings.logoUrl || printSettings.logoUrl}
                                                    alt="Logo"
                                                    className="h-40 w-auto drop-shadow-[0_0_30px_rgba(59,130,246,0.4)] relative z-10 transition-transform duration-700 group-hover:scale-110"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.parentElement!.classList.add('fallback-active');
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-40 h-40 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl relative z-10 group-hover:rotate-6 transition-transform duration-700 border border-white/10">
                                                    <span className="text-white font-black text-xl px-4 text-center">
                                                        مؤسسة سما الوطن الانسانية للتدريب والتطوير
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500/15 to-indigo-500/15 border border-blue-500/20 text-blue-300 text-xs font-black uppercase tracking-widest">
                                                <Award className="w-4 h-4" />
                                                <span>الجودة والتميز</span>
                                            </div>
                                            <h3 className="text-2xl md:text-3xl font-black">
                                                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isDark ? 'from-white via-blue-200 to-white' : 'from-slate-800 via-blue-600 to-slate-800'}`} style={{ WebkitBackgroundClip: 'text' }}>إبداع وبناء إنساني مستدام</span>
                                            </h3>
                                            <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed font-medium">نحن نؤمن بأن التعليم هو المفتاح الحقيقي لتطوير المجتمعات وبناء مستقبل أفضل للجميع.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Vision, Mission, Values cards */}
                        <div className="space-y-6">
                            {[
                                {
                                    title: 'رؤيتنا',
                                    desc: 'أن نكون المؤسسة الرائدة في العراق في مجال التطوير البشري، ونموذجاً يحتذى به في العمل الإنساني والتعليمي.',
                                    icon: Target,
                                    gradient: 'from-emerald-500 to-teal-500',
                                    borderColor: 'emerald',
                                    delay: 0.1
                                },
                                {
                                    title: 'رسالتنا',
                                    desc: 'تقديم برامج تعليمية وتنموية عالية الجودة، تركز على بناء الشخصية وتطوير المهارات القيادية والمهنية لتمكين الفرد من خدمة نفسه ومجتمعه.',
                                    icon: Users,
                                    gradient: 'from-blue-500 to-indigo-500',
                                    borderColor: 'blue',
                                    delay: 0.2
                                },
                                {
                                    title: 'قيمنا',
                                    desc: 'الإخلاص، التمكين، الإبداع، العمل الجماعي.',
                                    icon: Heart,
                                    gradient: 'from-purple-500 to-pink-500',
                                    borderColor: 'purple',
                                    delay: 0.3,
                                    isValues: true
                                }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: 30, y: 10 }}
                                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: item.delay, type: 'spring', stiffness: 100, damping: 18 }}
                                    whileHover={{ y: -4, scale: 1.01 }}
                                    className={`group relative flex gap-5 p-5 rounded-[1.25rem] border transition-all duration-500 overflow-hidden ${isDark ? `bg-gradient-to-br from-white/[0.04] to-white/[0.01] border-white/[0.06] hover:border-${item.borderColor}-500/25` : `bg-white border-slate-200 hover:border-${item.borderColor}-400/40 shadow-sm hover:shadow-md`}`}
                                >
                                    {/* Left accent line */}
                                    <div className={`absolute right-0 top-[15%] bottom-[15%] w-[2px] bg-gradient-to-b ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                    {/* Hover glow */}
                                    <div className={`absolute top-0 left-0 w-32 h-32 bg-${item.borderColor}-500/[0.04] rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-${item.borderColor}-500/15 relative`}>
                                        <item.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="pt-1 relative z-10 flex-1">
                                        <h4 className={`text-lg font-black mb-2 transition-colors duration-300 uppercase tracking-wide ${isDark ? 'text-white group-hover:text-blue-400' : 'text-slate-800 group-hover:text-blue-600'}`}>{item.title}</h4>
                                        {item.isValues ? (
                                            <div className="flex flex-wrap gap-2.5">
                                                {['الإخلاص', 'التمكين', 'الإبداع', 'العمل الجماعي'].map((val, i) => (
                                                    <span key={i} className={`px-4 py-2 rounded-lg text-xs font-black border transition-all duration-300 cursor-default ${isDark ? 'bg-gradient-to-r from-white/[0.04] to-white/[0.02] border-white/[0.08] text-slate-400 hover:from-purple-500/15 hover:to-pink-500/10 hover:text-purple-300 hover:border-purple-500/25' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300'}`}>
                                                        {val}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className={`leading-relaxed text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.desc}</p>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════ Course Categories ═══════════════════════════ */}
            <section className="py-24 px-4 md:px-8 relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${isDark ? 'via-white/[0.06]' : 'via-slate-200'} to-transparent`} />
                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-center mb-16"
                    >
                        <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r border text-xs font-black mb-6 backdrop-blur-xl ${isDark ? 'from-blue-500/15 to-indigo-500/15 border-blue-500/25 text-blue-300' : 'from-blue-500/10 to-indigo-500/10 border-blue-400/25 text-blue-600'}`}>
                            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                            <span>مجالات التدريب</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black mb-4">
                            برامج تدريبية{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400" style={{ WebkitBackgroundClip: 'text' }}>
                                عالمية المستوى
                            </span>
                        </h2>
                        <p className={`max-w-2xl mx-auto font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>نقدم مجموعة واسعة من الدورات المتخصصة التي تلبي احتياجات سوق العمل وتساهم في التطوير الشخصي والمهني.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courseCategories.map((cat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 25, scale: 0.95 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true, margin: '-30px' }}
                                transition={{ delay: i * 0.12, type: 'spring', stiffness: 120, damping: 20 }}
                                whileHover={{ y: -12, scale: 1.03, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                                className={`group p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden ${isDark ? 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-blue-500/20' : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 shadow-sm hover:shadow-md'}`}
                            >
                                <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-[0.08] blur-[80px] transition-opacity duration-700`} />
                                <div className={`w-16 h-16 rounded-[1.25rem] bg-gradient-to-br ${cat.color} flex items-center justify-center mb-6 shadow-xl text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                                    <cat.icon className="w-8 h-8" />
                                </div>
                                <h3 className={`text-xl font-black mb-3 transition-colors duration-300 ${isDark ? 'text-white group-hover:text-blue-400' : 'text-slate-800 group-hover:text-blue-600'}`}>{cat.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">{cat.description}</p>
                                <div className="flex items-center gap-2 text-xs font-black text-blue-400/80 group-hover:text-blue-400 group-hover:gap-4 transition-all duration-500 uppercase tracking-widest">
                                    <span>المزيد من التفاصيل</span>
                                    <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════ Why Choose Us ═══════════════════════════ */}
            <section className="py-24 px-4 md:px-8 relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className={`border rounded-[3rem] p-8 md:p-16 relative overflow-hidden transition-all duration-700 ${isDark ? 'bg-gradient-to-br from-blue-900/30 via-indigo-900/15 to-transparent border-white/[0.08] hover:border-blue-500/15' : 'bg-gradient-to-br from-blue-50 via-indigo-50/50 to-transparent border-slate-200 hover:border-blue-300 shadow-lg'}`}>
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60" />
                        <div className="absolute top-8 left-8 w-32 h-32 bg-blue-500/10 rounded-full blur-[50px]" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r border text-xs font-black mb-6 backdrop-blur-xl ${isDark ? 'from-blue-500/15 to-indigo-500/15 border-blue-500/25 text-blue-300' : 'from-blue-500/10 to-indigo-500/10 border-blue-400/25 text-blue-600'}`}>
                                    <Award className="w-3.5 h-3.5" />
                                    <span>لماذا نحن مميزون</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black mb-8 leading-tight">
                                    لماذا يختار الملتحقون{' '}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400" style={{ WebkitBackgroundClip: 'text' }}>مؤسسة سما الوطن</span>
                                    ؟
                                </h2>
                                <div className="space-y-5">
                                    {[
                                        { title: 'مدربون خبراء', desc: 'نخبة من الأكاديميين والمهنيين ذوي الخبرة الطويلة.', icon: Award, gradient: 'from-emerald-500 to-teal-500' },
                                        { title: 'شهادات معتمدة', desc: 'نوفر شهادات رسمية تدعم الملف الشخصي في سوق العمل.', icon: CheckCircle2, gradient: 'from-blue-500 to-indigo-500' },
                                        { title: 'منهجية حديثة', desc: 'نعتمد أحدث الأساليب التدريبية التفاعلية والعملية.', icon: Shield, gradient: 'from-purple-500 to-pink-500' },
                                        { title: 'بيئة تعليمية متميزة', desc: 'قاعات مجهزة بأحدث الوسائل التعليمية المريحة.', icon: Sparkles, gradient: 'from-amber-500 to-orange-500' },
                                    ].map((feature, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: 20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.1, type: 'spring', stiffness: 120 }}
                                            className={`flex gap-4 p-4 rounded-2xl transition-all duration-500 group border border-transparent ${isDark ? 'hover:bg-white/[0.03] hover:border-white/[0.06]' : 'hover:bg-white hover:border-slate-200 hover:shadow-sm'}`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                                                <feature.icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h4 className={`font-black text-lg mb-1 transition-colors ${isDark ? 'text-white group-hover:text-blue-400' : 'text-slate-800 group-hover:text-blue-600'}`}>{feature.title}</h4>
                                                <p className="text-slate-500 text-sm font-medium">{feature.desc}</p>
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
            <section className="px-4 md:px-8 py-24">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 0.9, type: 'spring', stiffness: 80, damping: 20 }}
                        className="relative rounded-[3rem] overflow-hidden"
                    >
                        {/* Background layers */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />
                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                        {/* Floating orbs */}
                        <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-white/[0.08] rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '4s' }} />
                        <div className="absolute bottom-[-50px] left-[-50px] w-[250px] h-[250px] bg-purple-300/[0.08] rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '6s' }} />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-300/[0.05] rounded-full blur-[100px]" />

                        <div className="relative z-10 p-12 md:p-24 text-center">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ type: 'spring', stiffness: 150, delay: 0.2 }}
                                className="w-20 h-20 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-8 backdrop-blur-xl"
                            >
                                <GraduationCap className="w-10 h-10 text-white/70" />
                            </motion.div>
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                                هل أنت جاهز لبدء{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white" style={{ WebkitBackgroundClip: 'text' }}>
                                    رحلة التطوير؟
                                </span>
                            </h2>
                            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
                                انضم إلى آلاف الطلاب والمتميزين الذين اختاروا مؤسسة سما الوطن الانسانية للتدريب والتطوير.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <motion.button
                                    onClick={() => navigate(user ? '/educational-dashboard' : '/login')}
                                    whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-full sm:w-auto bg-white text-blue-600 px-12 py-5 rounded-2xl font-black text-xl shadow-2xl flex items-center justify-center gap-3 relative overflow-hidden group"
                                >
                                    <span className="relative z-10">{user ? 'دخول لوحة التحكم' : 'سجل الآن مجاناً'}</span>
                                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:-translate-x-1 transition-transform" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    data-scroll-to="contact-section"
                                    className="w-full sm:w-auto px-12 py-5 bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 hover:border-white/40 text-white rounded-2xl font-black text-xl transition-all duration-500 backdrop-blur-xl"
                                >
                                    تواصل معنا
                                </motion.button>
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
                        <div className={`absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] animate-pulse ${isDark ? 'bg-amber-500/[0.07]' : 'bg-amber-500/[0.04]'}`} style={{ animationDuration: '4s' }} />
                        <div className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] animate-pulse ${isDark ? 'bg-orange-500/[0.05]' : 'bg-orange-500/[0.03]'}`} style={{ animationDuration: '6s', animationDelay: '2s' }} />
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
                                className={`inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r border text-sm font-black mb-8 shadow-xl backdrop-blur-xl ${isDark ? 'from-amber-500/20 via-orange-500/15 to-rose-500/20 border-amber-500/30 text-amber-300 shadow-amber-500/10' : 'from-amber-500/10 via-orange-500/8 to-rose-500/10 border-amber-400/30 text-amber-600 shadow-amber-500/5'}`}
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
                                className={`text-lg md:text-xl max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                            >
                                تابع آخر المستجدات والإعلانات الخاصة بمؤسستنا
                            </motion.p>
                        </motion.div>

                        {/* Cards Grid — centered & large when few items */}
                        <div className={`grid gap-8 ${announcements.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : announcements.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                            {announcements.map((ann, i) => (
                                <motion.div
                                    key={ann.id}
                                    initial={{ opacity: 0, y: 40, scale: 0.93 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    viewport={{ once: true, margin: '-50px' }}
                                    transition={{ delay: i * 0.12, duration: 0.7, type: 'spring', stiffness: 100, damping: 18 }}
                                    whileHover={{ y: -10, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
                                    className="group relative"
                                >
                                    {/* Rotating gradient border */}
                                    <div className="absolute -inset-[1px] rounded-3xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                        <div className="absolute inset-0" style={{
                                            background: 'conic-gradient(from 0deg, transparent 0%, rgba(245,158,11,0.5) 20%, transparent 40%, rgba(249,115,22,0.4) 60%, transparent 80%, rgba(245,158,11,0.5) 100%)',
                                            animation: 'spin 4s linear infinite'
                                        }} />
                                    </div>

                                    <div className={`relative backdrop-blur-3xl border rounded-3xl overflow-hidden group-hover:border-transparent transition-all duration-700 shadow-2xl h-full flex flex-col ${isDark ? 'bg-gradient-to-br from-[#0d1117]/95 to-[#111827]/95 border-white/[0.06] group-hover:shadow-amber-500/[0.08]' : 'bg-white border-slate-200 group-hover:shadow-amber-200/30'}`}>
                                        {/* Top accent line */}
                                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                        {/* Hover glow orb */}
                                        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/[0.04] rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                        {/* Image Area */}
                                        {ann.imageUrl ? (
                                            <div className={`aspect-[16/10] overflow-hidden relative ${isDark ? 'bg-[#080c15]' : 'bg-slate-50'}`}>
                                                <img
                                                    src={ann.imageUrl}
                                                    alt={ann.title}
                                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-[1200ms] ease-out"
                                                />
                                                {/* Multi-layer gradient overlay */}
                                                <div className={`absolute inset-0 bg-gradient-to-t via-20% to-transparent ${isDark ? 'from-[#0d1117] via-[#0d1117]/20' : 'from-white via-white/30'}`} />
                                                <div className="absolute inset-0 bg-gradient-to-l from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                                {/* Shimmer sweep */}
                                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
                                                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                                                </div>

                                                {/* Badge */}
                                                <div className="absolute top-4 right-4">
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        whileInView={{ opacity: 1, scale: 1 }}
                                                        viewport={{ once: true }}
                                                        transition={{ delay: i * 0.12 + 0.3, type: 'spring' }}
                                                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 backdrop-blur-xl text-[10px] font-black uppercase tracking-[0.15em] text-white shadow-xl shadow-amber-500/30 flex items-center gap-1.5"
                                                    >
                                                        <Megaphone className="w-3 h-3" />
                                                        إعلان
                                                    </motion.div>
                                                </div>

                                                {/* Date badge - bottom left */}
                                                {ann.createdAt && (
                                                    <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-xl text-[10px] font-bold text-white/70 z-20">
                                                        {ann.createdAt?.toDate ? new Date(ann.createdAt.toDate()).toLocaleDateString('ar-IQ') : ''}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            /* No Image Decorative Header */
                                            <div className={`relative h-36 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 overflow-hidden`}>
                                                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(245,158,11,0.3) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                                                <div className={`absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t ${isDark ? 'from-[#0d1117]' : 'from-white'} to-transparent`} />
                                                <motion.div
                                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                                    animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.08, 1] }}
                                                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                                >
                                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-500/20 flex items-center justify-center backdrop-blur-xl border border-amber-500/20 shadow-lg shadow-amber-500/10">
                                                        <Megaphone className="w-7 h-7 text-amber-400" />
                                                    </div>
                                                </motion.div>
                                                {/* Badge for no-image cards */}
                                                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] font-black uppercase tracking-[0.15em] text-white shadow-lg flex items-center gap-1.5">
                                                    <Megaphone className="w-3 h-3" />
                                                    إعلان
                                                </div>
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className="p-7 flex-1 flex flex-col">
                                            <h3 className={`text-lg md:text-xl font-black mb-3 transition-all duration-500 line-clamp-2 leading-relaxed ${isDark ? 'text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-amber-300 group-hover:via-orange-300 group-hover:to-amber-300' : 'text-slate-800 group-hover:text-amber-600'}`} style={{ WebkitBackgroundClip: 'text' }}>
                                                {ann.title}
                                            </h3>
                                            {ann.description && (
                                                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 flex-1 group-hover:text-slate-400 transition-colors duration-500">
                                                    {ann.description}
                                                </p>
                                            )}

                                            {/* Read More Footer */}
                                            <div className={`mt-5 pt-4 border-t ${isDark ? 'border-white/[0.04]' : 'border-slate-100'}`}>
                                                <div className="flex items-center gap-2 text-amber-500/50 group-hover:text-amber-400 transition-colors duration-500">
                                                    <span className="text-xs font-black uppercase tracking-wider">قراءة المزيد</span>
                                                    <div className="h-px flex-1 bg-gradient-to-l from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                    <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform duration-300" />
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
            <section id="contact-section" className="py-24 px-4 md:px-8 relative overflow-hidden">
                <div className={`absolute inset-0 pointer-events-none ${isDark ? 'bg-white/[0.015]' : 'bg-slate-50/50'}`} />
                <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${isDark ? 'via-white/10' : 'via-slate-200'} to-transparent`} />
                <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-blue-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-center mb-16"
                    >
                        <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r border text-xs font-black mb-6 backdrop-blur-xl ${isDark ? 'from-blue-500/15 to-indigo-500/15 border-blue-500/25 text-blue-300' : 'from-blue-500/10 to-indigo-500/10 border-blue-400/25 text-blue-600'}`}>
                            <Mail className="w-3.5 h-3.5" />
                            <span>نحن هنا لمساعدتك</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black mb-4">
                            تواصل{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400" style={{ WebkitBackgroundClip: 'text' }}>معنا</span>
                        </h2>
                        <p className={`max-w-2xl mx-auto font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>يسعدنا تواصلكم معنا في أي وقت</p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Info Cards */}
                        <div className="space-y-4">
                            {customSettings.contactAddress && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 }}
                                    className={`flex items-start gap-4 p-6 rounded-2xl border transition-all duration-500 group ${isDark ? 'bg-white/[0.03] border-white/[0.06] hover:border-blue-500/20 hover:bg-white/[0.05]' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'}`}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500 border border-blue-500/10">
                                        <MapPin className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className={`font-black mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>العنوان</h4>
                                        <p className="text-slate-400 text-sm">{customSettings.contactAddress}</p>
                                    </div>
                                </motion.div>
                            )}
                            {customSettings.contactPhone && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 }}
                                    className={`flex items-start gap-4 p-6 rounded-2xl border transition-all duration-500 group ${isDark ? 'bg-white/[0.03] border-white/[0.06] hover:border-emerald-500/20 hover:bg-white/[0.05]' : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md'}`}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500 border border-emerald-500/10">
                                        <Phone className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className={`font-black mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>الهاتف</h4>
                                        <p className="text-slate-400 text-sm" dir="ltr">{customSettings.contactPhone}</p>
                                    </div>
                                </motion.div>
                            )}
                            {customSettings.contactEmail && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 }}
                                    className={`flex items-start gap-4 p-6 rounded-2xl border transition-all duration-500 group ${isDark ? 'bg-white/[0.03] border-white/[0.06] hover:border-amber-500/20 hover:bg-white/[0.05]' : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-md'}`}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500 border border-amber-500/10">
                                        <Mail className="w-6 h-6 text-amber-400" />
                                    </div>
                                    <div>
                                        <h4 className={`font-black mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>البريد الإلكتروني</h4>
                                        <p className="text-slate-400 text-sm" dir="ltr">{customSettings.contactEmail}</p>
                                    </div>
                                </motion.div>
                            )}
                            {/* WhatsApp Card */}
                            <motion.a
                                href={`https://wa.me/${(customSettings.contactPhone || '+9640000000000').replace(/[^0-9+]/g, '').replace('+', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4, type: 'spring', stiffness: 120 }}
                                whileHover={{ scale: 1.02 }}
                                className="flex items-start gap-4 p-6 rounded-2xl bg-gradient-to-br from-[#25D366]/10 to-[#128C7E]/5 border border-[#25D366]/20 hover:border-[#25D366]/40 hover:from-[#25D366]/15 hover:to-[#128C7E]/10 transition-all duration-500 group cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-[#25D366]/20">
                                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className={`font-black mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>واتساب</h4>
                                    <p className="text-[#25D366] text-sm font-bold">تواصل معنا مباشرة عبر الواتساب</p>
                                </div>
                                <div className="mr-auto flex items-center gap-1 text-[#25D366]/60 group-hover:text-[#25D366] transition-colors">
                                    <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                </div>
                            </motion.a>
                            {!customSettings.contactAddress && !customSettings.contactPhone && !customSettings.contactEmail && (
                                <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
                                    <MapPin className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                                    <p className="text-slate-500 text-sm font-bold">أضف معلومات الاتصال من صفحة التخصيص</p>
                                </div>
                            )}
                        </div>

                        {/* Map */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className={`rounded-2xl overflow-hidden border shadow-2xl relative ${isDark ? 'border-white/[0.08]' : 'border-slate-200'}`}
                            style={{ height: '380px' }}
                        >
                            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.05] pointer-events-none z-10" />
                            <iframe
                                title="موقع المؤسسة"
                                width="100%"
                                height="100%"
                                style={{ border: 0, filter: isDark ? 'invert(90%) hue-rotate(180deg) brightness(0.95) contrast(0.9)' : 'none' }}
                                loading="lazy"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${(customSettings.mapLng || 44.3661) - 0.02},${(customSettings.mapLat || 33.3152) - 0.02},${(customSettings.mapLng || 44.3661) + 0.02},${(customSettings.mapLat || 33.3152) + 0.02}&layer=mapnik&marker=${customSettings.mapLat || 33.3152},${customSettings.mapLng || 44.3661}`}
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════ Footer ═══════════════════════════ */}
            <footer className={`relative pt-16 pb-8 px-4 md:px-8 ${isDark ? 'bg-[#060912]' : 'bg-slate-900'}`}>
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                <div className="max-w-7xl mx-auto">
                    <div className={`grid grid-cols-1 md:grid-cols-3 gap-12 mb-16`}>
                        <div className="col-span-1 border-r-0 md:border-r border-white/[0.05] pr-0 md:pr-8">
                            <div className="mb-6">
                                {customSettings.logoUrl ? (
                                    <img
                                        src={customSettings.logoUrl}
                                        alt="Logo"
                                        className="h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                        onError={(e) => e.currentTarget.style.display = 'none'}
                                    />
                                ) : (
                                    <span className="text-xl font-black bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent" style={{ WebkitBackgroundClip: 'text' }}>مؤسسة سما الوطن الانسانية للتدريب والتطوير</span>
                                )}
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed font-bold">
                                مؤسسة سما الوطن الانسانية للتدريب والتطوير، مؤسسة غير ربحية تهدف لرفع كفاءة الفرد العراقي وبناء قدراته المهنية والإنسانية.
                            </p>
                        </div>
                        <div className="col-span-1">
                            <h4 className="font-black text-lg mb-6 text-white">روابط سريعة</h4>
                            <ul className="space-y-4 text-sm font-bold text-slate-500">
                                {[
                                    { label: 'الرئيسية', target: 'hero-section' },
                                    { label: 'الدورات', target: 'courses-section' },
                                    { label: 'رؤيتنا', target: 'vision-section' },
                                    { label: 'تواصل معنا', target: 'contact-section' },
                                ].map(link => (
                                    <li key={link.target}>
                                        <button
                                            data-scroll-to={link.target}
                                            className="hover:text-blue-400 transition-all duration-300 hover:translate-x-[-4px]"
                                        >
                                            {link.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="col-span-1">
                            <h4 className="font-black text-lg mb-6 text-white">اتصل بنا</h4>
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

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.05] text-[10px] text-slate-600 font-extrabold uppercase tracking-widest">
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

            {/* ═══════════════════════════ Floating WhatsApp Button ═══════════════════════════ */}
            <motion.a
                href={`https://wa.me/${(customSettings.contactPhone || '+9640000000000').replace(/[^0-9+]/g, '').replace('+', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 2, type: 'spring', stiffness: 200, damping: 15 }}
                whileHover={{ scale: 1.15, boxShadow: '0 0 50px rgba(37,211,102,0.5)' }}
                whileTap={{ scale: 0.9 }}
                className="fixed bottom-8 left-8 z-[90] group cursor-pointer"
                title="تواصل معنا عبر واتساب"
            >
                {/* Pulse Ring */}
                <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
                {/* Glow */}
                <div className="absolute inset-[-8px] rounded-full bg-[#25D366]/20 blur-[20px] group-hover:bg-[#25D366]/30 transition-all duration-500" />
                {/* Button */}
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center shadow-2xl shadow-[#25D366]/30 border-2 border-white/20">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-white fill-current">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                </div>
                {/* Tooltip */}
                <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-[#0a0e1a] border border-white/10 text-white text-xs font-black px-4 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 pointer-events-none shadow-2xl">
                    تواصل معنا عبر واتساب
                    <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-l-[6px] border-transparent border-l-[#0a0e1a]" style={{ transform: 'translateY(-50%) rotate(180deg)', right: '100%' }} />
                </div>
            </motion.a>
        </div>
    );
};

export default LandingPage;
