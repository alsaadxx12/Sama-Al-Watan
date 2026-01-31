import React, { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, CheckCircle2, ImageIcon, Trash2, Plus, Rocket, Loader2, Users, UserX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useWhatsAppGroups from '../../../hooks/useWhatsAppGroups';
import { WhatsAppAccountSelector } from '../../SystemBrowser/libs/whatsapp/WhatsAppAccountSelector';
import useImageUpload from '../../SystemBrowser/libs/whatsapp/useImageUpload';
import useMessageSending from '../../SystemBrowser/libs/whatsapp/useMessageSending';
import { BroadcastProgressPanel } from './BroadcastProgressPanel';
import { ProBroadcastEditor } from './ProBroadcastEditor';

const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.896 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.393 0 12.031c0 2.122.554 4.193 1.607 6.041l-1.708 6.236 6.38-1.674c1.778.969 3.793 1.48 5.845 1.481h.005c6.632 0 12.032-5.403 12.035-12.041a11.968 11.968 0 00-3.525-8.513z" />
    </svg>
);

interface GroupsContainerProps {
    onToggleTarget: (target: any) => void;
    onSelectAll: (targets: any[]) => void;
    onDeselectAll: (ids: string[]) => void;
    selectedIds: Set<string>;
    exclusions: Set<string>;
    onBroadcastComplete?: (data: any) => void;
    selectedAccount: { instance_id: string; token: string } | null;
    setSelectedAccount: (account: { instance_id: string; token: string } | null) => void;
}

const AnimatedGroupCard = ({ group, isSelected, onToggle }: any) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="w-full h-[88px] relative group overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800"
        >
            {/* Liquid Background Fill from Right to Left */}
            <motion.div
                className={`absolute inset-0 z-0 origin-right ${isSelected ? 'bg-indigo-500/20' : 'bg-indigo-50/50 dark:bg-indigo-500/10'}`}
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.4, ease: "circOut" }}
            />

            <button
                onClick={onToggle}
                className={`relative z-10 flex items-center gap-3 h-full px-4 text-right w-full transition-all ${isSelected ? 'ring-2 ring-indigo-400/50' : ''
                    }`}
            >
                <div className="relative w-12 h-12 flex-shrink-0">
                    {group.image ? (
                        <img src={group.image} className="w-full h-full rounded-xl object-cover shadow-sm" alt="" />
                    ) : (
                        <div className={`w-full h-full rounded-xl flex items-center justify-center shadow-inner ${isSelected ? 'bg-indigo-500 text-white' : 'bg-green-500/10 text-green-500 border border-green-500/20'
                            }`}>
                            <WhatsAppIcon className="w-6 h-6" />
                        </div>
                    )}
                    {isSelected && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-900">
                            <CheckCircle2 className="w-3 h-3" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-black truncate transition-colors ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200'}`}>
                        {group.name}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5 font-bold">{group.id}</p>
                </div>
            </button>
        </motion.div>
    );
};

const GroupsContainer: React.FC<GroupsContainerProps> = ({
    onToggleTarget,
    onSelectAll,
    onDeselectAll,
    selectedIds,
    exclusions,
    onBroadcastComplete,
    selectedAccount,
    setSelectedAccount
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState('');

    const { whatsappGroups, isLoading, fetchGroups } = useWhatsAppGroups(false, selectedAccount);
    const { selectedImage, imagePreview, handleImageChange, clearSelectedImage, uploadImageWithRetry, isUploading: isImageUploading } = useImageUpload();
    const { isSending, sendMessage, sendProgress, isPaused, togglePause, setCurrentDelayMs, currentDelayMs, setIsSending } = useMessageSending();

    const [error, setError] = useState<string | null>(null);

    // Account loading is now handled by the parent Announcements component

    useEffect(() => {
        if (selectedAccount) fetchGroups();
    }, [selectedAccount, fetchGroups]);

    const filteredGroups = useMemo(() => {
        return whatsappGroups.filter(g =>
            !exclusions.has(g.id) && (
                g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                g.id.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [whatsappGroups, searchTerm, exclusions]);

    const excludedCount = useMemo(() => {
        return whatsappGroups.filter(g => exclusions.has(g.id)).length;
    }, [whatsappGroups, exclusions]);

    const handleToggleAll = () => {
        const allFilteredIds = filteredGroups.map(g => g.id);
        const allFilteredSelected = allFilteredIds.every(id => selectedIds.has(id));
        if (allFilteredSelected) {
            onDeselectAll(allFilteredIds);
        } else {
            onSelectAll(filteredGroups.map(g => ({ ...g, type: 'group' })));
        }
    };

    const startBroadcast = async () => {
        if (!message.trim() && !selectedImage) {
            setError('يرجى كتابة رسالة أو اختيار صورة');
            return;
        }
        if (!selectedAccount) {
            setError('يرجى اختيار حساب واتساب أولاً');
            return;
        }

        setError(null);
        setIsSending(true);

        try {
            let imageUrl: string | null = null;
            if (selectedImage) imageUrl = await uploadImageWithRetry(selectedImage, selectedAccount);

            const recipients = Array.from(selectedIds).map(id => {
                const group = whatsappGroups.find(g => g.id === id);
                return { id: id, name: group?.name || 'Group', phone: id };
            });

            await sendMessage({
                text: message,
                imageUrl: imageUrl,
                recipients: recipients,
                recipientType: 'group',
                account: selectedAccount,
                delayMs: currentDelayMs
            });

            if (onBroadcastComplete) {
                onBroadcastComplete({
                    message,
                    imageUrl,
                    recipientsCount: recipients.length,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (err: any) {
            console.error('Broadcast failed:', err);
            setError(err.message || 'فشلت عملية الإرسال');
            setIsSending(false);
        }
    };

    const isAllSelected = filteredGroups.length > 0 && filteredGroups.every(g => selectedIds.has(g.id));

    return (
        <div className="flex flex-col h-[780px] w-full overflow-hidden bg-white dark:bg-gray-950">
            <style>
                {`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .smooth-momentum {
                    -webkit-overflow-scrolling: touch;
                    scroll-behavior: smooth;
                }
                `}
            </style>

            {/* Master Navigation Toolbar */}
            <div className="px-6 py-2 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-[#2e1065] via-[#1e1b4b] to-[#0f172a] shadow-2xl sticky top-0 z-50 shrink-0">
                {/* Account Selection HUD (Right) */}
                <div className="flex items-center gap-2 shrink-0 h-11 px-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] group/hud hover:border-white/20 transition-all duration-500">
                    <div className="flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] hidden lg:block">المرسل</span>
                    </div>
                    <div className="w-px h-4 bg-white/10 mx-1.5" />
                    <WhatsAppAccountSelector
                        onAccountSelected={setSelectedAccount}
                        initialAccount={selectedAccount}
                    />
                    <div className="w-px h-6 bg-white/10 mx-1.5" />
                    <div className="flex items-center gap-2 h-8 px-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl group-hover/hud:bg-indigo-500/20 transition-all duration-500">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[11px] font-black text-white/80 tabular-nums">{filteredGroups.length}</span>
                    </div>
                    {excludedCount > 0 && (
                        <div className="flex items-center gap-1.5 h-8 px-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl ml-2 text-rose-400">
                            <UserX className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-black text-white/80 tabular-nums">{excludedCount}</span>
                        </div>
                    )}
                </div>

                {/* Centered Search (Middle) */}
                <div className="flex-1 max-w-[400px] relative mt-1 md:mt-0 h-10">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <Search className="w-4 h-4 text-purple-300" />
                    </div>
                    <input
                        type="text"
                        placeholder="ابحث عن مجموعات الواتساب..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-full bg-white/5 border border-white/10 rounded-2xl pr-12 pl-4 text-sm font-bold outline-none ring-white/20 focus:ring-4 focus:bg-white/10 transition-all shadow-inner text-center text-white placeholder-white/40"
                    />
                    <button
                        onClick={fetchGroups}
                        disabled={isLoading || !selectedAccount}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 text-purple-300 hover:text-white transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Send/Toggle Buttons (Left) */}
                <div className="flex items-center gap-3 shrink-0 h-10">
                    <button
                        onClick={handleToggleAll}
                        disabled={filteredGroups.length === 0}
                        title={isAllSelected ? 'إلغاء الكل' : 'تحديد الكل'}
                        className={`group h-10 px-4 rounded-2xl text-[11px] font-black transition-all flex items-center justify-center gap-2 ${isAllSelected
                            ? 'bg-white text-[#2e1065] shadow-inner'
                            : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                            }`}
                    >
                        {isAllSelected ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        <span>{isAllSelected ? 'إلغاء' : 'تحديد الكل'}</span>
                    </button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startBroadcast}
                        disabled={isSending || (!message.trim() && !selectedImage) || selectedIds.size === 0 || isImageUploading}
                        className="flex items-center gap-2.5 h-10 px-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl text-[12px] font-black shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all disabled:opacity-30 disabled:pointer-events-none"
                    >
                        <Rocket className={`w-4 h-4 ${isSending ? 'animate-bounce' : 'group-hover:translate-x-1 group-hover:-translate-y-1'}`} />
                        <span>{isSending ? 'جاري البث...' : 'إرسال البث الآن'}</span>
                    </motion.button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 pt-2 min-h-0">
                {/* Inputs Area (5 cols) */}
                <div className="lg:col-span-5 space-y-5 overflow-y-auto hide-scrollbar scroll-smooth">
                    <ProBroadcastEditor
                        value={message}
                        onChange={setMessage}
                        accentColor="indigo"
                    />

                    <div className="space-y-1">
                        <label className="text-[11px] font-black text-black dark:text-white uppercase tracking-widest flex items-center gap-2 px-2">
                            <ImageIcon className="w-4 h-4 text-violet-500" /> مرفق الإعلان
                        </label>
                        <AnimatePresence mode="wait">
                            {imagePreview ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="relative group rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden aspect-video bg-gray-50 dark:bg-black flex items-center justify-center shadow-lg"
                                >
                                    <img src={imagePreview} className="w-full h-full object-contain" alt="Preview" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <button
                                            onClick={clearSelectedImage}
                                            className="p-3 bg-rose-500 text-white rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.label
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center w-full h-[180px] bg-white dark:bg-gray-950 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl cursor-pointer hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-all group"
                                >
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl shadow-sm mb-2 group-hover:scale-110 transition-all">
                                        <Plus className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">إضافة صورة</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </motion.label>
                            )}
                        </AnimatePresence>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl text-[11px] font-bold flex items-center gap-3 border border-rose-100 dark:border-rose-900/30"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            {error}
                        </motion.div>
                    )}
                </div>

                {/* Groups List Area (7 cols) */}
                <div className="lg:col-span-7 flex flex-col min-h-0 items-center">
                    <div className="flex-1 max-h-[608px] overflow-y-auto smooth-momentum hide-scrollbar px-4 touch-pan-y w-full max-w-[580px]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 content-start pb-6">
                            {isLoading ? (
                                <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400">
                                    <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4 opacity-50" />
                                    <span className="text-sm font-black tracking-widest uppercase opacity-50">جاري تحميل المجموعات...</span>
                                </div>
                            ) : filteredGroups.length > 0 ? (
                                filteredGroups.map(group => (
                                    <AnimatedGroupCard
                                        key={group.id}
                                        group={group}
                                        isSelected={selectedIds.has(group.id)}
                                        onToggle={() => onToggleTarget({ ...group, type: 'group' })}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center">
                                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Users className="w-10 h-10 text-gray-200 dark:text-gray-800" />
                                    </div>
                                    <p className="text-sm font-black text-gray-300 dark:text-gray-700">لا توجد مجموعات تطابق البحث</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Float Bottom Progress & Summary */}
            <div className="shrink-0 p-2 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
                <BroadcastProgressPanel
                    isSending={isSending}
                    isPaused={isPaused}
                    sendProgress={sendProgress}
                    currentDelayMs={currentDelayMs}
                    onTogglePause={togglePause}
                    onSetDelay={setCurrentDelayMs}
                />
            </div>
        </div>
    );
};

export default GroupsContainer;
