import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { X, Tag, Search, Plus, Trash2, Edit3, Check } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

interface ManageCategoriesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({ isOpen, onClose }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [search, setSearch] = useState('');
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const unsub = onSnapshot(collection(db, 'course_categories'), snap => {
            setCategories(snap.docs.map(d => ({ id: d.id, name: d.data().name })).sort((a, b) => a.name.localeCompare(b.name)));
        });
        return () => unsub();
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setSearch('');
            setNewName('');
            setEditingId(null);
            setConfirmDeleteId(null);
            setIsAdding(false);
        }
    }, [isOpen]);

    const handleAdd = async () => {
        if (!newName.trim()) return;
        if (categories.some(c => c.name.trim().toLowerCase() === newName.trim().toLowerCase())) return;
        setIsAdding(true);
        try {
            await addDoc(collection(db, 'course_categories'), { name: newName.trim(), createdAt: serverTimestamp() });
            setNewName('');
        } catch (err) {
            console.error('Error adding category:', err);
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'course_categories', id));
            setConfirmDeleteId(null);
        } catch (err) {
            console.error('Error deleting category:', err);
        }
    };

    const handleRename = async (id: string) => {
        if (!editingName.trim()) return;
        try {
            await updateDoc(doc(db, 'course_categories', id), { name: editingName.trim() });
            setEditingId(null);
            setEditingName('');
        } catch (err) {
            console.error('Error renaming category:', err);
        }
    };

    const filtered = categories.filter(c =>
        !search || c.name.toLowerCase().includes(search.toLowerCase())
    );

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`relative w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border flex flex-col max-h-[80vh] ${isDark
                    ? 'bg-gray-900 border-gray-800'
                    : 'bg-white border-gray-200'
                    }`}
            >
                {/* Header */}
                <div className={`p-5 border-b flex items-center justify-between shrink-0 ${isDark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100 bg-gray-50/50'}`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-500/10 rounded-xl">
                            <Tag className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>إدارة التصنيفات</h2>
                            <p className={`text-[10px] font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{categories.length} تصنيف</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-red-500/10 hover:text-red-500 text-gray-400 rounded-xl transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search + Add */}
                <div className={`p-4 border-b shrink-0 space-y-3 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                    <div className="relative">
                        <Search className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                        <input
                            type="text"
                            placeholder="البحث في التصنيفات..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`w-full pr-10 pl-4 py-2.5 rounded-xl border-2 text-sm font-bold outline-none transition-all text-right ${isDark
                                ? 'bg-gray-800/60 border-gray-700/60 text-white placeholder-gray-600 focus:border-blue-500/60'
                                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500/60'
                                }`}
                        />
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="اسم تصنيف جديد..."
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
                            className={`flex-1 px-4 py-2.5 rounded-xl border-2 text-sm font-bold outline-none transition-all text-right ${isDark
                                ? 'bg-gray-800/60 border-gray-700/60 text-white placeholder-gray-600 focus:border-blue-500/60'
                                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500/60'
                                }`}
                        />
                        <button
                            onClick={handleAdd}
                            disabled={!newName.trim() || isAdding}
                            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-1.5 shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            إضافة
                        </button>
                    </div>
                </div>

                {/* Category List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-1.5" dir="rtl">
                    <AnimatePresence>
                        {filtered.map(cat => (
                            <motion.div
                                key={cat.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className={`group flex items-center gap-2 p-3 rounded-xl border transition-all ${isDark
                                    ? 'border-gray-800 bg-gray-800/30 hover:bg-gray-800/60'
                                    : 'border-gray-100 bg-gray-50/50 hover:bg-gray-100/80'
                                    }`}
                            >
                                <Tag className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />

                                {editingId === cat.id ? (
                                    <div className="flex-1 flex gap-2">
                                        <input
                                            type="text"
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleRename(cat.id); if (e.key === 'Escape') setEditingId(null); }}
                                            autoFocus
                                            className={`flex-1 px-3 py-1.5 rounded-lg border text-sm font-bold outline-none text-right ${isDark
                                                ? 'bg-gray-900 border-gray-700 text-white focus:border-blue-500'
                                                : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
                                                }`}
                                        />
                                        <button onClick={() => handleRename(cat.id)} className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all">
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:bg-gray-500/10 rounded-lg transition-all">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <span className={`flex-1 text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{cat.name}</span>

                                        {confirmDeleteId === cat.id ? (
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] text-red-400 font-bold">حذف؟</span>
                                                <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all">
                                                    <Check className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => setConfirmDeleteId(null)} className="p-1.5 text-gray-400 hover:bg-gray-500/10 rounded-lg transition-all">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }}
                                                    className={`p-1.5 rounded-lg transition-all ${isDark ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'}`}
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDeleteId(cat.id)}
                                                    className={`p-1.5 rounded-lg transition-all ${isDark ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filtered.length === 0 && (
                        <div className="py-12 text-center">
                            <Search className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
                            <p className={`text-sm font-bold ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                {search ? 'لا توجد تصنيفات مطابقة' : 'لا توجد تصنيفات بعد'}
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>,
        document.body
    );
};

export default ManageCategoriesModal;
