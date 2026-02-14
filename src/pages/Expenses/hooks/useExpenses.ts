import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export interface ExpenseAccount {
    id: string;
    name: string;
    phone?: string;
    details?: string;
    amount: number; // Opening balance or budget if any
    balance: number; // Dynamically calculated
    createdAt: any;
    createdBy: string;
}

export function useExpenses() {
    const [accounts, setAccounts] = useState<ExpenseAccount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAccounts = useCallback(async () => {
        try {
            setIsLoading(true);

            // 1. Fetch all expense accounts
            const accountsRef = collection(db, 'expenses');
            const accountsSnapshot = await getDocs(query(accountsRef, orderBy('name', 'asc')));
            const initialAccounts = accountsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                balance: 0 // Will be updated
            })) as ExpenseAccount[];

            // 2. Fetch all vouchers related to expenses
            const vouchersRef = collection(db, 'vouchers');
            const vouchersSnapshot = await getDocs(query(vouchersRef, where('entityType', '==', 'expense')));

            const vouchers = vouchersSnapshot.docs.map(doc => doc.data());

            // 3. Calculate balances
            const updatedAccounts = initialAccounts.map(account => {
                const accountVouchers = vouchers.filter(v => v.companyId === account.id || v.companyName === account.name);

                const totalPayments = accountVouchers
                    .filter(v => v.type === 'payment')
                    .reduce((sum, v) => sum + (Number(v.amount) || 0), 0);

                const totalReceipts = accountVouchers
                    .filter(v => v.type === 'receipt')
                    .reduce((sum, v) => sum + (Number(v.amount) || 0), 0);

                return {
                    ...account,
                    balance: totalPayments - totalReceipts
                };
            });

            setAccounts(updatedAccounts);
        } catch (err) {
            console.error('Error fetching expenses:', err);
            setError('فشل في تحميل بيانات المصروفات');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAccounts();

        // Set up real-time listener for vouchers to update balances
        const vouchersRef = collection(db, 'vouchers');
        const q = query(vouchersRef, where('entityType', '==', 'expense'));

        const unsubscribe = onSnapshot(q, () => {
            fetchAccounts();
        });

        return () => unsubscribe();
    }, [fetchAccounts]);

    return {
        accounts,
        isLoading,
        error,
        refresh: fetchAccounts
    };
}
