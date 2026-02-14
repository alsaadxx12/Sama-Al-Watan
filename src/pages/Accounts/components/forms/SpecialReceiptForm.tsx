import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
    Building2,
    Phone,
    TriangleAlert as AlertTriangle,
    Star,
    CreditCard,
    DollarSign,
    Box,
    FileText,
    CircleAlert as AlertCircle
} from 'lucide-react';
import BeneficiarySelector from '../BeneficiarySelector';
import { useAuth } from '../../../../contexts/AuthContext';
import { useExchangeRate } from '../../../../contexts/ExchangeRateContext';
import useVouchers from '../../hooks/useVouchers';
import { Company, Safe, CourseEnrollment } from '../../hooks/useVoucherData';
import { FormRef } from './ReceiptForm';

interface SpecialReceiptFormProps {
    safes: Safe[];
    companies: Company[];
    onClose: () => void;
    settings?: any;
}

const SpecialReceiptForm = forwardRef<FormRef, SpecialReceiptFormProps>(({ safes, companies, onClose, settings = {} }, ref) => {
    const { employee } = useAuth();
    const { currentRate } = useExchangeRate();
    const { createVoucher } = useVouchers({ type: 'receipt' });

    const [formData, setFormData] = useState({
        companyName: '',
        companyId: '',
        receivedAmount: '',
        currency: 'IQD' as 'IQD' | 'USD',
        exchangeRate: currentRate,
        phone: '',
        details: '',
        safeId: '',
        safeName: '',
        gates: '',
        internal: '',
        external: '',
        fly: '',
        entityType: 'company' as any,
        courseDistributions: {} as Record<string, string>
    });

    const [studentCourses, setStudentCourses] = useState<CourseEnrollment[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [distributionError, setDistributionError] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
        submit: () => {
            const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
            handleSubmit(fakeEvent);
        },
        isSubmitting
    }));

    const formatNumber = (numStr: string | number): string => {
        if (numStr === '' || numStr === null || numStr === undefined) return '';
        const num = typeof numStr === 'string' ? parseFloat(numStr.replace(/,/g, '')) : numStr;
        if (isNaN(num)) return '';
        return new Intl.NumberFormat('en-US').format(num);
    };

    const parseNumber = (str: string): string => str.replace(/,/g, '');

    useEffect(() => {
        if (employee?.safeId) {
            const safe = safes.find(s => s.id === employee.safeId);
            if (safe) {
                setFormData(prev => ({ ...prev, safeId: safe.id, safeName: safe.name }));
            }
        }
    }, [safes, employee]);

    useEffect(() => {
        const receivedAmount = parseFloat(parseNumber(formData.receivedAmount)) || 0;
        const internal = parseFloat(parseNumber(formData.internal)) || 0;
        const external = parseFloat(parseNumber(formData.external)) || 0;
        const fly = parseFloat(parseNumber(formData.fly)) || 0;

        const totalDistribution = internal + external + fly;
        const calculatedGates = receivedAmount - totalDistribution;

        if (formData.entityType === 'student') {
            const courseTotal = Object.values(formData.courseDistributions).reduce((acc, val) => acc + (parseFloat(parseNumber(val)) || 0), 0);
            if (courseTotal > receivedAmount) {
                setDistributionError('مجموع توزيع الدورات يتجاوز المبلغ المستلم');
            } else {
                setDistributionError(null);
            }
        } else {
            if (totalDistribution > receivedAmount) {
                setDistributionError('مجموع التقسيمات يتجاوز المبلغ المستلم');
            } else {
                setDistributionError(null);
            }
        }

        setFormData(prev => ({
            ...prev,
            gates: calculatedGates >= 0 ? String(calculatedGates) : '0'
        }));
    }, [formData.receivedAmount, formData.internal, formData.external, formData.fly, formData.courseDistributions, formData.entityType]);

    const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const parsedValue = parseNumber(value);

        if (!isNaN(Number(parsedValue)) || parsedValue === '') {
            if (name.startsWith('course-')) {
                const courseId = name.replace('course-', '');
                setFormData(prev => ({
                    ...prev,
                    courseDistributions: { ...prev.courseDistributions, [courseId]: parsedValue }
                }));
                return;
            }
            setFormData(prev => ({ ...prev, [name]: parsedValue }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError(null);

        try {
            if (!formData.companyName) throw new Error('يرجى اختيار الحساب');
            const receivedAmount = parseFloat(parseNumber(formData.receivedAmount));
            if (isNaN(receivedAmount) || receivedAmount <= 0) throw new Error('يرجى إدخال مبلغ صحيح');
            if (!formData.safeId) throw new Error('يرجى اختيار الصندوق');
            if (distributionError) throw new Error(distributionError);

            const voucherData = {
                type: 'receipt',
                companyName: formData.companyName,
                companyId: formData.companyId || null,
                amount: receivedAmount,
                currency: formData.currency,
                exchangeRate: formData.currency === 'USD' ? formData.exchangeRate : 1,
                phone: formData.phone || null,
                details: formData.details || null,
                safeId: formData.safeId,
                safeName: formData.safeName,
                gates: parseFloat(parseNumber(formData.gates)) || 0,
                internal: parseFloat(parseNumber(formData.internal)) || 0,
                external: parseFloat(parseNumber(formData.external)) || 0,
                fly: parseFloat(parseNumber(formData.fly)) || 0,
                courseDistributions: formData.entityType === 'student' ? Object.entries(formData.courseDistributions).map(([id, amount]) => ({
                    courseId: id,
                    courseName: studentCourses.find(c => c.courseId === id)?.courseName || '',
                    amount: parseFloat(parseNumber(amount)) || 0
                })).filter(d => d.amount > 0) : [],
                employeeId: employee?.id || '',
                employeeName: employee?.name || '',
                entityType: formData.entityType,
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
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-purple-500 text-white rounded-2xl shadow-lg shadow-purple-500/20">
                    <Star className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">سند قبض مخصص</h3>
                    <p className="text-xs text-gray-500 mt-0.5">سند مع إمكانية توزيع المبالغ وتخصيصها</p>
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
                            <Building2 className="w-3.5 h-3.5" />الحساب المستفيد (المستلم منه مبالغ مخصصة)
                        </label>
                        {formData.entityType && (
                            <span className="text-[9px] font-black bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-lg uppercase tracking-widest border border-purple-200/50">
                                {formData.entityType}
                            </span>
                        )}
                    </div>
                    <BeneficiarySelector
                        value={formData.companyName}
                        onChange={(name, id, phone, _wgId, _wgName, type) => {
                            setFormData(prev => ({ ...prev, companyName: name, companyId: id, phone: phone || '', entityType: type, courseDistributions: {} }));
                            if (type === 'student') {
                                const student = companies.find(c => c.name === name && c.entityType === 'student');
                                setStudentCourses(student?.enrollments || []);
                            } else {
                                setStudentCourses([]);
                            }
                        }}
                        companies={companies}
                        placeholder="ابحث عن الحساب..."
                        className="text-lg"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* 2. Financials & Distributions Section */}
                    <div className="lg:col-span-12 xl:col-span-6 space-y-6">
                        <div className="p-6 bg-purple-50/30 dark:bg-purple-900/10 rounded-3xl border border-purple-100 dark:border-purple-800/50 space-y-6 shadow-inner">
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
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1 block text-center">إجمالي المبلغ المحصل</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        name="receivedAmount"
                                        value={formatNumber(formData.receivedAmount)}
                                        onChange={handleNumericChange}
                                        className={`w-full h-20 text-center text-4xl font-black rounded-2xl border-2 flex items-center justify-center bg-white dark:bg-gray-950 transition-all outline-none shadow-sm ${formData.currency === 'USD' ? 'text-emerald-500 border-emerald-100/50 focus:border-emerald-500' : 'text-orange-500 border-orange-100/50 focus:border-orange-500'
                                            }`}
                                        placeholder="0"
                                        dir="ltr"
                                        required
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity">
                                        {formData.currency === 'USD' ? <DollarSign className="w-6 h-6 text-emerald-500" /> : <div className="text-xl font-black text-orange-500">IQD</div>}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-purple-200/50 dark:border-purple-800/50">
                                {formData.entityType === 'student' ? (
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-widest text-center">توزيع المبالغ على الدورات</h4>
                                        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
                                            {studentCourses.map(course => (
                                                <div key={course.courseId} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-black text-gray-700 dark:text-gray-300 truncate">{course.courseName}</p>
                                                        <p className="text-[9px] text-gray-500 font-bold">الرسوم: {formatNumber(course.courseFee)} {course.currency}</p>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        name={`course-${course.courseId}`}
                                                        value={formatNumber(formData.courseDistributions[course.courseId] || '')}
                                                        onChange={handleNumericChange}
                                                        className="w-28 h-10 text-center rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 font-black text-sm focus:border-purple-500 outline-none transition-all"
                                                        placeholder="0"
                                                        dir="ltr"
                                                    />
                                                </div>
                                            ))}
                                            {studentCourses.length === 0 && (
                                                <p className="text-center text-[10px] text-gray-400 py-4 font-bold italic bg-white/50 dark:bg-gray-900/50 rounded-xl">لا توجد دورات مسجلة لهذا الطالب</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-widest text-center">تقسيم المبالغ (برمجياً)</h4>
                                        <div className={`grid grid-cols-2 md:grid-cols-4 gap-2.5 p-3 rounded-2xl border-2 ${distributionError ? 'bg-red-50/50 border-red-200' : 'bg-white/50 border-gray-100'}`}>
                                            {[
                                                { label: settings.gatesColumnLabel || 'جات', value: formData.gates, color: 'gray', readOnly: true },
                                                { label: settings.internalColumnLabel || 'داخلي', name: 'internal', value: formData.internal, color: 'blue' },
                                                { label: settings.externalColumnLabel || 'خارجي', name: 'external', value: formData.external, color: 'purple' },
                                                { label: settings.flyColumnLabel || 'فلاي', name: 'fly', value: formData.fly, color: 'green' },
                                            ].map((field) => (
                                                <div key={field.label || field.name} className="space-y-1">
                                                    <label className={`text-[8px] font-black uppercase text-center block ${field.color === 'blue' ? 'text-blue-500' : field.color === 'purple' ? 'text-purple-500' : field.color === 'green' ? 'text-green-500' : 'text-gray-400'
                                                        }`}>{field.label}</label>
                                                    <input
                                                        type="text"
                                                        name={field.name}
                                                        value={formatNumber(field.value)}
                                                        readOnly={field.readOnly}
                                                        onChange={field.readOnly ? undefined : handleNumericChange}
                                                        className={`w-full h-10 text-center rounded-lg font-black text-sm border-2 transition-all ${field.readOnly ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-transparent shadow-inner' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-700 focus:border-purple-500 outline-none shadow-sm'
                                                            }`}
                                                        dir="ltr"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {distributionError && (
                                    <div className="mt-3 flex items-center justify-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 animate-pulse transition-all">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <p className="text-[10px] font-black">{distributionError}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 3. Info Section - Metadata */}
                    <div className="lg:col-span-12 xl:col-span-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">
                                    <Phone className="w-3.5 h-3.5" />رقم الهاتف
                                </label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-bold focus:border-purple-500 transition-all outline-none shadow-sm"
                                    placeholder="07xxxxxxxx"
                                    dir="ltr"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">
                                    <Box className="w-3.5 h-3.5" />الصندوق المستقبل
                                </label>
                                <select
                                    value={formData.safeId}
                                    onChange={e => {
                                        const safe = safes.find(s => s.id === e.target.value);
                                        setFormData(prev => ({ ...prev, safeId: e.target.value, safeName: safe?.name || '' }));
                                    }}
                                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-bold focus:border-purple-500 transition-all outline-none shadow-sm cursor-pointer"
                                >
                                    <option value="">اختر الصندوق...</option>
                                    {safes.map(safe => <option key={safe.id} value={safe.id}>{safe.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">
                                    <FileText className="w-3.5 h-3.5" />البيان (تفاصيل السند)
                                </label>
                                <textarea
                                    value={formData.details}
                                    onChange={e => setFormData(prev => ({ ...prev, details: e.target.value }))}
                                    className="w-full h-32 px-4 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-bold focus:border-purple-500 transition-all resize-none outline-none shadow-sm"
                                    placeholder="اكتب ملاحظات إضافية هنا..."
                                />
                            </div>

                            {/* Summary Box */}
                            <div className="p-5 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-3">
                                <div className="flex items-center justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                    <span>إجمالي المبلغ:</span>
                                    <span className="text-gray-900 dark:text-gray-100">{formatNumber(formData.receivedAmount)} {formData.currency}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                    <span>سعر الصرف:</span>
                                    <span className="text-blue-500">{currentRate.toLocaleString()} IQD</span>
                                </div>
                                <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                                    <span className="text-xs font-black text-gray-900 dark:text-white">المبلغ بالدينار تقريباً:</span>
                                    <span className="text-lg font-black text-purple-600">
                                        {formatNumber((parseFloat(parseNumber(formData.receivedAmount)) || 0) * (formData.currency === 'USD' ? currentRate : 1))} <span className="text-[10px]">IQD</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
});

export default SpecialReceiptForm;
