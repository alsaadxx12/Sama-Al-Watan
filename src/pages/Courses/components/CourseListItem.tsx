import React from 'react';
import { BookOpen, Pencil, Trash2, MessageCircle, User, Briefcase } from 'lucide-react';
import { Course } from '../hooks/useCourses';
import { useLanguage } from '../../../contexts/LanguageContext';

interface CourseListItemProps {
  course: Course;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CourseListItem({ course, onEdit, onDelete }: CourseListItemProps) {
  const { t } = useLanguage();

  // Enhanced card styles with visual distinction
  const getCardStyles = () => {
    if (course.entityType === 'client') return { border: 'border-green-200' };
    if (course.entityType === 'expense') return { border: 'border-red-200' };
    return {
      border: course.paymentType === 'cash' ? 'border-blue-200' : 'border-amber-200'
    };
  };

  // Get icon based on entity type
  const getEntityIcon = () => {
    if (course.entityType === 'client') return <User className="w-4 h-4 text-green-600" />;
    if (course.entityType === 'expense') return <Briefcase className="w-4 h-4 text-red-600" />;
    return <BookOpen className="w-4 h-4 text-gray-600" />;
  };

  // Get color based on entity type
  const getEntityColor = () => {
    if (course.entityType === 'client') return 'bg-green-500';
    if (course.entityType === 'expense') return 'bg-red-500';
    return course.paymentType === 'cash' ? 'bg-blue-500' : 'bg-amber-500';
  };

  return (
    <div className="bg-white rounded-lg border hover:shadow-md transition-all h-[200px] flex flex-col" style={getCardStyles()}>
      {/* Top colored strip based on payment type */}
      <div className={`h-2 w-full ${getEntityColor()}`}></div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100">
              {getEntityIcon()}
            </div>
            <div>
              <h3 className="font-bold text-secondary-800 truncate max-w-[180px]">{course.name}</h3>
              <div className="flex items-center gap-3 mt-1">
                <div className="text-xs text-gray-500">
                  {course.courseId || course.id.substring(0, 8)}
                </div>
              </div>
            </div>
          </div>

          {course.entityType === 'company' && (
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${course.paymentType === 'cash'
                ? 'bg-primary-50 text-primary'
                : 'bg-primary-50 text-primary'
              }`}>
              {course.paymentType === 'cash' ? 'نقدي' : 'آجل'}
            </div>
          )}

          {course.entityType === 'client' && (
            <div className="px-2 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary">
              طالب
            </div>
          )}

          {course.entityType === 'expense' && (
            <div className="px-2 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary">
              مصروف
            </div>
          )}
        </div>

        <div className="flex-1 mt-2">
          {course.whatsAppGroupId && course.whatsAppGroupName && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary rounded-md text-xs mb-2">
              <MessageCircle className="w-3 h-3" />
              <span>واتساب</span>
            </div>
          )}

          {course.details && (
            <p className="text-xs text-gray-600 line-clamp-2 mt-2">{course.details}</p>
          )}
        </div>

        {/* Bottom section with secondary-800 background */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between bg-secondary-800 -mx-4 -mb-4 px-4 py-2">
          <div className="text-xs text-white">
            {new Date(course.createdAt).toLocaleDateString('en-GB')}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-1.5 rounded-md"
              title="تعديل"
            >
              <Pencil className="w-3.5 h-3.5" style={{ color: 'rgb(255 95 10 / var(--tw-bg-opacity))' }} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-red-600 rounded-md"
              title="حذف"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
