import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useTheme } from '../../contexts/ThemeContext';
import {
  BookOpen, Plus, Sparkles, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CoursesGrid from './components/CoursesGrid';
import CourseFilters from './components/CourseFilters';
import AddStudentModal from './components/AddStudentModal';
import AddInstructorModal from './components/AddInstructorModal';
import InstructorsTab from './components/InstructorsTab';

import NewEditCourseModal from './components/NewEditCourseModal';
import DeleteCourseModal from './components/DeleteCourseModal';
import ImportCoursesModal from './components/ImportCoursesModal';

import EmptyCoursesState from './components/EmptyCoursesState';
import useCourses from './hooks/useCourses';

const Courses = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPaymentType, setFilterPaymentType] = useState<'all' | 'cash' | 'credit'>('all');
  const [filterWhatsApp, setFilterWhatsApp] = useState(false);
  const [filterEntityType, setFilterEntityType] = useState<'all' | 'company' | 'client' | 'expense'>('all');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [gridView, setGridView] = useState<'grid' | 'compact' | 'list'>('grid');
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [studentEnrollCourse, setStudentEnrollCourse] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'courses' | 'instructors'>('courses');
  const [isAddInstructorModalOpen, setIsAddInstructorModalOpen] = useState(false);
  const [instructorRefreshKey, setInstructorRefreshKey] = useState(0);


  const {
    filteredCourses,
    isLoading,
    error,
    selectedCourse,
    setSelectedCourse,
    formData: _formData,
    setFormData,
    isSubmitting,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    currentPage,
    totalPages,
    totalCount,
    handleEditCourse: _handleEditCourse,
    handleDeleteCourse,
    importFile,
    setImportFile,
    importPreview,
    setImportPreview,
    isImporting,
    importSuccess,
    handleImportCourses,
    downloadExcelTemplate,
    onUpdateCourse,
    fetchData,
    studentCounts
  } = useCourses(searchQuery, filterPaymentType, filterWhatsApp, filterEntityType);



  return (
    <main className={`p-4 md:p-6 min-h-screen w-full lg:max-w-7xl lg:mx-auto pb-24 md:pb-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
      {/* Header - Hidden on mobile */}
      <div className="hidden md:block mb-6 relative z-30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-white/50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 backdrop-blur-md shadow-xl shadow-gray-200/20 dark:shadow-none">
          <div className="flex items-center gap-4 text-right">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-lg animate-pulse"></div>
              <div className="relative p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                دليل الدورات
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                إدارة الدورات التدريبية والطلاب
              </p>
            </div>
          </div>
          <div className="relative add-menu-container self-center sm:self-auto">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="flex items-center justify-center gap-2 h-12 px-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl font-black shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Plus className="w-6 h-6" />
              <span>{activeTab === 'courses' ? 'إضافة' : 'إضافة أستاذ'}</span>
            </button>

            {showAddMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowAddMenu(false)}
                />
                <div className={`absolute left-0 mt-2 w-64 rounded-2xl shadow-2xl border z-50 overflow-hidden ${theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
                  }`}>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        if (activeTab === 'courses') {
                          navigate('/courses/add');
                        } else {
                          setIsAddInstructorModalOpen(true);
                        }
                        setShowAddMenu(false);
                      }}
                      className={`flex items-center gap-3 w-full px-5 py-4 transition-all text-sm text-right ${theme === 'dark'
                        ? 'text-gray-200 hover:bg-blue-900/40 rounded-lg'
                        : 'text-gray-700 hover:bg-blue-50 rounded-lg'
                        }`}
                    >
                      {activeTab === 'courses' ? (
                        <BookOpen className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                      ) : (
                        <GraduationCap className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                      )}
                      <div className="flex-1 text-right">
                        <p className="font-bold">{activeTab === 'courses' ? 'إضافة دورة' : 'إضافة أستاذ'}</p>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className={`flex items-center gap-1 p-1.5 rounded-2xl mx-0 ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-gray-100/80'}`}>
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'courses'
              ? theme === 'dark'
                ? 'bg-gray-700 text-white shadow-lg'
                : 'bg-white text-gray-900 shadow-lg'
              : theme === 'dark'
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <BookOpen className="w-4 h-4" />
            الدورات
          </button>
          <button
            onClick={() => setActiveTab('instructors')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'instructors'
              ? theme === 'dark'
                ? 'bg-gray-700 text-white shadow-lg'
                : 'bg-white text-gray-900 shadow-lg'
              : theme === 'dark'
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <GraduationCap className="w-4 h-4" />
            الأساتذة
          </button>
        </div>
      </div>

      {/* Filters Panel - Only for courses tab */}
      {activeTab === 'courses' && (
        <div className="mb-6">
          <CourseFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterPaymentType={filterPaymentType}
            setFilterPaymentType={setFilterPaymentType}
            filterWhatsApp={filterWhatsApp}
            setFilterWhatsApp={setFilterWhatsApp}
            filterEntityType={filterEntityType}
            setFilterEntityType={setFilterEntityType}
          />
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-4" />
        </div>
      )}

      {/* Content */}
      {activeTab === 'courses' && (
        <div className="p-0 md:p-0">
          {error && (
            <div className={`mb-6 p-5 rounded-xl flex items-center gap-3 border ${theme === 'dark'
              ? 'bg-red-900/30 text-red-400 border-red-700/50'
              : 'bg-red-50 text-red-600 border-red-100'
              }`}>
              <p>{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className={`flex items-center justify-center min-h-[500px] rounded-xl`}>
              <div className="flex flex-col items-center gap-4">
                <div className={`w-16 h-16 border-4 rounded-full animate-spin ${theme === 'dark'
                  ? 'border-gray-700 border-t-blue-500'
                  : 'border-gray-200 border-t-blue-600'
                  }`}></div>
                <p className={`animate-pulse font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>جاري تحميل البيانات...</p>
              </div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <EmptyCoursesState
              searchQuery={searchQuery}
              filterPaymentType={filterPaymentType}
              setSearchQuery={setSearchQuery}
              setFilterPaymentType={setFilterPaymentType}
              filterEntityType={filterEntityType}
              setFilterEntityType={setFilterEntityType}
            />
          ) : (
            <CoursesGrid
              filteredCourses={filteredCourses}
              sortBy={sortBy}
              setSortBy={setSortBy}
              currentPage={currentPage}
              setCurrentPage={fetchData}
              totalPages={totalPages}
              totalCount={totalCount}
              sortDirection={sortDirection}
              setSortDirection={setSortDirection}
              gridView={gridView}
              setGridView={setGridView}
              onEdit={(course: any) => {
                setSelectedCourse(course);
                setFormData({
                  name: course.name,
                  instructorName: course.instructorName || '',
                  daysCount: course.daysCount ? String(course.daysCount) : '',
                  maxStudents: course.maxStudents ? String(course.maxStudents) : '',
                  lectureStartTime: course.lectureStartTime || '',
                  lectureEndTime: course.lectureEndTime || '',
                  feePerStudent: course.feePerStudent ? String(course.feePerStudent) : '',
                  currency: course.currency || 'IQD',
                  instructorPhone: course.instructorPhone || '',
                  summary: course.summary || '',
                  paymentType: course.paymentType,
                  courseId: course.companyId || course.id || '',
                  whatsAppGroupId: course.whatsAppGroupId || null,
                  whatsAppGroupName: course.whatsAppGroupName || null,
                  phone: course.phone || '',
                  website: course.website || '',
                  details: course.details || '',
                  category: course.category || ''
                });
                setIsEditModalOpen(true);
              }}
              onDelete={(course: any) => {
                setSelectedCourse(course);
                setIsDeleteModalOpen(true);
              }}
              onAddStudent={(course: any) => {
                setStudentEnrollCourse(course);
                setIsAddStudentModalOpen(true);
              }}
              studentCounts={studentCounts}
              onViewDetails={(course: any) => {
                if (course._collectionName === 'courses') {
                  navigate(`/courses/${course.id}`);
                }
              }}
            />
          )}
        </div>
      )}

      {/* Instructors Tab Content */}
      {activeTab === 'instructors' && (
        <InstructorsTab
          onAddInstructor={() => setIsAddInstructorModalOpen(true)}
          refreshKey={instructorRefreshKey}
        />
      )}





      <NewEditCourseModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        course={selectedCourse}
        onUpdate={onUpdateCourse}
        isSubmitting={isSubmitting}
      />

      <DeleteCourseModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteCourse}
        selectedCourse={selectedCourse}
      />

      <AddStudentModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        course={studentEnrollCourse}
        onStudentAdded={() => fetchData(1)}
      />

      <AddInstructorModal
        isOpen={isAddInstructorModalOpen}
        onClose={() => setIsAddInstructorModalOpen(false)}
        onInstructorAdded={() => setInstructorRefreshKey(k => k + 1)}
      />

      <ImportCoursesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        importFile={importFile}
        setImportFile={setImportFile}
        importPreview={importPreview}
        setImportPreview={setImportPreview}
        isImporting={isImporting}
        importSuccess={importSuccess}
        onImport={handleImportCourses}
        downloadTemplate={downloadExcelTemplate}
      />

      {/* Mobile Floating Action Button - Portal to body */}
      {typeof document !== 'undefined' && createPortal(
        <div className="md:hidden fixed bottom-[7.5rem] left-6 z-[9999] add-menu-container">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full shadow-[0_10px_40px_-10px_rgba(37,99,235,0.6)] flex items-center justify-center transform active:scale-95 transition-all border-4 border-white dark:border-gray-800"
          >
            <Plus className={`w-8 h-8 transition-transform duration-300 ${showAddMenu ? 'rotate-[135deg]' : ''}`} />
          </button>

          <AnimatePresence>
            {showAddMenu && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
                  onClick={() => setShowAddMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 40 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 40 }}
                  className={`fixed bottom-[13rem] left-6 w-64 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border z-50 overflow-hidden ${theme === 'dark'
                    ? 'bg-gray-800/95 border-gray-700/50 backdrop-blur-2xl text-white'
                    : 'bg-white border-gray-100 shadow-blue-500/10 text-gray-900'
                    }`}
                >
                  <div className="p-3 flex flex-col gap-1.5" dir="rtl">
                    <div className="px-5 py-3 mb-1 border-b border-gray-100 dark:border-gray-700/50">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>خيارات الإضافة</p>
                    </div>
                    <button
                      onClick={() => {
                        if (activeTab === 'courses') {
                          navigate('/courses/add');
                        } else {
                          setIsAddInstructorModalOpen(true);
                        }
                        setShowAddMenu(false);
                      }}
                      className={`flex items-center gap-4 w-full px-5 py-4 transition-all rounded-2xl text-sm text-right ${theme === 'dark'
                        ? 'hover:bg-blue-600/20'
                        : 'hover:bg-blue-50'
                        }`}
                    >
                      <div className={`p-2.5 rounded-2xl ${activeTab === 'courses' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'}`}>
                        {activeTab === 'courses' ? <BookOpen className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
                      </div>
                      <span className="font-black">{activeTab === 'courses' ? 'إضافة دورة' : 'إضافة أستاذ'}</span>
                    </button>

                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </main>
  );
};

export default Courses;
