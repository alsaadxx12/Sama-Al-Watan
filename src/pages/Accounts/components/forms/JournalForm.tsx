import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Building2, Box, TriangleAlert as AlertTriangle, DollarSign, CreditCard, AlertCircle, FileText, Phone, Check, Plus, Trash2 } from 'lucide-react';
import BeneficiarySelector from '../BeneficiarySelector';
import { useAuth } from '../../../../contexts/AuthContext';
import { useExchangeRate } from '../../../../contexts/ExchangeRateContext';
import useVouchers from '../../hooks/useVouchers';
import { Company, Safe } from '../../hooks/useVoucherData';
import { FormRef } from './ReceiptForm';

interface JournalFormProps {
    safes: Safe[];
    companies: Company[];
    onClose: () => void;
}

interface JournalRow {
    id: string;
    accountId: string;
    accountName: string;
    entityType: string;
    debit: string;
    credit: string;
}

const JournalForm = forwardRef<FormRef, JournalFormProps>(({ safes, companies, onClose }, ref) => {
    const { employee } = useAuth();
    const { currentRate } = useExchangeRate();
    const { createVoucher } = useVouchers({ type: 'receipt' });

    const [rows, setRows] = useState<JournalRow[]>([
        { id: Math.random().toString(36).substr(2, 9), accountId: '', accountName: '', entityType: 'company', debit: '', credit: '' },
        { id: Math.random().toString(36).substr(2, 9), accountId: '', accountName: '', entityType: 'company', debit: '', credit: '' },
    ]);

    const [details, setDetails] = useState('');
    const [currency, setCurrency] = useState<'IQD' | 'USD'>('IQD');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
        submit: () => {
            const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
            handleSubmit(fakeEvent);
        },
        isSubmitting
    }));

    const addRow = () => {
        setRows([...rows, { id: Math.random().toString(36).substr(2, 9), accountId: '', accountName: '', entityType: 'company', debit: '', credit: '' }]);
    };

    const removeRow = (id: string) => {
        if (rows.length <= 2) return;
        setRows(rows.filter(row => row.id !== id));
    };

    const updateRow = (id: string, field: keyof JournalRow, value: string) => {
        setRows(prev => prev.map(row => {
            if (row.id === id) {
                // If setting debit, clear credit and vice versa (standard journal logic per row)
                if (field === 'debit' && parseFloat(value) > 0) return { ...row, [field]: value, credit: '' };
                if (field === 'credit' && parseFloat(value) > 0) return { ...row, [field]: value, debit: '' };
                return { ...row, [field]: value };
            }
            return row;
        }));
    };

    const totalDebit = rows.reduce((acc, row) => acc + (parseFloat(row.debit) || 0), 0);
    const totalCredit = rows.reduce((acc, row) => acc + (parseFloat(row.credit) || 0), 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError(null);

        try {
            if (!isBalanced) throw new Error('القيد غير متزن. يجب أن يتساوى إجمالي المدين مع إجمالي الدائن');

            const validRows = rows.filter(r => r.accountId && (parseFloat(r.debit) > 0 || parseFloat(r.credit) > 0));
            if (validRows.length < 2) throw new Error('يرجى إضافة سطرين على الأقل يحتويان على حسابات ومبالغ');

            // prepare journal data
            const voucherData = {
                type: 'journal',
                details: `[قيد محاسبي] ${details}`,
                totalAmount: totalDebit,
                currency,
                exchangeRate: currency === 'USD' ? currentRate : 1,
                employeeId: employee?.id || '',
                employeeName: employee?.name || '',
                journalEntries: validRows.map(r => ({
                    accountId: r.accountId,
                    accountName: r.accountName,
                    entityType: r.entityType,
                    debit: parseFloat(r.debit) || 0,
                    credit: parseFloat(r.credit) || 0
                }))
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
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500 max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/20">
                    <FileText className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">سند قيد يدوي</h3>
                    <p className="text-xs text-gray-400 mt-1 font-bold">تسجيل حركات مالية متعددة الأطراف بشروط متزنة</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl flex items-center gap-3 border border-rose-100 dark:border-rose-900/50 text-sm font-black shadow-sm">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                            <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest w-16">#</th>
                            <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">الحساب المحاسبي</th>
                            <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-40">مدين (Debit)</th>
                            <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-40">دائن (Credit)</th>
                            <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-16"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {rows.map((row, index) => (
                            <tr key={row.id} className="group hover:bg-gray-50/30 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="px-6 py-4 text-sm font-black text-gray-300 dark:text-gray-600 text-center">
                                    {index + 1}
                                </td>
                                <td className="px-4 py-4">
                                    <BeneficiarySelector
                                        value={row.accountName}
                                        onChange={(name, id, _p, _w, _wn, type) => {
                                            updateRow(row.id, 'accountName', name);
                                            updateRow(row.id, 'accountId', id);
                                            updateRow(row.id, 'entityType', type);
                                        }}
                                        companies={companies}
                                        placeholder="ابحث عن الحساب..."
                                        className="border-none bg-transparent hover:bg-white dark:hover:bg-gray-800 transition-all rounded-xl"
                                    />
                                </td>
                                <td className="px-4 py-4">
                                    <input
                                        type="number"
                                        value={row.debit}
                                        onChange={e => updateRow(row.id, 'debit', e.target.value)}
                                        className="w-full h-11 text-center bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 text-sm font-black text-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                        placeholder="0"
                                    />
                                </td>
                                <td className="px-4 py-4">
                                    <input
                                        type="number"
                                        value={row.credit}
                                        onChange={e => updateRow(row.id, 'credit', e.target.value)}
                                        className="w-full h-11 text-center bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 text-sm font-black text-rose-500 focus:border-rose-500 outline-none transition-all"
                                        placeholder="0"
                                    />
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <button
                                        type="button"
                                        onClick={() => removeRow(row.id)}
                                        disabled={rows.length <= 2}
                                        className="p-2 text-gray-300 hover:text-rose-500 disabled:opacity-0 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-50/30 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-800">
                            <td colSpan={2} className="px-6 py-6">
                                <button
                                    type="button"
                                    onClick={addRow}
                                    className="flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4 p-0.5 bg-blue-100 rounded-full" />
                                    إضافة سطر جديد
                                </button>
                            </td>
                            <td className="px-4 py-6">
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Total Debit</p>
                                    <p className="text-lg font-black text-emerald-500">{new Intl.NumberFormat().format(totalDebit)}</p>
                                </div>
                            </td>
                            <td className="px-4 py-6">
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Total Credit</p>
                                    <p className="text-lg font-black text-rose-500">{new Intl.NumberFormat().format(totalCredit)}</p>
                                </div>
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                <div className="lg:col-span-2 space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2 text-right">
                        <FileText className="w-3.5 h-3.5" />البيان العام للقيد
                    </label>
                    <textarea
                        value={details}
                        onChange={e => setDetails(e.target.value)}
                        className="w-full h-24 px-5 py-4 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none resize-none shadow-sm"
                        placeholder="اكتب وصفاً تفصيلياً للقيد هنا..."
                    />
                </div>

                <div className="space-y-4">
                    <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl flex gap-1 shadow-inner">
                        <button
                            type="button"
                            onClick={() => setCurrency('IQD')}
                            className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${currency === 'IQD' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            دينار عراقي
                        </button>
                        <button
                            type="button"
                            onClick={() => setCurrency('USD')}
                            className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${currency === 'USD' ? 'bg-white dark:bg-gray-700 text-emerald-500 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            دولار أمريكي
                        </button>
                    </div>

                    <div className={`p-5 rounded-3xl border transition-all ${isBalanced ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${isBalanced ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'}`}>
                                {isBalanced ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Balance Status</p>
                                <p className="text-sm font-black leading-none mt-1">
                                    {isBalanced ? 'القيد متزن وجاهز' : 'القيد غير متزن'}
                                </p>
                            </div>
                        </div>
                        {!isBalanced && totalDebit > 0 && (
                            <p className="text-[10px] font-bold mt-3 border-t border-rose-100 pt-2 flex items-center justify-between">
                                <span>الفرق:</span>
                                <span>{new Intl.NumberFormat().format(Math.abs(totalDebit - totalCredit))}</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </form>
    );
});

export default JournalForm;
