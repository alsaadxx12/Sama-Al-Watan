import { useState, useRef } from 'react';
import {
    ArrowDownRight,
    ArrowUpLeft,
    FileText,
    Repeat,
    Star,
    X,
    Loader2,
    Save
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import ModernModal from '../../../components/ModernModal';
import ReceiptForm, { FormRef } from './forms/ReceiptForm';
import SpecialReceiptForm from './forms/SpecialReceiptForm';
import PaymentForm from './forms/PaymentForm';
import JournalForm from './forms/JournalForm';
import TransferForm from './forms/TransferForm';
import useVoucherData from '../hooks/useVoucherData';
import useVouchers from '../hooks/useVouchers';

interface UnifiedVoucherModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: VoucherTab;
    settings?: any;
}

export type VoucherTab = 'receipt' | 'special-receipt' | 'payment' | 'journal' | 'transfer';

export default function UnifiedVoucherModal({ isOpen, onClose, initialTab = 'receipt', settings }: UnifiedVoucherModalProps) {
    const { theme } = useTheme();
    const { employee } = useAuth();
    const [activeTab, setActiveTab] = useState<VoucherTab>(initialTab);
    const { safes, companies, isLoading, error } = useVoucherData(isOpen);
    const { nextInvoiceNumber, isLoadingInvoiceNumber } = useVouchers({ type: 'receipt' });
    const formRef = useRef<FormRef>(null);

    const tabs = [
        { id: 'receipt' as VoucherTab, label: 'سقبض', fullLabel: 'سند قبض', icon: ArrowDownRight, color: 'emerald' },
        { id: 'special-receipt' as VoucherTab, label: 'مخصص', fullLabel: 'سند قبض مخصص', icon: Star, color: 'purple' },
        { id: 'payment' as VoucherTab, label: 'دفع', fullLabel: 'سند دفع', icon: ArrowUpLeft, color: 'rose' },
        { id: 'journal' as VoucherTab, label: 'قيد', fullLabel: 'سند قيد', icon: FileText, color: 'blue' },
        { id: 'transfer' as VoucherTab, label: 'تحويل', fullLabel: 'سند تحويل عملة', icon: Repeat, color: 'orange' },
    ];

    const activeTabData = tabs.find(t => t.id === activeTab) || tabs[0];

    const handleSave = () => {
        if (formRef.current) {
            formRef.current.submit();
        }
    };

    const renderForm = () => {
        const commonProps = {
            onClose,
            ref: formRef,
            companies,
            safes,
            isLoading,
            settings
        };

        switch (activeTab) {
            case 'receipt': return <ReceiptForm {...commonProps} />;
            case 'special-receipt': return <SpecialReceiptForm {...commonProps} />;
            case 'payment': return <PaymentForm {...commonProps} />;
            case 'journal': return <JournalForm {...commonProps} />;
            case 'transfer': return <TransferForm {...commonProps} />;
            default: return null;
        }
    };

    const ActiveIcon = activeTabData.icon;

    return (
        <ModernModal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            hideHeader
            showCloseButton={false}
            noScroll
            title=""
        >
            <div className="flex flex-col h-[80vh] min-h-[600px] bg-gray-50 dark:bg-gray-950 font-sans">
                {/* 1. Fixed Top Bar (Voucher #, Type, User + Close) */}
                <div className="h-16 shrink-0 flex items-center justify-between px-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-30 shadow-sm sticky top-0">
                    <div className="flex items-center gap-8">
                        {/* 1.1 Voucher Type */}
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl shadow-lg ${activeTabData.color === 'emerald' ? 'bg-emerald-500 shadow-emerald-500/20' :
                                activeTabData.color === 'purple' ? 'bg-purple-500 shadow-purple-500/20' :
                                    activeTabData.color === 'rose' ? 'bg-rose-500 shadow-rose-500/20' :
                                        activeTabData.color === 'blue' ? 'bg-blue-600 shadow-blue-600/20' :
                                            'bg-orange-500 shadow-orange-500/20'
                                }`}>
                                <ActiveIcon className="w-4 h-4 text-white" />
                            </div>
                            <h1 className="text-base font-black text-gray-900 dark:text-white leading-none">
                                {activeTabData.fullLabel}
                            </h1>
                        </div>

                        <div className="h-6 w-px bg-gray-100 dark:bg-gray-800" />

                        {/* 1.2 Voucher Number */}
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest opacity-60">رقم السند:</span>
                            <span className="text-sm font-black text-gray-700 dark:text-gray-300">V-{isLoadingInvoiceNumber ? '...' : nextInvoiceNumber}</span>
                        </div>

                        <div className="h-6 w-px bg-gray-100 dark:bg-gray-800" />

                        {/* 1.3 Active User */}
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest opacity-60">المستخدم:</span>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                                    <span className="text-[7px] font-black text-blue-600 dark:text-blue-400">
                                        {employee?.name?.substring(0, 3).toUpperCase() || 'USR'}
                                    </span>
                                </div>
                                <span className="text-sm font-black text-gray-700 dark:text-gray-300">{employee?.name || 'مستخدم النظام'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100/50 dark:bg-gray-800/80 px-2 py-1 rounded-lg border border-gray-200/50 dark:border-gray-700/50">Esc للخروج</span>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all border border-gray-200 dark:border-gray-800"
                            title="إغلاق النافذة"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* 2. Middle Area (Sidebar + Content) */}
                <div className="flex flex-1 overflow-hidden relative">
                    {/* RTL Sidebar - Vertical Icons with Short Labels */}
                    <div className={`w-28 border-l shrink-0 flex flex-col z-20 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
                        }`}>
                        <nav className="flex-1 p-2 space-y-3 overflow-y-auto custom-scrollbar">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;

                                const activeStyles = {
                                    emerald: 'bg-emerald-500 shadow-emerald-500/20 text-white',
                                    purple: 'bg-purple-500 shadow-purple-500/20 text-white',
                                    rose: 'bg-rose-500 shadow-rose-500/20 text-white',
                                    blue: 'bg-blue-600 shadow-blue-600/20 text-white',
                                    orange: 'bg-orange-500 shadow-orange-500/20 text-white',
                                }[tab.color];

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full group flex flex-col items-center justify-center gap-2 px-2 py-4 rounded-2xl transition-all ${isActive ? `${activeStyles} shadow-lg scale-[1.02]` :
                                            `text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white`
                                            }`}
                                    >
                                        <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'
                                            }`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className="block text-[10px] font-black tracking-tight text-center">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 relative flex flex-col bg-white dark:bg-gray-950 overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                            {isLoading && !companies.length ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-md z-50">
                                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                    <p className="mt-4 text-[10px] font-black text-gray-400 tracking-widest uppercase animate-pulse">Synchronizing...</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                    <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl mb-4">
                                        <X className="w-8 h-8 text-rose-500" />
                                    </div>
                                    <p className="text-rose-500 font-black text-lg">تعذر تحميل البيانات</p>
                                    <p className="text-gray-500 text-xs mt-2 max-w-xs">{error}</p>
                                </div>
                            ) : (
                                <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                                    {renderForm()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Fixed Bottom Bar (Save Fixed at Bottom) */}
                <div className="h-16 shrink-0 px-8 bg-gray-50 dark:bg-gray-900/50 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 flex items-center justify-center z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] sticky bottom-0">
                    <button
                        onClick={handleSave}
                        disabled={formRef.current?.isSubmitting}
                        className={`min-w-[280px] h-11 rounded-xl flex items-center justify-center gap-3 text-sm font-black text-white shadow-xl transition-all active:scale-95 disabled:opacity-50 ${activeTabData.color === 'emerald' ? 'bg-emerald-500 shadow-emerald-500/30 hover:bg-emerald-600' :
                            activeTabData.color === 'purple' ? 'bg-purple-500 shadow-purple-500/30 hover:bg-purple-600' :
                                activeTabData.color === 'rose' ? 'bg-rose-500 shadow-rose-500/30 hover:bg-rose-600' :
                                    activeTabData.color === 'blue' ? 'bg-blue-600 shadow-blue-600/30 hover:bg-blue-700' :
                                        'bg-orange-500 shadow-orange-500/30 hover:bg-orange-600'
                            }`}
                    >
                        {formRef.current?.isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                إرسال وحفظ البيانات
                            </>
                        )}
                    </button>
                </div>
            </div>
        </ModernModal>
    );
}
