import {
    collection,
    doc,
    setDoc,
    getDocs,
    getDoc,
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
            // 1. Students (subcollection under courses)
            const studentsSnap = await getDocs(collectionGroup(db, 'students'));

            // Build student nodes and track their course parent paths
            const studentCourseMap: Record<string, string> = {}; // studentDocId -> courseId
            const courseFees: Record<string, number> = {};       // courseId -> fee

            const studentNodes: COANode[] = studentsSnap.docs.map(d => {
                const data = d.data();
                // Extract courseId from path: courses/{courseId}/students/{studentId}
                const pathParts = d.ref.path.split('/');
                if (pathParts.length >= 2) {
                    const courseId = pathParts[1]; // courses/{courseId}
                    studentCourseMap[d.id] = courseId;
                }
                return {
                    id: d.id,
                    name: data.name || data.studentName || 'Unknown Student',
                    nameAr: data.name || data.studentName || 'طالب غير معروف',
                    code: 'S-' + d.id.substring(0, 4),
                    parentId: '102',
                    type: 'asset',
                    level: 2,
                    isLeaf: true,
                    isVirtual: true,
                    debit: 0,
                    credit: 0,
                    balance: 0
                } as any;
            });

            // Fetch course fees for all unique courseIds
            const uniqueCourseIds = [...new Set(Object.values(studentCourseMap))];
            for (const cid of uniqueCourseIds) {
                try {
                    const courseDoc = await getDoc(doc(db, 'courses', cid));
                    if (courseDoc.exists()) {
                        const cData = courseDoc.data();
                        courseFees[cid] = Number(cData.feePerStudent || cData.price || 0);
                    }
                } catch { /* ignore */ }
            }

            // Apply course fee as debit (receivable) to each student node
            for (const sNode of studentNodes) {
                const courseId = studentCourseMap[sNode.id];
                if (courseId && courseFees[courseId]) {
                    sNode.debit = courseFees[courseId];
                    sNode.balance = sNode.debit;
                }
            }

            // 2. Instructors
            const instructorsSnap = await getDocs(collection(db, 'instructors'));
            const instructorNodes: COANode[] = instructorsSnap.docs.map(d => {
                const data = d.data();
                return {
                    id: d.id,
                    name: data.name || 'Unknown Instructor',
                    nameAr: data.name || 'أستاذ غير معروف',
                    code: 'I-' + d.id.substring(0, 4),
                    parentId: '202',
                    type: 'liability',
                    level: 2,
                    isLeaf: true,
                    isVirtual: true,
                    debit: 0,
                    credit: 0,
                    balance: 0
                } as any;
            });

            const allNodes = [...nodes, ...studentNodes, ...instructorNodes];

            // ── Fetch ALL vouchers and aggregate amounts ──
            const vouchersSnap = await getDocs(collection(db, 'vouchers'));

            // Map: entityType → parentAccountId in the COA tree
            const entityParentMap: Record<string, string> = {
                'student': '102',
                'instructor': '202',
                'company': '103',    // Clients
                'client': '103',
                'expense': '501',    // Operating Expenses
            };

            // Aggregate per (companyName + entityType)
            // key = companyName|entityType
            const entityBalances: Record<string, { debit: number; credit: number }> = {};

            for (const vDoc of vouchersSnap.docs) {
                const v = vDoc.data();
                const amount = Number(v.amount) || 0;
                if (amount === 0) continue;

                const entityType = v.entityType || 'company';
                const companyName = v.companyName || '';
                const voucherType = v.type; // 'receipt' or 'payment'
                const key = `${companyName}|${entityType}`;

                if (!entityBalances[key]) {
                    entityBalances[key] = { debit: 0, credit: 0 };
                }

                // Accounting logic:
                // Receipt voucher (سند قبض): we RECEIVED money
                //   → Debit Cash (asset increases), Credit the entity's account
                // Payment voucher (سند صرف): we PAID money
                //   → Credit Cash (asset decreases), Debit the entity's account
                if (voucherType === 'receipt') {
                    entityBalances[key].credit += amount;
                } else if (voucherType === 'payment') {
                    entityBalances[key].debit += amount;
                }
            }

            // Apply balances to leaf/virtual nodes
            for (const [key, bal] of Object.entries(entityBalances)) {
                const [companyName, entityType] = key.split('|');
                const parentId = entityParentMap[entityType];

                // Try to find a matching virtual node by name
                let matched = false;
                for (const node of allNodes) {
                    const isVirtual = (node as any).isVirtual;
                    if (isVirtual && node.parentId === parentId) {
                        const nodeName = node.nameAr || node.name || '';
                        if (nodeName === companyName) {
                            node.debit = (node.debit || 0) + bal.debit;
                            node.credit = (node.credit || 0) + bal.credit;
                            node.balance = (node.debit || 0) - (node.credit || 0);
                            matched = true;
                            break;
                        }
                    }
                }

                // If not matched to a virtual node, try matching a static leaf node by name
                if (!matched) {
                    for (const node of allNodes) {
                        if (!(node as any).isVirtual && node.isLeaf) {
                            const nodeName = node.nameAr || node.name || '';
                            if (nodeName === companyName) {
                                node.debit = (node.debit || 0) + bal.debit;
                                node.credit = (node.credit || 0) + bal.credit;
                                node.balance = (node.debit || 0) - (node.credit || 0);
                                matched = true;
                                break;
                            }
                        }
                    }
                }

                // If still not matched, put the amount on the parent account itself
                if (!matched && parentId) {
                    const parentNode = allNodes.find(n => n.id === parentId || n.code === parentId);
                    if (parentNode) {
                        parentNode.debit = (parentNode.debit || 0) + bal.debit;
                        parentNode.credit = (parentNode.credit || 0) + bal.credit;
                        parentNode.balance = (parentNode.debit || 0) - (parentNode.credit || 0);
                    }
                }
            }

            // ── Roll up totals from children to parents ──
            // Build a map of id → node for fast lookup
            const nodeMap = new Map<string, COANode>();
            for (const n of allNodes) nodeMap.set(n.id, n);

            // Find all leaf nodes (virtual or isLeaf) and propagate up
            // First reset all non-leaf parent debit/credit so we don't double-count
            const leafIds = new Set<string>();
            for (const n of allNodes) {
                if ((n as any).isVirtual || n.isLeaf) {
                    leafIds.add(n.id);
                }
            }

            // Collect children per parent
            const childrenMap = new Map<string, COANode[]>();
            for (const n of allNodes) {
                if (n.parentId) {
                    if (!childrenMap.has(n.parentId)) childrenMap.set(n.parentId, []);
                    childrenMap.get(n.parentId)!.push(n);
                }
            }

            // Recursive roll-up function
            const rollUp = (nodeId: string): { debit: number; credit: number } => {
                const children = childrenMap.get(nodeId) || [];
                if (children.length === 0) {
                    const node = nodeMap.get(nodeId);
                    return { debit: node?.debit || 0, credit: node?.credit || 0 };
                }

                let totalDebit = 0;
                let totalCredit = 0;

                for (const child of children) {
                    const childTotals = rollUp(child.id);
                    totalDebit += childTotals.debit;
                    totalCredit += childTotals.credit;
                }

                // Also include any direct amounts on this node itself (for unmatched entries)
                const node = nodeMap.get(nodeId);
                if (node && leafIds.has(nodeId)) {
                    // This is a leaf that also has children (shouldn't happen much) – keep its own amounts
                    totalDebit += node.debit || 0;
                    totalCredit += node.credit || 0;
                }

                if (node) {
                    node.debit = totalDebit;
                    node.credit = totalCredit;
                    node.balance = totalDebit - totalCredit;
                }

                return { debit: totalDebit, credit: totalCredit };
            };

            // Roll up from root nodes
            const rootNodes = allNodes.filter(n => n.parentId === null);
            for (const root of rootNodes) {
                rollUp(root.id);
            }

            return allNodes;
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
