import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Box, ArrowRight, TriangleAlert as AlertTriangle, DollarSign, CreditCard, Repeat, FileText } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useExchangeRate } from '../../../../contexts/ExchangeRateContext';
import useVouchers from '../../hooks/useVouchers';
import { Safe } from '../../hooks/useVoucherData';
import { FormRef } from './ReceiptForm';

interface TransferFormProps {
    safes: Safe[];
    onClose: () => void;
}

const TransferForm = forwardRef<FormRef, TransferFormProps>(({ safes, onClose }, ref) => {
    const { employee } = useAuth();
    const { currentRate } = useExchangeRate();
    const { createVoucher } = useVouchers({ type: 'payment' }); // Type doesn't strictly matter for the hook here as we'll manually call createVoucher

    const [formData, setFormData] = useState({
        fromSafeId: '',
        fromSafeName: '',
        toSafeId: '',
        toSafeName: '',
        amount: '',
        currency: 'IQD' as 'IQD' | 'USD',
        exchangeRate: currentRate,
        details: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
        submit: () => {
            const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
            handleSubmit(fakeEvent);
        },
        isSubmitting
    }));

    useEffect(() => {
        if (employee?.safeId) {
            const safe = safes.find(s => s.id === employee.safeId);
            if (safe) {
                setFormData(prev => ({ ...prev, fromSafeId: safe.id, fromSafeName: safe.name }));
            }
        }
    }, [safes, employee]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError(null);

        try {
            if (!formData.fromSafeId) throw new Error('يرجى اختيار الصندوق المصدر');
            if (!formData.toSafeId) throw new Error('يرجى اختيار الصندوق الهدف');
            if (formData.fromSafeId === formData.toSafeId) throw new Error('لا يمكن التحويل لنفس الصندوق');
            if (!formData.amount || parseFloat(formData.amount) <= 0) throw new Error('يرجى إدخال المبلغ');

            const amount = parseFloat(formData.amount);
            const details = formData.details ? `[تحويل] ${formData.details}` : `[تحويل] من ${formData.fromSafeName} إلى ${formData.toSafeName}`;

            // 1. Create Payment Voucher (Source)
            const paymentData = {
                type: 'payment',
                companyName: `تحويل إلى ${formData.toSafeName}`,
                amount: amount,
                currency: formData.currency,
                exchangeRate: formData.currency === 'USD' ? formData.exchangeRate : 1,
                details: details,
                safeId: formData.fromSafeId,
                safeName: formData.fromSafeName,
                employeeId: employee?.id || '',
                employeeName: employee?.name || '',
                entityType: 'safe_transfer',
                isTransfer: true
            };

            // 2. Create Receipt Voucher (Target)
            const receiptData = {
                type: 'receipt',
                companyName: `تحويل من ${formData.fromSafeName}`,
                amount: amount,
                currency: formData.currency,
                exchangeRate: formData.currency === 'USD' ? formData.exchangeRate : 1,
                details: details,
                safeId: formData.toSafeId,
                safeName: formData.toSafeName,
                employeeId: employee?.id || '',
                employeeName: employee?.name || '',
                entityType: 'safe_transfer',
                isTransfer: true
            };

            await createVoucher(paymentData);
            await createVoucher(receiptData);

            onClose();
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء الحفظ');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-500/20">
                    <Repeat className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">سند تحويل عملة</h3>
                    <p className="text-xs text-gray-500 mt-0.5">نقل الأموال بين الصناديق المختلفة</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl flex items-center gap-3 border border-rose-100 dark:border-rose-800 text-sm font-bold">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            <div className="space-y-8 pb-10">
                {/* 1. Safes Section - Full Width */}
                <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1 w-full space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">
                                <Box className="w-3.5 h-3.5 text-orange-500" />من الصندوق (المصدر)
                            </label>
                            <select
                                value={formData.fromSafeId}
                                onChange={e => {
                                    const safe = safes.find(s => s.id === e.target.value);
                                    setFormData(prev => ({ ...prev, fromSafeId: e.target.value, fromSafeName: safe?.name || '' }));
                                }}
                                className="w-full h-14 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 text-sm font-bold focus:border-orange-500 transition-all outline-none shadow-inner"
                            >
                                <option value="">اختر الصندوق...</option>
                                {safes.map(safe => <option key={safe.id} value={safe.id}>{safe.name}</option>)}
                            </select>
                        </div>

                        <div className="flex-shrink-0 bg-orange-500 p-2.5 rounded-full shadow-lg shadow-orange-500/30 text-white transform rotate-90 md:rotate-0">
                            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                        </div>

                        <div className="flex-1 w-full space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">
                                <Box className="w-3.5 h-3.5 text-emerald-500" />إلى الصندوق (الهدف)
                            </label>
                            <select
                                value={formData.toSafeId}
                                onChange={e => {
                                    const safe = safes.find(s => s.id === e.target.value);
                                    setFormData(prev => ({ ...prev, toSafeId: e.target.value, toSafeName: safe?.name || '' }));
                                }}
                                className="w-full h-14 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 text-sm font-bold focus:border-orange-500 transition-all outline-none shadow-inner"
                            >
                                <option value="">اختر الصندوق...</option>
                                {safes.map(safe => <option key={safe.id} value={safe.id}>{safe.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* 2. Financials Section */}
                    <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                        <div className="p-6 bg-orange-50/30 dark:bg-orange-900/10 rounded-3xl border border-orange-100 dark:border-orange-800/50 space-y-6 shadow-inner">
                            <div className="p-1 bg-white dark:bg-gray-800 rounded-2xl flex gap-1 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, currency: 'IQD' }))}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${formData.currency === 'IQD' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <CreditCard className="w-4 h-4" />دينار عراقي
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, currency: 'USD' }))}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${formData.currency === 'USD' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <DollarSign className="w-4 h-4" />دولار أمريكي
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1 block text-center">المبلغ المراد تحويله</label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                        className={`w-full h-20 text-center text-4xl font-black rounded-2xl border-2 flex items-center justify-center bg-white dark:bg-gray-950 transition-all outline-none shadow-sm ${formData.currency === 'USD' ? 'text-emerald-500 border-emerald-100/50 focus:border-emerald-500' : 'text-orange-500 border-orange-100/50 focus:border-orange-500'
                                            }`}
                                        placeholder="0"
                                        required
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity">
                                        {formData.currency === 'USD' ? <DollarSign className="w-6 h-6 text-emerald-500" /> : <div className="text-xl font-black text-orange-500">IQD</div>}
                                    </div>
                                </div>
                            </div>

                            {formData.currency === 'USD' && (
                                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-blue-500 uppercase">سعر الصرف:</span>
                                        <span className="text-sm font-black text-blue-800 dark:text-blue-300">{formData.exchangeRate.toLocaleString()} IQD</span>
                                    </div>
                                    <div className="text-left font-mono font-black text-blue-600 dark:text-blue-400 text-xs">
                                        ≈ {(parseFloat(formData.amount || '0') * formData.exchangeRate).toLocaleString()} <span className="text-[9px]">IQD</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. Info Section */}
                    <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">
                                <FileText className="w-3.5 h-3.5" />البيان (تفاصيل التحويل الإضافية)
                            </label>
                            <textarea
                                value={formData.details}
                                onChange={e => setFormData(prev => ({ ...prev, details: e.target.value }))}
                                className="w-full h-44 px-4 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-bold focus:border-orange-500 transition-all resize-none outline-none shadow-sm"
                                placeholder="اكتب سبباً إضافياً أو ملاحظات للتحويل هنا..."
                            />
                        </div>

                        {/* Summary Helper */}
                        <div className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                            <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                                <Repeat className="w-5 h-5 opacity-50" />
                                <div className="flex-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">خلاصة العملية</p>
                                    <p className="text-xs font-bold leading-relaxed">
                                        سيتم خصم <span className="text-orange-600 font-black">{formData.amount || '0'} {formData.currency}</span> من صندوق <span className="text-gray-900 dark:text-white font-black">{formData.fromSafeName || '---'}</span> وإضافتها إلى صندوق <span className="text-emerald-600 font-black">{formData.toSafeName || '---'}</span>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
});

export default TransferForm;
