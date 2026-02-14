import React from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, GraduationCap, User, Phone, Mail, FileText, MapPin, Briefcase, Sparkles } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';

interface AddInstructorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInstructorAdded?: () => void;
}

interface InstructorFormData {
    name: string;
    phone: string;
    email: string;
    specialization: string;
    bio: string;
    location: string;
}

export default function AddInstructorModal({ isOpen, onClose, onInstructorAdded }: AddInstructorModalProps) {
    const { theme } = useTheme();
    const { employee } = useAuth();
    const isDark = theme === 'dark';

    const [formData, setFormData] = React.useState<InstructorFormData>({
        name: '', phone: '', email: '', specialization: '', bio: '', location: ''
    });
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!isOpen) {
            setFormData({ name: '', phone: '', email: '', specialization: '', bio: '', location: '' });
            setError(null);
            setSuccess(null);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            setError('يرجى إدخال اسم الأستاذ');
            return;
        }
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            await addDoc(collection(db, 'instructors'), {
                name: formData.name.trim(),
                phone: formData.phone.trim() || null,
                email: formData.email.trim() || null,
                specialization: formData.specialization.trim() || null,
                bio: formData.bio.trim() || null,
                location: formData.location.trim() || null,
                createdAt: serverTimestamp(),
                createdBy: employee?.name || '',
                createdById: employee?.id || ''
            });
            setSuccess('تم إضافة الأستاذ بنجاح ✓');
            if (onInstructorAdded) onInstructorAdded();
            setTimeout(() => onClose(), 1200);
        } catch (err: any) {
            console.error('Error adding instructor:', err);
            setError('فشل في إضافة الأستاذ');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const inputClass = `w-full px-4 py-2.5 rounded-2xl border-2 focus:outline-none transition-all text-sm font-bold text-center ${isDark
        ? 'bg-gray-800/60 border-gray-700/50 text-white placeholder-gray-600 focus:border-purple-500/60 focus:bg-gray-800/80'
        : 'bg-gray-50/80 border-gray-200/80 text-gray-900 placeholder-gray-400 focus:border-purple-400 focus:bg-white'
        }`;

    const labelClass = `flex items-center justify-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" dir="rtl">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className={`relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border-2 animate-in fade-in zoom-in duration-300 ${isDark
                ? 'bg-gray-900/95 border-gray-700/80 shadow-black/40'
                : 'bg-white/95 border-purple-200/60 shadow-purple-900/10'
                } backdrop-blur-xl`}
                style={{
                    boxShadow: isDark
                        ? '0 25px 60px -12px rgba(0,0,0,0.5), 0 0 30px rgba(147,51,234,0.08)'
                        : '0 25px 60px -12px rgba(88,28,135,0.15), 0 0 30px rgba(147,51,234,0.08)'
                }}
            >
                {/* Header */}
                <div className={`relative overflow-hidden px-6 py-4 text-center ${isDark ? 'bg-gradient-to-bl from-purple-900/30 via-indigo-900/20 to-gray-900' : 'bg-gradient-to-bl from-purple-50 via-indigo-50 to-white'}`}>
                    <div className={`inline-flex p-3 rounded-2xl mb-2 ${isDark ? 'bg-purple-500/15' : 'bg-purple-100/80'}`}>
                        <GraduationCap className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                    <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>إضافة أستاذ جديد</h3>
                    <p className={`text-xs font-bold mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>أضف بيانات الأستاذ والسيرة الذاتية</p>

                    <button
                        onClick={onClose}
                        className={`absolute top-4 left-4 p-1.5 rounded-xl transition-all ${isDark ? 'hover:bg-white/10 text-gray-500' : 'hover:bg-black/5 text-gray-400'} hover:text-red-500`}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 180px)' }}>
                    {/* Messages */}
                    {error && (
                        <div className={`p-3 rounded-xl flex items-center gap-2 text-xs font-bold ${isDark ? 'bg-red-900/30 text-red-300 border border-red-700/40' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                            <X className="w-3.5 h-3.5 flex-shrink-0" /> {error}
                        </div>
                    )}
                    {success && (
                        <div className={`p-3 rounded-xl flex items-center gap-2 text-xs font-bold ${isDark ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-700/40' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                            <Sparkles className="w-3.5 h-3.5 flex-shrink-0" /> {success}
                        </div>
                    )}

                    {/* Name * */}
                    <div className="space-y-1.5">
                        <label className={labelClass}>
                            <User className="w-3 h-3" /> اسم الأستاذ <span className="text-red-400 text-[10px]">*</span>
                        </label>
                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="الاسم الكامل" autoFocus className={inputClass} />
                    </div>

                    {/* Specialization */}
                    <div className="space-y-1.5">
                        <label className={labelClass}>
                            <Briefcase className="w-3 h-3" /> التخصص
                        </label>
                        <input type="text" value={formData.specialization} onChange={e => setFormData({ ...formData, specialization: e.target.value })} placeholder="مثال: البرمجة، التصميم، اللغات..." className={inputClass} />
                    </div>

                    {/* Two columns: Phone & Email */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className={labelClass}><Phone className="w-3 h-3" /> الهاتف</label>
                            <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="0770 000 0000" className={inputClass} />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelClass}><Mail className="w-3 h-3" /> البريد</label>
                            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" className={inputClass} />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-1.5">
                        <label className={labelClass}><MapPin className="w-3 h-3" /> الموقع</label>
                        <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="المدينة / البلد" className={inputClass} />
                    </div>

                    {/* Bio */}
                    <div className="space-y-1.5">
                        <label className={labelClass}><FileText className="w-3 h-3" /> السيرة الذاتية</label>
                        <textarea
                            value={formData.bio}
                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="نبذة عن الأستاذ، خبراته، شهاداته..."
                            rows={2}
                            className={`${inputClass} resize-none`}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-1">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !formData.name.trim()}
                            className="flex-1 py-3 bg-gradient-to-l from-purple-600 to-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-40 disabled:scale-100 disabled:shadow-none flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />}
                            إضافة الأستاذ
                        </button>
                        <button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className={`px-5 py-3 rounded-2xl font-black text-xs transition-all ${isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
