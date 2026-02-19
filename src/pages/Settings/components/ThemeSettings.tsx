import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Palette, Image as ImageIcon, Save, Check, Loader2, Upload, X, Award, Plus, Trash2, FileText, RotateCw, RotateCcw, MapPin, Phone, Mail, Navigation, GraduationCap, Shield } from 'lucide-react';
import SettingsCard from '../../../components/SettingsCard';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';


// Set the worker source for PDF.js using local file
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

interface ThemePreset {
  name: string;
  gradient: string;
}

const THEME_PRESETS: ThemePreset[] = [
  { name: 'افتراضي', gradient: 'from-indigo-700 via-indigo-800 to-blue-800' },
  { name: 'محيطي', gradient: 'from-blue-600 via-cyan-600 to-teal-600' },
  { name: 'غروب', gradient: 'from-red-500 via-orange-500 to-yellow-500' },
  { name: 'غابة', gradient: 'from-green-600 via-teal-700 to-green-800' },
  { name: 'ملكي', gradient: 'from-purple-600 via-violet-700 to-purple-800' },
  { name: 'أنيق', gradient: 'from-gray-700 via-gray-800 to-gray-900' },
  { name: 'وردي', gradient: 'from-pink-500 via-rose-500 to-red-500' },
  { name: 'سماوي', gradient: 'from-sky-400 via-cyan-400 to-blue-400' },
  { name: 'ليموني', gradient: 'from-lime-400 via-yellow-400 to-green-400' },
  { name: 'برتقالي', gradient: 'from-orange-400 via-amber-500 to-red-500' },
  { name: 'ياقوتي', gradient: 'from-fuchsia-600 via-pink-600 to-rose-500' },
  { name: 'معدني', gradient: 'from-slate-500 via-slate-600 to-slate-700' },
  { name: 'أكوا', gradient: 'from-cyan-300 via-sky-400 to-blue-400' },
  { name: 'ماغما', gradient: 'from-red-700 via-orange-600 to-amber-500' },
  { name: 'نيون', gradient: 'from-lime-400 via-green-500 to-emerald-600' },
  { name: 'أرجواني', gradient: 'from-violet-500 via-purple-500 to-fuchsia-500' },
  { name: 'كهربائي', gradient: 'from-blue-400 via-indigo-500 to-purple-600' },
  { name: 'استوائي', gradient: 'from-teal-400 via-cyan-500 to-sky-600' },
  { name: 'خريفي', gradient: 'from-amber-400 via-orange-500 to-red-600' },
  { name: 'غسق', gradient: 'from-slate-800 via-gray-800 to-zinc-900' },
  { name: 'ياقوت أزرق', gradient: 'from-blue-800 via-indigo-900 to-purple-900' },
  { name: 'زمرد', gradient: 'from-emerald-700 via-green-800 to-teal-900' },
  { name: 'عقيق', gradient: 'from-red-800 via-rose-900 to-pink-900' },
  { name: 'جمشت', gradient: 'from-violet-800 via-purple-900 to-fuchsia-900' },
  { name: 'فجر', gradient: 'from-sky-300 via-blue-400 to-indigo-400' },
  { name: 'شفق', gradient: 'from-rose-300 via-pink-400 to-purple-400' },
  { name: 'صيف', gradient: 'from-yellow-300 via-orange-400 to-red-400' },
  { name: 'ربيع', gradient: 'from-lime-300 via-green-400 to-teal-400' },
  { name: 'شاطئ', gradient: 'from-cyan-200 via-sky-300 to-blue-300' },
  { name: 'حلوى', gradient: 'from-pink-300 via-fuchsia-400 to-purple-400' },
  { name: 'محيط هادئ', gradient: 'from-gray-600 via-slate-700 to-gray-800' },
  { name: 'مجرة', gradient: 'from-gray-900 via-purple-900 to-blue-900' },
];

// Compress an image file to a small JPEG base64
const compressImage = (file: File, maxDim: number = 300): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
        else { w = Math.round(w * maxDim / h); h = maxDim; }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      // White background for JPEG (no transparency)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      const compressed = canvas.toDataURL('image/jpeg', 0.8);
      URL.revokeObjectURL(img.src);
      resolve(compressed);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('فشل في تحميل الصورة'));
    };
    img.src = URL.createObjectURL(file);
  });
};

// Render ALL pages of a PDF to JPEG base64 strings
const renderPdfAllPages = async (file: File, maxDim: number = 800): Promise<string[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 });

    const scale = Math.min(maxDim / viewport.width, maxDim / viewport.height, 2);
    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
    pages.push(canvas.toDataURL('image/jpeg', 0.7));
  }

  return pages;
};



export default function ThemeSettings() {
  const { theme, customSettings, setCustomSettings } = useTheme();
  const [logoUrl, setLogoUrl] = useState(customSettings.logoUrl || '');
  const [headerLogoUrl, setHeaderLogoUrl] = useState(customSettings.headerLogoUrl || '');
  const [loginLogoUrl, setLoginLogoUrl] = useState(customSettings.loginLogoUrl || '');
  const [selectedGradient, setSelectedGradient] = useState(customSettings.headerGradient || THEME_PRESETS[0].gradient);
  const [logoSize, setLogoSize] = useState(customSettings.logoSize || 40);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [certificates, setCertificates] = useState(customSettings.certificates || []);
  const [contactPhone, setContactPhone] = useState(customSettings.contactPhone || '');
  const [contactEmail, setContactEmail] = useState(customSettings.contactEmail || '');
  const [contactAddress, setContactAddress] = useState(customSettings.contactAddress || '');
  const [mapLat, setMapLat] = useState(customSettings.mapLat || 33.3152);
  const [mapLng, setMapLng] = useState(customSettings.mapLng || 44.3661);
  const [isLocating, setIsLocating] = useState(false);
  const [trainerCertificates, setTrainerCertificates] = useState(customSettings.trainerCertificates || []);
  const [boardAccreditations, setBoardAccreditations] = useState(customSettings.boardAccreditations || []);

  const addCertificate = () => {
    setCertificates([...certificates, { id: Date.now().toString(), imageUrl: '', pages: [], logoUrl: '', title: '', rotation: 0 }]);
  };

  const removeCertificate = (id: string) => {
    setCertificates(certificates.filter((c: any) => c.id !== id));
  };

  const updateCertificate = (id: string, updates: Record<string, any>) => {
    setCertificates(prev => prev.map((c: any) => c.id === id ? { ...c, ...updates } : c));
  };

  const handleCertImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, certId: string, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (file.size > 20 * 1024 * 1024) { alert('\u062d\u062c\u0645 \u0627\u0644\u0645\u0644\u0641 \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0623\u0642\u0644 \u0645\u0646 20 \u0645\u064a\u062c\u0627\u0628\u0627\u064a\u062a'); return; }
    setIsUploading(`cert-${certId}-${field}`);
    try {
      if (file.type === 'application/pdf') {
        const allPages = await renderPdfAllPages(file, 800);
        updateCertificate(certId, { imageUrl: allPages[0] || '', pages: allPages });
      } else if (field === 'logoUrl') {
        const result = await compressImage(file, 200);
        updateCertificate(certId, { logoUrl: result });
      } else {
        const result = await compressImage(file, 800);
        updateCertificate(certId, { imageUrl: result, pages: [result] });
      }
    } catch (err) {
      console.error('File processing error:', err);
      alert('\u0641\u0634\u0644 \u0641\u064a \u0645\u0639\u0627\u0644\u062c\u0629 \u0627\u0644\u0645\u0644\u0641');
    }
    finally { setIsUploading(null); }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) { alert('المتصفح لا يدعم تحديد الموقع'); return; }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setMapLat(pos.coords.latitude); setMapLng(pos.coords.longitude); setIsLocating(false); },
      () => { alert('فشل في تحديد الموقع'); setIsLocating(false); },
      { enableHighAccuracy: true }
    );
  };

  // Trainer certificate CRUD
  const addTrainerCert = () => {
    setTrainerCertificates((prev: any[]) => [...prev, { id: Date.now().toString(), name: '', title: '', imageUrl: '', certificatePages: [] }]);
  };

  const removeTrainerCert = (id: string) => {
    setTrainerCertificates((prev: any[]) => prev.filter((c: any) => c.id !== id));
  };

  const updateTrainerCert = (id: string, updates: Record<string, any>) => {
    setTrainerCertificates((prev: any[]) => prev.map((c: any) => c.id === id ? { ...c, ...updates } : c));
  };

  const handleTrainerCertUpload = async (e: React.ChangeEvent<HTMLInputElement>, certId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (file.size > 20 * 1024 * 1024) { alert('حجم الملف يجب أن يكون أقل من 20 ميجابايت'); return; }
    setIsUploading(`trainer-${certId}`);
    try {
      if (file.type === 'application/pdf') {
        // Use smaller resolution (500px) to stay under Firestore 1MB doc limit
        const allPages = await renderPdfAllPages(file, 500);
        updateTrainerCert(certId, { imageUrl: allPages[0] || '', certificatePages: allPages });
      } else {
        const result = await compressImage(file, 500);
        updateTrainerCert(certId, { imageUrl: result, certificatePages: [result] });
      }
    } catch (err) {
      console.error('File processing error:', err);
      alert('فشل في معالجة الملف');
    } finally {
      setIsUploading(null);
    }
  };

  // Board accreditation CRUD
  const addBoard = () => {
    setBoardAccreditations(prev => [...prev, { id: Date.now().toString(), name: '', description: '', logoUrl: '' }]);
  };

  const removeBoard = (id: string) => {
    setBoardAccreditations(prev => prev.filter(b => b.id !== id));
  };

  const updateBoard = (id: string, updates: Record<string, any>) => {
    setBoardAccreditations(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const handleBoardLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, boardId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(`board-${boardId}`);
    try {
      const result = await compressImage(file, 200);
      updateBoard(boardId, { logoUrl: result });
    } catch (err) {
      console.error('Error uploading board logo:', err);
    } finally {
      setIsUploading(null);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setCustomSettings({
      logoUrl,
      headerLogoUrl,
      loginLogoUrl,
      headerGradient: selectedGradient,
      logoSize,
      certificates,
      trainerCertificates,
      boardAccreditations,
      contactPhone,
      contactEmail,
      contactAddress,
      mapLat,
      mapLng,
    }).then(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }).catch((e) => {
      console.error("Failed to save settings:", e);
      alert('فشل في حفظ الإعدادات: ' + (e?.message || 'خطأ غير معروف'));
      setIsSaving(false);
    });
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void,
    logoKey: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('حجم الصورة يجب أن يكون أقل من 2 ميجابايت');
      return;
    }

    setIsUploading(logoKey);
    try {
      const compressed = await compressImage(file, 300);
      setter(compressed);
    } catch (err) {
      console.error('Image compression failed:', err);
      alert('فشل في معالجة الصورة');
    } finally {
      setIsUploading(null);
    }
  };

  const LogoUploader = ({
    label,
    description,
    value,
    onChange,
    logoKey,
  }: {
    label: string;
    description: string;
    value: string;
    onChange: (url: string) => void;
    logoKey: string;
  }) => (
    <div className={`p-4 rounded-2xl border-2 transition-all ${theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">{label}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        {value && (
          <button
            onClick={() => onChange('')}
            className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
            title="إزالة الشعار"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {value ? (
        <div className={`p-4 rounded-xl flex items-center justify-center relative ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-white border border-gray-100'}`}>
          <img src={value} alt={label} className="max-h-20 object-contain" />
          <label className="absolute bottom-2 right-2 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, onChange, logoKey)}
              className="hidden"
            />
            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
              تغيير
            </span>
          </label>
          {isUploading === logoKey && (
            <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 rounded-xl flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, onChange, logoKey)}
            className="hidden"
          />
          <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${theme === 'dark' ? 'border-gray-600 hover:border-blue-500' : 'border-gray-300 hover:border-blue-500'}`}>
            <Upload className={`w-7 h-7 mx-auto mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">اختر صورة</span>
          </div>
          {isUploading === logoKey && (
            <div className="mt-2 flex items-center justify-center gap-2 text-blue-500 text-xs">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>جاري المعالجة...</span>
            </div>
          )}
        </label>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <SettingsCard
        icon={Palette}
        title="تخصيص الألوان"
        description="اختر نظام الألوان المفضل لديك لواجهة النظام"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              اختر لون الشريط العلوي والجانبي:
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setSelectedGradient(preset.gradient)}
                  className={`relative p-4 rounded-xl border-4 transition-all duration-300 transform hover:scale-105 ${selectedGradient === preset.gradient
                    ? 'border-blue-500 shadow-2xl'
                    : 'border-transparent hover:border-blue-200'
                    }`}
                >
                  <div className={`w-full h-16 rounded-lg bg-gradient-to-r ${preset.gradient}`}></div>
                  <p className="text-center text-sm font-bold mt-3 text-gray-800 dark:text-gray-200">
                    {preset.name}
                  </p>
                  {selectedGradient === preset.gradient && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        icon={ImageIcon}
        title="تخصيص الشعارات"
        description="إدارة الشعارات المعروضة في مختلف أقسام النظام"
      >
        <div className="space-y-4">
          <LogoUploader
            label="الشعار الرئيسي (اللاندنج بيج)"
            description="يظهر في صفحة الهبوط وكشعار افتراضي"
            value={logoUrl}
            onChange={setLogoUrl}
            logoKey="main"
          />

          <LogoUploader
            label="شعار الشريط العلوي"
            description="يظهر في الهيدر العلوي للوحة التحكم (اختياري - يستخدم الرئيسي إن لم يُحدد)"
            value={headerLogoUrl}
            onChange={setHeaderLogoUrl}
            logoKey="header"
          />

          <LogoUploader
            label="شعار صفحة تسجيل الدخول"
            description="يظهر في صفحة الدخول (اختياري - يستخدم الرئيسي إن لم يُحدد)"
            value={loginLogoUrl}
            onChange={setLoginLogoUrl}
            logoKey="login"
          />

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              حجم الشعار:
            </label>
            <select
              value={logoSize}
              onChange={(e) => setLogoSize(Number(e.target.value))}
              className="w-full md:w-64 px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 font-medium"
            >
              <option value={24}>صغير جداً (24px)</option>
              <option value={32}>صغير (32px)</option>
              <option value={40}>متوسط (40px)</option>
              <option value={48}>كبير (48px)</option>
              <option value={56}>كبير جداً (56px)</option>
              <option value={64}>ضخم (64px)</option>
              <option value={80}>عملاق (80px)</option>
              <option value={100}>أقصى حجم (100px)</option>
              <option value={120}>فائق (120px)</option>
            </select>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              يؤثر هذا الخيار على حجم الشعار في الشريط العلوي وصفحة الهبوط.
            </p>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        icon={Award}
        title="الشهادات والاعتمادات"
        description="إدارة الشهادات التي تظهر في صفحة الهبوط"
      >
        <div className="space-y-4">
          {certificates.map((cert: any, index: number) => (
            <div
              key={cert.id}
              className={`p-4 rounded-2xl border-2 transition-all ${theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">شهادة #{index + 1}</h4>
                <button
                  onClick={() => removeCertificate(cert.id)}
                  className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                  title="حذف الشهادة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                value={cert.title}
                onChange={(e) => updateCertificate(cert.id, { title: e.target.value })}
                placeholder="اسم الشهادة (اختياري)"
                className={`w-full px-3 py-2 rounded-lg border text-sm font-medium mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Certificate Image */}
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">صورة الشهادة أو ملف PDF</p>
                  {cert.imageUrl ? (
                    <div className={`relative p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-white border border-gray-100'}`}>
                      <img src={cert.imageUrl} alt="الشهادة" className="w-full h-28 object-contain rounded-lg" style={{ transform: `rotate(${cert.rotation || 0}deg)` }} />
                      <label className="absolute bottom-1 right-1 cursor-pointer">
                        <input type="file" accept="image/*,application/pdf" onChange={(e) => handleCertImageUpload(e, cert.id, 'imageUrl')} className="hidden" />
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>تغيير</span>
                      </label>
                      {/* Rotation buttons */}
                      <div className="absolute top-1 left-1 flex gap-1">
                        <button
                          type="button"
                          onClick={() => updateCertificate(cert.id, { rotation: ((cert.rotation || 0) - 90) % 360 })}
                          className={`p-1.5 rounded-lg transition-all ${theme === 'dark' ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100'} shadow-sm`}
                          title="تدوير يسار"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateCertificate(cert.id, { rotation: ((cert.rotation || 0) + 90) % 360 })}
                          className={`p-1.5 rounded-lg transition-all ${theme === 'dark' ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100'} shadow-sm`}
                          title="تدوير يمين"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {isUploading === `cert-${cert.id}-imageUrl` && (
                        <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 rounded-xl flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*,application/pdf" onChange={(e) => handleCertImageUpload(e, cert.id, 'imageUrl')} className="hidden" />
                      <div className={`border-2 border-dashed rounded-xl p-3 text-center transition-all ${theme === 'dark' ? 'border-gray-600 hover:border-blue-500' : 'border-gray-300 hover:border-blue-500'}`}>
                        <Upload className={`w-6 h-6 mx-auto mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">رفع صورة أو PDF</span>
                      </div>
                    </label>
                  )}
                </div>

                {/* Certificate Logo */}
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">شعار الجهة المانحة</p>
                  {cert.logoUrl ? (
                    <div className={`relative p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-white border border-gray-100'}`}>
                      <img src={cert.logoUrl} alt="شعار الجهة" className="w-full h-28 object-contain rounded-lg" />
                      <label className="absolute bottom-1 right-1 cursor-pointer">
                        <input type="file" accept="image/*" onChange={(e) => handleCertImageUpload(e, cert.id, 'logoUrl')} className="hidden" />
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>تغيير</span>
                      </label>
                      {isUploading === `cert-${cert.id}-logoUrl` && (
                        <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 rounded-xl flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" onChange={(e) => handleCertImageUpload(e, cert.id, 'logoUrl')} className="hidden" />
                      <div className={`border-2 border-dashed rounded-xl p-3 text-center transition-all ${theme === 'dark' ? 'border-gray-600 hover:border-blue-500' : 'border-gray-300 hover:border-blue-500'}`}>
                        <Upload className={`w-6 h-6 mx-auto mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">رفع شعار الجهة</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addCertificate}
            className={`w-full p-4 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-2 font-bold text-sm ${theme === 'dark' ? 'border-gray-600 hover:border-blue-500 text-gray-400 hover:text-blue-400' : 'border-gray-300 hover:border-blue-500 text-gray-500 hover:text-blue-600'}`}
          >
            <Plus className="w-5 h-5" />
            <span>إضافة شهادة جديدة</span>
          </button>
        </div>
      </SettingsCard>

      <SettingsCard
        icon={GraduationCap}
        title="شهادات المدربين"
        description="إدارة شهادات المدربين التي تظهر في صفحة الهبوط"
      >
        <div className="space-y-4">
          {trainerCertificates.map((tc: any, index: number) => (
            <div
              key={tc.id}
              className={`p-4 rounded-2xl border-2 transition-all ${theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">مدرب #{index + 1}</h4>
                <button
                  onClick={() => removeTrainerCert(tc.id)}
                  className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">اسم المدرب</label>
                  <input
                    type="text"
                    value={tc.name}
                    onChange={(e) => updateTrainerCert(tc.id, { name: e.target.value })}
                    placeholder="مثال: أحمد محمد"
                    className={`w-full px-3 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">التخصص</label>
                  <input
                    type="text"
                    value={tc.title}
                    onChange={(e) => updateTrainerCert(tc.id, { title: e.target.value })}
                    placeholder="مثال: مدرب تنمية بشرية"
                    className={`w-full px-3 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">ملف الشهادة (PDF أو صورة)</p>
                {tc.imageUrl ? (
                  <div className={`relative p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-white border border-gray-100'}`}>
                    <img src={tc.imageUrl} alt="شهادة المدرب" className="w-full h-28 object-contain rounded-lg" />
                    {tc.certificatePages && tc.certificatePages.length > 1 && (
                      <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                        {tc.certificatePages.length} صفحات
                      </span>
                    )}
                    <label className="absolute bottom-1 right-1 cursor-pointer">
                      <input type="file" accept="image/*,application/pdf" onChange={(e) => handleTrainerCertUpload(e, tc.id)} className="hidden" />
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>تغيير</span>
                    </label>
                    {isUploading === `trainer-${tc.id}` && (
                      <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 rounded-xl flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => handleTrainerCertUpload(e, tc.id)} className="hidden" />
                    <div className={`border-2 border-dashed rounded-xl p-3 text-center transition-all ${theme === 'dark' ? 'border-gray-600 hover:border-blue-500' : 'border-gray-300 hover:border-blue-500'}`}>
                      <Upload className={`w-6 h-6 mx-auto mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">رفع شهادة PDF أو صورة</span>
                    </div>
                    {isUploading === `trainer-${tc.id}` && (
                      <div className="mt-2 flex items-center justify-center gap-2 text-blue-500 text-xs">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري المعالجة...</span>
                      </div>
                    )}
                  </label>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={addTrainerCert}
            className={`w-full p-4 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-2 font-bold text-sm ${theme === 'dark' ? 'border-gray-600 hover:border-blue-500 text-gray-400 hover:text-blue-400' : 'border-gray-300 hover:border-blue-500 text-gray-500 hover:text-blue-600'}`}
          >
            <Plus className="w-5 h-5" />
            <span>إضافة شهادة مدرب</span>
          </button>
        </div>
      </SettingsCard>

      <SettingsCard
        icon={Shield}
        title="الاعتمادات الدولية"
        description="أضف البورد الكندي والأمريكي وغيرها مع شرح توضيحي لكل اعتماد"
      >
        <div className="space-y-4">
          {boardAccreditations.map((board: any) => (
            <div
              key={board.id}
              className={`relative p-4 rounded-2xl border-2 transition-all ${theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'}`}
            >
              <button
                onClick={() => removeBoard(board.id)}
                className="absolute top-3 left-3 p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">شعار الاعتماد</label>
                  {board.logoUrl ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white">
                      <img src={board.logoUrl} alt="" className="w-full h-full object-contain p-1" />
                      <label className="absolute bottom-1 right-1 cursor-pointer">
                        <input type="file" accept="image/*" onChange={(e) => handleBoardLogoUpload(e, board.id)} className="hidden" />
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>تغيير</span>
                      </label>
                      {isUploading === `board-${board.id}` && (
                        <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 rounded-xl flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" onChange={(e) => handleBoardLogoUpload(e, board.id)} className="hidden" />
                      <div className={`w-20 h-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${theme === 'dark' ? 'border-gray-600 hover:border-blue-500' : 'border-gray-300 hover:border-blue-500'}`}>
                        <Upload className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className="text-[9px] font-medium text-gray-400">رفع شعار</span>
                      </div>
                      {isUploading === `board-${board.id}` && (
                        <div className="mt-1 flex items-center gap-1 text-blue-500 text-xs">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>جاري الرفع...</span>
                        </div>
                      )}
                    </label>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">اسم الاعتماد</label>
                  <input
                    type="text"
                    value={board.name}
                    onChange={(e) => updateBoard(board.id, { name: e.target.value })}
                    placeholder="مثال: البورد الكندي الأمريكي"
                    className={`w-full px-3 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">الشرح التوضيحي</label>
                  <textarea
                    value={board.description}
                    onChange={(e) => updateBoard(board.id, { description: e.target.value })}
                    placeholder="اكتب شرحاً توضيحياً عن هذا الاعتماد ومميزاته..."
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addBoard}
            className={`w-full p-4 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-2 font-bold text-sm ${theme === 'dark' ? 'border-gray-600 hover:border-blue-500 text-gray-400 hover:text-blue-400' : 'border-gray-300 hover:border-blue-500 text-gray-500 hover:text-blue-600'}`}
          >
            <Plus className="w-5 h-5" />
            <span>إضافة اعتماد جديد</span>
          </button>
        </div>
      </SettingsCard>

      <SettingsCard
        icon={MapPin}
        title="معلومات الاتصال والموقع"
        description="بيانات الاتصال والموقع الجغرافي التي تظهر في صفحة الهبوط"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="w-4 h-4 inline ml-1" />
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+964 xxx xxx xxxx"
                dir="ltr"
                className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline ml-1" />
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="info@example.com"
                dir="ltr"
                className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline ml-1" />
              عنوان المؤسسة
            </label>
            <input
              type="text"
              value={contactAddress}
              onChange={(e) => setContactAddress(e.target.value)}
              placeholder="العراق، بغداد، شارع..."
              className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
            />
          </div>

          <div className={`p-4 rounded-2xl border-2 ${theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'}`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">
                <Navigation className="w-4 h-4 inline ml-1" />
                إحداثيات الخريطة
              </h4>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-50 transition-all"
              >
                {isLocating ? (
                  <><Loader2 className="w-3 h-3 animate-spin" /> جاري التحديد...</>
                ) : (
                  <><MapPin className="w-3 h-3" /> تحديد موقعي</>
                )}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">خط العرض (Latitude)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={mapLat}
                  onChange={(e) => setMapLat(Number(e.target.value))}
                  dir="ltr"
                  className={`w-full px-3 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block">خط الطول (Longitude)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={mapLng}
                  onChange={(e) => setMapLng(Number(e.target.value))}
                  dir="ltr"
                  className={`w-full px-3 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>
            </div>
            {mapLat && mapLng && (
              <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700" style={{ height: '200px' }}>
                <iframe
                  title="خريطة الموقع"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapLng - 0.01},${mapLat - 0.01},${mapLng + 0.01},${mapLat + 0.01}&layer=mapnik&marker=${mapLat},${mapLng}`}
                />
              </div>
            )}
          </div>
        </div>
      </SettingsCard>

      <div className="flex items-center justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleSave}
          disabled={isSaving || !!isUploading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>جاري الحفظ...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>حفظ التغييرات</span>
            </>
          )}
        </button>
      </div>

      {saveSuccess && (
        <div className="fixed bottom-10 right-10 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-500">
          <Check className="w-6 h-6" />
          <span className="font-bold">تم حفظ الإعدادات بنجاح!</span>
        </div>
      )}
    </div>
  );
}
