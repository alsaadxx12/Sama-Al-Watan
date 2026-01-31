import React, { useState, useMemo } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { UserX, Trash2, Search, Users, Contact, Loader2, Plus, X, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useWhatsAppGroups from '../../../hooks/useWhatsAppGroups';
import useWhatsAppContacts from '../../../hooks/useWhatsAppContacts';

interface ExclusionsContainerProps {
    exclusions: Set<string>;
    onToggleExclusion: (id: string) => void;
    onClearAll: () => void;
    account?: { instance_id: string; token: string } | null;
}

const ExclusionsContainer: React.FC<ExclusionsContainerProps> = ({
    exclusions,
    onToggleExclusion,
    onClearAll,
    account
}) => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<'groups' | 'contacts'>('groups');
    const [searchTerm, setSearchTerm] = useState('');

    const { whatsappGroups, isLoading: loadingGroups } = useWhatsAppGroups(true, account);
    const { whatsappContacts, isLoading: loadingContacts } = useWhatsAppContacts(true, account);

    const isLoading = activeTab === 'groups' ? loadingGroups : loadingContacts;

    const filteredList = useMemo(() => {
        const list = activeTab === 'groups' ? whatsappGroups : whatsappContacts;
        return list.filter(item =>
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [activeTab, whatsappGroups, whatsappContacts, searchTerm]);

    return (
        <div className="flex flex-col h-[600px] overflow-hidden">
            {/* Header section with Tabs */}
            <div className="px-6 py-4 flex flex-col gap-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-rose-500/10 rounded-2xl text-rose-500">
                            <UserX className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-black text-base">إدارة الاستثناءات</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">استبعاد من الإرسال الجماعي</p>
                        </div>
                    </div>
                    {exclusions.size > 0 && (
                        <button
                            onClick={onClearAll}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>إعادة ضبط الكل ({exclusions.size})</span>
                        </button>
                    )}
                </div>

                {/* Tab Switcher */}
                <div className="flex p-1 bg-gray-100 dark:bg-gray-950 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 h-11 relative">
                    <button
                        onClick={() => setActiveTab('groups')}
                        className={`flex-1 flex items-center justify-center gap-2 text-[11px] font-black transition-all relative z-10 ${activeTab === 'groups' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Users className="w-4 h-4" />
                        <span>المجموعات</span>
                        {activeTab === 'groups' && (
                            <motion.div layoutId="tab-pill" className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl shadow-sm -z-10" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('contacts')}
                        className={`flex-1 flex items-center justify-center gap-2 text-[11px] font-black transition-all relative z-10 ${activeTab === 'contacts' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Contact className="w-4 h-4" />
                        <span>جهات الاتصال</span>
                        {activeTab === 'contacts' && (
                            <motion.div layoutId="tab-pill" className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl shadow-sm -z-10" />
                        )}
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative h-10">
                    <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={activeTab === 'groups' ? "ابحث عن مجموعة لاستبعادها..." : "ابحث عن جهة اتصال لاستبعادها..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl pr-10 pl-4 text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                    />
                </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 hide-scrollbar">
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 animate-pulse">
                        <Loader2 className="w-8 h-8 animate-spin mb-3 opacity-20" />
                        <span className="text-[10px] uppercase font-black tracking-widest">جاري التحميل...</span>
                    </div>
                ) : filteredList.length > 0 ? (
                    <AnimatePresence mode="popLayout">
                        {filteredList.map((item) => {
                            const isExcluded = exclusions.has(item.id);
                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    key={item.id}
                                    className={`flex items-center justify-between p-3 rounded-[1.2rem] border transition-all duration-300 ${isExcluded
                                        ? 'bg-rose-500/5 border-rose-500/10'
                                        : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-indigo-500/20 shadow-sm'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 truncate min-w-0">
                                        <div className="relative w-9 h-9 shrink-0">
                                            {item.image ? (
                                                <img src={item.image} className="w-full h-full rounded-xl object-cover border border-white/10" alt="" />
                                            ) : (
                                                <div className={`w-full h-full rounded-xl flex items-center justify-center font-black text-[10px] border ${isExcluded ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700'}`}>
                                                    {item.name?.[0] || '?'}
                                                </div>
                                            )}
                                            {isExcluded && (
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                                                    <X className="w-2 h-2" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col truncate">
                                            <span className={`text-xs font-black truncate ${isExcluded ? 'text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>
                                                {item.name}
                                            </span>
                                            <span className="text-[9px] font-bold text-gray-400 truncate opacity-60">
                                                {item.id}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => onToggleExclusion(item.id)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border ${isExcluded
                                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/20'
                                            : 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20'
                                            }`}
                                    >
                                        {isExcluded ? 'إدراج' : 'استبعاد'}
                                    </button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20 grayscale opacity-40">
                        <Inbox className="w-12 h-12 mb-4 stroke-[1px]" />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">لا توجد نتائج مطابقة</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExclusionsContainer;
