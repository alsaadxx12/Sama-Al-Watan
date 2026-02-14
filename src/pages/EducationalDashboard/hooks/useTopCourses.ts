import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { getCountFromServer } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export interface TopCourse {
  id: string;
  name: string;
  instructorName?: string;
  studentCount: number;
  maxStudents?: number;
  feePerStudent?: number;
  currency?: string;
  enrollmentRate: number;
  imageUrl?: string;
  _collectionName: string;
}

export default function useTopCourses(limit: number = 5) {
  const [courses, setCourses] = useState<TopCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get courses from main courses collection
        const coursesRef = collection(db, 'courses');
        const coursesSnapshot = await getDocs(coursesRef);

        const coursesData: TopCourse[] = [];

        for (const courseDoc of coursesSnapshot.docs) {
          const courseData = courseDoc.data();

          try {
            // Get student count for this course
            const studentsRef = collection(db, 'courses', courseDoc.id, 'students');
            const studentsSnapshot = await getCountFromServer(studentsRef);
            const studentCount = studentsSnapshot.data().count;

            // Calculate enrollment rate
            const maxStudents = courseData.maxStudents || 0;
            const enrollmentRate = maxStudents > 0 ? (studentCount / maxStudents) * 100 : 0;

            coursesData.push({
              id: courseDoc.id,
              name: courseData.name || 'غير مسمى',
              instructorName: courseData.instructorName || 'غير محدد',
              studentCount,
              maxStudents,
              feePerStudent: courseData.feePerStudent,
              currency: courseData.currency || 'IQD',
              enrollmentRate,
              imageUrl: courseData.imageUrl || '',
              _collectionName: 'courses'
            });
          } catch (err) {
            console.warn(`Failed to get students for course ${courseDoc.id}:`, err);
            // Add course with zero students if error
            coursesData.push({
              id: courseDoc.id,
              name: courseData.name || 'غير مسمى',
              instructorName: courseData.instructorName || 'غير محدد',
              studentCount: 0,
              maxStudents: courseData.maxStudents,
              feePerStudent: courseData.feePerStudent,
              currency: courseData.currency || 'IQD',
              enrollmentRate: 0,
              imageUrl: courseData.imageUrl || '',
              _collectionName: 'courses'
            });
          }
        }

        // Sort by student count and limit
        const topCourses = coursesData
          .sort((a, b) => b.studentCount - a.studentCount)
          .slice(0, limit);

        setCourses(topCourses);
      } catch (err) {
        console.error('Error fetching top courses:', err);
        setError('فشل في تحميل أفضل الدورات');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopCourses();
  }, [limit]);

  return { courses, isLoading, error };
}