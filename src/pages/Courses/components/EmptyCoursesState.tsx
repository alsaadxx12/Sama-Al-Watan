import React from 'react';
import { BookOpen, Search, Filter, Plus, User, Briefcase } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface EmptyCoursesStateProps {
  searchQuery: string;
  filterPaymentType: 'all' | 'cash' | 'credit';
  setSearchQuery: (query: string) => void;
  setFilterPaymentType: (type: 'all' | 'cash' | 'credit') => void;
  filterEntityType: 'all' | 'company' | 'client' | 'expense';
  setFilterEntityType: (type: 'all' | 'company' | 'client' | 'expense') => void;
}

export default function EmptyCoursesState({
  searchQuery,
  filterPaymentType,
  setSearchQuery,
  setFilterPaymentType,
  filterEntityType,
  setFilterEntityType
}: EmptyCoursesStateProps) {
  const { t } = useLanguage();
  const isFiltered = searchQuery || filterPaymentType !== 'all' || filterEntityType !== 'all';

  // Get icon based on entity type filter
  const getEntityIcon = () => {
    if (filterEntityType === 'client') return <User className="w-12 h-12 text-gray-400" />;
    if (filterEntityType === 'expense') return <Briefcase className="w-12 h-12 text-gray-400" />;
    return <BookOpen className="w-12 h-12 text-gray-400" />;
  };

  return (
    <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
      <div className="w-full">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gray-50 rounded-full shadow-sm">
            {getEntityIcon()}
          </div>
        </div>
        <h3 className="text-xl font-semibold text-secondary-800 mb-2">
          {isFiltered ? 'لا توجد نتائج مطابقة' :
            filterEntityType === 'company' ? 'لا يوجد دورات' :
              filterEntityType === 'client' ? 'لا يوجد طلاب' :
                filterEntityType === 'expense' ? 'لا يوجد مصاريف' :
                  'لا يوجد بيانات'}
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          {isFiltered
            ? 'لم يتم العثور على أي بيانات تطابق معايير البحث. حاول تغيير كلمات البحث أو الفلتر.'
            : filterEntityType === 'company' ? 'لم يتم العثور على أي دورات. قم بإضافة دورة جديدة للبدء.' :
              filterEntityType === 'client' ? 'لم يتم العثور على أي طلاب. قم بإضافة طالب جديد للبدء.' :
                filterEntityType === 'expense' ? 'لم يتم العثور على أي مصاريف. قم بإضافة مصروف جديد للبدء.' :
                  'لم يتم العثور على أي بيانات. قم بإضافة دورة أو طالب أو مصروف جديد للبدء.'}
        </p>

        {isFiltered ? (
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterPaymentType('all');
              setFilterEntityType('all');
            }}
            className="mt-4 px-4 py-2 text-primary bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors font-medium"
          >
            مسح البحث والفلتر
          </button>
        ) : (
          null
        )}
      </div>
    </div>
  );
}