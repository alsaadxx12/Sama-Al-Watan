import { useState, useEffect } from 'react';
import { collection, collectionGroup, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export interface CourseEnrollment {
    courseId: string;
    courseName: string;
    courseFee: number;
    currency: string;
}

export interface Company {
    id: string;
    name: string;
    entityType?: 'company' | 'client' | 'expense' | 'student' | 'instructor';
    whatsAppGroupId?: string | null;
    whatsAppGroupName?: string | null;
    phone?: string;
    enrollments?: CourseEnrollment[];
}

export interface Safe {
    id: string;
    name: string;
}

export default function useVoucherData(isOpen: boolean) {
    const [safes, setSafes] = useState<Safe[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!isOpen) return;
            setIsLoading(true);
            setError(null);

            try {
                // Fetch Safes
                const safesSnapshot = await getDocs(collection(db, 'safes'));
                const safesData = safesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name
                }));
                setSafes(safesData);

                // Fetch Companies, Clients, Expenses, Instructors
                const collectionsToFetch = [
                    { name: 'companies', type: 'company' },
                    { name: 'clients', type: 'client' },
                    { name: 'expenses', type: 'expense' },
                    { name: 'instructors', type: 'instructor' }
                ];

                let allEntities: Company[] = [];

                for (const coll of collectionsToFetch) {
                    const snapshot = await getDocs(collection(db, coll.name));
                    const entities = snapshot.docs.map(doc => ({
                        id: doc.id,
                        name: doc.data().name,
                        phone: doc.data().phone || '',
                        whatsAppGroupId: doc.data().whatsAppGroupId || null,
                        whatsAppGroupName: doc.data().whatsAppGroupName || null,
                        entityType: coll.type as any
                    }));
                    allEntities = [...allEntities, ...entities];
                }

                // Fetch Students and their enrollments
                try {
                    const studentsSnapshot = await getDocs(collectionGroup(db, 'students'));
                    const tempStudentMap = new Map<string, Company>();
                    const courseCache = new Map<string, string>();

                    for (const studentDoc of studentsSnapshot.docs) {
                        const data = studentDoc.data();
                        const studentName = data.name || data.studentName || '';
                        if (!studentName) continue;

                        const courseRef = studentDoc.ref.parent.parent;
                        let courseName = 'دورة غير معروفة';
                        let courseId = '';

                        if (courseRef) {
                            courseId = courseRef.id;
                            if (courseCache.has(courseId)) {
                                courseName = courseCache.get(courseId)!;
                            } else {
                                const courseDoc = await getDoc(courseRef);
                                if (courseDoc.exists()) {
                                    courseName = courseDoc.data().name || 'دورة غير معروفة';
                                    courseCache.set(courseId, courseName);
                                }
                            }
                        }

                        const enrollment: CourseEnrollment = {
                            courseId,
                            courseName,
                            courseFee: data.courseFee || 0,
                            currency: data.currency || 'IQD'
                        };

                        const existing = tempStudentMap.get(studentName);
                        if (existing) {
                            if (existing.enrollments && !existing.enrollments.find(e => e.courseId === courseId)) {
                                existing.enrollments.push(enrollment);
                            }
                        } else {
                            tempStudentMap.set(studentName, {
                                id: studentName,
                                name: studentName,
                                phone: data.phone || '',
                                entityType: 'student',
                                enrollments: [enrollment]
                            });
                        }
                    }
                    allEntities = [...allEntities, ...Array.from(tempStudentMap.values())];
                } catch (studentErr) {
                    console.warn('Could not fetch students:', studentErr);
                }

                setCompanies(allEntities);
            } catch (err: any) {
                console.error('Error fetching voucher data:', err);
                setError(err.message || 'فشل تحميل البيانات');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [isOpen]);

    return { safes, companies, isLoading, error };
}
