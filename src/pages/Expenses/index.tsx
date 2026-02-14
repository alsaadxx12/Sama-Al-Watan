import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Briefcase,
    Plus,
    Search,
    Wallet,
    ArrowUpLeft,
    RefreshCw,
    MoreVertical,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { useExpenses, ExpenseAccount } from './hooks/useExpenses';
import { useTheme } from '../../contexts/ThemeContext';
import AddExpenseModal from '../Courses/components/AddExpenseModal';
import NewPaymentVoucherModal from '../Accounts/components/NewPaymentVoucherModal';

const ExpensesPage: React.FC = () => {
    const { theme } = useTheme();
    const { accounts, isLoading, error, refresh } = useExpenses();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<ExpenseAccount | null>(null);

    const filteredAccounts = accounts.filter(acc =>
        acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (acc.details && acc.details.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    const handleRecordPayment = (account: ExpenseAccount) => {
        setSelectedAccount(account);
        // Note: To pre-select the account in the voucher modal, 
        // we would need to pass it as a prop. 
        // For now, we'll just open the modal.
        setIsPaymentModalOpen(true);
    };

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className={`text-3xl font-black flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                        <div className="p-2 bg-blue-500/10 rounded-xl">
                            <Briefcase className="w-8 h-8 text-blue-500" />
                        </div>
                        إدارة المصروفات
                    </h1>
                    <p className="text-gray-500 font-bold mt-1">
                        تابع حسابات المصروفات والأرصدة والمدفوعات
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refresh()}
                        className={`p-3 rounded-xl transition-all shadow-sm ${theme === 'dark' ? 'bg-gray-800 text-gray-400 hover:text-white' : 'bg-white text-gray-600 hover:text-blue-600'
                            }`}
                    >
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                        onClick={() => setIsAddAccountOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-sm"
                    >
                        <Plus className="w-5 h-5" />
                        إضافة حساب مصروف
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-2xl border-2 ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-blue-50'
                        } shadow-sm`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">إجمالي الأرصدة</span>
                    </div>
                    <div className="space-y-1">
                        <h3 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {totalBalance.toLocaleString()} <span className="text-sm">IQD</span>
                        </h3>
                        <p className="text-gray-500 text-sm font-bold">إجمالي المبالغ المدفوعة للمصروفات</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`p-6 rounded-2xl border-2 ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-emerald-50'
                        } shadow-sm`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">عدد الحسابات</span>
                    </div>
                    <div className="space-y-1">
                        <h3 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {accounts.length}
                        </h3>
                        <p className="text-gray-500 text-sm font-bold">حساب مصروف نشط في النظام</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`p-6 rounded-2xl border-2 ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-rose-50'
                        } shadow-sm`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
                            <ArrowUpLeft className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">أحدث العمليات</span>
                    </div>
                    <div className="space-y-1">
                        <h3 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            مصروفات تشغيلية
                        </h3>
                        <p className="text-gray-500 text-sm font-bold">آخر تحديث: {new Date().toLocaleTimeString('ar-IQ')}</p>
                    </div>
                </motion.div>
            </div>

            {/* Main Content & Table */}
            <div className={`rounded-2xl border-2 overflow-hidden ${theme === 'dark' ? 'bg-gray-800/30 border-gray-700/50' : 'bg-white border-blue-50 shadow-sm'
                }`}>
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-grow max-w-md">
                        <Search className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="ابحث عن حساب مصروف..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pr-12 pl-4 py-3 rounded-xl border-2 outline-none transition-all font-bold text-sm ${theme === 'dark'
                                ? 'bg-gray-800/50 border-gray-700 text-white focus:border-blue-500'
                                : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-blue-500'
                                }`}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 space-y-4">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                        <p className="text-gray-500 font-bold">جاري تحميل الحسابات...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center p-20 space-y-4">
                        <AlertCircle className="w-12 h-12 text-rose-500" />
                        <p className="text-gray-500 font-bold">{error}</p>
                        <button onClick={() => refresh()} className="text-blue-600 font-black">إعادة المحاولة</button>
                    </div>
                ) : filteredAccounts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 space-y-4">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <Briefcase className="w-10 h-10 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-bold text-lg">لا توجد حسابات مصروفات حالياً</p>
                        <button onClick={() => setIsAddAccountOpen(true)} className="text-blue-600 font-black">إضافة أول حساب</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                                    <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">اسم الحساب</th>
                                    <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">التفاصيل</th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">الرصيد الحالي</th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">تاريخ الإنشاء</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredAccounts.map((account) => (
                                    <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                    <Plus className="w-5 h-5" />
                                                </div>
                                                <span className={`font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                    {account.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <p className="text-gray-500 text-sm font-bold truncate">
                                                {account.details || 'لا توجد تفاصيل'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-black text-sm ${account.balance > 0
                                                ? 'bg-rose-500/10 text-rose-500'
                                                : account.balance < 0
                                                    ? 'bg-emerald-500/10 text-emerald-500'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                                                }`}>
                                                {account.balance.toLocaleString()} {account.balance !== 0 && 'IQD'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex flex-col items-center">
                                                <span className={`text-xs font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {account.createdAt?.toDate ? account.createdAt.toDate().toLocaleDateString('ar-IQ') : 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-left">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleRecordPayment(account)}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-lg text-xs font-black hover:bg-emerald-500/20 transition-all active:scale-95"
                                                >
                                                    <ArrowUpLeft className="w-4 h-4" />
                                                    تسجيل صرف
                                                </button>
                                                <button className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                                                    }`}>
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AddExpenseModal
                isOpen={isAddAccountOpen}
                onClose={() => setIsAddAccountOpen(false)}
                onExpenseAdded={() => refresh()}
            />

            {isPaymentModalOpen && (
                <NewPaymentVoucherModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    preSelectedBeneficiary={selectedAccount ? {
                        id: selectedAccount.id,
                        name: selectedAccount.name,
                        phone: selectedAccount.phone,
                        entityType: 'expense'
                    } : undefined}
                />
            )}
        </div>
    );
};

export default ExpensesPage;
