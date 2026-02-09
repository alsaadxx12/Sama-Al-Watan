import { collection, doc, setDoc, getDocs, limit, query, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../firebase';

export const isSystemEmpty = async () => {
    try {
        const q = query(collection(db, 'employees'), limit(1));
        const snapshot = await getDocs(q);
        return snapshot.empty;
    } catch (error) {
        console.error('Error checking if system is empty:', error);
        return false;
    }
};

export const initializeSuperAdmin = async (email: string, password: string, name: string) => {
    try {
        // 1. Create the Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // 2. Create the "Super Admin" permission group
        const adminRoleRef = doc(db, 'permissions', 'super_admin');
        await setDoc(adminRoleRef, {
            name: 'مدير النظام (Super Admin)',
            permissions: {
                isAdmin: true,
                accounts: ['view', 'add', 'edit', 'delete', 'confirm', 'settlement', 'currency'],
                companies: ['view', 'add', 'edit', 'delete'],
                employees: ['view', 'add', 'edit', 'delete'],
                safes: ['view', 'add', 'edit', 'delete'],
                tickets: ['view', 'add', 'edit', 'delete'],
                audit: ['view', 'add', 'edit', 'delete'],
                settings: ['view', 'edit'],
                dashboard: ['view'],
                reports: ['view'],
                branches: ['view', 'add', 'edit', 'delete'],
                leaves: ['view', 'add', 'edit', 'delete', 'approve']
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // 3. Create the Employee record
        const employeeRef = doc(db, 'employees', uid);
        await setDoc(employeeRef, {
            userId: uid,
            name: name,
            email: email,
            role: 'super_admin',
            salary: 0,
            startDate: new Date(),
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return { success: true };
    } catch (error: any) {
        console.error('Initialization error:', error);
        throw new Error(error.message || 'فشل في تهيئة النظام');
    }
};
