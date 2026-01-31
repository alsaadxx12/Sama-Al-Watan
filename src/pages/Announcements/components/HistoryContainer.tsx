import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import { History, Calendar, Trash2, RotateCcw, ImageIcon, Loader2, MessageSquare, Search, X, AlertTriangle } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

interface HistoryContainerProps {
    onResend?: (item: any) => void;
}

const HistoryContainer: React.FC<HistoryContainerProps> = ({ onResend }) => {
    const { theme } = useTheme();
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Custom Modal State
    const [showConfirmId, setShowConfirmId] = useState<string | null>(null);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const q = query(
                collection(db, 'announcements_history'),
                orderBy('timestamp', 'desc'),
                limit(100)
            );
            const snapshot = await getDocs(q);
            const historyData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setHistory(historyData);
        } catch (err) {
            console.error('Error fetching history:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const filteredHistory = useMemo(() => {
        if (!searchQuery.trim()) return history;
        const queryLower = searchQuery.toLowerCase();
        return history.filter(item =>
            (item.message && item.message.toLowerCase().includes(queryLower)) ||
            (item.timestamp && format(new Date(item.timestamp), 'eeee d MMMM', { locale: ar }).toLowerCase().includes(queryLower))
        );
    }, [history, searchQuery]);

    const confirmDelete = async () => {
        if (!showConfirmId) return;

        const id = showConfirmId;
        setShowConfirmId(null);
        setIsDeleting(id);

        try {
            await deleteDoc(doc(db, 'announcements_history', id));
            setHistory(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
            alert('فشل حذف السجل');
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="relative">
            <div className={`rounded-[2rem] border shadow-2xl overflow-hidden flex flex-col ${theme === 'dark' ? 'bg-gray-950/40 border-white/10' : 'bg-white border-gray-100'}`}>
                {/* Header & Search Bar */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/30 dark:bg-gray-900/30">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
                            <History className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-black text-lg">سجل الإعلانات</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">متابعة الأرشيف والبحث في الحملات السابقة</p>
                        </div>
                    </div>

                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="بحث في السجل (بالتاريخ أو النص)..."
                            className="w-full pr-11 pl-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold outline-none ring-indigo-500/20 focus:ring-4 focus:border-indigo-500 transition-all shadow-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="w-3 h-3 text-gray-400" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Table Area with Fixed Height and Scroll */}
                <div className="overflow-x-auto custom-scrollbar flex-1 min-h-0" style={{ height: '1000px' }}>
                    <table className="w-full text-right border-collapse min-w-[800px] relative">
                        <thead className="sticky top-0 z-20 bg-gray-50 dark:bg-gray-900 shadow-sm">
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                                <th className="p-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] w-48">التاريخ والوقت</th>
                                <th className="p-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">محتوى الإعلان</th>
                                <th className="p-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-center w-24">النجاح</th>
                                <th className="p-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-center w-24">الفشل</th>
                                <th className="p-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-left w-64">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-32 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="relative w-12 h-12">
                                                <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                                                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
                                            </div>
                                            <span className="text-sm font-black text-gray-400 animate-pulse">جاري جلب البيانات...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredHistory.length > 0 ? (
                                filteredHistory.map(item => (
                                    <tr
                                        key={item.id}
                                        className="group hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all duration-300"
                                        onMouseEnter={() => setHoveredId(item.id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                    >
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-white dark:group-hover:bg-gray-700 transition-colors shadow-sm">
                                                    <Calendar className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-gray-800 dark:text-gray-200">
                                                        {item.timestamp ? format(new Date(item.timestamp), 'eeee, d MMMM', { locale: ar }) : 'غير معروف'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 mt-1 font-bold">
                                                        {item.timestamp ? format(new Date(item.timestamp), 'HH:mm', { locale: ar }) : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5 relative">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-12 h-12 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-shrink-0 items-center justify-center overflow-hidden shadow-sm">
                                                    {item.imageUrl ? (
                                                        <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <ImageIcon className="w-5 h-5 text-gray-300" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 line-clamp-1 leading-relaxed max-w-[250px]">
                                                        {item.message || 'إعلان وسائط متعددة'}
                                                    </p>
                                                    {item.message && item.message.length > 20 && (
                                                        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                                            <MessageSquare className="w-3 h-3 text-indigo-500" />
                                                            <span className="text-[8px] font-black text-indigo-500 uppercase tracking-tighter">معاينة الرسالة</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Professional Hover Tooltip */}
                                            {hoveredId === item.id && item.message && (
                                                <div className="absolute z-50 left-5 bottom-[80%] w-80 p-5 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-indigo-500/10 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 pointer-events-none text-right">
                                                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                                                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                                        <span className="text-[9px] font-black uppercase text-gray-400">معاينة المحتوى الكامل</span>
                                                    </div>
                                                    <p className="text-xs leading-loose font-medium text-gray-700 dark:text-gray-300 italic">
                                                        "{item.message}"
                                                    </p>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-5 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <span className="w-8 h-8 flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black border border-emerald-500/20">
                                                    {item.sent || item.successCount || item.recipientsCount || 0}
                                                </span>
                                                <span className="text-[8px] font-black text-emerald-500/50 mt-1">ناجح</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <span className={`w-8 h-8 flex items-center justify-center rounded-full text-[10px] font-black border ${(item.failedCount || 0) > 0
                                                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-300 border-transparent opacity-40'
                                                    }`}>
                                                    {item.failedCount || 0}
                                                </span>
                                                <span className={`text-[8px] font-black mt-1 ${(item.failedCount || 0) > 0 ? 'text-rose-500/50' : 'text-gray-400/30'}`}>فاشل</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center justify-end gap-3">
                                                {onResend && (
                                                    <button
                                                        onClick={() => onResend(item)}
                                                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all font-black text-xs hover:scale-105 active:scale-95 group/btn"
                                                    >
                                                        <RotateCcw className="w-4 h-4 group-hover/btn:rotate-[-45deg] transition-transform" />
                                                        <span>إعادة إرسال</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setShowConfirmId(item.id)}
                                                    disabled={isDeleting === item.id}
                                                    className="p-2.5 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
                                                    title="حذف"
                                                >
                                                    {isDeleting === item.id ? <Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> : <Trash2 className="w-5 h-5 transition-transform hover:scale-110" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-40 text-center text-gray-400">
                                        <div className="flex flex-col items-center justify-center gap-4 opacity-10">
                                            <Search className="w-20 h-20" />
                                            <p className="text-xl font-black uppercase">لا توجد نتائج مطابقة لبحثك</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Summary */}
                <div className="p-4 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center px-8">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        إجمالي السجلات: {filteredHistory.length} من أصل {history.length}
                    </span>
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                        تحميل مستمر (حتى 100 إعلان أخير)
                    </span>
                </div>
            </div>

            {/* Custom Confirmation Modal (Portal to body for global overlay) */}
            {createPortal(
                <AnimatePresence>
                    {showConfirmId && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowConfirmId(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                                className={`w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl border ${theme === 'dark' ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-100'}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <AlertTriangle className="w-10 h-10 text-rose-500" />
                                </div>
                                <h3 className="text-xl font-black mb-2">هل أنت متأكد؟</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                                    سيتم حذف هذا السجل نهائياً من قاعدة البيانات. لا يمكنك التراجع عن هذا الإجراء.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowConfirmId(null)}
                                        className="flex-1 py-4 rounded-2xl font-black text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="flex-1 py-4 rounded-2xl font-black text-sm bg-rose-500 text-white shadow-lg shadow-rose-500/25 hover:bg-rose-600 transition-colors"
                                    >
                                        نعم، احذف
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default HistoryContainer;
