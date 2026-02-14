import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Printer, Save, Check, Loader2, Palette, Image as ImageIcon, Type, MapPin, Upload } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { generateVoucherHTML } from '../../Accounts/components/PrintTemplate';

interface PrintSettings {
  gatesColumnLabel: string;
  internalColumnLabel: string;
  externalColumnLabel: string;
  flyColumnLabel: string;
  primaryColor: string;
  labelBackgroundColor: string;
  textColor: string;
  logoUrl: string;
  footerAddress: string;
  companyNameLabel: string;
  receiptTitle: string;
  paymentTitle: string;
  receiptNoLabel: string;
  receiptNoArabicLabel: string;
  dateLabel: string;
  dateArabicLabel: string;
  dayLabel: string;
  dayArabicLabel: string;
  receivedFromLabel: string;
  receivedFromArabicLabel: string;
  paidToArabicLabel: string;
  paidToLabel: string;
  amountReceivedLabel: string;
  amountReceivedArabicLabel: string;
  amountInWordsLabel: string;
  amountInWordsArabicLabel: string;
  detailsLabel: string;
  detailsArabicLabel: string;
  distributionTitleLabel: string;
  phoneLabel: string;
  phoneArabicLabel: string;
  cashierLabel: string;
  recipientSignatureLabel: string;
  directorSignatureLabel: string;
}

export default function PrintTemplateEditor() {
  const { theme } = useTheme();
  const [settings, setSettings] = useState<PrintSettings>({
    gatesColumnLabel: 'جات',
    internalColumnLabel: 'داخلي',
    externalColumnLabel: 'خارجي',
    flyColumnLabel: 'فلاي',
    primaryColor: '#4A0E6B',
    labelBackgroundColor: '#F3E8FF',
    textColor: '#111827',
    logoUrl: "",
    footerAddress: 'يرجى كتابة العنوان وأرقام الهواتف هنا',
    companyNameLabel: 'مؤسسة سما الوطن الانسانية للتدريب والتطوير',
    receiptTitle: 'سند قبض',
    paymentTitle: 'سند صرف',
    receiptNoLabel: 'Receipt No:',
    receiptNoArabicLabel: 'رقم الوصل:',
    dateLabel: 'Date:',
    dateArabicLabel: 'التاريخ:',
    dayLabel: 'Day:',
    dayArabicLabel: 'اليوم:',
    receivedFromLabel: 'Received From',
    receivedFromArabicLabel: 'استلمنا من السيد/ السادة:',
    paidToArabicLabel: 'ادفعوا إلى السيد/ السادة:',
    paidToLabel: 'Paid To',
    amountReceivedLabel: 'Amount Received',
    amountReceivedArabicLabel: 'المبلغ المقبوض',
    amountInWordsLabel: 'The amount in words',
    amountInWordsArabicLabel: 'المبلغ كتابة',
    detailsLabel: 'Details',
    detailsArabicLabel: 'الملاحظات',
    distributionTitleLabel: 'تفاصيل التوزيع',
    phoneLabel: 'Phone Number',
    phoneArabicLabel: 'رقم الهاتف',
    cashierLabel: 'منظم الوصل',
    recipientSignatureLabel: 'توقيع المستلم',
    directorSignatureLabel: 'المدير'
  });
  const [previewHtml, setPreviewHtml] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadSettings = async () => {
    try {
      const settingsRef = doc(db, 'settings', 'print');
      const docSnap = await getDoc(settingsRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings(prev => ({
          ...prev,
          ...data
        }));
      }
    } catch (error) {
      console.error("Error loading print settings:", error);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    const generatePreview = async () => {
      const sampleVoucher = {
        type: 'receipt' as const,
        invoiceNumber: '12345',
        createdAt: new Date(),
        companyName: 'شركة وهمية للسفر',
        amount: 5000,
        currency: 'USD',
        details: 'دفعة أولى لتذاكر طيران',
        employeeName: 'موظف تجريبي',
        gates: 1000,
        internal: 1500,
        external: 2000,
        fly: 500,
        phone: '07701234567',
        ...settings,
      };
      const html = await generateVoucherHTML(sampleVoucher, settings);
      setPreviewHtml(html);
    };

    generatePreview();
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'print'), settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error("Error saving print settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      alert('حجم الصورة يجب أن يكون أقل من 2 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSettings(prev => ({ ...prev, logoUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        }`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <Palette className="w-5 h-5 text-indigo-500" />
              <span>تخصيص الألوان</span>
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اللون الأساسي</label>
                <div className="flex gap-2">
                  <input type="color" name="primaryColor" value={settings.primaryColor} onChange={handleInputChange} className="w-12 h-10 rounded-md cursor-pointer" />
                  <input type="text" name="primaryColor" value={settings.primaryColor} onChange={handleInputChange} className="flex-1 px-3 py-2 text-sm border rounded-md" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">لون خلفية التسميات</label>
                <div className="flex gap-2">
                  <input type="color" name="labelBackgroundColor" value={settings.labelBackgroundColor} onChange={handleInputChange} className="w-12 h-10 rounded-md cursor-pointer" />
                  <input type="text" name="labelBackgroundColor" value={settings.labelBackgroundColor} onChange={handleInputChange} className="flex-1 px-3 py-2 text-sm border rounded-md" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">لون النص</label>
                <div className="flex gap-2">
                  <input type="color" name="textColor" value={settings.textColor} onChange={handleInputChange} className="w-12 h-10 rounded-md cursor-pointer" />
                  <input type="text" name="textColor" value={settings.textColor} onChange={handleInputChange} className="flex-1 px-3 py-2 text-sm border rounded-md" />
                </div>
              </div>
            </div>

            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-indigo-500" />
              <span>تخصيص الشعار</span>
            </h4>
            <div className="flex items-center gap-4">
              <img src={settings.logoUrl} alt="Logo Preview" className="w-16 h-16 object-contain rounded-lg bg-gray-100 p-1" />
              <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400">
                <Upload className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">تغيير الشعار</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <Type className="w-5 h-5 text-indigo-500" />
              <span>تخصيص العناوين والتسميات</span>
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">العناوين الرئيسية</label>
                <div className="grid grid-cols-2 gap-2">
                  <input name="companyNameLabel" value={settings.companyNameLabel} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md" placeholder="اسم المؤسسة/الشركة" title="اسم المؤسسة/الشركة" />
                  <input name="receiptTitle" value={settings.receiptTitle} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md" placeholder="عنوان سند القبض" title="عنوان سند القبض" />
                  <input name="paymentTitle" value={settings.paymentTitle} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md" placeholder="عنوان سند الصرف" title="عنوان سند الصرف" />
                  <input name="distributionTitleLabel" value={settings.distributionTitleLabel} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md" placeholder="عنوان تفاصيل التوزيع" title="عنوان تفاصيل التوزيع" />
                </div>
              </div>

              <div className="col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <label className="text-xs font-black text-indigo-500 uppercase tracking-wider">تخصيص التسميات الثنائية (عربي / انجليزي)</label>
                  <div className="flex gap-24 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">
                    <span>English (Left)</span>
                    <span>Arabic (Right)</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Receipt No & Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <input name="receiptNoLabel" value={settings.receiptNoLabel} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md" placeholder="Receipt No:" title="رقم الوصل (انجليزي)" />
                      <input name="dateLabel" value={settings.dateLabel} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md" placeholder="Date:" title="التاريخ (انجليزي)" />
                    </div>
                    <div className="space-y-2">
                      <input name="receiptNoArabicLabel" value={settings.receiptNoArabicLabel} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md text-right" placeholder="رقم الوصل:" title="رقم الوصل (عربي)" />
                      <input name="dateArabicLabel" value={settings.dateArabicLabel} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md text-right" placeholder="التاريخ:" title="التاريخ (عربي)" />
                    </div>
                  </div>

                  {/* Day & Received From */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <input name="dayLabel" value={settings.dayLabel} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md" placeholder="Day:" title="اليوم (انجليزي)" />
                      <input name="receivedFromLabel" value={settings.receivedFromLabel} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md" placeholder="Received From" title="استلمنا من (انجليزي)" />
                    </div>
                    <div className="space-y-2">
                      <input name="dayArabicLabel" value={settings.dayArabicLabel} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md text-right" placeholder="اليوم:" title="اليوم (عربي)" />
                      <input name="receivedFromArabicLabel" value={settings.receivedFromArabicLabel} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md text-right" placeholder="استلمنا من السيد/ السادة:" title="استلمنا من (عربي)" />
                    </div>
                  </div>

                  {/* Paid To & Amount Received */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <input name="paidToLabel" value={settings.paidToLabel} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md" placeholder="Paid To" title="ادفعوا إلى (انجليزي)" />
                      <input name="amountReceivedLabel" value={settings.amountReceivedLabel} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md" placeholder="Amount Received" title="المبلغ المقبوض (انجليزي)" />
                    </div>
                    <div className="space-y-2">
                      <input name="paidToArabicLabel" value={settings.paidToArabicLabel} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md text-right" placeholder="ادفعوا إلى السيد/ السادة:" title="ادفعوا إلى (عربي)" />
                      <input name="amountReceivedArabicLabel" value={settings.amountReceivedArabicLabel} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md text-right" placeholder="المبلغ المقبوض" title="المبلغ المقبوض (عربي)" />
                    </div>
                  </div>

                  {/* Amount In Words & Phone */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <input name="amountInWordsLabel" value={settings.amountInWordsLabel} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md" placeholder="The amount in words" title="المبلغ كتابة (انجليزي)" />
                      <input name="phoneLabel" value={settings.phoneLabel} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md" placeholder="Phone Number" title="رقم الهاتف (انجليزي)" />
                    </div>
                    <div className="space-y-2">
                      <input name="amountInWordsArabicLabel" value={settings.amountInWordsArabicLabel} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md text-right" placeholder="المبلغ كتابة" title="المبلغ كتابة (عربي)" />
                      <input name="phoneArabicLabel" value={settings.phoneArabicLabel} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md text-right" placeholder="رقم الهاتف" title="رقم الهاتف (عربي)" />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <input name="detailsLabel" value={settings.detailsLabel} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md" placeholder="Details" title="التفاصيل (انجليزي)" />
                    <input name="detailsArabicLabel" value={settings.detailsArabicLabel} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md text-right" placeholder="الملاحظات" title="الملاحظات (عربي)" />
                  </div>
                </div>
              </div>

              <div className="col-span-2 space-y-2 mt-4">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">التوقيعات</label>
                <div className="grid grid-cols-3 gap-2">
                  <input name="cashierLabel" value={settings.cashierLabel} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md" placeholder="منظم الوصل" />
                  <input name="directorSignatureLabel" value={settings.directorSignatureLabel} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md" placeholder="المدير" />
                  <input name="recipientSignatureLabel" value={settings.recipientSignatureLabel} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md" placeholder="توقيع المستلم" />
                </div>
              </div>
            </div>

            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-500" />
              <span>تخصيص التذييل</span>
            </h4>
            <textarea
              name="footerAddress"
              value={settings.footerAddress}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border rounded-md h-20 resize-none"
              placeholder="العنوان، أرقام الهواتف، إلخ..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-bold"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
        {saveSuccess && (
          <div className="flex items-center gap-2 text-green-600 ml-4">
            <Check className="w-5 h-5" />
            تم الحفظ بنجاح!
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-3">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50 shadow-inner`}>
            <Printer className="w-5 h-5 text-indigo-600" />
          </div>
          معاينة مباشرة
        </h3>
        <div className="flex justify-center w-full bg-gray-200 dark:bg-gray-900 p-8 rounded-2xl">
          <div className="w-full aspect-[210/148] border-4 border-gray-300 dark:border-gray-700 rounded-2xl overflow-hidden shadow-2xl bg-white">
            <iframe
              srcDoc={previewHtml}
              className="w-full h-full border-none"
              title="Voucher Preview"
              style={{ transform: 'scale(1)', transformOrigin: 'top left' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
