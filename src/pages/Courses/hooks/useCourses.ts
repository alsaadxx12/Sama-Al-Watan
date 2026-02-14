import { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, getDocs, query, doc, deleteDoc, addDoc, serverTimestamp, updateDoc, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { readExcelFile, cleanString, validateExcelFile, createCompanyTemplate, downloadFile } from '../../../lib/services/excelService';

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

export interface CourseFormData {
  name: string;
  instructorName: string;
  daysCount: string;
  maxStudents: string;
  lectureStartTime: string;
  lectureEndTime: string;
  feePerStudent: string;
  currency: 'IQD' | 'USD';
  instructorPhone: string;
  summary: string;
  paymentType: 'cash' | 'credit';
  courseId?: string;
  whatsAppGroupId?: string | null;
  whatsAppGroupName?: string | null;
  phone: string;
  website: string;
  details: string;
  entityType?: 'company' | 'client' | 'expense';
}

export default function useCourses(
  searchQuery: string,
  filterPaymentType: 'all' | 'cash' | 'credit',
  filterWhatsApp: boolean = false,
  filterEntityType: 'all' | 'company' | 'client' | 'expense' = 'all'
) {
  const { employee } = useAuth();
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [paginatedCourses, setPaginatedCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    instructorName: '',
    daysCount: '',
    maxStudents: '',
    lectureStartTime: '',
    lectureEndTime: '',
    feePerStudent: '',
    currency: 'IQD',
    instructorPhone: '',
    summary: '',
    paymentType: 'cash',
    courseId: '',
    whatsAppGroupId: null,
    whatsAppGroupName: null,
    phone: '',
    website: '',
    details: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'paymentType' | 'createdAt'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [totalCount, setTotalCount] = useState(0);

  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});

  const collectionsToFetch: { name: string, type: 'company' | 'client' | 'expense' }[] = [
    { name: 'courses', type: 'company' },
    { name: 'companies', type: 'company' },
    { name: 'clients', type: 'client' }
  ];

  const fetchData = useCallback(async (_page: number = 1, _direction: 'next' | 'prev' | 'first' = 'first') => {
    setIsLoading(true);
    setError(null);
    try {
      const collectionsToQuery = filterEntityType === 'all'
        ? collectionsToFetch
        : collectionsToFetch.filter(c => c.type === filterEntityType);

      let allDocs: Course[] = [];
      for (const coll of collectionsToQuery) {
        let q = query(collection(db, coll.name));

        // Apply filters
        if (filterPaymentType !== 'all') {
          q = query(q, where('paymentType', '==', filterPaymentType));
        }
        if (filterWhatsApp) {
          q = query(q, where('whatsAppGroupId', '!=', null));
        }

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          entityType: coll.type,
          _collectionName: coll.name,
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        } as Course));
        allDocs.push(...data);
      }

      // Client-side search
      if (searchQuery) {
        const term = searchQuery.toLowerCase();
        allDocs = allDocs.filter(c => c.name.toLowerCase().includes(term));
      }

      // Client-side sort
      allDocs.sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortBy === 'createdAt') {
          comparison = b.createdAt.getTime() - a.createdAt.getTime();
        } else {
          comparison = a.paymentType.localeCompare(b.paymentType);
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });

      setAllCourses(allDocs);
      setTotalCount(allDocs.length);
      setIsLoading(false);

      // Fetch student counts for courses in 'courses' collection
      const courseDocs = allDocs.filter(d => d._collectionName === 'courses');
      if (courseDocs.length > 0) {
        const counts: Record<string, number> = {};
        await Promise.all(courseDocs.map(async (c) => {
          try {
            const studentsRef = collection(db, 'courses', c.id, 'students');
            const snapshot = await getCountFromServer(studentsRef);
            counts[c.id] = snapshot.data().count;
          } catch {
            counts[c.id] = 0;
          }
        }));
        setStudentCounts(counts);
      }

    } catch (err) {
      console.error("Error fetching data: ", err);
      setError("فشل في تحميل البيانات");
      setIsLoading(false);
    }
  }, [searchQuery, sortBy, sortDirection, filterPaymentType, filterWhatsApp, filterEntityType]);

  useEffect(() => {
    fetchData(1, 'first');
  }, [fetchData]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return allCourses.slice(startIndex, startIndex + itemsPerPage);
  }, [allCourses, currentPage, itemsPerPage]);

  useEffect(() => {
    setPaginatedCourses(paginatedData);
  }, [paginatedData]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);


  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return false;

    setIsSubmitting(true);
    setError(null);

    try {
      const collectionName = formData.entityType === 'client' ? 'clients' :
        formData.entityType === 'expense' ? 'expenses' : 'companies';

      const courseData = {
        name: formData.name,
        instructorName: formData.instructorName || null,
        daysCount: formData.daysCount ? Number(formData.daysCount) : null,
        maxStudents: formData.maxStudents ? Number(formData.maxStudents) : null,
        lectureStartTime: formData.lectureStartTime || null,
        lectureEndTime: formData.lectureEndTime || null,
        feePerStudent: formData.feePerStudent ? Number(formData.feePerStudent) : null,
        currency: formData.currency || 'IQD',
        instructorPhone: formData.instructorPhone || null,
        summary: formData.summary || null,
        paymentType: formData.paymentType,
        courseId: formData.courseId || null,
        whatsAppGroupId: formData.whatsAppGroupId || null,
        whatsAppGroupName: formData.whatsAppGroupName || null,
        phone: formData.phone || null,
        website: formData.website || null,
        details: formData.details || null,
        entityType: formData.entityType || 'company',
        createdAt: serverTimestamp(),
        createdBy: employee.name,
        createdById: employee.id || ''
      };

      await addDoc(collection(db, collectionName), courseData);

      fetchData(1); // Refetch data

      setFormData({
        name: '', instructorName: '', daysCount: '', maxStudents: '',
        lectureStartTime: '', lectureEndTime: '', feePerStudent: '',
        currency: 'IQD', instructorPhone: '', summary: '',
        courseId: '', paymentType: 'cash',
        whatsAppGroupId: null, whatsAppGroupName: null,
        phone: '', website: '', details: ''
      });

      return true;
    } catch (error) {
      console.error('Error adding entity:', error);
      setError('فشل في إضافة الكيان');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const onUpdateCourse = async (id: string, updateData: any) => {
    if (!employee) return false;

    setIsSubmitting(true);
    setError(null);

    try {
      // Find the course to determine collection
      const course = allCourses.find(c => c.id === id) || selectedCourse;
      if (!course) throw new Error("Course not found");

      const collectionName = course._collectionName ||
        (course.entityType === 'client' ? 'clients' :
          course.entityType === 'expense' ? 'expenses' : 'courses');

      const courseRef = doc(db, collectionName, id);

      const finalUpdateData = {
        ...updateData,
        updatedAt: serverTimestamp(),
        updatedBy: employee.name,
        updatedById: employee.id || ''
      };

      await updateDoc(courseRef, finalUpdateData);
      fetchData(currentPage);
      return true;
    } catch (error) {
      console.error('Error updating course:', error);
      setError('فشل في تحديث البيانات');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee || !selectedCourse) return false;

    return onUpdateCourse(selectedCourse.id, {
      name: formData.name,
      instructorName: formData.instructorName || null,
      daysCount: formData.daysCount ? Number(formData.daysCount) : null,
      maxStudents: formData.maxStudents ? Number(formData.maxStudents) : null,
      lectureStartTime: formData.lectureStartTime || null,
      lectureEndTime: formData.lectureEndTime || null,
      feePerStudent: formData.feePerStudent ? Number(formData.feePerStudent) : null,
      currency: formData.currency || 'IQD',
      instructorPhone: formData.instructorPhone || null,
      summary: formData.summary || null,
      paymentType: formData.paymentType,
      whatsAppGroupId: formData.whatsAppGroupId || null,
      whatsAppGroupName: formData.whatsAppGroupName || null,
      phone: formData.phone || null,
      website: formData.website || null,
      details: formData.details || null,
      entityType: selectedCourse.entityType || 'company'
    });
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return false;

    try {
      const collectionName = selectedCourse._collectionName ||
        (selectedCourse.entityType === 'client' ? 'clients' :
          selectedCourse.entityType === 'expense' ? 'expenses' : 'courses');

      await deleteDoc(doc(db, collectionName, selectedCourse.id));

      fetchData(1);
      return true;
    } catch (error) {
      console.error('Error deleting course:', error);
      setError('فشل في حذف الدورة');
      return false;
    }
  };

  const handleFileChange = async (file: File) => {
    if (!file) return;

    setImportFile(file);
    setError(null);
    setImportPreview([]);

    try {
      const validation = validateExcelFile(file);
      if (!validation.valid) {
        setError(validation.error || 'ملف غير صالح');
        return;
      }

      const rows = await readExcelFile(file);

      if (rows.length <= 1) {
        setError('الملف فارغ أو يحتوي على عناوين فقط');
        setImportPreview([]);
        return;
      }

      const data = rows.slice(1)
        .filter(row => Array.isArray(row) && row.length >= 1)
        .map((row) => {
          const name = row[0] !== undefined ? cleanString(String(row[0])) : '';
          const id = row[1] !== undefined ? cleanString(String(row[1])) : '';
          const paymentTypeStr = row[2] !== undefined ? String(row[2]) : '';

          const paymentType = (
            paymentTypeStr.toLowerCase().includes('credit') ||
            paymentTypeStr.toLowerCase().includes('آجل') ||
            paymentTypeStr.toLowerCase().includes('اجل')
          ) ? 'credit' : 'cash';

          return { name, id, paymentType };
        });

      const validData = data.filter(item => item.name && item.name.trim().length > 0);

      if (validData.length === 0) setError('لم يتم العثور على بيانات صالحة في الملف');

      setImportPreview(data);
    } catch (error) {
      console.error('Error reading Excel file:', error);
      setError('فشل في قراءة ملف الإكسل');
    }
  };

  const handleImportCourses = async () => {
    if (!importPreview.length || !employee) return false;

    setIsImporting(true);
    setError(null);

    try {
      const importedCourses = [];

      for (const course of importPreview) {
        if (!course.name || course.name.trim().length === 0) continue;

        const cleanName = course.name.replace(/x000D/gi, '').trim();
        const cleanId = course.id ? course.id.replace(/x000D/gi, '').trim() : null;

        const courseData = {
          name: cleanName,
          companyId: cleanId,
          paymentType: course.paymentType,
          entityType: 'company',
          createdAt: serverTimestamp(),
          createdBy: employee.name,
          createdById: employee.id || ''
        };

        const docRef = await addDoc(collection(db, 'companies'), courseData);

        importedCourses.push({
          id: docRef.id,
          ...courseData,
          createdAt: new Date()
        });
      }

      fetchData(1);

      setImportSuccess(`تم استيراد ${importedCourses.length} دورة بنجاح`);
      return true;
    } catch (error) {
      console.error('Error importing courses:', error);
      setError('فشل في استيراد الدورات');
      return false;
    } finally {
      setIsImporting(false);
    }
  };

  const downloadExcelTemplate = () => {
    const template = createCompanyTemplate();
    downloadFile(template, 'courses_template.csv');
  };

  return {
    courses: allCourses,
    filteredCourses: paginatedCourses,
    isLoading,
    error,
    selectedCourse,
    setSelectedCourse,
    formData,
    setFormData,
    isSubmitting,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    paginatedCourses, // Keep this for backward compatibility
    handleAddCourse: handleAddCompany,
    handleEditCourse,
    handleDeleteCourse,
    importFile,
    setImportFile,
    importPreview,
    setImportPreview,
    isImporting,
    importSuccess,
    handleImportCourses,
    downloadExcelTemplate,
    handleFileChange,
    onUpdateCourse,
    fetchData,
    studentCounts
  };
}
