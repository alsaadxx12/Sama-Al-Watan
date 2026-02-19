import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
    ArrowRight, Plus, Search, Loader2, Users, TrendingDown,
    Link2, Layers, FileText, Phone, Mail,
    BookOpen, Eye, X, Check, User, Trash2, Pencil,
    Building, MapPin, Tag, Briefcase, AlertTriangle
} from 'lucide-react';
import { collection, collectionGroup, getDocs, addDoc, doc, deleteDoc, updateDoc, query, where, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

/* ─── category config ─── */
interface CategoryConfig {
    name: string;
    nameEn: string;
    icon: any;
    color: string;
    gradient: string;
    firestoreCollection: string;
    useCollectionGroup: boolean;
    columns: { key: string; label: string; width?: string }[];
    addFields: { key: string; label: string; placeholder: string; icon: any; type?: string; required?: boolean }[];
}

const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
    students: {
        name: 'الطلبة',
        nameEn: 'Students',
        icon: Users,
        color: 'bg-blue-600',
        gradient: 'from-blue-600 to-indigo-600',
        firestoreCollection: 'students',
        useCollectionGroup: true,
        columns: [
            { key: 'name', label: 'الاسم', width: '1fr' },
            { key: 'phone', label: 'الهاتف', width: '140px' },
            { key: 'courses', label: 'الدورات', width: '100px' },
            { key: 'balance', label: 'الرصيد', width: '120px' },
        ],
        addFields: [
            { key: 'name', label: 'اسم الطالب', placeholder: 'ادخل اسم الطالب الكامل', icon: User, required: true },
            { key: 'phone', label: 'رقم الهاتف', placeholder: '07xxxxxxxxx', icon: Phone, type: 'tel' },
            { key: 'email', label: 'البريد الإلكتروني', placeholder: 'email@example.com', icon: Mail, type: 'email' },
        ]
    },
    instructors: {
        name: 'الأساتذة',
        nameEn: 'Instructors',
        icon: Users,
        color: 'bg-emerald-600',
        gradient: 'from-emerald-600 to-teal-600',
        firestoreCollection: 'instructors',
        useCollectionGroup: false,
        columns: [
            { key: 'name', label: 'الاسم', width: '1fr' },
            { key: 'phone', label: 'الهاتف', width: '140px' },
            { key: 'specialization', label: 'التخصص', width: '160px' },
            { key: 'balance', label: 'الرصيد', width: '120px' },
        ],
        addFields: [
            { key: 'name', label: 'اسم الأستاذ', placeholder: 'ادخل اسم الأستاذ الكامل', icon: User, required: true },
            { key: 'phone', label: 'رقم الهاتف', placeholder: '07xxxxxxxxx', icon: Phone, type: 'tel' },
            { key: 'specialization', label: 'التخصص', placeholder: 'مثلاً: اللغة الانجليزية', icon: BookOpen },
        ]
    },
    expenses: {
        name: 'المصاريف',
        nameEn: 'Expenses',
        icon: TrendingDown,
        color: 'bg-rose-600',
        gradient: 'from-rose-600 to-pink-600',
        firestoreCollection: 'expenses',
        useCollectionGroup: false,
        columns: [
            { key: 'name', label: 'اسم المصروف', width: '1fr' },
            { key: 'category', label: 'التصنيف', width: '160px' },
            { key: 'balance', label: 'الرصيد', width: '120px' },
        ],
        addFields: [
            { key: 'name', label: 'اسم المصروف', placeholder: 'مثلاً: إيجار المكتب', icon: Tag, required: true },
            { key: 'category', label: 'التصنيف', placeholder: 'مثلاً: مصاريف تشغيلية', icon: Briefcase },
        ]
    },
    clients: {
        name: 'العملاء',
        nameEn: 'Clients',
        icon: Link2,
        color: 'bg-indigo-600',
        gradient: 'from-indigo-600 to-violet-600',
        firestoreCollection: 'clients',
        useCollectionGroup: false,
        columns: [
            { key: 'name', label: 'الاسم', width: '1fr' },
            { key: 'phone', label: 'الهاتف', width: '140px' },
            { key: 'company', label: 'الشركة', width: '160px' },
            { key: 'balance', label: 'الرصيد', width: '120px' },
        ],
        addFields: [
            { key: 'name', label: 'اسم العميل', placeholder: 'ادخل اسم العميل', icon: User, required: true },
            { key: 'phone', label: 'رقم الهاتف', placeholder: '07xxxxxxxxx', icon: Phone, type: 'tel' },
            { key: 'company', label: 'اسم الشركة', placeholder: 'اختياري', icon: Building },
            { key: 'address', label: 'العنوان', placeholder: 'العنوان الكامل', icon: MapPin },
        ]
    },
    suppliers: {
        name: 'الموردين',
        nameEn: 'Suppliers',
        icon: Layers,
        color: 'bg-orange-600',
        gradient: 'from-orange-600 to-amber-600',
        firestoreCollection: 'companies',
        useCollectionGroup: false,
        columns: [
            { key: 'name', label: 'الاسم', width: '1fr' },
            { key: 'phone', label: 'الهاتف', width: '140px' },
            { key: 'company', label: 'الشركة', width: '160px' },
            { key: 'balance', label: 'الرصيد', width: '120px' },
        ],
        addFields: [
            { key: 'name', label: 'اسم المورد', placeholder: 'ادخل اسم المورد', icon: User, required: true },
            { key: 'phone', label: 'رقم الهاتف', placeholder: '07xxxxxxxxx', icon: Phone, type: 'tel' },
            { key: 'company', label: 'اسم الشركة', placeholder: 'اختياري', icon: Building },
            { key: 'address', label: 'العنوان', placeholder: 'العنوان الكامل', icon: MapPin },
        ]
    }
};

/* ─── Add Entity Modal ─── */
const AddEntityModal = ({
    config,
    isOpen,
    onClose,
    onSave
}: {
    config: CategoryConfig;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Record<string, string>) => Promise<void>;
}) => {
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) setFormData({});
    }, [isOpen]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (err) {
            console.error('Error saving entity:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const isValid = config.addFields
        .filter(f => f.required)
        .every(f => formData[f.key]?.trim());

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ animation: 'fadeIn 0.2s ease-out' }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

            <div
                className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden text-right"
                style={{ animation: 'scaleIn 0.25s ease-out' }}
            >
                {/* header */}
                <div className={`px-8 pt-7 pb-5 bg-gradient-to-r ${config.gradient} text-white`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Plus className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-lg font-black">إضافة {config.name}</h4>
                                <p className="text-xs opacity-80 font-bold mt-0.5">إضافة سجل جديد في {config.name}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* form */}
                <div className="px-8 py-6 space-y-4">
                    {config.addFields.map(field => (
                        <div key={field.key}>
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <field.icon className="w-3 h-3" />
                                {field.label}
                                {field.required && <span className="text-rose-500">*</span>}
                            </label>
                            <input
                                type={field.type || 'text'}
                                value={formData[field.key] || ''}
                                onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                                placeholder={field.placeholder}
                                className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-right"
                                autoFocus={field.key === config.addFields[0]?.key}
                            />
                        </div>
                    ))}
                </div>

                {/* footer */}
                <div className="px-8 py-5 bg-gray-50/80 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        disabled={!isValid || isSaving}
                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r ${config.gradient} text-white rounded-xl text-sm font-black shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all`}
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        حفظ
                    </button>
                    <button
                        onClick={onClose}
                        className="px-8 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                        إلغاء
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            `}</style>
        </div>,
        document.body
    );
};

/* ─── Main Category Detail Page ─── */
const CategoryDetail = () => {
    const { category } = useParams<{ category: string }>();
    const navigate = useNavigate();
    const [entities, setEntities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editEntity, setEditEntity] = useState<any>(null);
    const [editFormData, setEditFormData] = useState<Record<string, string>>({});
    const [deleteEntity, setDeleteEntity] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const config = category ? CATEGORY_CONFIGS[category] : null;

    useEffect(() => {
        if (!config) return;
        fetchEntities();
    }, [category]);

    const fetchEntities = async () => {
        if (!config) return;
        setIsLoading(true);
        try {
            let snap;
            if (config.useCollectionGroup) {
                snap = await getDocs(collectionGroup(db, config.firestoreCollection));
            } else {
                snap = await getDocs(collection(db, config.firestoreCollection));
            }
            const data = snap.docs.map(d => ({
                id: d.id,
                ...d.data(),
                name: d.data().name || d.data().studentName || d.data().companyName || 'غير معروف',
                _ref: d.ref,
            }));

            // For students: compute balance from course fees and voucher payments
            if (category === 'students' && data.length > 0) {
                // Group students by their parent course
                const courseStudentMap: Record<string, any[]> = {};
                for (const student of data) {
                    const path = student._ref?.path || '';
                    const parts = path.split('/');
                    const courseId = parts.length >= 2 ? parts[1] : '';
                    if (courseId) {
                        if (!courseStudentMap[courseId]) courseStudentMap[courseId] = [];
                        courseStudentMap[courseId].push(student);
                    }
                }

                // Fetch course fees
                const courseFees: Record<string, number> = {};
                for (const cid of Object.keys(courseStudentMap)) {
                    try {
                        const courseDoc = await getDoc(doc(db, 'courses', cid));
                        if (courseDoc.exists()) {
                            courseFees[cid] = courseDoc.data().feePerStudent || courseDoc.data().price || 0;
                        }
                    } catch { /* ignore */ }
                }

                // Fetch voucher payments per student name
                const studentNames = [...new Set(data.map(s => s.name))];
                const voucherPayments: Record<string, number> = {};
                // Batch by 30 for Firestore 'in' limit
                for (let i = 0; i < studentNames.length; i += 30) {
                    const batch = studentNames.slice(i, i + 30);
                    try {
                        const vQuery = query(
                            collection(db, 'vouchers'),
                            where('type', '==', 'receipt'),
                            where('companyName', 'in', batch)
                        );
                        const vSnap = await getDocs(vQuery);
                        vSnap.docs.forEach(vDoc => {
                            const vData = vDoc.data();
                            const name = vData.companyName;
                            voucherPayments[name] = (voucherPayments[name] || 0) + (vData.amount || 0);
                        });
                    } catch { /* ignore */ }
                }

                // Compute balance per student
                for (const student of data) {
                    const path = student._ref?.path || '';
                    const parts = path.split('/');
                    const courseId = parts.length >= 2 ? parts[1] : '';
                    const fee = courseFees[courseId] || 0;
                    const paid = voucherPayments[student.name] || 0;
                    student.balance = paid - fee;
                }
            }

            setEntities(data);
        } catch (err) {
            console.error('Error fetching entities:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredEntities = useMemo(() => {
        if (!searchTerm.trim()) return entities;
        const term = searchTerm.toLowerCase();
        return entities.filter(e =>
            (e.name || '').toLowerCase().includes(term) ||
            (e.phone || '').includes(term) ||
            (e.company || '').toLowerCase().includes(term)
        );
    }, [entities, searchTerm]);

    const handleAddEntity = async (data: Record<string, string>) => {
        if (!config) return;
        const collRef = collection(db, config.firestoreCollection);
        await addDoc(collRef, {
            ...data,
            createdAt: new Date().toISOString(),
        });
        await fetchEntities();
    };

    const handleEditEntity = (entity: any) => {
        const data: Record<string, string> = {};
        if (config) {
            config.addFields.forEach(f => { data[f.key] = entity[f.key] || ''; });
        }
        setEditFormData(data);
        setEditEntity(entity);
    };

    const handleSaveEdit = async () => {
        if (!config || !editEntity) return;
        setIsSavingEdit(true);
        try {
            // Use _ref for collectionGroup entities (students live inside course subcollections)
            const ref = editEntity._ref || doc(db, config.firestoreCollection, editEntity.id);
            await updateDoc(ref, editFormData);
            setEditEntity(null);
            await fetchEntities();
        } catch (err) {
            console.error('Error updating entity:', err);
        } finally {
            setIsSavingEdit(false);
        }
    };

    const handleDeleteEntity = async () => {
        if (!config || !deleteEntity) return;
        setIsDeleting(true);
        try {
            // Use _ref for collectionGroup entities (students live inside course subcollections)
            const ref = deleteEntity._ref || doc(db, config.firestoreCollection, deleteEntity.id);
            await deleteDoc(ref);
            setDeleteEntity(null);
            await fetchEntities();
        } catch (err) {
            console.error('Error deleting entity:', err);
        } finally {
            setIsDeleting(false);
        }
    };

    const getCellValue = (entity: any, key: string) => {
        switch (key) {
            case 'name':
                return (
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-white truncate">{entity.name}</span>
                        {entity.email && <span className="text-[10px] text-gray-400 font-medium">{entity.email}</span>}
                    </div>
                );
            case 'phone':
                return <span className="text-xs font-mono text-gray-500 dark:text-gray-400" dir="ltr">{entity.phone || '—'}</span>;
            case 'courses':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[11px] font-black rounded-lg">
                        <BookOpen className="w-3 h-3" />
                        {entity.courses?.length || entity.enrolledCourses?.length || 0}
                    </span>
                );
            case 'specialization':
                return <span className="text-xs font-bold text-gray-500">{entity.specialization || entity.specialty || '—'}</span>;
            case 'category':
                return <span className="text-xs font-bold text-gray-500">{entity.category || '—'}</span>;
            case 'company':
                return <span className="text-xs font-bold text-gray-500">{entity.company || entity.companyName || '—'}</span>;
            case 'balance':
                return (
                    <span className={`text-xs font-black font-mono ${(entity.balance || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {new Intl.NumberFormat('en-IQ').format(entity.balance || 0)}
                    </span>
                );
            default:
                return <span className="text-xs text-gray-400">{entity[key] || '—'}</span>;
        }
    };

    if (!config) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <p className="text-gray-500 font-bold text-lg">الفئة غير موجودة</p>
            </div>
        );
    }

    const Icon = config.icon;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20" dir="rtl">
            {/* header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/relationships')}
                        className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
                    >
                        <ArrowRight className="w-5 h-5 text-gray-500" />
                    </button>
                    <div className={`p-3.5 bg-gradient-to-br ${config.gradient} text-white rounded-2xl shadow-lg`}>
                        <Icon className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">{config.name}</h1>
                        <p className="text-xs text-gray-500 font-bold mt-0.5">
                            {isLoading ? '...' : `${entities.length} سجل`} • {config.nameEn}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder={`بحث في ${config.name}...`}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full md:w-64 pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-xs font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className={`flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r ${config.gradient} text-white rounded-xl text-xs font-black shadow-lg hover:shadow-xl transition-all`}
                    >
                        <Plus className="w-4 h-4" />
                        إضافة {config.name}
                    </button>
                </div>
            </div>

            {/* table container */}
            <div className="bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden">
                {/* table header */}
                <div
                    className="grid items-center bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-gray-800/30 border-b border-gray-200/80 dark:border-gray-800 px-6 py-4"
                    style={{
                        gridTemplateColumns: config.columns.map(c => c.width || '1fr').join(' ') + ' 120px'
                    }}
                >
                    {config.columns.map(col => (
                        <div key={col.key} className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                            {col.label}
                        </div>
                    ))}
                    <div className="text-[11px] font-black text-gray-400 uppercase tracking-wider text-center">إجراءات</div>
                </div>

                {/* table body */}
                <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                            <p className="text-gray-400 font-bold animate-pulse">جاري تحميل البيانات...</p>
                        </div>
                    ) : filteredEntities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className={`p-4 bg-gradient-to-br ${config.gradient} text-white rounded-2xl opacity-20`}>
                                <Icon className="w-10 h-10" />
                            </div>
                            <p className="text-gray-400 font-bold text-lg">
                                {searchTerm ? 'لا توجد نتائج مطابقة' : `لا يوجد ${config.name} بعد`}
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className={`px-6 py-2.5 bg-gradient-to-r ${config.gradient} text-white rounded-xl text-xs font-black shadow-lg`}
                                >
                                    إضافة أول سجل
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredEntities.map((entity, idx) => (
                            <div
                                key={entity.id || idx}
                                className="grid items-center px-6 py-4 hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-colors group"
                                style={{
                                    gridTemplateColumns: config.columns.map(c => c.width || '1fr').join(' ') + ' 120px'
                                }}
                            >
                                {config.columns.map(col => (
                                    <div key={col.key}>{getCellValue(entity, col.key)}</div>
                                ))}
                                <div className="flex items-center justify-center gap-1">
                                    {/* Profile button for students */}
                                    {category === 'students' && (
                                        <button
                                            onClick={() => navigate(`/relationships/students/${entity.id}`)}
                                            className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all opacity-0 group-hover:opacity-100"
                                            title="بروفايل الطالب"
                                        >
                                            <User className="w-4 h-4" />
                                        </button>
                                    )}
                                    {/* Edit */}
                                    <button
                                        onClick={() => handleEditEntity(entity)}
                                        className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all opacity-0 group-hover:opacity-100"
                                        title="تعديل"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    {/* Delete */}
                                    <button
                                        onClick={() => setDeleteEntity(entity)}
                                        className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all opacity-0 group-hover:opacity-100"
                                        title="حذف"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* footer summary */}
                {!isLoading && filteredEntities.length > 0 && (
                    <div className="px-6 py-3 bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-400">
                            عرض {filteredEntities.length} من {entities.length} سجل
                        </span>
                    </div>
                )}
            </div>

            {/* add modal */}
            <AddEntityModal
                config={config}
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddEntity}
            />

            {/* edit modal */}
            {editEntity && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setEditEntity(null)} />
                    <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden text-right" style={{ animation: 'scaleIn 0.25s ease-out' }}>
                        <div className={`px-8 pt-7 pb-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm"><Pencil className="w-5 h-5" /></div>
                                    <div>
                                        <h4 className="text-lg font-black">تعديل البيانات</h4>
                                        <p className="text-xs opacity-80 font-bold mt-0.5">{editEntity.name}</p>
                                    </div>
                                </div>
                                <button onClick={() => setEditEntity(null)} className="p-2 hover:bg-white/20 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                            </div>
                        </div>
                        <div className="px-8 py-6 space-y-4">
                            {config.addFields.map(field => (
                                <div key={field.key}>
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <field.icon className="w-3 h-3" /> {field.label}
                                    </label>
                                    <input
                                        type={field.type || 'text'}
                                        value={editFormData[field.key] || ''}
                                        onChange={e => setEditFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                                        className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm font-bold focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-right"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="px-8 py-5 bg-gray-50/80 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3">
                            <button onClick={handleSaveEdit} disabled={isSavingEdit} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-black shadow-lg hover:shadow-xl disabled:opacity-40 transition-all">
                                {isSavingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} حفظ التعديلات
                            </button>
                            <button onClick={() => setEditEntity(null)} className="px-8 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">إلغاء</button>
                        </div>
                    </div>
                    <style>{`
                        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                    `}</style>
                </div>,
                document.body
            )}

            {/* delete confirmation */}
            {deleteEntity && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setDeleteEntity(null)} />
                    <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden text-center" style={{ animation: 'scaleIn 0.25s ease-out' }}>
                        <div className="px-8 pt-8 pb-4">
                            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl w-fit mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-rose-600" />
                            </div>
                            <h4 className="text-lg font-black text-gray-900 dark:text-white mb-2">تأكيد الحذف</h4>
                            <p className="text-sm text-gray-500 font-bold">
                                هل أنت متأكد من حذف <span className="text-rose-600 font-black">{deleteEntity.name}</span>؟
                            </p>
                            <p className="text-[11px] text-gray-400 mt-1">لا يمكن التراجع عن هذا الإجراء</p>
                        </div>
                        <div className="px-8 py-5 flex items-center gap-3">
                            <button onClick={handleDeleteEntity} disabled={isDeleting} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl text-sm font-black shadow-lg hover:shadow-xl disabled:opacity-40 transition-all">
                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} نعم، احذف
                            </button>
                            <button onClick={() => setDeleteEntity(null)} className="flex-1 py-3.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">إلغاء</button>
                        </div>
                    </div>
                    <style>{`
                        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                    `}</style>
                </div>,
                document.body
            )}
        </div>
    );
};

export default CategoryDetail;
