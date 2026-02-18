import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { BookOpen, Phone, X, Sparkles, Clock, Users, DollarSign, Calendar, User, FileText, ImagePlus, Trash2, Tag, Plus, Settings } from 'lucide-react';
import { CourseFormData } from '../hooks/useCourses';
import { useAuth } from '../../../contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db, storage } from '../../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ModernModal from '../../../components/ModernModal';
import ModernButton from '../../../components/ModernButton';
import { useTheme } from '../../../contexts/ThemeContext';
import ManageCategoriesModal from './ManageCategoriesModal';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData?: CourseFormData;
  setFormData?: React.Dispatch<React.SetStateAction<CourseFormData>>;
  isSubmitting: boolean;
  onSubmit?: (e: React.FormEvent) => Promise<boolean>;
  onCourseAdded?: (course: any) => void;
}

const formatNumber = (value: string): string => {
  const num = value.replace(/[^0-9]/g, '');
  if (!num) return '';
  return Number(num).toLocaleString('en-US');
};

const parseNumber = (value: string): string => {
  return value.replace(/[^0-9]/g, '');
};

const compressImage = async (file: File, maxWidth = 1000, maxHeight = 1000, quality = 0.7): Promise<{ blob: Blob, dataUrl: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        canvas.toBlob((blob) => {
          if (blob) resolve({ blob, dataUrl });
          else reject(new Error('Canvas to Blob failed'));
        }, 'image/jpeg', quality);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

const AddCourseModal: React.FC<AddCourseModalProps> = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  isSubmitting,
  onSubmit,
  onCourseAdded
}) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { employee } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [localFormData, setLocalFormData] = React.useState<CourseFormData>({
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
  const [localIsSubmitting, setLocalIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [categories, setCategories] = React.useState<{ id: string; name: string }[]>([]);
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [showNewCategory, setShowNewCategory] = React.useState(false);
  const [showManageCategories, setShowManageCategories] = React.useState(false);

  // Fetch categories
  React.useEffect(() => {
    const unsub = onSnapshot(collection(db, 'course_categories'), snap => {
      setCategories(snap.docs.map(d => ({ id: d.id, name: d.data().name })));
    });
    return () => unsub();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await addDoc(collection(db, 'course_categories'), { name: newCategoryName.trim(), createdAt: serverTimestamp() });
      actualSetFormData(prev => ({ ...prev, category: newCategoryName.trim() }));
      setNewCategoryName('');
      setShowNewCategory(false);
    } catch (err) {
      console.error('Error adding category:', err);
    }
  };

  const actualFormData = formData || localFormData;
  const actualSetFormData = setFormData || setLocalFormData;

  React.useEffect(() => {
    if (!isOpen) {
      setLocalFormData({
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
      setImageFile(null);
      setImagePreview(null);
      setError(null);
      setSuccess(null);
      setShowNewCategory(false);
      setNewCategoryName('');
    }
  }, [isOpen]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار ملف صورة صالح');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };



  const handleLocalSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!employee) {
      setError('لم يتم العثور على بيانات الموظف');
      return;
    }

    setLocalIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (!actualFormData.name.trim()) {
        throw new Error('يرجى إدخال اسم الدورة');
      }
      if (!actualFormData.instructorName.trim()) {
        throw new Error('يرجى إدخال اسم أستاذ الدورة');
      }

      const coursesRef = collection(db, 'courses');
      const q = query(coursesRef, where('name', '==', actualFormData.name.trim()));
      const existingCourses = await getDocs(q);

      if (!existingCourses.empty) {
        throw new Error('يوجد دورة بهذا الاسم بالفعل');
      }

      // Process image if selected
      let imageUrl: string | null = null;
      if (imageFile) {
        try {
          // 1. Compress image locally first to be safe
          const { blob, dataUrl: compressedDataUrl } = await compressImage(imageFile);

          // 2. Try uploading to Firebase Storage with sanitized name
          try {
            const sanitizedName = imageFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
            const fileName = `${Date.now()}_${sanitizedName}`;
            const storageRef = ref(storage, `courses/${fileName}`);
            const uploadSnapshot = await uploadBytes(storageRef, blob);
            imageUrl = await getDownloadURL(uploadSnapshot.ref);
          } catch (storageError: any) {
            console.warn('Storage upload failed (possibly permissions), falling back to compressed Base64:', storageError);

            // 3. Fallback to compressed Base64 if Storage fails
            // compressedDataUrl is dynamic and usually < 500KB after compression
            if (compressedDataUrl.length < 1048487) {
              imageUrl = compressedDataUrl;
            } else {
              throw new Error('الصورة كبيرة جداً حتى بعد الضغط، يرجى اختيار صورة أصغر.');
            }
          }
        } catch (error: any) {
          console.error('Image processing failed:', error);
          throw new Error('فشل معالجة الصورة. يرجى المحاولة مرة أخرى.');
        }
      } else if (imagePreview && imagePreview.startsWith('http')) {
        imageUrl = imagePreview;
      }

      const courseData = {
        name: actualFormData.name.trim(),
        instructorName: actualFormData.instructorName.trim(),
        daysCount: actualFormData.daysCount ? Number(actualFormData.daysCount) : null,
        maxStudents: actualFormData.maxStudents ? Number(actualFormData.maxStudents) : null,
        lectureStartTime: actualFormData.lectureStartTime || null,
        lectureEndTime: actualFormData.lectureEndTime || null,
        feePerStudent: actualFormData.feePerStudent ? Number(actualFormData.feePerStudent) : null,
        currency: actualFormData.currency || 'IQD',
        instructorPhone: actualFormData.instructorPhone || null,
        summary: actualFormData.summary || null,
        imageUrl: imageUrl,
        paymentType: actualFormData.paymentType,
        phone: actualFormData.phone || null,
        website: actualFormData.website || null,
        details: actualFormData.details || null,
        createdAt: serverTimestamp(),
        createdBy: employee.name,
        createdById: employee.id || '',
        entityType: 'company',
        category: actualFormData.category || null
      };

      const docRef = await addDoc(coursesRef, courseData);

      setSuccess('تم إضافة الدورة بنجاح');

      if (onCourseAdded) {
        onCourseAdded({
          id: docRef.id,
          ...courseData,
          createdAt: new Date()
        });
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Error adding course:', error);
      setError(error instanceof Error ? error.message : 'فشل في إضافة الدورة');
    } finally {
      setLocalIsSubmitting(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (onSubmit) {
      const successResult = await onSubmit(e!);
      if (successResult) {
        onClose();
      }
    }
    else {
      await handleLocalSubmit(e);
    }
  };

  const isDark = theme === 'dark';
  const inputBase = `w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all text-sm font-bold text-center ${isDark
    ? 'bg-gray-900/60 border-gray-700/60 text-white placeholder-gray-600 focus:border-blue-500/60'
    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500/60 shadow-sm'
    }`;

  return (
    <>
      <ModernModal
        isOpen={isOpen}
        onClose={onClose}
        title="إضافة دورة جديدة"
        description="قم بتعبئة بيانات الدورة التدريبية"
        icon={<BookOpen className="w-8 h-8" />}
        iconColor="blue"
        size="xl"
        footer={
          <div className="flex items-center justify-end gap-3 px-1">
            <ModernButton
              type="button"
              variant="secondary"
              onClick={onClose}
              className="px-8 py-3.5"
            >
              {t('cancel')}
            </ModernButton>
            <ModernButton
              type="submit"
              variant="primary"
              loading={isSubmitting || localIsSubmitting}
              onClick={() => handleSubmit()}
              className="px-12 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              إضافة الدورة
            </ModernButton>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
          {/* Messages */}
          {(error || success) && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              {error && (
                <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${isDark ? 'bg-red-900/30 border-red-700/50 text-red-100' : 'bg-red-50 border-red-100 text-red-700'}`}>
                  <div className="p-1.5 bg-red-500/20 rounded-lg"><X className="w-4 h-4 text-red-500" /></div>
                  <span className="font-bold text-sm">{error}</span>
                </div>
              )}
              {success && (
                <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${isDark ? 'bg-emerald-900/30 border-emerald-700/50 text-emerald-100' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                  <div className="p-1.5 bg-emerald-500/20 rounded-lg"><Sparkles className="w-4 h-4 text-emerald-500" /></div>
                  <span className="font-bold text-sm">{success}</span>
                </div>
              )}
            </div>
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* ===== Right Column ===== */}
            <div className="space-y-4">
              {/* Image Upload */}
              <div className="space-y-1.5">
                <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <ImagePlus className="w-3.5 h-3.5" /> صورة الدورة
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                {imagePreview ? (
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="معاينة"
                      className="w-full h-36 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all rounded-xl flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2.5 bg-white/90 rounded-xl hover:bg-white transition-all"
                      >
                        <ImagePlus className="w-5 h-5 text-blue-600" />
                      </button>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="p-2.5 bg-white/90 rounded-xl hover:bg-white transition-all"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.01] ${isDark
                      ? 'border-gray-700 bg-gray-900/40 hover:border-blue-500/50 hover:bg-blue-500/5'
                      : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50'
                      }`}
                  >
                    <ImagePlus className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                    <span className={`text-xs font-bold ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>اضغط لاختيار صورة</span>
                  </button>
                )}
              </div>

              {/* Course Name */}
              <div className="space-y-1.5">
                <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <BookOpen className="w-3.5 h-3.5" /> اسم الدورة <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={actualFormData.name}
                  onChange={(e) => actualSetFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="دورة المحاسبة المتقدمة"
                  required
                  className={inputBase}
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Tag className="w-3.5 h-3.5" /> تصنيف الدورة
                </label>
                {showNewCategory ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="اسم التصنيف الجديد"
                      className={inputBase}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
                    />
                    <button type="button" onClick={handleAddCategory} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shrink-0">
                      إضافة
                    </button>
                    <button type="button" onClick={() => setShowNewCategory(false)} className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <select
                      value={actualFormData.category || ''}
                      onChange={(e) => actualSetFormData(prev => ({ ...prev, category: e.target.value }))}
                      className={inputBase}
                    >
                      <option value="">بدون تصنيف</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => setShowNewCategory(true)} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shrink-0">
                      <Plus className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setShowManageCategories(true)} className={`p-3 rounded-xl transition-all shrink-0 ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`} title="إدارة التصنيفات">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Instructor Name */}
              <div className="space-y-1.5">
                <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <User className="w-3.5 h-3.5" /> أستاذ الدورة <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={actualFormData.instructorName}
                  onChange={(e) => actualSetFormData(prev => ({ ...prev, instructorName: e.target.value }))}
                  placeholder="اسم المحاضر"
                  required
                  className={inputBase}
                />
              </div>

              {/* Days & Max Students */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Calendar className="w-3.5 h-3.5" /> عدد الأيام
                  </label>
                  <input
                    type="number"
                    value={actualFormData.daysCount}
                    onChange={(e) => actualSetFormData(prev => ({ ...prev, daysCount: e.target.value }))}
                    placeholder="30"
                    className={inputBase}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Users className="w-3.5 h-3.5" /> الحد الأقصى للطلبة
                  </label>
                  <input
                    type="number"
                    value={actualFormData.maxStudents}
                    onChange={(e) => actualSetFormData(prev => ({ ...prev, maxStudents: e.target.value }))}
                    placeholder="25"
                    className={inputBase}
                  />
                </div>
              </div>

              {/* Lecture Times */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Clock className="w-3.5 h-3.5" /> من الساعة
                  </label>
                  <input
                    type="time"
                    value={actualFormData.lectureStartTime}
                    onChange={(e) => actualSetFormData(prev => ({ ...prev, lectureStartTime: e.target.value }))}
                    className={inputBase}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Clock className="w-3.5 h-3.5" /> إلى الساعة
                  </label>
                  <input
                    type="time"
                    value={actualFormData.lectureEndTime}
                    onChange={(e) => actualSetFormData(prev => ({ ...prev, lectureEndTime: e.target.value }))}
                    className={inputBase}
                  />
                </div>
              </div>
            </div>

            {/* ===== Left Column ===== */}
            <div className="space-y-4">
              {/* Fee - Large Field */}
              <div className="space-y-1.5">
                <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <DollarSign className="w-3.5 h-3.5" /> مبلغ الدورة للطالب الواحد
                </label>
                <input
                  type="text"
                  value={formatNumber(actualFormData.feePerStudent)}
                  onChange={(e) => actualSetFormData(prev => ({ ...prev, feePerStudent: parseNumber(e.target.value) }))}
                  placeholder="500,000"
                  className={`w-full px-5 py-5 rounded-xl border-2 focus:outline-none transition-all text-2xl font-black text-center tracking-wider ${isDark
                    ? 'bg-gray-900/60 border-gray-700/60 text-white placeholder-gray-600 focus:border-emerald-500/60'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500/60 shadow-sm'
                    }`}
                />
              </div>

              {/* Currency Toggle */}
              <div className="space-y-1.5">
                <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  العملة
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => actualSetFormData(prev => ({ ...prev, currency: 'IQD' }))}
                    className={`py-3 rounded-xl border-2 font-black text-base transition-all duration-200 ${actualFormData.currency === 'IQD'
                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                      : isDark ? 'border-gray-700 bg-gray-900/40 text-gray-400 hover:border-gray-600' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}
                  >
                    IQD
                  </button>
                  <button
                    type="button"
                    onClick={() => actualSetFormData(prev => ({ ...prev, currency: 'USD' }))}
                    className={`py-3 rounded-xl border-2 font-black text-base transition-all duration-200 ${actualFormData.currency === 'USD'
                      ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : isDark ? 'border-gray-700 bg-gray-900/40 text-gray-400 hover:border-gray-600' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}
                  >
                    USD
                  </button>
                </div>
              </div>

              {/* Instructor Phone */}
              <div className="space-y-1.5">
                <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Phone className="w-3.5 h-3.5" /> رقم هاتف الأستاذ
                </label>
                <input
                  type="tel"
                  value={actualFormData.instructorPhone}
                  onChange={(e) => actualSetFormData(prev => ({ ...prev, instructorPhone: e.target.value }))}
                  placeholder="0770 000 0000"
                  className={inputBase}
                />
              </div>

              {/* Summary */}
              <div className="space-y-1.5">
                <label className={`flex items-center gap-1.5 text-xs font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <FileText className="w-3.5 h-3.5" /> ملخص الدورة والشهادات
                </label>
                <textarea
                  value={actualFormData.summary}
                  onChange={(e) => actualSetFormData(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="ملخص عن محتوى الدورة والشهادات المقدمة..."
                  rows={5}
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all text-sm font-bold text-center resize-none ${isDark
                    ? 'bg-gray-900/60 border-gray-700/60 text-white placeholder-gray-600 focus:border-blue-500/60'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500/60 shadow-sm'
                    }`}
                />
              </div>
            </div>
          </div>
        </form>
      </ModernModal>
      <ManageCategoriesModal isOpen={showManageCategories} onClose={() => setShowManageCategories(false)} />
    </>
  );
};

export default AddCourseModal;
