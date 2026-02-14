import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  getCountFromServer,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface EducationStats {
  totalCourses: number;
  totalStudentsInCourses: number;
  totalStudentsInInstitution: number;
  totalInstructors: number;
  isLoading: boolean;
  error: string | null;
}

export interface Course {
  id: string;
  name: string;
  instructorName?: string;
  daysCount?: number;
  maxStudents?: number;
  lectureStartTime?: string;
  lectureEndTime?: string;
  feePerStudent?: number;
  currency?: 'IQD' | 'USD';
  instructorPhone?: string;
  summary?: string;
  imageUrl?: string;
  paymentType: 'cash' | 'credit';
  phone?: string;
  website?: string;
  isVerified?: boolean;
  isFeatured?: boolean;
  details?: string;
  companyId?: string;
  whatsAppGroupId?: string;
  whatsAppGroupName?: string;
  entityType?: 'company' | 'client' | 'expense';
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  _collectionName?: string;
}

export interface Employee {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  salary: number;
  isActive: boolean;
  departmentId?: string;
  branchId?: string;
}

export function useEducationStats() {
  const [stats, setStats] = useState<EducationStats>({
    totalCourses: 0,
    totalStudentsInCourses: 0,
    totalStudentsInInstitution: 0,
    totalInstructors: 0,
    isLoading: true,
    error: null
  });

  const collectionsToFetch = [
    { name: 'courses', type: 'course' }
  ];

  const instructorRoles = ['super_admin', 'admin', 'instructor', 'teacher', 'مدرس', 'أستاذ'];

  useEffect(() => {
    const fetchEducationStats = async () => {
      try {
        // 1. Fetch all courses from different collections
        let allCourses: Course[] = [];

        for (const coll of collectionsToFetch) {
          const snapshot = await getDocs(collection(db, coll.name));
          const courses = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            _collectionName: coll.name
          } as Course));
          allCourses.push(...courses);
        }

        // 2. Calculate total courses
        const totalCourses = allCourses.length;

        // 3. Fetch student counts for each course
        let totalStudentsInCourses = 0;
        const coursesWithStudentCounts = await Promise.all(
          allCourses.map(async (course) => {
            try {
              // Only count students for courses in the 'courses' collection that have students subcollection
              if (course._collectionName === 'courses') {
                const studentsRef = collection(db, 'courses', course.id, 'students');
                const studentSnapshot = await getCountFromServer(studentsRef);
                const studentCount = studentSnapshot.data().count;
                totalStudentsInCourses += studentCount;
                return {
                  ...course,
                  studentCount
                };
              } else {
                return {
                  ...course,
                  studentCount: 0
                };
              }
            } catch (err) {
              console.warn(`Failed to count students for course ${course.id}:`, err);
              return {
                ...course,
                studentCount: 0
              };
            }
          })
        );

        // 4. For now, students in courses = total students in institution
        // This can be enhanced later with a separate students collection
        const totalStudentsInInstitution = totalStudentsInCourses;

        // 5. Fetch instructors count
        // Method 1: Count employees with instructor roles
        let totalInstructors = 0;
        try {
          const instructorQueries = instructorRoles.map(role =>
            query(
              collection(db, 'employees'),
              where('role', '==', role),
              where('isActive', '==', true)
            )
          );

          const instructorCounts = await Promise.all(
            instructorQueries.map(q => getCountFromServer(q))
          );

          totalInstructors = instructorCounts.reduce((total, count) =>
            total + count.data().count, 0
          );
        } catch (err) {
          console.warn('Failed to count instructors by role:', err);
          // Fallback: Count unique instructor names from courses
          const uniqueInstructors = new Set(
            allCourses
              .map(course => course.instructorName)
              .filter(name => name && name.trim().length > 0)
          );
          totalInstructors = uniqueInstructors.size;
        }

        setStats({
          totalCourses,
          totalStudentsInCourses,
          totalStudentsInInstitution,
          totalInstructors,
          isLoading: false,
          error: null
        });

      } catch (err) {
        console.error('Error fetching education stats:', err);
        setStats(prev => ({
          ...prev,
          isLoading: false,
          error: 'فشل في تحميل الإحصائيات التعليمية'
        }));
      }
    };

    fetchEducationStats();
  }, []);

  return stats;
}