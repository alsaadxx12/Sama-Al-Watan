import React, { useState, useEffect } from 'react';
import { getGlobalWhatsAppSettings } from '../../../../lib/collections/whatsapp';
import { Check, ChevronDown, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

interface WhatsAppAccountSelectorProps {
    onAccountSelected: (account: { instance_id: string; token: string }) => void;
    initialAccount?: { instance_id: string; token: string } | null;
}

export const WhatsAppAccountSelector: React.FC<WhatsAppAccountSelectorProps> = ({
    onAccountSelected,
    initialAccount
}) => {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [accountDetails, setAccountDetails] = useState<Record<string, { profile_picture?: string, name?: string }>>({});

    useEffect(() => {
        const fetchAccounts = async () => {
            setLoading(true);
            const data = await getGlobalWhatsAppSettings();
            setAccounts(data);

            if (initialAccount) {
                const found = data.find(acc => acc.instance_id === initialAccount.instance_id);
                if (found) setSelectedId(found.id);
            } else if (data.length > 0) {
                const active = data.find(acc => acc.is_active) || data[0];
                setSelectedId(active.id);
                onAccountSelected({ instance_id: active.instance_id, token: active.token });
            }
            setLoading(false);
        };
        fetchAccounts();
    }, [initialAccount, onAccountSelected]);

    useEffect(() => {
        const fetchMissingDetails = async () => {
            const missingAccounts = accounts.filter(acc => !acc.profile_picture && !accountDetails[acc.id]);
            if (missingAccounts.length === 0) return;

            const newDetails = { ...accountDetails };
            for (const acc of missingAccounts) {
                try {
                    const cleanId = acc.instance_id.replace(/^instance/, '');
                    const response = await axios.get(`https://api.ultramsg.com/instance${cleanId}/instance/me`, {
                        params: { token: acc.token }
                    });
                    if (response.data) {
                        newDetails[acc.id] = {
                            profile_picture: response.data.profile_picture,
                            name: response.data.name
                        };
                    }
                } catch (err) {
                    console.error('Failed to fetch account info for:', acc.instance_id, err);
                }
            }
            setAccountDetails(newDetails);
        };

        if (accounts.length > 0) {
            fetchMissingDetails();
        }
    }, [accounts, accountDetails]);

    const handleSelect = (acc: any) => {
        setSelectedId(acc.id);
        onAccountSelected({ instance_id: acc.instance_id, token: acc.token });
        setIsOpen(false);
    };

    const selectedAccount = accounts.find(acc => acc.id === selectedId);
    const currentProfilePic = selectedAccount?.profile_picture || accountDetails[selectedAccount?.id || '']?.profile_picture;
    const currentName = selectedAccount?.name || accountDetails[selectedAccount?.id || '']?.name || selectedAccount?.instance_id || 'اختر الحساب...';

    if (loading) {
        return (
            <div className="flex items-center justify-center p-3">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            </div>
        );
    }

    return (
        <div className="relative group/selector">
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    relative flex items-center gap-2.5 pl-3 pr-2 py-1 rounded-xl transition-all duration-500
                    ${isOpen
                        ? 'bg-white dark:bg-gray-900 border border-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.15)]'
                        : 'bg-transparent border border-transparent border-white/0 hover:bg-white/5'
                    }
                `}
            >
                <div className="relative">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center border border-white/10 shadow-lg group-hover/selector:border-indigo-400 transition-colors duration-500">
                        {currentProfilePic ? (
                            <img src={currentProfilePic} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center">
                                <span className="text-white font-black text-[10px]">{currentName[0]}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col text-right min-w-0">
                    <span className="text-[10px] font-black text-white/90 truncate leading-none mb-1 group-hover/selector:text-white transition-colors">
                        {currentName}
                    </span>
                    <div className="flex items-center justify-end gap-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                        <span className="text-[7px] text-emerald-400 font-extrabold uppercase tracking-widest">متصل</span>
                    </div>
                </div>

                <div className={`
                    ml-0.5 p-0.5 rounded-md transition-all duration-300 
                    ${isOpen ? 'bg-indigo-500 text-white' : 'text-white/30 group-hover/selector:text-white'}
                `}>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                        className="absolute top-full right-0 left-0 mt-3 bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] max-h-80 overflow-y-auto hide-scrollbar p-2"
                    >
                        <div className="px-3 py-2.5 mb-2 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">تبديل الحساب</span>
                            </div>
                            <span className="text-[8px] font-bold text-indigo-400/50">{accounts.length} حسابات</span>
                        </div>

                        <div className="space-y-1">
                            {accounts.map((acc) => {
                                const details = accountDetails[acc.id];
                                const pic = acc.profile_picture || details?.profile_picture;
                                const name = acc.name || details?.name || acc.instance_id;
                                const isSelected = selectedId === acc.id;

                                return (
                                    <motion.button
                                        whileHover={{ x: -4, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                                        key={acc.id}
                                        type="button"
                                        onClick={() => handleSelect(acc)}
                                        className={`
                                            w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all text-right group/item
                                            ${isSelected
                                                ? 'bg-indigo-500/20 border border-indigo-500/30'
                                                : 'hover:bg-white/5 border border-transparent'
                                            }
                                        `}
                                    >
                                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 flex items-center justify-center border border-white/10">
                                            {pic ? (
                                                <img src={pic} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                                                    <span className="text-gray-400 font-bold text-xs">{name[0]}</span>
                                                </div>
                                            )}
                                            {isSelected && <div className="absolute inset-0 bg-indigo-500/10" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className={`text-[11px] truncate leading-none mb-1.5 transition-colors ${isSelected ? 'text-indigo-400 font-black' : 'text-gray-200 font-bold group-hover/item:text-white'}`}>
                                                {name}
                                            </p>
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-indigo-400' : 'bg-gray-600'}`} />
                                                <span className="text-[8px] text-gray-500 font-bold tracking-tight uppercase">{acc.instance_id}</span>
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30"
                                            >
                                                <Check className="w-3.5 h-3.5 font-bold" />
                                            </motion.div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>

                        {accounts.length === 0 && (
                            <div className="p-8 text-center">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                                    لا توجد حسابات مضافة حالياً<br />
                                    <span className="text-xs mt-1 block opacity-50">يرجى إضافة حساب من الإعدادات</span>
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
