import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Phone, Clock, Users, DollarSign, Calendar, User, FileText, ImagePlus, Trash2, Tag, Plus, Settings, ArrowRight, Sparkles, X, Link2, Copy, Check } from 'lucide-react';
import { CourseFormData } from './hooks/useCourses';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db, storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useTheme } from '../../contexts/ThemeContext';
import ManageCategoriesModal from './components/ManageCategoriesModal';
import { toast } from 'sonner';

function formatNumber(value: string): string {
    const num = value.replace(/[^\d]/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function parseNumber(value: string): string {
    return value.replace(/[^\d]/g, '');
}

async function compressImage(file: File, maxWidth = 1000, maxHeight = 1000, quality = 0.7): Promise<{ blob: Blob; dataUrl: string }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let w = img.width, h = img.height;
                if (w > maxWidth) { h *= maxWidth / w; w = maxWidth; }
                if (h > maxHeight) { w *= maxHeight / h; h = maxHeight; }
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d')!;
                ctx.drawImage(img, 0, 0, w, h);
                canvas.toBlob(
                    (blob) => {
                        if (!blob) return reject(new Error('Failed'));
                        const dataUrl = canvas.toDataURL('image/jpeg', quality);
                        resolve({ blob, dataUrl });
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
}

const AddCoursePage: React.FC = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { employee } = useAuth();
    const isDark = theme === 'dark';
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<CourseFormData>({
        name: '', instructorName: '', daysCount: '', maxStudents: '',
        lectureStartTime: '', lectureEndTime: '', feePerStudent: '',
        currency: 'IQD', instructorPhone: '', summary: '',
        paymentType: 'cash', courseId: '', whatsAppGroupId: null,
        whatsAppGroupName: null, phone: '', website: '', details: ''
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [showManageCategories, setShowManageCategories] = useState(false);
    const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);
    const [linkCopied, setLinkCopied] = useState(false);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'course_categories'), snap => {
            setCategories(snap.docs.map(d => ({ id: d.id, name: d.data().name })));
        });
        return () => unsub();
    }, []);

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            await addDoc(collection(db, 'course_categories'), { name: newCategoryName.trim(), createdAt: serverTimestamp() });
            setFormData(prev => ({ ...prev, category: newCategoryName.trim() }));
            setNewCategoryName('');
            setShowNewCategory(false);
        } catch (err) {
            console.error('Error adding category:', err);
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!employee) { setError('لم يتم العثور على بيانات الموظف'); return; }
        setIsSubmitting(true);
        setError(null);

        try {
            if (!formData.name.trim()) throw new Error('يرجى إدخال اسم الدورة');
            if (!formData.instructorName.trim()) throw new Error('يرجى إدخال اسم أستاذ الدورة');

            const coursesRef = collection(db, 'courses');
            const q = query(coursesRef, where('name', '==', formData.name.trim()));
            const existing = await getDocs(q);
            if (!existing.empty) throw new Error('يوجد دورة بهذا الاسم بالفعل');

            let imageUrl: string | null = null;
            if (imageFile) {
                try {
                    const { blob, dataUrl } = await compressImage(imageFile);
                    try {
                        const sanitizedName = imageFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
                        const fileName = `${Date.now()}_${sanitizedName}`;
                        const storageRef = ref(storage, `courses/${fileName}`);
                        const uploadSnapshot = await uploadBytes(storageRef, blob);
                        imageUrl = await getDownloadURL(uploadSnapshot.ref);
                    } catch {
                        if (dataUrl.length < 1048487) imageUrl = dataUrl;
                        else throw new Error('الصورة كبيرة جداً، يرجى اختيار صورة أصغر.');
                    }
                } catch (err: any) {
                    throw new Error(err.message || 'فشل معالجة الصورة.');
                }
            }

            const courseData = {
                name: formData.name.trim(),
                instructorName: formData.instructorName.trim(),
                daysCount: formData.daysCount ? Number(formData.daysCount) : null,
                maxStudents: formData.maxStudents ? Number(formData.maxStudents) : null,
                lectureStartTime: formData.lectureStartTime || null,
                lectureEndTime: formData.lectureEndTime || null,
                feePerStudent: formData.feePerStudent ? Number(formData.feePerStudent) : null,
                currency: formData.currency || 'IQD',
                instructorPhone: formData.instructorPhone || null,
                summary: formData.summary || null,
                imageUrl,
                paymentType: formData.paymentType,
                phone: formData.phone || null,
                website: formData.website || null,
                details: formData.details || null,
                createdAt: serverTimestamp(),
                createdBy: employee.name,
                createdById: employee.id || '',
                entityType: 'company',
                category: formData.category || null
            };

            const docRef = await addDoc(coursesRef, courseData);
            setCreatedCourseId(docRef.id);
            toast.success('تم إضافة الدورة بنجاح!');
        } catch (err: any) {
            setError(err instanceof Error ? err.message : 'فشل في إضافة الدورة');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getCourseLink = () => `${window.location.origin}/course-info/${createdCourseId}`;

    const copyLink = () => {
        navigator.clipboard.writeText(getCourseLink());
        setLinkCopied(true);
        toast.success('تم نسخ الرابط!');
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const inputBase = `w-full px-4 py-3.5 rounded-xl border-2 focus:outline-none transition-all text-sm font-bold text-right ${isDark
        ? 'bg-gray-800/60 border-gray-700/60 text-white placeholder-gray-600 focus:border-blue-500/60'
        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500/60 shadow-sm'
        }`;

    // ═══════════ SUCCESS STATE ═══════════
    if (createdCourseId) {
        return (
            <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className={`w-full max-w-md rounded-[2rem] p-8 text-center space-y-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-xl'}`}>
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h2 className={`text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>تم إضافة الدورة بنجاح!</h2>
                        <p className={`text-sm font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{formData.name}</p>
                    </div>

                    {/* Shareable Link */}
                    <div className="space-y-2">
                        <label className={`flex items-center justify-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Link2 className="w-3.5 h-3.5" /> رابط الدورة القابل للمشاركة
                        </label>
                        <div className={`flex gap-2 items-center rounded-xl border-2 p-2 ${isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
                            <input
                                type="text"
                                value={getCourseLink()}
                                readOnly
                                className={`flex-1 bg-transparent text-xs font-bold outline-none px-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                                dir="ltr"
                            />
                            <button
                                onClick={copyLink}
                                className={`p-2.5 rounded-xl transition-all shrink-0 ${linkCopied
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => navigate('/courses')}
                            className={`flex-1 py-3.5 rounded-xl font-black text-sm transition-all ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            العودة للدورات
                        </button>
                        <button
                            onClick={() => {
                                setCreatedCourseId(null);
                                setFormData({
                                    name: '', instructorName: '', daysCount: '', maxStudents: '',
                                    lectureStartTime: '', lectureEndTime: '', feePerStudent: '',
                                    currency: 'IQD', instructorPhone: '', summary: '',
                                    paymentType: 'cash', courseId: '', whatsAppGroupId: null,
                                    whatsAppGroupName: null, phone: '', website: '', details: ''
                                });
                                setImageFile(null);
                                setImagePreview(null);
                                setError(null);
                            }}
                            className="flex-1 py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-blue-500/20"
                        >
                            إضافة دورة أخرى
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ═══════════ FORM STATE ═══════════
    return (
        <div className={`min-h-screen pb-12 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className={`sticky top-0 z-30 border-b backdrop-blur-xl ${isDark ? 'bg-gray-900/90 border-gray-800' : 'bg-white/90 border-gray-200'}`}>
                <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/courses')}
                            className={`p-2.5 rounded-xl transition-all ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-500/10 rounded-xl">
                                <BookOpen className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <h1 className={`text-lg font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>إضافة دورة جديدة</h1>
                                <p className={`text-[10px] font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>قم بتعبئة بيانات الدورة التدريبية</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => handleSubmit()}
                        disabled={isSubmitting}
                        className="px-8 py-3 rounded-xl font-black text-sm bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                    >
                        {isSubmitting ? 'جاري الحفظ...' : 'حفظ الدورة'}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 md:px-6 pt-6">
                {/* Error Message */}
                {error && (
                    <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 animate-in fade-in ${isDark ? 'bg-red-900/30 border-red-700/50 text-red-100' : 'bg-red-50 border-red-100 text-red-700'}`}>
                        <div className="p-1.5 bg-red-500/20 rounded-lg"><X className="w-4 h-4 text-red-500" /></div>
                        <span className="font-bold text-sm">{error}</span>
                        <button onClick={() => setError(null)} className="mr-auto p-1 hover:bg-red-500/20 rounded-lg transition-all">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* ═══════════ RIGHT COLUMN ═══════════ */}
                        <div className="space-y-5">
                            {/* Section: Basic Info */}
                            <div className={`rounded-2xl border p-5 space-y-4 ${isDark ? 'bg-gray-800/40 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                                <h3 className={`text-sm font-black flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <BookOpen className="w-4 h-4 text-blue-500" /> معلومات الدورة الأساسية
                                </h3>

                                {/* Image Upload */}
                                <div className="space-y-1.5">
                                    <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <ImagePlus className="w-3.5 h-3.5" /> صورة الدورة
                                    </label>
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                                    {imagePreview ? (
                                        <div className="relative group">
                                            <img src={imagePreview} alt="معاينة" className="w-full h-48 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all rounded-xl flex items-center justify-center gap-3">
                                                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-white/90 rounded-xl hover:bg-white transition-all">
                                                    <ImagePlus className="w-5 h-5 text-blue-600" />
                                                </button>
                                                <button type="button" onClick={removeImage} className="p-2.5 bg-white/90 rounded-xl hover:bg-white transition-all">
                                                    <Trash2 className="w-5 h-5 text-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`w-full h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.01] ${isDark
                                                ? 'border-gray-700 bg-gray-900/40 hover:border-blue-500/50'
                                                : 'border-gray-300 bg-gray-50 hover:border-blue-400'
                                                }`}
                                        >
                                            <ImagePlus className={`w-10 h-10 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                                            <span className={`text-xs font-bold ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>اضغط لاختيار صورة</span>
                                        </button>
                                    )}
                                </div>

                                {/* Course Name */}
                                <div className="space-y-1.5">
                                    <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <BookOpen className="w-3.5 h-3.5" /> اسم الدورة <span className="text-red-400">*</span>
                                    </label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="دورة المحاسبة المتقدمة" required className={inputBase} />
                                </div>

                                {/* Category */}
                                <div className="space-y-1.5">
                                    <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <Tag className="w-3.5 h-3.5" /> تصنيف الدورة
                                    </label>
                                    {showNewCategory ? (
                                        <div className="flex gap-2">
                                            <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="اسم التصنيف الجديد" className={inputBase}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }} />
                                            <button type="button" onClick={handleAddCategory} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shrink-0">إضافة</button>
                                            <button type="button" onClick={() => setShowNewCategory(false)} className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>إلغاء</button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <select value={formData.category || ''} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} className={inputBase}>
                                                <option value="">بدون تصنيف</option>
                                                {categories.map(cat => (<option key={cat.id} value={cat.name}>{cat.name}</option>))}
                                            </select>
                                            <button type="button" onClick={() => setShowNewCategory(true)} className="p-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shrink-0"><Plus className="w-4 h-4" /></button>
                                            <button type="button" onClick={() => setShowManageCategories(true)} className={`p-3.5 rounded-xl transition-all shrink-0 ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`} title="إدارة التصنيفات"><Settings className="w-4 h-4" /></button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section: Instructor */}
                            <div className={`rounded-2xl border p-5 space-y-4 ${isDark ? 'bg-gray-800/40 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                                <h3 className={`text-sm font-black flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <User className="w-4 h-4 text-indigo-500" /> بيانات المحاضر
                                </h3>

                                <div className="space-y-1.5">
                                    <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <User className="w-3.5 h-3.5" /> أستاذ الدورة <span className="text-red-400">*</span>
                                    </label>
                                    <input type="text" value={formData.instructorName} onChange={(e) => setFormData(prev => ({ ...prev, instructorName: e.target.value }))} placeholder="اسم المحاضر" required className={inputBase} />
                                </div>

                                <div className="space-y-1.5">
                                    <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <Phone className="w-3.5 h-3.5" /> رقم هاتف الأستاذ
                                    </label>
                                    <input type="tel" value={formData.instructorPhone} onChange={(e) => setFormData(prev => ({ ...prev, instructorPhone: e.target.value }))} placeholder="0770 000 0000" className={inputBase} />
                                </div>
                            </div>
                        </div>

                        {/* ═══════════ LEFT COLUMN ═══════════ */}
                        <div className="space-y-5">
                            {/* Section: Pricing */}
                            <div className={`rounded-2xl border p-5 space-y-4 ${isDark ? 'bg-gray-800/40 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                                <h3 className={`text-sm font-black flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <DollarSign className="w-4 h-4 text-emerald-500" /> التسعير
                                </h3>

                                <div className="space-y-1.5">
                                    <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <DollarSign className="w-3.5 h-3.5" /> مبلغ الدورة للطالب الواحد
                                    </label>
                                    <input
                                        type="text"
                                        value={formatNumber(formData.feePerStudent)}
                                        onChange={(e) => setFormData(prev => ({ ...prev, feePerStudent: parseNumber(e.target.value) }))}
                                        placeholder="500,000"
                                        className={`w-full px-5 py-5 rounded-xl border-2 focus:outline-none transition-all text-2xl font-black text-center tracking-wider ${isDark
                                            ? 'bg-gray-800/60 border-gray-700/60 text-white placeholder-gray-600 focus:border-emerald-500/60'
                                            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500/60 shadow-sm'
                                            }`}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>العملة</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, currency: 'IQD' }))}
                                            className={`py-3 rounded-xl border-2 font-black text-base transition-all ${formData.currency === 'IQD'
                                                ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                                : isDark ? 'border-gray-700 bg-gray-900/40 text-gray-400' : 'border-gray-200 bg-white text-gray-500'}`}>IQD</button>
                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, currency: 'USD' }))}
                                            className={`py-3 rounded-xl border-2 font-black text-base transition-all ${formData.currency === 'USD'
                                                ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                                                : isDark ? 'border-gray-700 bg-gray-900/40 text-gray-400' : 'border-gray-200 bg-white text-gray-500'}`}>USD</button>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Schedule */}
                            <div className={`rounded-2xl border p-5 space-y-4 ${isDark ? 'bg-gray-800/40 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                                <h3 className={`text-sm font-black flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <Calendar className="w-4 h-4 text-orange-500" /> الجدول والمدة
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}><Calendar className="w-3.5 h-3.5" /> عدد الأيام</label>
                                        <input type="number" value={formData.daysCount} onChange={(e) => setFormData(prev => ({ ...prev, daysCount: e.target.value }))} placeholder="30" className={inputBase} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}><Users className="w-3.5 h-3.5" /> الحد الأقصى للطلبة</label>
                                        <input type="number" value={formData.maxStudents} onChange={(e) => setFormData(prev => ({ ...prev, maxStudents: e.target.value }))} placeholder="25" className={inputBase} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}><Clock className="w-3.5 h-3.5" /> من الساعة</label>
                                        <input type="time" value={formData.lectureStartTime} onChange={(e) => setFormData(prev => ({ ...prev, lectureStartTime: e.target.value }))} className={inputBase} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}><Clock className="w-3.5 h-3.5" /> إلى الساعة</label>
                                        <input type="time" value={formData.lectureEndTime} onChange={(e) => setFormData(prev => ({ ...prev, lectureEndTime: e.target.value }))} className={inputBase} />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Description */}
                            <div className={`rounded-2xl border p-5 space-y-4 ${isDark ? 'bg-gray-800/40 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                                <h3 className={`text-sm font-black flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <FileText className="w-4 h-4 text-purple-500" /> وصف الدورة
                                </h3>
                                <div className="space-y-1.5">
                                    <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}><FileText className="w-3.5 h-3.5" /> ملخص الدورة والشهادات</label>
                                    <textarea
                                        value={formData.summary}
                                        onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                                        placeholder="ملخص عن محتوى الدورة والشهادات المقدمة..."
                                        rows={6}
                                        className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all text-sm font-bold text-right resize-none ${isDark
                                            ? 'bg-gray-800/60 border-gray-700/60 text-white placeholder-gray-600 focus:border-blue-500/60'
                                            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500/60 shadow-sm'}`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Submit - Mobile */}
                    <div className="lg:hidden">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 rounded-xl font-black text-sm bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? 'جاري الحفظ...' : 'حفظ الدورة'}
                        </button>
                    </div>
                </form>
            </div>

            <ManageCategoriesModal isOpen={showManageCategories} onClose={() => setShowManageCategories(false)} />
        </div>
    );
};

export default AddCoursePage;
