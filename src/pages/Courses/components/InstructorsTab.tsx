import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import {
    User, Phone, Mail, BookOpen, Trash2, Edit3, Loader2,
    GraduationCap, Plus, Eye, Briefcase, MapPin
} from 'lucide-react';

export interface Instructor {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    specialization?: string;
    bio?: string;
    location?: string;
    imageUrl?: string;
    createdAt: any;
}

interface InstructorsTabProps {
    onAddInstructor: () => void;
    refreshKey?: number;
}

export default function InstructorsTab({ onAddInstructor, refreshKey }: InstructorsTabProps) {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const isDark = theme === 'dark';

    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [courseCounts, setCourseCounts] = useState<Record<string, number>>({});

    const fetchInstructors = async () => {
        setIsLoading(true);
        try {
            const q = query(collection(db, 'instructors'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Instructor));
            setInstructors(data);

            // Count courses per instructor
            const coursesSnapshot = await getDocs(collection(db, 'courses'));
            const counts: Record<string, number> = {};
            data.forEach(inst => { counts[inst.id] = 0; });
            coursesSnapshot.docs.forEach(cDoc => {
                const cData = cDoc.data();
                const matchedInstructor = data.find(i => i.name === cData.instructorName);
                if (matchedInstructor) {
                    counts[matchedInstructor.id] = (counts[matchedInstructor.id] || 0) + 1;
                }
            });
            setCourseCounts(counts);
        } catch (err) {
            console.error('Error fetching instructors:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInstructors();
    }, [refreshKey]);

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الأستاذ؟')) return;
        setDeletingId(id);
        try {
            await deleteDoc(doc(db, 'instructors', id));
            setInstructors(prev => prev.filter(i => i.id !== id));
        } catch (err) {
            console.error('Error deleting instructor:', err);
        } finally {
            setDeletingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className={`w-16 h-16 border-4 rounded-full animate-spin ${isDark ? 'border-gray-700 border-t-purple-500' : 'border-gray-200 border-t-purple-600'}`} />
                    <p className={`animate-pulse font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>جاري تحميل الأساتذة...</p>
                </div>
            </div>
        );
    }

    if (instructors.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className={`p-6 rounded-full ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                    <GraduationCap className={`w-16 h-16 ${isDark ? 'text-purple-500/40' : 'text-purple-300'}`} />
                </div>
                <p className={`font-black text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>لا يوجد أساتذة بعد</p>
                <p className={`text-sm font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>ابدأ بإضافة الأساتذة لإدارة الكادر التعليمي</p>
                <button
                    onClick={onAddInstructor}
                    className="mt-2 px-6 py-3 bg-gradient-to-l from-purple-600 to-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    إضافة أستاذ
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {instructors.map(instructor => (
                <div
                    key={instructor.id}
                    className={`group rounded-2xl border overflow-hidden transition-all hover:shadow-xl ${isDark
                        ? 'bg-gray-800/60 border-gray-700/50 hover:border-purple-500/30 hover:shadow-purple-500/5'
                        : 'bg-white border-gray-200/80 hover:border-purple-300 hover:shadow-purple-100/50'
                        }`}
                >
                    {/* Header with avatar */}
                    <div className={`relative p-5 ${isDark ? 'bg-gradient-to-bl from-purple-900/20 to-transparent' : 'bg-gradient-to-bl from-purple-50 to-transparent'}`}>
                        <div className="flex items-start gap-4">
                            {/* Avatar */}
                            {instructor.imageUrl ? (
                                <img
                                    src={instructor.imageUrl}
                                    alt={instructor.name}
                                    className="w-16 h-16 rounded-2xl object-cover ring-3 ring-purple-500/20 shadow-lg flex-shrink-0"
                                />
                            ) : (
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${isDark ? 'bg-purple-500/15 ring-2 ring-purple-500/20' : 'bg-purple-100 ring-2 ring-purple-200'}`}>
                                    <User className={`w-7 h-7 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
                                </div>
                            )}
                            <div className="flex-1 min-w-0 text-right">
                                <h3 className={`text-base font-black truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{instructor.name}</h3>
                                {instructor.specialization && (
                                    <div className={`flex items-center gap-1.5 mt-1 text-xs font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                                        <Briefcase className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">{instructor.specialization}</span>
                                    </div>
                                )}
                                {instructor.location && (
                                    <div className={`flex items-center gap-1.5 mt-0.5 text-xs font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        <MapPin className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">{instructor.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bio preview */}
                    {instructor.bio && (
                        <div className={`px-5 pb-3`}>
                            <p className={`text-xs font-bold leading-relaxed line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {instructor.bio}
                            </p>
                        </div>
                    )}

                    {/* Stats & Contact */}
                    <div className={`px-5 py-3 border-t ${isDark ? 'border-gray-700/30' : 'border-gray-100'}`}>
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                <BookOpen className="w-3.5 h-3.5" />
                                {courseCounts[instructor.id] || 0} دورة
                            </div>
                            {instructor.phone && (
                                <span className={`flex items-center gap-1 text-[10px] font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    <Phone className="w-3 h-3" /> {instructor.phone}
                                </span>
                            )}
                            {instructor.email && (
                                <span className={`flex items-center gap-1 text-[10px] font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    <Mail className="w-3 h-3" /> {instructor.email}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className={`px-5 py-3 flex items-center justify-end gap-2 border-t ${isDark ? 'border-gray-700/30' : 'border-gray-100'}`}>
                        <button
                            onClick={() => navigate(`/instructors/${instructor.id}`)}
                            className={`p-2.5 rounded-xl transition-all ${isDark ? 'text-blue-400 hover:bg-blue-500/10' : 'text-blue-500 hover:bg-blue-50'}`}
                            title="عرض الملف الشخصي"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(instructor.id)}
                            disabled={deletingId === instructor.id}
                            className={`p-2.5 rounded-xl transition-all ${isDark ? 'text-red-400/60 hover:bg-red-500/10 hover:text-red-400' : 'text-red-400 hover:bg-red-50 hover:text-red-600'}`}
                            title="حذف"
                        >
                            {deletingId === instructor.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
