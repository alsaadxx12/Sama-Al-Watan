import React from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { AlertCircle } from 'lucide-react';
import { Course } from '../hooks/useCourses';

interface DeleteCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => Promise<boolean>;
  selectedCourse: Course | null;
}

const DeleteCourseModal: React.FC<DeleteCourseModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  selectedCourse
}) => {
  const { t } = useLanguage();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const success = await onDelete();
    setIsDeleting(false);
    if (success) {
      onClose();
    }
  };

  if (!isOpen || !selectedCourse) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md mx-4 w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-red-100 rounded-xl">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-secondary-800">تأكيد الحذف</h3>
        </div>
        <div className="space-y-4">
          <p className="text-gray-600">
            هل أنت متأكد من حذف دورة {selectedCourse.name}؟
          </p>
          <div className="p-4 bg-red-50 rounded-xl border border-red-100">
            <div className="text-sm text-red-600">
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الدورة وجميع بياناتها.
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isDeleting ? 'جاري الحذف...' : t('delete')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeleteCourseModal;