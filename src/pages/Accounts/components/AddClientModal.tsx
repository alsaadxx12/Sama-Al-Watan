import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { User, Phone, FileText, Sparkles, X, Info, CheckCircle2, XCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import ModernModal from '../../../components/ModernModal';
import ModernInput from '../../../components/ModernInput';
import ModernButton from '../../../components/ModernButton';

interface ClientFormData {
  name: string;
  phone: string;
  details: string;
  status: 'active' | 'inactive';
}

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientAdded?: (client: any) => void;
}

const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onClientAdded
}) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { employee } = useAuth();
  const [formData, setFormData] = React.useState<ClientFormData>({
    name: '',
    phone: '',
    details: '',
    status: 'active'
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        phone: '',
        details: '',
        status: 'active'
      });
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!employee) {
      setError('لم يتم العثور على بيانات الموظف');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.name.trim()) {
        throw new Error('يرجى إدخال اسم العميل');
      }

      const clientsRef = collection(db, 'clients');
      const q = query(clientsRef, where('name', '==', formData.name.trim()));
      const existingClients = await getDocs(q);

      if (!existingClients.empty) {
        throw new Error('يوجد عميل بهذا الاسم بالفعل');
      }

      const clientData = {
        name: formData.name.trim(),
        phone: formData.phone || null,
        details: formData.details || null,
        status: formData.status,
        createdAt: serverTimestamp(),
        createdBy: employee.name,
        createdById: employee.id || '',
        entityType: 'client',
        paymentType: 'cash'
      };

      const docRef = await addDoc(clientsRef, clientData);

      setSuccess('تم إضافة العميل بنجاح');

      if (onClientAdded) {
        onClientAdded({
          id: docRef.id,
          ...clientData,
          createdAt: new Date()
        });
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error adding client:', error);
      setError(error instanceof Error ? error.message : 'فشل في إضافة العميل');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModernModal
      isOpen={isOpen}
      onClose={onClose}
      title="إضافة عميل جديد"
      description="قم بإدخال معلومات العميل بدقة لضمان دقة السجلات المالية والات تنبيهات"
      icon={<User className="w-8 h-8" />}
      iconColor="blue"
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3 px-1">
          <ModernButton
            type="button"
            variant="secondary"
            onClick={onClose}
            className="px-8 py-3.5"
          >
            إلغاء
          </ModernButton>
          <ModernButton
            type="submit"
            variant="primary"
            loading={isSubmitting}
            onClick={() => handleSubmit()}
            className="px-12 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all text-white"
          >
            حفظ العميل
          </ModernButton>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-8" dir="rtl">
        {/* Messages */}
        {(error || success) && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            {error && (
              <div className={`p-4 rounded-2xl border flex items-center gap-4 ${theme === 'dark' ? 'bg-red-900/30 border-red-700/50 text-red-100' : 'bg-red-50 border-red-100 text-red-700'
                }`}>
                <div className="p-2 bg-red-500/20 rounded-xl"><X className="w-5 h-5 text-red-500" /></div>
                <span className="font-black text-sm">{error}</span>
              </div>
            )}
            {success && (
              <div className={`p-4 rounded-2xl border flex items-center gap-4 ${theme === 'dark' ? 'bg-emerald-900/30 border-emerald-700/50 text-emerald-100' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                }`}>
                <div className="p-2 bg-emerald-500/20 rounded-xl"><Sparkles className="w-5 h-5 text-emerald-500" /></div>
                <span className="font-black text-sm">{success}</span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ModernInput
              label="اسم العميل"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="أدخل اسم العميل الكامل..."
              required
              icon={<User className="w-5 h-5 opacity-40" />}
              iconPosition="right"
            />

            <ModernInput
              label="رقم هاتف العميل"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="0770 000 0000"
              icon={<Phone className="w-5 h-5 opacity-40" />}
              iconPosition="right"
              dir="ltr"
            />
          </div>

          {/* Status Selection - Premium Cards */}
          <div className="space-y-4">
            <label className={`block text-sm font-black tracking-tight ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>حالة الحساب</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="group relative cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={formData.status === 'active'}
                  onChange={() => setFormData(prev => ({ ...prev, status: 'active' }))}
                  className="sr-only"
                />
                <div className={`flex flex-col gap-4 p-5 rounded-[2rem] border-2 transition-all duration-300 ${formData.status === 'active' ? 'border-emerald-500 bg-emerald-500/5 ring-4 ring-emerald-500/5' : theme === 'dark' ? 'border-gray-800 bg-gray-900/30' : 'border-gray-100 bg-gray-50/50'
                  }`}>
                  <div className="flex items-center justify-between">
                    <div className={`p-4 rounded-2xl ${formData.status === 'active' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.status === 'active' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300'}`}>
                      {formData.status === 'active' && <div className="w-3 h-3 bg-emerald-500 rounded-full" />}
                    </div>
                  </div>
                  <div>
                    <p className={`font-black text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>نشط (Active)</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">الحساب مفعل وجاهز للعمل</p>
                  </div>
                </div>
              </label>

              <label className="group relative cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="inactive"
                  checked={formData.status === 'inactive'}
                  onChange={() => setFormData(prev => ({ ...prev, status: 'inactive' }))}
                  className="sr-only"
                />
                <div className={`flex flex-col gap-4 p-5 rounded-[2rem] border-2 transition-all duration-300 ${formData.status === 'inactive' ? 'border-red-500 bg-red-500/5 ring-4 ring-red-500/5' : theme === 'dark' ? 'border-gray-800 bg-gray-900/30' : 'border-gray-100 bg-gray-50/50'
                  }`}>
                  <div className="flex items-center justify-between">
                    <div className={`p-4 rounded-2xl ${formData.status === 'inactive' ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                      <XCircle className="w-7 h-7" />
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.status === 'inactive' ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}>
                      {formData.status === 'inactive' && <div className="w-3 h-3 bg-red-500 rounded-full" />}
                    </div>
                  </div>
                  <div>
                    <p className={`font-black text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>معطل (Inactive)</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">الحساب متوقف حالياً</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <ModernInput
              label="ملاحظات وتفاصيل إضافية"
              value={formData.details}
              onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
              placeholder="اكتب ملاحظاتك عن العميل هنا..."
              multiline
              rows={4}
              icon={<FileText className="w-5 h-5 opacity-40" />}
              iconPosition="right"
            />

            <div className={`p-6 rounded-[2.5rem] border-2 flex items-start gap-5 transition-all duration-300 ${theme === 'dark' ? 'bg-blue-900/20 border-blue-800/20 text-blue-300 shadow-2xl shadow-blue-950/20' : 'bg-blue-50/50 border-blue-100 text-blue-700 shadow-xl shadow-blue-500/5'}`}>
              <div className="p-4 bg-blue-500/10 rounded-[1.5rem] shrink-0">
                <Info className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-xs font-black leading-relaxed opacity-80">
                العملاء هم الأفراد أو الكيانات التي تتعامل معها بشكل مباشر، بينما الشركات هي المؤسسات التي تتعامل معها بشكل رسمي. تأكد من إدخال الاسم الرباعي لتجنب التشابه.
              </p>
            </div>
          </div>
        </div>
      </form>
    </ModernModal>
  );
};

export default AddClientModal;