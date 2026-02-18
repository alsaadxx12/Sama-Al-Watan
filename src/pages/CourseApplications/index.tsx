import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    getDoc,
    addDoc,
    getDocs,
    where,
    serverTimestamp
} from 'firebase/firestore';
import {
    GraduationCap,
    Calendar,
    Phone,
    Mail,
    MapPin,
    MessageCircle,
    CheckCircle2,
    XCircle,
    Trash2,
    Search,
    MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const CourseApplications = () => {
    const { theme } = useTheme();
    const { employee } = useAuth();
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const q = query(collection(db, 'course_applications'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const apps = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setApplications(apps);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching applications:", error);
            toast.error("خطأ في تحميل طلبات التقديم");
        });

        return () => unsubscribe();
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const appRef = doc(db, 'course_applications', id);

            // If status is changed to enrolled, perform automation
            if (newStatus === 'enrolled') {
                const appSnap = await getDoc(appRef);
                if (appSnap.exists()) {
                    const appData = appSnap.data();
                    const courseId = appData.courseId;

                    if (!courseId) {
                        toast.error("لم يتم العثور على معرّف الدورة في الطلب");
                        return;
                    }

                    // 1. Fetch course details for fees/currency
                    const courseSnap = await getDoc(doc(db, 'courses', courseId));
                    if (!courseSnap.exists()) {
                        toast.error("الدورة المختارة لم تعد موجودة");
                        return;
                    }
                    const courseData = courseSnap.data();

                    // 2. Check if student already exists in this course
                    const studentsRef = collection(db, 'courses', courseId, 'students');
                    const q = query(studentsRef, where('phone', '==', appData.phone));
                    const existing = await getDocs(q);

                    if (!existing.empty) {
                        toast.error("هذا الطالب مسجل بالفعل في هذه الدورة");
                        return;
                    }

                    // 3. Create student record
                    await addDoc(studentsRef, {
                        name: appData.applicantName,
                        phone: appData.phone,
                        province: appData.province,
                        courseFee: courseData.feePerStudent || 0,
                        currency: courseData.currency || 'IQD',
                        status: 'active',
                        enrolledAt: serverTimestamp(),
                        enrolledBy: employee?.name || 'النظام',
                        enrolledById: employee?.id || '',
                        applicationId: id
                    });

                    toast.success("تم تسجيل الطالب في الدورة بنجاح");
                }
            }

            await updateDoc(appRef, {
                status: newStatus,
                updatedAt: serverTimestamp(),
                updatedBy: employee?.name || 'النظام'
            });

            toast.success("تم تحديث حالة الطلب");
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("خطأ في تحديث الحالة");
        }
    };

    const deleteApplication = async (id: string) => {
        if (!window.confirm("هل أنت متأكد من حذف هذا الطلب؟")) return;
        try {
            await deleteDoc(doc(db, 'course_applications', id));
            toast.success("تم حذف الطلب");
        } catch (error) {
            console.error("Error deleting application:", error);
            toast.error("خطأ في حذف الطلب");
        }
    };

    const filteredApps = applications.filter(app => {
        const matchesSearch = app.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.phone?.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'contacted': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'enrolled': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'قيد الانتظار';
            case 'contacted': return 'تم التواصل';
            case 'enrolled': return 'تم التسجيل';
            case 'cancelled': return 'ملغى';
            default: return status;
        }
    };

    return (
        <main className={`p-4 md:p-8 min-h-screen ${theme === 'dark' ? 'bg-[#0a0e1a]' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-6"
                    >
                        <div className="relative group">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-[2rem] blur-xl group-hover:bg-blue-500/30 transition-all animate-pulse"></div>
                            <div className="relative p-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] shadow-2xl shadow-blue-500/20 border border-white/10">
                                <GraduationCap className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                                طلبات التقديم
                            </h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                                <p className="text-slate-500 dark:text-slate-400 font-bold">إدارة طلبات المتقدمين للدورات التدريبية</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex bg-white/50 dark:bg-white/5 p-2 rounded-[2rem] border border-gray-200/50 dark:border-white/5 backdrop-blur-xl shadow-xl"
                    >
                        {['all', 'pending', 'contacted', 'enrolled'].map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-8 py-3 rounded-[1.5rem] font-black text-sm transition-all duration-300 ${statusFilter === s
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 translate-y-[-1px]'
                                    : 'text-slate-500 dark:text-gray-400 hover:bg-white/10 hover:text-blue-500'
                                    }`}
                            >
                                {s === 'all' ? 'الكل' : getStatusLabel(s)}
                            </button>
                        ))}
                    </motion.div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-[#111624]/40 border border-gray-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl backdrop-blur-sm group hover:border-blue-500/30 transition-all"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">إجمالي الطلبات</span>
                        </div>
                        <h3 className="text-4xl font-black text-slate-700 dark:text-white mb-1">{applications.length}</h3>
                        <p className="text-xs text-slate-500 font-bold">جميع الطلبات المستلمة</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-[#111624]/40 border border-gray-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl backdrop-blur-sm group hover:border-amber-500/30 transition-all"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 group-hover:scale-110 transition-transform">
                                <MessageCircle className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">قيد الانتظار</span>
                        </div>
                        <h3 className="text-4xl font-black text-slate-700 dark:text-white mb-1">
                            {applications.filter(a => a.status === 'pending').length}
                        </h3>
                        <p className="text-xs text-amber-500 font-bold">طلبات لم يتم التواصل معها</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-[#111624]/40 border border-gray-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl backdrop-blur-sm group hover:border-emerald-500/30 transition-all"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">تم التسجيل</span>
                        </div>
                        <h3 className="text-4xl font-black text-slate-700 dark:text-white mb-1">
                            {applications.filter(a => a.status === 'enrolled').length}
                        </h3>
                        <p className="text-xs text-emerald-500 font-bold">عمليات تحويل مكتملة</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 shadow-2xl shadow-blue-500/20 group"
                    >
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10 text-white">
                            <p className="text-[10px] text-blue-100/70 font-black uppercase tracking-widest mb-4">نسبة التحويل</p>
                            <h3 className="text-4xl font-black mb-1">
                                {applications.length > 0
                                    ? Math.round((applications.filter(a => a.status === 'enrolled').length / applications.length) * 100)
                                    : 0}%
                            </h3>
                            <div className="w-full bg-white/20 h-1.5 rounded-full mt-4 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${applications.length > 0 ? (applications.filter(a => a.status === 'enrolled').length / applications.length) * 100 : 0}%` }}
                                    className="h-full bg-white rounded-full shadow-[0_0_10px_white]"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Search Bar Upgrade */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="relative mb-10 group"
                >
                    <div className="absolute inset-0 bg-blue-500/5 rounded-3xl blur-2xl group-focus-within:bg-blue-500/10 transition-all"></div>
                    <div className="relative flex items-center bg-white dark:bg-[#111624]/60 border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-sm focus-within:shadow-2xl focus-within:border-blue-500/50 transition-all overflow-hidden backdrop-blur-md">
                        <div className="pr-8 group-focus-within:text-blue-500 transition-colors">
                            <Search className="w-6 h-6 text-slate-400 group-focus-within:text-blue-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="البحث بالاسم، الدورة، أو رقم الهاتف..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-6 py-6 outline-none bg-transparent font-black text-lg text-slate-600 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                    </div>
                </motion.div>

                {/* Applications Table */}
                <div className="bg-white dark:bg-[#111624]/60 border border-gray-200 dark:border-white/10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative">
                    <div className="overflow-visible">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-white/5">
                                    <th className="p-6 text-slate-400 text-sm font-black uppercase tracking-widest">المتقدم</th>
                                    <th className="p-6 text-slate-400 text-sm font-black uppercase tracking-widest">الدورة</th>
                                    <th className="p-6 text-slate-400 text-sm font-black uppercase tracking-widest">المحافظة</th>
                                    <th className="p-6 text-slate-400 text-sm font-black uppercase tracking-widest">التاريخ</th>
                                    <th className="p-6 text-slate-400 text-sm font-black uppercase tracking-widest">الحالة</th>
                                    <th className="p-6 text-slate-400 text-sm font-black uppercase tracking-widest text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                <AnimatePresence mode="popLayout">
                                    {filteredApps.map((app, index) => (
                                        <motion.tr
                                            key={app.id}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-blue-500/[0.03] transition-all duration-300 group/row relative hover:z-[60]"
                                        >
                                            <td className="p-8">
                                                <div className="flex items-center gap-5">
                                                    <div className="relative">
                                                        <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-lg opacity-0 group-hover/row:opacity-100 transition-opacity"></div>
                                                        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-xl group-hover/row:scale-110 transition-transform duration-500 shadow-inner">
                                                            {app.applicantName?.charAt(0)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-lg text-slate-700 dark:text-white group-hover/row:text-blue-600 dark:group-hover/row:text-blue-400 transition-colors">{app.applicantName}</h4>
                                                        <p className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2 mt-1">
                                                            <div className="p-1 bg-emerald-500/10 rounded-md">
                                                                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                                                            </div>
                                                            <span className="tracking-wide underline decoration-emerald-500/30">{app.phone}</span>
                                                        </p>
                                                        {app.email && (
                                                            <p className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2 mt-1">
                                                                <div className="p-1 bg-blue-500/10 rounded-md">
                                                                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                                                                </div>
                                                                <span className="tracking-wide text-sm">{app.email}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-8">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-600 dark:text-slate-200 group-hover/row:translate-x-[-4px] transition-transform inline-block">{app.courseName}</span>
                                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mt-1 opacity-0 group-hover/row:opacity-100 transition-opacity">اسم الدورة المختارة</span>
                                                </div>
                                            </td>
                                            <td className="p-8">
                                                <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 font-black">
                                                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                                                        <MapPin className="w-4 h-4 text-slate-400 group-hover/row:text-red-500 transition-colors" />
                                                    </div>
                                                    {app.province}
                                                </div>
                                            </td>
                                            <td className="p-8">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-500 dark:text-slate-400 text-sm">{app.createdAt?.toDate?.() ? (() => { const d = app.createdAt.toDate(); return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`; })() : '—'}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold opacity-0 group-hover/row:opacity-100 transition-opacity">تاريخ التقديم</span>
                                                </div>
                                            </td>
                                            <td className="p-8">
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    className={`px-5 py-2.5 rounded-2xl border-2 text-[11px] font-black tracking-widest uppercase text-center shadow-lg transition-shadow ${getStatusStyles(app.status)}`}
                                                >
                                                    {getStatusLabel(app.status)}
                                                </motion.div>
                                            </td>
                                            <td className="p-8">
                                                <div className="flex items-center justify-center gap-4">
                                                    <motion.a
                                                        href={`https://wa.me/964${app.phone?.replace(/^0/, '')}?text=${encodeURIComponent(`مرحباً أستاذ ${app.applicantName}، نحن نتواصل معك بخصوص طلبك للانضمام إلى دورة ${app.courseName}`)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        whileHover={{ scale: 1.1, rotate: -5 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
                                                        title="تواصل عبر واتساب"
                                                    >
                                                        <MessageCircle className="w-6 h-6" />
                                                    </motion.a>

                                                    <div className="relative group/dropdown">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-400 flex items-center justify-center hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all shadow-lg"
                                                        >
                                                            <MoreHorizontal className="w-6 h-6" />
                                                        </motion.button>

                                                        <div className="absolute left-0 top-full mt-4 w-56 bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300 z-[100] p-3 scale-95 group-hover/dropdown:scale-100 origin-top-left">
                                                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest px-4 py-2 mb-1">تحديث الحالة</div>
                                                            <button onClick={() => updateStatus(app.id, 'enrolled')} className="w-full text-right px-4 py-3 rounded-xl text-emerald-500 hover:bg-emerald-500/10 font-black flex items-center gap-3 transition-colors">
                                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><CheckCircle2 className="w-4 h-4" /></div> تم التسجيل
                                                            </button>
                                                            <button onClick={() => updateStatus(app.id, 'contacted')} className="w-full text-right px-4 py-3 rounded-xl text-blue-500 hover:bg-blue-500/10 font-black flex items-center gap-3 transition-colors">
                                                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><MessageCircle className="w-4 h-4" /></div> تم التواصل
                                                            </button>
                                                            <button onClick={() => updateStatus(app.id, 'cancelled')} className="w-full text-right px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 font-black flex items-center gap-3 transition-colors">
                                                                <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center"><XCircle className="w-4 h-4" /></div> إلغاء الطلب
                                                            </button>
                                                            <div className="h-px bg-gray-100 dark:bg-white/5 my-2 mx-2" />
                                                            <button onClick={() => deleteApplication(app.id)} className="w-full text-right px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-600 hover:text-white font-black flex items-center gap-3 transition-all">
                                                                <div className="w-8 h-8 rounded-lg bg-slate-500/10 group-hover:bg-white/20 flex items-center justify-center"><Trash2 className="w-4 h-4" /></div> حذف الطلب
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>

                {filteredApps.length === 0 && !loading && (
                    <div className="py-32 text-center">
                        <div className="w-24 h-24 rounded-full bg-slate-500/10 flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-slate-400 opacity-50" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-400 mb-2">لا توجد نتائج</h3>
                        <p className="text-slate-500 font-bold">لم نتمكن من العثور على أي طلبات تطابق معايير البحث.</p>
                    </div>
                )}
            </div>
        </main>
    );
};

export default CourseApplications;
