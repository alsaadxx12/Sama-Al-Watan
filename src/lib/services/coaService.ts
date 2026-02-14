import {
    collection,
    doc,
    setDoc,
    getDocs,
    query,
    where,
    orderBy,
    deleteDoc,
    updateDoc,
    collectionGroup
} from 'firebase/firestore';
import { db } from '../firebase';

export interface COANode {
    id: string;
    name: string;
    nameAr: string;
    code: string;
    parentId: string | null;
    type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
    level: number;
    isLeaf: boolean;
    debit?: number;
    credit?: number;
    balance?: number;
    currency?: 'IQD' | 'USD';
}

const COLLECTION_NAME = 'chart_of_accounts';

export const coaService = {
    async getAccounts() {
        const q = query(collection(db, COLLECTION_NAME), orderBy('code'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as COANode));
    },

    async getHybridAccounts() {
        // Fetch static COA nodes
        const nodes = await this.getAccounts();

        // Fetch dynamic entities
        try {
            // 1. Students
            const studentsSnap = await getDocs(collectionGroup(db, 'students'));
            const studentNodes: COANode[] = studentsSnap.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name || data.studentName || 'Unknown Student',
                    nameAr: data.name || data.studentName || 'طالب غير معروف',
                    code: 'S-' + doc.id.substring(0, 4), // Placeholder code
                    parentId: '102', // Under "Students" account
                    type: 'asset',
                    level: 2,
                    isLeaf: true,
                    isVirtual: true,
                    debit: 0,
                    credit: 0,
                    balance: 0
                } as any;
            });

            // 2. Instructors
            const instructorsSnap = await getDocs(collection(db, 'instructors'));
            const instructorNodes: COANode[] = instructorsSnap.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name || 'Unknown Instructor',
                    nameAr: data.name || 'أستاذ غير معروف',
                    code: 'I-' + doc.id.substring(0, 4),
                    parentId: '202', // Under "Instructors" account
                    type: 'liability',
                    level: 2,
                    isLeaf: true,
                    isVirtual: true,
                    debit: 0,
                    credit: 0,
                    balance: 0
                } as any;
            });

            // Add other entities here (Clients, Suppliers)

            return [...nodes, ...studentNodes, ...instructorNodes];
        } catch (err) {
            console.error('Error fetching hybrid accounts:', err);
            return nodes;
        }
    },

    async addAccount(node: Omit<COANode, 'id'>) {
        const newRef = doc(collection(db, COLLECTION_NAME));
        await setDoc(newRef, node);
        return newRef.id;
    },

    async calculateNextCode(parentId: string | null, parentCode?: string) {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('parentId', '==', parentId),
            orderBy('code', 'desc')
        );
        const snapshot = await getDocs(q);

        // Root-level account (no parent)
        if (!parentId || !parentCode) {
            if (snapshot.empty) return '1';
            const lastCode = snapshot.docs[0].data().code;
            const lastNum = parseInt(lastCode);
            return (lastNum + 1).toString();
        }

        // Child account — build code as parentCode + next suffix
        if (snapshot.empty) {
            return parentCode + '1';
        }

        // Find the highest suffix among existing children
        const childCodes = snapshot.docs.map(d => d.data().code as string);
        let maxSuffix = 0;
        for (const code of childCodes) {
            if (code.startsWith(parentCode)) {
                const suffix = code.slice(parentCode.length);
                const num = parseInt(suffix);
                if (!isNaN(num) && num > maxSuffix) {
                    maxSuffix = num;
                }
            }
        }
        return parentCode + (maxSuffix + 1).toString();
    },

    async updateAccount(id: string, data: Partial<COANode>) {
        const ref = doc(db, COLLECTION_NAME, id);
        await updateDoc(ref, data);
    },

    async deleteAccount(id: string) {
        const ref = doc(db, COLLECTION_NAME, id);
        await deleteDoc(ref);
    },

    async initializeDefaultCOA() {
        const defaults: COANode[] = [
            // 1. Assets
            { id: '1', name: 'Assets', nameAr: 'الموجودات', code: '1', parentId: null, type: 'asset', level: 0, isLeaf: false, debit: 0, credit: 0, balance: 0 },
            { id: '101', name: 'Cash and Banks', nameAr: 'النقدية والمصارف', code: '101', parentId: '1', type: 'asset', level: 1, isLeaf: false, debit: 0, credit: 0, balance: 0 },
            { id: '102', name: 'Students', nameAr: 'الطلبة', code: '102', parentId: '1', type: 'asset', level: 1, isLeaf: false, debit: 0, credit: 0, balance: 0 },
            { id: '103', name: 'Clients', nameAr: 'العملاء', code: '103', parentId: '1', type: 'asset', level: 1, isLeaf: false, debit: 0, credit: 0, balance: 0 },

            // 2. Liabilities
            { id: '2', name: 'Liabilities', nameAr: 'المطلوبات', code: '2', parentId: null, type: 'liability', level: 0, isLeaf: false, debit: 0, credit: 0, balance: 0 },
            { id: '201', name: 'Suppliers', nameAr: 'الموردين', code: '201', parentId: '2', type: 'liability', level: 1, isLeaf: false, debit: 0, credit: 0, balance: 0 },
            { id: '202', name: 'Instructors', nameAr: 'الأساتذة', code: '202', parentId: '2', type: 'liability', level: 1, isLeaf: false, debit: 0, credit: 0, balance: 0 },

            // 3. Equity
            { id: '3', name: 'Equity', nameAr: 'حقوق الملكية', code: '3', parentId: null, type: 'equity', level: 0, isLeaf: false, debit: 0, credit: 0, balance: 0 },
            { id: '301', name: 'Profits', nameAr: 'الأرباح المحتجزة', code: '301', parentId: '3', type: 'equity', level: 1, isLeaf: false, debit: 0, credit: 0, balance: 0 },

            // 4. Revenue
            { id: '4', name: 'Revenue', nameAr: 'الإيرادات', code: '4', parentId: null, type: 'revenue', level: 0, isLeaf: false, debit: 0, credit: 0, balance: 0 },
            { id: '401', name: 'Misc Revenue', nameAr: 'إيرادات عرضية', code: '401', parentId: '4', type: 'revenue', level: 1, isLeaf: false, debit: 0, credit: 0, balance: 0 },

            // 5. Expenses
            { id: '5', name: 'Expenses', nameAr: 'المصروفات', code: '5', parentId: null, type: 'expense', level: 0, isLeaf: false, debit: 0, credit: 0, balance: 0 },
            { id: '501', name: 'Operating Expenses', nameAr: 'المصاريف التشغيلية', code: '501', parentId: '5', type: 'expense', level: 1, isLeaf: false, debit: 0, credit: 0, balance: 0 },
        ];

        for (const node of defaults) {
            const { id, ...data } = node;
            await setDoc(doc(db, COLLECTION_NAME, id), data);
        }
    }
};
