import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { BookOpen, Plus, FileSpreadsheet, User, Briefcase, ChevronDown } from 'lucide-react';

interface CoursesHeaderProps {
  setIsAddModalOpen: () => void;
  setIsImportModalOpen: (isOpen: boolean) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  showAddMenu: boolean;
  setShowAddMenu: (show: boolean) => void;
  setAddEntityType: (type: 'company' | 'client' | 'expense') => void;
  setIsAddCourseModalOpen: (isOpen: boolean) => void;
  setIsAddClientModalOpen: (isOpen: boolean) => void;
  setIsAddExpenseModalOpen: (isOpen: boolean) => void;
}

export default function CoursesHeader({
  setIsAddModalOpen,
  setIsImportModalOpen,
  searchQuery,
  setSearchQuery,
  showAddMenu,
  setShowAddMenu,
  setAddEntityType,
  setIsAddCourseModalOpen,
  setIsAddClientModalOpen,
  setIsAddExpenseModalOpen
}: CoursesHeaderProps) {
  const { t } = useLanguage();

  return (
    <div className="p-6 border-b border-gray-200 bg-gray-50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-secondary-50 rounded-xl">
            <BookOpen className="w-6 h-6 text-secondary-800" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-secondary-800">سجل الدورات</h2>
            <p className="text-sm text-gray-600 mt-1">إدارة الدورات والطلاب والمصاريف</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-600 transition-all shadow-sm font-medium text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>استيراد من إكسل</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg shadow-sm font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة جديد</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showAddMenu ? 'rotate-180' : ''}`} />
            </button>

            {showAddMenu && (
              <div className="absolute left-0 mt-2 w-48 bg-gray-50 rounded-lg shadow-lg border border-gray-200 z-50 animate-fadeIn">
                <button
                  onClick={() => {
                    setAddEntityType('company');
                    setIsAddCourseModalOpen(true);
                    setShowAddMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-gray-700 hover:bg-primary-50 hover:text-primary transition-colors text-sm text-right rounded-t-lg"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>إضافة دورة</span>
                </button>
                <button
                  onClick={() => {
                    setAddEntityType('client');
                    setIsAddClientModalOpen(true);
                    setShowAddMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-gray-700 hover:bg-primary-50 hover:text-primary transition-colors text-sm text-right"
                >
                  <User className="w-4 h-4" />
                  <span>إضافة طالب</span>
                </button>
                <button
                  onClick={() => {
                    setAddEntityType('expense');
                    setIsAddExpenseModalOpen(true);
                    setShowAddMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-gray-700 hover:bg-primary-50 hover:text-primary transition-colors text-sm text-right rounded-b-lg"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>إضافة مصروف</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
