import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Building2, Phone, Box, FileText, Check, TriangleAlert as AlertTriangle, DollarSign, CreditCard } from 'lucide-react';
import BeneficiarySelector from '../BeneficiarySelector';
import { useAuth } from '../../../../contexts/AuthContext';
import { useExchangeRate } from '../../../../contexts/ExchangeRateContext';
import useVouchers from '../../hooks/useVouchers';
import { Company, Safe } from '../../hooks/useVoucherData';

export interface FormRef {
    submit: () => void;
    isSubmitting: boolean;
}

interface ReceiptFormProps {
    safes: Safe[];
    companies: Company[];
    onClose: () => void;
}

export interface FormRef {
    submit: () => void;
    isSubmitting: boolean;
}

const ReceiptForm = forwardRef<FormRef, ReceiptFormProps>(({ safes, companies, onClose }, ref) => {
    const { employee } = useAuth();
    const { currentRate } = useExchangeRate();
    const { createVoucher, nextInvoiceNumber, isLoadingInvoiceNumber } = useVouchers({ type: 'receipt' });

    const [formData, setFormData] = useState({
        companyName: '',
        companyId: '',
        amount: '',
        currency: 'IQD' as 'IQD' | 'USD',
        exchangeRate: currentRate,
        phone: '',
        details: '',
        safeId: '',
        safeName: '',
        entityType: 'company' as any,
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
                setFormData(prev => ({ ...prev, safeId: safe.id, safeName: safe.name }));
            }
        }
    }, [safes, employee]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError(null);

        try {
            if (!formData.companyName) throw new Error('يرجى اختيار الحساب');
            if (!formData.amount || parseFloat(formData.amount) <= 0) throw new Error('يرجى إدخال المبلغ');
            if (!formData.safeId) throw new Error('يرجى اختيار الصندوق');

            const voucherData = {
                type: 'receipt',
                companyName: formData.companyName,
                companyId: formData.companyId || null,
                amount: parseFloat(formData.amount),
                currency: formData.currency,
                exchangeRate: formData.currency === 'USD' ? formData.exchangeRate : 1,
                phone: formData.phone || null,
                details: formData.details || null,
                safeId: formData.safeId,
                safeName: formData.safeName,
                employeeId: employee?.id || '',
                employeeName: employee?.name || '',
                entityType: formData.entityType,
                gates: parseFloat(formData.amount), // In simple mode, full amount goes to gates
                internal: 0,
                external: 0,
                fly: 0
            };

            await createVoucher(voucherData);
            onClose();
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء الحفظ');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                    <Check className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">سند قبض (بسيط)</h3>
                    <p className="text-xs text-gray-500 mt-0.5">إنشاء سند قبض مباشر بدون توزيع مبالغ</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl flex items-center gap-3 border border-rose-100 dark:border-rose-800 text-sm font-bold">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            <div className="space-y-8 pb-10">
                {/* 1. Target Account Section - Full Width */}
                <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">
                            <Building2 className="w-3.5 h-3.5" />الحساب المحاسبي (المستلم منه)
                        </label>
                        {formData.entityType && (
                            <span className="text-[9px] font-black bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-lg uppercase tracking-widest border border-gray-200/50 dark:border-gray-700/50">
                                {formData.entityType}
                            </span>
                        )}
                    </div>
                    <BeneficiarySelector
                        value={formData.companyName}
                        onChange={(name, id, phone, _wgId, _wgName, type) =>
                            setFormData(prev => ({ ...prev, companyName: name, companyId: id, phone: phone || '', entityType: type }))
                        }
                        companies={companies}
                        placeholder="ابحث عن الحساب..."
                        className="text-lg"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* 2. Financials Section - Important Fields */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="p-6 bg-gray-100/50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-6 shadow-inner">
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
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1 block text-center">المبلغ المطلوب قبضه</label>
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
                                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/50 mt-4">
                                    <span className="text-[9px] font-black text-blue-500 uppercase">سعر الصرف الحالي:</span>
                                    <span className="text-xs font-black text-blue-700 dark:text-blue-400">{currentRate.toLocaleString()} IQD</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. Info Section - Metadata */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">
                                    <Phone className="w-3.5 h-3.5" />رقم الهاتف
                                </label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-bold focus:border-emerald-500 transition-all outline-none shadow-sm"
                                    placeholder="07xxxxxxxx"
                                    dir="ltr"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">
                                    <Box className="w-3.5 h-3.5" />مستلم في صندوق
                                </label>
                                <select
                                    value={formData.safeId}
                                    onChange={e => {
                                        const safe = safes.find(s => s.id === e.target.value);
                                        setFormData(prev => ({ ...prev, safeId: e.target.value, safeName: safe?.name || '' }));
                                    }}
                                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-bold focus:border-emerald-500 transition-all outline-none shadow-sm cursor-pointer"
                                >
                                    <option value="">اختر الصندوق...</option>
                                    {safes.map(safe => <option key={safe.id} value={safe.id}>{safe.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">
                                <FileText className="w-3.5 h-3.5" />البيان (تفاصيل السند)
                            </label>
                            <textarea
                                value={formData.details}
                                onChange={e => setFormData(prev => ({ ...prev, details: e.target.value }))}
                                className="w-full h-32 px-4 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-bold focus:border-emerald-500 transition-all resize-none outline-none shadow-sm"
                                placeholder="اكتب تفاصيل السند هنا..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
});

export default ReceiptForm;
