import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useTheme } from '../../../contexts/ThemeContext';
import { Megaphone, Plus, Trash2, Edit3, Save, X, Loader2, Upload, Image as ImageIcon, Eye, EyeOff, Calendar, GripVertical } from 'lucide-react';
import SettingsCard from '../../../components/SettingsCard';

interface Announcement {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    isActive: boolean;
    order: number;
    createdAt: any;
}

const MAX_IMAGE_SIZE = 800;

const compressImage = (file: File, maxWidth: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let w = img.width, h = img.height;
                if (w > maxWidth) { h = (maxWidth / w) * h; w = maxWidth; }
                canvas.width = w; canvas.height = h;
                const ctx = canvas.getContext('2d')!;
                ctx.drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = reject;
            img.src = e.target!.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export default function AnnouncementsSettings() {
    const { theme } = useTheme();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ title: '', description: '', imageUrl: '', isActive: true });
    const [showAddForm, setShowAddForm] = useState(false);
    const [newForm, setNewForm] = useState({ title: '', description: '', imageUrl: '', isActive: true });
    const [uploading, setUploading] = useState(false);

    const colRef = collection(db, 'landing_announcements');

    const loadAnnouncements = async () => {
        try {
            setLoading(true);
            const q = query(colRef, orderBy('order', 'asc'));
            const snap = await getDocs(q);
            setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement)));
        } catch (err) {
            console.error('Failed to load announcements:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAnnouncements(); }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'new' | 'edit') => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';
        if (file.size > 10 * 1024 * 1024) { alert('حجم الملف يجب أن يكون أقل من 10 ميجابايت'); return; }
        setUploading(true);
        try {
            const result = await compressImage(file, MAX_IMAGE_SIZE);
            if (target === 'new') {
                setNewForm(prev => ({ ...prev, imageUrl: result }));
            } else {
                setEditForm(prev => ({ ...prev, imageUrl: result }));
            }
        } catch { alert('فشل في معالجة الصورة'); }
        finally { setUploading(false); }
    };

    const handleAdd = async () => {
        if (!newForm.title.trim()) { alert('يرجى إدخال عنوان الإعلان'); return; }
        setSaving(true);
        try {
            await addDoc(colRef, {
                title: newForm.title.trim(),
                description: newForm.description.trim(),
                imageUrl: newForm.imageUrl,
                isActive: newForm.isActive,
                order: announcements.length,
                createdAt: serverTimestamp(),
            });
            setNewForm({ title: '', description: '', imageUrl: '', isActive: true });
            setShowAddForm(false);
            await loadAnnouncements();
        } catch (err) {
            console.error('Failed to add announcement:', err);
            alert('فشل في إضافة الإعلان');
        } finally { setSaving(false); }
    };

    const handleUpdate = async (id: string) => {
        if (!editForm.title.trim()) { alert('يرجى إدخال عنوان الإعلان'); return; }
        setSaving(true);
        try {
            await updateDoc(doc(db, 'landing_announcements', id), {
                title: editForm.title.trim(),
                description: editForm.description.trim(),
                imageUrl: editForm.imageUrl,
                isActive: editForm.isActive,
            });
            setEditingId(null);
            await loadAnnouncements();
        } catch (err) {
            console.error('Failed to update announcement:', err);
            alert('فشل في تحديث الإعلان');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
        try {
            await deleteDoc(doc(db, 'landing_announcements', id));
            await loadAnnouncements();
        } catch (err) {
            console.error('Failed to delete announcement:', err);
            alert('فشل في حذف الإعلان');
        }
    };

    const handleToggleActive = async (id: string, current: boolean) => {
        try {
            await updateDoc(doc(db, 'landing_announcements', id), { isActive: !current });
            await loadAnnouncements();
        } catch { alert('فشل في تغيير الحالة'); }
    };

    const startEdit = (ann: Announcement) => {
        setEditingId(ann.id);
        setEditForm({ title: ann.title, description: ann.description, imageUrl: ann.imageUrl, isActive: ann.isActive });
    };

    const isDark = theme === 'dark';

    const renderImageUploader = (value: string, target: 'new' | 'edit') => (
        <div>
            <p className={`text-xs font-bold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>صورة الإعلان</p>
            {value ? (
                <div className={`relative rounded-xl overflow-hidden ${isDark ? 'bg-gray-900/50' : 'bg-white border border-gray-100'}`}>
                    <img src={value} alt="" className="w-full h-40 object-cover rounded-xl" />
                    <div className="absolute top-2 left-2 flex gap-1">
                        <button onClick={() => target === 'new' ? setNewForm(prev => ({ ...prev, imageUrl: '' })) : setEditForm(prev => ({ ...prev, imageUrl: '' }))}
                            className={`p-1.5 rounded-lg ${isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-500'} hover:opacity-80 transition-all`}>
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <label className="absolute bottom-2 right-2 cursor-pointer">
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, target)} className="hidden" />
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>تغيير</span>
                    </label>
                    {uploading && (
                        <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 rounded-xl flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                        </div>
                    )}
                </div>
            ) : (
                <label className="cursor-pointer">
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, target)} className="hidden" />
                    <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${isDark ? 'border-gray-600 hover:border-blue-500' : 'border-gray-300 hover:border-blue-500'}`}>
                        <ImageIcon className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>اختر صورة للإعلان</span>
                    </div>
                    {uploading && (
                        <div className="mt-2 flex items-center justify-center gap-2 text-blue-500 text-xs">
                            <Loader2 className="w-4 h-4 animate-spin" /> <span>جاري المعالجة...</span>
                        </div>
                    )}
                </label>
            )}
        </div>
    );

    const renderForm = (
        form: typeof newForm,
        setForm: React.Dispatch<React.SetStateAction<typeof newForm>>,
        onSave: () => void,
        onCancel: () => void,
        saveLabel: string,
        target: 'new' | 'edit'
    ) => (
        <div className={`p-5 rounded-2xl border-2 space-y-4 ${isDark ? 'border-blue-500/30 bg-blue-500/5' : 'border-blue-200 bg-blue-50/50'}`}>
            <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>عنوان الإعلان *</label>
                <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="أدخل عنوان الإعلان..."
                    className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${isDark ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
                />
            </div>
            <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>وصف الإعلان</label>
                <textarea
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="أدخل وصف الإعلان..."
                    rows={3}
                    className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium resize-none ${isDark ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
                />
            </div>
            {renderImageUploader(form.imageUrl, target)}
            <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>نشط (يظهر في الصفحة الرئيسية)</span>
                </label>
            </div>
            <div className="flex items-center gap-3 pt-2">
                <button
                    onClick={onSave}
                    disabled={saving || uploading || !form.title.trim()}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 disabled:opacity-50 transition-all"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{saveLabel}</span>
                </button>
                <button onClick={onCancel} className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                    إلغاء
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <SettingsCard
                icon={Megaphone}
                title="إعلانات الصفحة الرئيسية"
                description="إضافة وإدارة الإعلانات والأخبار التي تظهر في صفحة الهبوط"
            >
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Existing Announcements */}
                            {announcements.length === 0 && !showAddForm && (
                                <div className={`text-center py-12 rounded-2xl border-2 border-dashed ${isDark ? 'border-gray-700 text-gray-500' : 'border-gray-300 text-gray-400'}`}>
                                    <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p className="font-bold text-sm">لا توجد إعلانات بعد</p>
                                    <p className="text-xs mt-1">أضف إعلاناً جديداً ليظهر في الصفحة الرئيسية</p>
                                </div>
                            )}

                            {announcements.map((ann) => (
                                <div key={ann.id} className={`p-4 rounded-2xl border-2 transition-all ${isDark ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'} ${!ann.isActive ? 'opacity-60' : ''}`}>
                                    {editingId === ann.id ? (
                                        renderForm(
                                            editForm,
                                            setEditForm,
                                            () => handleUpdate(ann.id),
                                            () => setEditingId(null),
                                            'حفظ التعديلات',
                                            'edit'
                                        )
                                    ) : (
                                        <div className="flex gap-4">
                                            {ann.imageUrl && (
                                                <div className="w-28 h-20 rounded-xl overflow-hidden flex-shrink-0">
                                                    <img src={ann.imageUrl} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <h4 className={`font-bold text-sm truncate ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{ann.title}</h4>
                                                        {ann.description && (
                                                            <p className={`text-xs mt-1 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{ann.description}</p>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${ann.isActive
                                                                ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400'
                                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                                                }`}>
                                                                {ann.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                                                {ann.isActive ? 'نشط' : 'مخفي'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                                        <button onClick={() => handleToggleActive(ann.id, ann.isActive)}
                                                            className={`p-1.5 rounded-lg transition-all ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                                                            title={ann.isActive ? 'إخفاء' : 'إظهار'}>
                                                            {ann.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                        <button onClick={() => startEdit(ann)}
                                                            className={`p-1.5 rounded-lg transition-all ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                                                            title="تعديل">
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(ann.id)}
                                                            className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                                                            title="حذف">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Add Form */}
                            {showAddForm && renderForm(
                                newForm,
                                setNewForm,
                                handleAdd,
                                () => { setShowAddForm(false); setNewForm({ title: '', description: '', imageUrl: '', isActive: true }); },
                                'إضافة الإعلان',
                                'new'
                            )}

                            {/* Add Button */}
                            {!showAddForm && (
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className={`w-full p-4 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-2 font-bold text-sm ${isDark ? 'border-gray-600 hover:border-blue-500 text-gray-400 hover:text-blue-400' : 'border-gray-300 hover:border-blue-500 text-gray-500 hover:text-blue-600'}`}
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>إضافة إعلان جديد</span>
                                </button>
                            )}
                        </>
                    )}
                </div>
            </SettingsCard>
        </div>
    );
}
