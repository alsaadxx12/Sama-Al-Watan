import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { getCountFromServer } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export interface FeaturedInstructor {
  name: string;
  totalStudents: number;
  coursesCount: number;
  courses: Array<{
    id: string;
    name: string;
    studentCount: number;
  }>;
}

export default function useFeaturedInstructor() {
  const [instructor, setInstructor] = useState<FeaturedInstructor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedInstructor = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get all courses
        const coursesRef = collection(db, 'courses');
        const coursesSnapshot = await getDocs(coursesRef);
        
        // Collect instructor statistics
        const instructorStats = new Map<string, {
          name: string;
          totalStudents: number;
          courses: Array<{
            id: string;
            name: string;
            studentCount: number;
          }>;
        }>();
        
        for (const courseDoc of coursesSnapshot.docs) {
          const courseData = courseDoc.data();
          const instructorName = courseData.instructorName;
          
          if (!instructorName || instructorName.trim().length === 0) {
            continue;
          }
          
          try {
            // Get student count for this course
            const studentsRef = collection(db, 'courses', courseDoc.id, 'students');
            const studentsSnapshot = await getCountFromServer(studentsRef);
            const studentCount = studentsSnapshot.data().count;
            
            // Only consider courses with students
            if (studentCount > 0) {
              const existing = instructorStats.get(instructorName) || {
                name: instructorName,
                totalStudents: 0,
                courses: []
              };
              
              existing.totalStudents += studentCount;
              existing.courses.push({
                id: courseDoc.id,
                name: courseData.name || 'غير مسمى',
                studentCount
              });
              
              instructorStats.set(instructorName, existing);
            }
          } catch (err) {
            console.warn(`Failed to get students for course ${courseDoc.id}:`, err);
          }
        }

        // Find the instructor with most students
        if (instructorStats.size > 0) {
          const featuredInstructor = Array.from(instructorStats.values())
            .sort((a, b) => b.totalStudents - a.totalStudents)[0];
          
          setInstructor({
            name: featuredInstructor.name,
            totalStudents: featuredInstructor.totalStudents,
            coursesCount: featuredInstructor.courses.length,
            courses: featuredInstructor.courses.sort((a, b) => b.studentCount - a.studentCount)
          });
        } else {
          setInstructor(null);
        }
        
      } catch (err) {
        console.error('Error fetching featured instructor:', err);
        setError('فشل في تحميل الأستاذ المتميز');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedInstructor();
  }, []);

  return { instructor, isLoading, error };
}