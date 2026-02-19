import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
    AlertCircle,
    Loader2,
    Eye,
    EyeOff,
    Mail,
    Lock,
    ArrowRight,
    ShieldCheck,
    Fingerprint,
    KeyRound,
    GraduationCap,
    Briefcase,
    Phone,
    UserPlus,
    User,
    MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import WelcomeOverlay from '../../components/WelcomeOverlay';
import SystemInit from './SystemInit';
import { isSystemEmpty } from '../../lib/collections/setup';
import { usePrintSettings } from '../../hooks/usePrintSettings';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { signIn, error: authError, loading, user, isAnonymous } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [focused, setFocused] = useState<'email' | 'password' | 'phone' | null>(null);
    const [loginMode, setLoginMode] = useState<'employee' | 'student'>('employee');
    const [studentView, setStudentView] = useState<'login' | 'register'>('login');

    // Student login fields
    const [studentEmail, setStudentEmail] = useState('');
    const [studentPassword, setStudentPassword] = useState('');
    const [studentLoading, setStudentLoading] = useState(false);

    // Student registration fields
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [regProvince, setRegProvince] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirmPassword, setRegConfirmPassword] = useState('');
    const [regLoading, setRegLoading] = useState(false);

    const [showWelcome, setShowWelcome] = useState(false);
    const { customSettings } = useTheme();
    const { settings: printSettings } = usePrintSettings();
    const logoUrl = customSettings.loginLogoUrl || customSettings.logoUrl || printSettings.logoUrl || '';
    const [_isEmpty, setIsEmpty] = useState(false);
    const [showInit, setShowInit] = useState(false);

    useEffect(() => {
        const checkSystem = async () => {
            const empty = await isSystemEmpty();
            setIsEmpty(empty);
            if (empty) setShowInit(true);
        };
        checkSystem();
    }, []);

    useEffect(() => {
        if (user && !loading && !isAnonymous) {
            const from = location.state?.from?.pathname || '/educational-dashboard';
            navigate(from, { replace: true });
        }
    }, [user, loading, isAnonymous, navigate, location]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await signIn(email.trim(), password);
            setShowWelcome(true);
        } catch (err: any) {
            setError(err.message || 'بيانات الدخول غير صحيحة');
        }
    };

    const handleStudentLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setStudentLoading(true);

        try {
            const q = query(
                collection(db, 'student_accounts'),
                where('email', '==', studentEmail.trim())
            );
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                setError('لا يوجد حساب بهذا البريد الإلكتروني');
                setStudentLoading(false);
                return;
            }

            const studentDoc = snapshot.docs[0];
            const studentData = studentDoc.data();

            if (studentData.password !== studentPassword.trim()) {
                setError('كلمة المرور غير صحيحة');
                setStudentLoading(false);
                return;
            }

            // Save session and navigate
            const session = {
                id: studentDoc.id,
                name: studentData.name,
                email: studentData.email,
                phone: studentData.phone,
                province: studentData.province
            };
            localStorage.setItem('student_session', JSON.stringify(session));
            navigate('/student-dashboard');
        } catch (err) {
            console.error('Student login error:', err);
            setError('حدث خطأ أثناء تسجيل الدخول');
        } finally {
            setStudentLoading(false);
        }
    };

    const handleStudentRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (regPassword.trim().length < 6) {
            setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }
        if (regPassword !== regConfirmPassword) {
            setError('كلمة المرور غير متطابقة');
            return;
        }

        setRegLoading(true);
        try {
            // Check if email already exists
            const q = query(
                collection(db, 'student_accounts'),
                where('email', '==', regEmail.trim())
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                setError('البريد الإلكتروني مسجل مسبقاً');
                setRegLoading(false);
                return;
            }

            // Create student account
            const docRef = await addDoc(collection(db, 'student_accounts'), {
                name: regName.trim(),
                email: regEmail.trim(),
                phone: regPhone.trim(),
                province: regProvince.trim(),
                password: regPassword.trim(),
                createdAt: new Date().toISOString()
            });

            // Auto-login after registration
            const session = {
                id: docRef.id,
                name: regName.trim(),
                email: regEmail.trim(),
                phone: regPhone.trim(),
                province: regProvince.trim()
            };
            localStorage.setItem('student_session', JSON.stringify(session));
            navigate('/student-dashboard');
        } catch (err) {
            console.error('Student registration error:', err);
            setError('حدث خطأ أثناء إنشاء الحساب');
        } finally {
            setRegLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center font-['Tajawal'] overflow-hidden relative" dir="rtl">
            <WelcomeOverlay
                isVisible={showWelcome}
                userName={email.split('@')[0]}
                onFinish={() => {
                    const from = location.state?.from?.pathname || '/educational-dashboard';
                    navigate(from, { replace: true });
                }}
            />

            {/* ══════════ Immersive Full-Screen Background ══════════ */}
            <div className="fixed inset-0 bg-[#030712]">
                {/* Primary gradient layer */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-950/80 via-[#030712] to-indigo-950/60" />

                {/* Animated orbs */}
                <motion.div
                    animate={{ x: [0, 80, 0], y: [0, 50, 0], scale: [1, 1.3, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-5%] right-[10%] w-[600px] h-[600px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)' }}
                />
                <motion.div
                    animate={{ x: [0, -60, 0], y: [0, -40, 0], scale: [1.1, 0.9, 1.1] }}
                    transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[-10%] left-[5%] w-[700px] h-[700px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)' }}
                />
                <motion.div
                    animate={{ x: [0, 40, -30, 0], y: [0, -60, 30, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[40%] left-[40%] w-[500px] h-[500px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)' }}
                />

                {/* Noise texture overlay */}
                <div className="absolute inset-0 opacity-[0.015]" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`
                }} />

                {/* Subtle grid */}
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
                    backgroundSize: '80px 80px'
                }} />
            </div>

            {/* ══════════ Main Card ══════════ */}
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 60, damping: 18, delay: 0.1 }}
                className="relative z-10 w-full max-w-[520px] mx-4"
            >
                {/* Card container with rich glassmorphism */}
                <div className="relative">
                    {/* Outer glow */}
                    <div className="absolute -inset-[1px] rounded-[36px] bg-gradient-to-b from-white/[0.12] via-white/[0.04] to-white/[0.02] pointer-events-none" />

                    <div className="relative bg-[#0a1628]/80 backdrop-blur-2xl rounded-[36px] border border-white/[0.06] shadow-[0_32px_80px_rgba(0,0,0,0.5)] overflow-hidden">

                        {/* Top accent glow bar */}
                        <div className="absolute top-0 left-[15%] right-[15%] h-[2px]">
                            <div className="w-full h-full bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
                            <div className="absolute top-0 left-[25%] right-[25%] h-[6px] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent blur-sm" />
                        </div>

                        {/* Inner content */}
                        <div className="px-8 md:px-12 pt-12 pb-10">

                            {/* ── Logo & Branding ── */}
                            <div className="text-center mb-10">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.25 }}
                                    className="relative inline-block mb-7"
                                >
                                    {/* Logo glow ring */}
                                    <div className="absolute -inset-3 rounded-[30px] bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-blue-600/20 blur-xl animate-pulse" />

                                    <div className="relative w-24 h-24 rounded-[24px] bg-gradient-to-br from-[#0f1d36] to-[#0a1628] border border-white/[0.1] flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]">
                                        {logoUrl ? (
                                            <img
                                                src={logoUrl}
                                                alt="Logo"
                                                className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[16px] shadow-[0_4px_20px_rgba(59,130,246,0.4)]">
                                                <span className="text-white font-black text-lg tracking-wider">SAMA</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Small floating dot */}
                                    <motion.div
                                        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]"
                                    />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <h1 className="text-3xl md:text-[34px] font-black text-white mb-3 tracking-tight leading-tight">
                                        بوابة الدخول الآمن
                                    </h1>
                                    <p className="text-slate-400 font-semibold text-sm md:text-[15px] leading-relaxed">
                                        مؤسسة سما الوطن الانسانية للتدريب والتطوير
                                    </p>
                                </motion.div>
                            </div>
                            {/* ── Login Mode Toggle ── */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.45 }}
                                className="flex items-center gap-1 bg-white/[0.03] rounded-2xl p-1.5 mb-8"
                            >
                                <button
                                    type="button"
                                    onClick={() => { setLoginMode('employee'); setError(null); setStudentView('login'); }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all duration-300 ${loginMode === 'employee'
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                                        : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    <Briefcase className="w-4 h-4" />
                                    الموظفين
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setLoginMode('student'); setError(null); setStudentView('login'); }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all duration-300 ${loginMode === 'student'
                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                                        : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    <GraduationCap className="w-4 h-4" />
                                    الطلاب
                                </button>
                            </motion.div>

                            {showInit ? (
                                <SystemInit onComplete={() => setShowInit(false)} />
                            ) : loginMode === 'employee' ? (
                                <form onSubmit={handleLogin} className="space-y-5">
                                    {/* ── Email Field ── */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <label className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2.5 mr-1">
                                            <Mail className="w-3.5 h-3.5" />
                                            البريد الإلكتروني
                                        </label>
                                        <div className={`relative group rounded-2xl transition-all duration-500 ${focused === 'email'
                                            ? 'shadow-[0_0_0_2px_rgba(59,130,246,0.3),0_0_24px_rgba(59,130,246,0.08)]'
                                            : 'shadow-[0_0_0_1px_rgba(255,255,255,0.04)]'
                                            }`}>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                onFocus={() => setFocused('email')}
                                                onBlur={() => setFocused(null)}
                                                className="w-full px-5 py-4 bg-white/[0.03] border-0 rounded-2xl focus:outline-none text-white text-right transition-all duration-300 font-semibold text-[15px] placeholder:text-slate-700 hover:bg-white/[0.05] focus:bg-white/[0.05]"
                                                placeholder="user@sama-al-watan.com"
                                                dir="ltr"
                                                required
                                            />
                                            <div className={`absolute bottom-0 left-[10%] right-[10%] h-[2px] rounded-full transition-all duration-500 ${focused === 'email'
                                                ? 'bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-100'
                                                : 'opacity-0'
                                                }`} />
                                        </div>
                                    </motion.div>

                                    {/* ── Password Field ── */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        <label className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2.5 mr-1">
                                            <KeyRound className="w-3.5 h-3.5" />
                                            كلمة المرور
                                        </label>
                                        <div className={`relative group rounded-2xl transition-all duration-500 ${focused === 'password'
                                            ? 'shadow-[0_0_0_2px_rgba(59,130,246,0.3),0_0_24px_rgba(59,130,246,0.08)]'
                                            : 'shadow-[0_0_0_1px_rgba(255,255,255,0.04)]'
                                            }`}>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                onFocus={() => setFocused('password')}
                                                onBlur={() => setFocused(null)}
                                                className="w-full pl-14 pr-5 py-4 bg-white/[0.03] border-0 rounded-2xl focus:outline-none text-white text-right transition-all duration-300 font-semibold text-lg tracking-[0.15em] placeholder:text-slate-700 placeholder:tracking-[0.3em] hover:bg-white/[0.05] focus:bg-white/[0.05]"
                                                placeholder="••••••••"
                                                dir="ltr"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-300"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                                            </button>
                                            <div className={`absolute bottom-0 left-[10%] right-[10%] h-[2px] rounded-full transition-all duration-500 ${focused === 'password'
                                                ? 'bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-100'
                                                : 'opacity-0'
                                                }`} />
                                        </div>
                                    </motion.div>

                                    {/* ── Error Message ── */}
                                    <AnimatePresence>
                                        {(error || authError) && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="flex items-center gap-3 p-4 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/15 backdrop-blur-sm">
                                                    <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
                                                        <AlertCircle className="w-5 h-5" />
                                                    </div>
                                                    <p className="text-sm font-bold leading-relaxed">{error || authError}</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* ── Login Button ── */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7 }}
                                        className="pt-2"
                                    >
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full group relative flex items-center justify-center gap-3 py-[18px] rounded-2xl font-black text-[16px] transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden text-white"
                                            style={{
                                                background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #6366f1 100%)',
                                                boxShadow: '0 8px 40px rgba(37,99,235,0.25), 0 2px 8px rgba(37,99,235,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out" />
                                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.06] transition-all duration-300" />
                                            {loading ? (
                                                <Loader2 className="w-6 h-6 animate-spin relative z-10" />
                                            ) : (
                                                <>
                                                    <Fingerprint className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform" />
                                                    <span className="relative z-10">دخول آمن للمنظومة</span>
                                                    <ArrowRight className="w-4 h-4 relative z-10 rotate-180 opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all duration-300" />
                                                </>
                                            )}
                                        </button>
                                    </motion.div>
                                </form>
                            ) : loginMode === 'student' && studentView === 'login' ? (
                                /* ════════ STUDENT LOGIN FORM ════════ */
                                <form onSubmit={handleStudentLogin} className="space-y-5">
                                    {/* ── Student Email ── */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <label className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2.5 mr-1">
                                            <Mail className="w-3.5 h-3.5" />
                                            البريد الإلكتروني
                                        </label>
                                        <div className={`relative group rounded-2xl transition-all duration-500 ${focused === 'email'
                                            ? 'shadow-[0_0_0_2px_rgba(16,185,129,0.3),0_0_24px_rgba(16,185,129,0.08)]'
                                            : 'shadow-[0_0_0_1px_rgba(255,255,255,0.04)]'
                                            }`}>
                                            <input
                                                type="email"
                                                value={studentEmail}
                                                onChange={(e) => setStudentEmail(e.target.value)}
                                                onFocus={() => setFocused('email')}
                                                onBlur={() => setFocused(null)}
                                                className="w-full px-5 py-4 bg-white/[0.03] border-0 rounded-2xl focus:outline-none text-white text-right transition-all duration-300 font-semibold text-[15px] placeholder:text-slate-700 hover:bg-white/[0.05] focus:bg-white/[0.05]"
                                                placeholder="student@email.com"
                                                dir="ltr"
                                                required
                                            />
                                            <div className={`absolute bottom-0 left-[10%] right-[10%] h-[2px] rounded-full transition-all duration-500 ${focused === 'email'
                                                ? 'bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-100'
                                                : 'opacity-0'
                                                }`} />
                                        </div>
                                    </motion.div>

                                    {/* ── Student Password ── */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        <label className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2.5 mr-1">
                                            <Lock className="w-3.5 h-3.5" />
                                            كلمة المرور
                                        </label>
                                        <div className={`relative group rounded-2xl transition-all duration-500 ${focused === 'password'
                                            ? 'shadow-[0_0_0_2px_rgba(16,185,129,0.3),0_0_24px_rgba(16,185,129,0.08)]'
                                            : 'shadow-[0_0_0_1px_rgba(255,255,255,0.04)]'
                                            }`}>
                                            <input
                                                type="password"
                                                value={studentPassword}
                                                onChange={(e) => setStudentPassword(e.target.value)}
                                                onFocus={() => setFocused('password')}
                                                onBlur={() => setFocused(null)}
                                                className="w-full px-5 py-4 bg-white/[0.03] border-0 rounded-2xl focus:outline-none text-white text-right transition-all duration-300 font-semibold text-[15px] placeholder:text-slate-700 hover:bg-white/[0.05] focus:bg-white/[0.05]"
                                                placeholder="أدخل كلمة المرور"
                                                required
                                            />
                                            <div className={`absolute bottom-0 left-[10%] right-[10%] h-[2px] rounded-full transition-all duration-500 ${focused === 'password'
                                                ? 'bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-100'
                                                : 'opacity-0'
                                                }`} />
                                        </div>
                                    </motion.div>

                                    {/* ── Error Message ── */}
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="flex items-center gap-3 p-4 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/15 backdrop-blur-sm">
                                                    <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
                                                        <AlertCircle className="w-5 h-5" />
                                                    </div>
                                                    <p className="text-sm font-bold leading-relaxed">{error}</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* ── Student Login Button ── */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7 }}
                                        className="pt-2"
                                    >
                                        <button
                                            type="submit"
                                            disabled={studentLoading}
                                            className="w-full group relative flex items-center justify-center gap-3 py-[18px] rounded-2xl font-black text-[16px] transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden text-white"
                                            style={{
                                                background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #14b8a6 100%)',
                                                boxShadow: '0 8px 40px rgba(5,150,105,0.25), 0 2px 8px rgba(5,150,105,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out" />
                                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.06] transition-all duration-300" />
                                            {studentLoading ? (
                                                <Loader2 className="w-6 h-6 animate-spin relative z-10" />
                                            ) : (
                                                <>
                                                    <GraduationCap className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform" />
                                                    <span className="relative z-10">دخول الطالب</span>
                                                    <ArrowRight className="w-4 h-4 relative z-10 rotate-180 opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all duration-300" />
                                                </>
                                            )}
                                        </button>
                                    </motion.div>

                                    {/* ── Toggle to Register ── */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.8 }}
                                        className="text-center pt-2"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => { setStudentView('register'); setError(null); }}
                                            className="text-emerald-400/80 hover:text-emerald-300 font-bold text-sm transition-all duration-300 inline-flex items-center gap-2"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            <span>ليس لديك حساب؟ أنشئ حساباً جديداً</span>
                                        </button>
                                    </motion.div>
                                </form>
                            ) : loginMode === 'student' && studentView === 'register' ? (
                                /* ════════ STUDENT REGISTRATION FORM ════════ */
                                <form onSubmit={handleStudentRegister} className="space-y-4">
                                    {/* ── Full Name ── */}
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                                        <label className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2 mr-1">
                                            <User className="w-3.5 h-3.5" />
                                            الاسم الكامل
                                        </label>
                                        <div className="relative group rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
                                            <input
                                                type="text"
                                                value={regName}
                                                onChange={(e) => setRegName(e.target.value)}
                                                className="w-full px-5 py-3.5 bg-white/[0.03] border-0 rounded-2xl focus:outline-none text-white text-right transition-all duration-300 font-semibold text-[15px] placeholder:text-slate-700 hover:bg-white/[0.05] focus:bg-white/[0.05]"
                                                placeholder="أدخل اسمك الكامل"
                                                required
                                            />
                                        </div>
                                    </motion.div>

                                    {/* ── Email ── */}
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
                                        <label className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2 mr-1">
                                            <Mail className="w-3.5 h-3.5" />
                                            البريد الإلكتروني
                                        </label>
                                        <div className="relative group rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
                                            <input
                                                type="email"
                                                value={regEmail}
                                                onChange={(e) => setRegEmail(e.target.value)}
                                                className="w-full px-5 py-3.5 bg-white/[0.03] border-0 rounded-2xl focus:outline-none text-white text-right transition-all duration-300 font-semibold text-[15px] placeholder:text-slate-700 hover:bg-white/[0.05] focus:bg-white/[0.05]"
                                                placeholder="student@email.com"
                                                dir="ltr"
                                                required
                                            />
                                        </div>
                                    </motion.div>

                                    {/* ── Phone ── */}
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                                        <label className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2 mr-1">
                                            <Phone className="w-3.5 h-3.5" />
                                            رقم الهاتف
                                        </label>
                                        <div className="relative group rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
                                            <input
                                                type="tel"
                                                value={regPhone}
                                                onChange={(e) => setRegPhone(e.target.value)}
                                                className="w-full px-5 py-3.5 bg-white/[0.03] border-0 rounded-2xl focus:outline-none text-white text-right transition-all duration-300 font-semibold text-[15px] placeholder:text-slate-700 hover:bg-white/[0.05] focus:bg-white/[0.05]"
                                                placeholder="07xxxxxxxxx"
                                                dir="ltr"
                                                required
                                            />
                                        </div>
                                    </motion.div>

                                    {/* ── Province ── */}
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 }}>
                                        <label className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2 mr-1">
                                            <MapPin className="w-3.5 h-3.5" />
                                            المحافظة
                                        </label>
                                        <div className="relative group rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
                                            <input
                                                type="text"
                                                value={regProvince}
                                                onChange={(e) => setRegProvince(e.target.value)}
                                                className="w-full px-5 py-3.5 bg-white/[0.03] border-0 rounded-2xl focus:outline-none text-white text-right transition-all duration-300 font-semibold text-[15px] placeholder:text-slate-700 hover:bg-white/[0.05] focus:bg-white/[0.05]"
                                                placeholder="مثال: بغداد"
                                                required
                                            />
                                        </div>
                                    </motion.div>

                                    {/* ── Password ── */}
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                                        <label className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2 mr-1">
                                            <Lock className="w-3.5 h-3.5" />
                                            كلمة المرور
                                        </label>
                                        <div className="relative group rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
                                            <input
                                                type="password"
                                                value={regPassword}
                                                onChange={(e) => setRegPassword(e.target.value)}
                                                className="w-full px-5 py-3.5 bg-white/[0.03] border-0 rounded-2xl focus:outline-none text-white text-right transition-all duration-300 font-semibold text-[15px] placeholder:text-slate-700 hover:bg-white/[0.05] focus:bg-white/[0.05]"
                                                placeholder="6 أحرف على الأقل"
                                                required
                                            />
                                        </div>
                                    </motion.div>

                                    {/* ── Confirm Password ── */}
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.65 }}>
                                        <label className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2 mr-1">
                                            <Lock className="w-3.5 h-3.5" />
                                            تأكيد كلمة المرور
                                        </label>
                                        <div className="relative group rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
                                            <input
                                                type="password"
                                                value={regConfirmPassword}
                                                onChange={(e) => setRegConfirmPassword(e.target.value)}
                                                className="w-full px-5 py-3.5 bg-white/[0.03] border-0 rounded-2xl focus:outline-none text-white text-right transition-all duration-300 font-semibold text-[15px] placeholder:text-slate-700 hover:bg-white/[0.05] focus:bg-white/[0.05]"
                                                placeholder="أعد إدخال كلمة المرور"
                                                required
                                            />
                                        </div>
                                    </motion.div>

                                    {/* ── Error ── */}
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="flex items-center gap-3 p-4 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/15 backdrop-blur-sm">
                                                    <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
                                                        <AlertCircle className="w-5 h-5" />
                                                    </div>
                                                    <p className="text-sm font-bold leading-relaxed">{error}</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* ── Register Button ── */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7 }}
                                        className="pt-1"
                                    >
                                        <button
                                            type="submit"
                                            disabled={regLoading}
                                            className="w-full group relative flex items-center justify-center gap-3 py-[18px] rounded-2xl font-black text-[16px] transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden text-white"
                                            style={{
                                                background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #14b8a6 100%)',
                                                boxShadow: '0 8px 40px rgba(5,150,105,0.25), 0 2px 8px rgba(5,150,105,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out" />
                                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.06] transition-all duration-300" />
                                            {regLoading ? (
                                                <Loader2 className="w-6 h-6 animate-spin relative z-10" />
                                            ) : (
                                                <>
                                                    <UserPlus className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform" />
                                                    <span className="relative z-10">إنشاء حساب جديد</span>
                                                </>
                                            )}
                                        </button>
                                    </motion.div>

                                    {/* ── Toggle back to Login ── */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.8 }}
                                        className="text-center pt-1"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => { setStudentView('login'); setError(null); }}
                                            className="text-emerald-400/80 hover:text-emerald-300 font-bold text-sm transition-all duration-300 inline-flex items-center gap-2"
                                        >
                                            <GraduationCap className="w-4 h-4" />
                                            <span>لديك حساب بالفعل؟ سجّل دخولك</span>
                                        </button>
                                    </motion.div>
                                </form>
                            ) : null}

                            {/* ── Security badge ── */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.9 }}
                                className="mt-8 flex items-center justify-center gap-2 text-[11px] text-slate-600 font-bold"
                            >
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600/60" />
                                <span>اتصال مشفّر ومحمي بالكامل</span>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* ── Back to home ── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-8 text-center"
                >
                    <button
                        onClick={() => navigate('/')}
                        className="text-slate-600 hover:text-blue-400 font-bold transition-all duration-300 text-sm inline-flex items-center gap-2 group"
                    >
                        <span>العودة للرئيسية</span>
                        <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1.5 transition-transform duration-300" />
                    </button>
                </motion.div>
            </motion.div>

            {/* ══════════ Corner decorative elements ══════════ */}
            <div className="fixed top-8 right-8 hidden md:flex items-center gap-2.5 z-20">
                <div className="w-2 h-2 rounded-full bg-emerald-400/60 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-600 tracking-[0.2em] uppercase">Secure Portal</span>
            </div>

            <div className="fixed bottom-8 left-8 hidden md:flex items-center gap-2 z-20 text-[10px] text-slate-700 font-bold tracking-wider">
                <span>v2.0</span>
                <div className="w-1 h-1 rounded-full bg-slate-700" />
                <span>SAMA SYSTEM</span>
            </div>
        </div>
    );
};

export default Login;
