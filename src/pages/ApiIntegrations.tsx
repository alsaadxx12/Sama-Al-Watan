import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Plus,
  Link as LinkIcon,
  RefreshCw,
  Eye,
  EyeOff,
  Clock,
  Activity,
  AlertCircle,
  Search
} from 'lucide-react';
import ModernButton from '../components/ModernButton';
import { useNotification } from '../contexts/NotificationContext';
import { apiSyncService, SyncStatus } from '../lib/services/apiSyncService';
import axios from 'axios';
import ModernModal from '../components/ModernModal';

interface ApiConnection {
  id: string;
  name: string;
  email: string;
  password: string;
  apiUrl: string;
  sourceId: string;
  sourceName: string;
  currency: 'IQD' | 'USD' | 'AED';
  isActive: boolean;
  lastSync?: Date;
  lastSyncStatus?: 'success' | 'error';
  lastSyncError?: string;
  autoSync: boolean;
  syncInterval: number;
  createdAt: Date;
  apiMethod?: 'POST' | 'GET';
  authToken?: string;
}

interface SupplierSource {
  id: string;
  name: string;
  type: string;
}

function ApiIntegrations() {
  const [connections, setConnections] = useState<ApiConnection[]>([]);
  const [sources, setSources] = useState<SupplierSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingConnection, setEditingConnection] = useState<ApiConnection | null>(null);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [testingConnection, setTestingConnection] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ isRunning: false });
  const [continuousSyncEnabled, setContinuousSyncEnabled] = useState(false);
  const [syncFrequency, setSyncFrequency] = useState(30);
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    apiUrl: '',
    sourceId: '',
    currency: 'USD' as 'IQD' | 'USD' | 'AED',
    isActive: true,
    autoSync: false,
    syncInterval: 60,
    apiMethod: 'POST' as 'POST' | 'GET',
    authToken: ''
  });

  useEffect(() => {
    const initializeData = async () => {
      await loadSources();

      const config = await apiSyncService.getGlobalSyncConfig();
      setContinuousSyncEnabled(config.enabled);
      setSyncFrequency(config.frequency);
    };
    initializeData();

    // Setup real-time listener for connections
    const connectionsRef = collection(db, 'api_connections');
    const unsubscribeConnections = onSnapshot(
      connectionsRef,
      (snapshot) => {
        const connectionsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          lastSync: doc.data().lastSync?.toDate(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as ApiConnection[];
        connectionsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setConnections(connectionsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading connections:', error);
        showNotification('error', 'خطأ', 'فشل تحميل الاتصالات');
        setLoading(false);
      }
    );

    const handleSyncStatus = (status: SyncStatus) => {
      setSyncStatus(status);
    };

    apiSyncService.addListener(handleSyncStatus);

    return () => {
      unsubscribeConnections();
      apiSyncService.removeListener(handleSyncStatus);
    };
  }, []);

  const loadSources = async () => {
    try {
      const sourcesRef = collection(db, 'balance_sources');
      const snapshot = await getDocs(sourcesRef);
      const sourcesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || data.sourceName || 'غير معروف',
          type: data.type || 'system'
        };
      }) as SupplierSource[];

      if (sourcesData.length === 0) {
        // Fallback to courses if no sources found
        const coursesRef = collection(db, 'courses');
        const snapshot = await getDocs(coursesRef);
        const coursesData = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          type: 'course'
        }));
        setSources(coursesData);
      } else {
        setSources(sourcesData);
      }
    } catch (error) {
      console.error('Error loading sources:', error);
      showNotification('error', 'خطأ', 'فشل تحميل قائمة المصادر');
    }
  };

  const testApiConnection = async () => {
    if (!formData.apiUrl?.trim()) {
      showNotification('error', 'خطأ', 'يرجى إدخال رابط API أولاً');
      return;
    }

    if (formData.apiMethod === 'POST' && (!formData.email?.trim() || !formData.password?.trim())) {
      showNotification('error', 'خطأ', 'يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setTestingConnection(true);
    try {
      const config: any = {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      let response;

      if (formData.apiMethod === 'POST') {
        response = await axios.post(formData.apiUrl, {
          email: formData.email,
          password: formData.password,
          type: 'login'
        }, config);
      } else {
        if (formData.authToken) {
          config.headers['Authorization'] = `Bearer ${formData.authToken}`;
        }
        response = await axios.get(formData.apiUrl, config);
      }

      showNotification('success', 'نجاح', '✓ الاتصال ناجح!');
    } catch (error: any) {
      console.error('Test connection error:', error);
      showNotification('error', 'خطأ', 'فشل اختبار الاتصال');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleAddConnection = async () => {
    if (!formData.name?.trim() || !formData.apiUrl?.trim() || !formData.sourceId) {
      showNotification('error', 'خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      const source = sources.find(s => s.id === formData.sourceId);
      if (!source) {
        showNotification('error', 'خطأ', 'المصدر المختار غير موجود');
        return;
      }

      await addDoc(collection(db, 'api_connections'), {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        apiUrl: formData.apiUrl.trim(),
        sourceId: formData.sourceId,
        sourceName: source.name,
        currency: formData.currency,
        isActive: formData.isActive,
        autoSync: formData.autoSync,
        syncInterval: formData.syncInterval,
        apiMethod: formData.apiMethod,
        authToken: formData.authToken || '',
        createdAt: Timestamp.now()
      });

      showNotification('success', 'نجاح', 'تم إضافة الاتصال بنجاح');
      setShowAddModal(false);
      resetForm();
    } catch (error: any) {
      showNotification('error', 'خطأ', 'فشل إضافة الاتصال');
    }
  };

  const handleEditConnection = (connection: ApiConnection) => {
    setEditingConnection(connection);
    setFormData({
      name: connection.name,
      email: connection.email,
      password: connection.password,
      apiUrl: connection.apiUrl,
      sourceId: connection.sourceId,
      currency: connection.currency,
      isActive: connection.isActive,
      autoSync: connection.autoSync,
      syncInterval: connection.syncInterval,
      apiMethod: connection.apiMethod || 'POST',
      authToken: connection.authToken || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateConnection = async () => {
    if (!editingConnection) return;

    try {
      const source = sources.find(s => s.id === formData.sourceId);
      if (!source) {
        showNotification('error', 'خطأ', 'المصدر غير موجود');
        return;
      }

      await updateDoc(doc(db, 'api_connections', editingConnection.id), {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        apiUrl: formData.apiUrl,
        sourceId: formData.sourceId,
        sourceName: source.name,
        currency: formData.currency,
        isActive: formData.isActive,
        autoSync: formData.autoSync,
        syncInterval: formData.syncInterval,
        apiMethod: formData.apiMethod,
        authToken: formData.authToken || ''
      });

      showNotification('success', 'نجاح', 'تم تحديث الاتصال بنجاح');
      setShowEditModal(false);
      setEditingConnection(null);
      resetForm();
    } catch (error) {
      showNotification('error', 'خطأ', 'فشل تحديث الاتصال');
    }
  };

  const handleDeleteConnection = async (connectionId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الاتصال؟')) return;

    try {
      await deleteDoc(doc(db, 'api_connections', connectionId));
      showNotification('success', 'نجاح', 'تم حذف الاتصال بنجاح');
    } catch (error) {
      showNotification('error', 'خطأ', 'فشل حذف الاتصال');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      apiUrl: '',
      sourceId: '',
      currency: 'USD',
      isActive: true,
      autoSync: false,
      syncInterval: 60,
      apiMethod: 'POST',
      authToken: ''
    });
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleContinuousSync = async () => {
    const newState = !continuousSyncEnabled;
    setContinuousSyncEnabled(newState);

    try {
      await apiSyncService.updateGlobalSyncConfig(newState, syncFrequency);
      showNotification(newState ? 'success' : 'info', newState ? 'نجاح' : 'معلومات', newState ? 'تم تفعيل المزامنة العالمية' : 'تم إيقاف المزامنة العالمية');
    } catch (error) {
      showNotification('error', 'خطأ', 'فشل تحديث إعدادات المزامنة');
      setContinuousSyncEnabled(!newState);
    }
  };

  const handleSyncFrequencyChange = async (newFrequency: number) => {
    setSyncFrequency(newFrequency);
    if (continuousSyncEnabled) {
      try {
        await apiSyncService.updateGlobalSyncConfig(true, newFrequency);
        showNotification('success', 'نجاح', `تم تحديث فترة المزامنة إلى ${newFrequency} ثانية`);
      } catch (error) {
        showNotification('error', 'خطأ', 'فشل تحديث فترة المزامنة');
      }
    }
  };

  const handleSyncNow = async () => {
    try {
      await apiSyncService.syncNow();
      showNotification('success', 'نجاح', 'تمت المزامنة بنجاح');
    } catch (error) {
      showNotification('error', 'خطأ', 'فشلت المزامنة');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-bold">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            ربط الأنظمة الخارجية (API)
          </h1>
          <p className="text-gray-500 font-bold mt-1">إدارة الاتصالات التلقائية والمزامنة مع الخدمات الخارجية</p>
        </div>
        <ModernButton
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white font-black px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-105 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة اتصال جديد
        </ModernButton>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[2rem] p-6 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Activity className="w-8 h-8 text-indigo-500" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">المزامنة التلقائية</h3>
                <p className="text-sm text-gray-500 font-bold">تزامن البيانات عالمياً لجميع المستخدمين</p>
              </div>
              <button
                onClick={toggleContinuousSync}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${continuousSyncEnabled ? 'bg-indigo-500 ring-4 ring-indigo-500/10' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${continuousSyncEnabled ? 'left-8' : 'left-1'
                    }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-3">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">الحالة</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${continuousSyncEnabled ? 'bg-indigo-500 animate-pulse' : 'bg-gray-400'}`} />
                  <span className={`text-xs font-black ${continuousSyncEnabled ? 'text-indigo-600' : 'text-gray-500'}`}>
                    {continuousSyncEnabled ? 'نشطة حالياً' : 'متوقفة'}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-2xl px-4 py-3">
                <p className="text-[10px] font-black text-blue-400 uppercase mb-1">تكرار المزامنة</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={syncFrequency}
                    onChange={(e) => handleSyncFrequencyChange(parseInt(e.target.value) || 30)}
                    min="10"
                    disabled={!continuousSyncEnabled}
                    className="w-14 bg-white dark:bg-gray-800 border-2 border-blue-100 dark:border-blue-700 rounded-lg text-xs text-center font-black focus:border-blue-500 outline-none disabled:opacity-50"
                  />
                  <span className="text-xs text-blue-600 font-black">ثانية</span>
                </div>
              </div>

              {syncStatus.lastSyncTime && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl px-4 py-3">
                  <p className="text-[10px] font-black text-emerald-400 uppercase mb-1">آخر تنفيذ</p>
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs font-black">{syncStatus.lastSyncTime.toLocaleTimeString('en-GB')}</span>
                  </div>
                </div>
              )}

              {syncStatus.isRunning && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-2xl px-4 py-3 animate-pulse">
                  <p className="text-[10px] font-black text-amber-500 uppercase mb-1">جاري العمل</p>
                  <div className="flex items-center gap-2 text-amber-600 text-xs font-black">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    {syncStatus.syncedCount}/{syncStatus.totalConnections}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleSyncNow}
              disabled={syncStatus.isRunning}
              className="px-6 py-2.5 bg-white dark:bg-gray-900 border-2 border-indigo-100 dark:border-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl font-black text-xs transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.isRunning ? 'animate-spin' : ''}`} />
              بدء مزامنة يدوية فورية
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {connections.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-gray-900/50 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <LinkIcon className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">لا توجد اتصالات API نشطة</h3>
            <p className="text-gray-500 font-bold max-w-sm mb-8">ابدأ بإضافة أول اتصال للربط مع الأنظمة الخارجية وأتمتة العمليات</p>
            <ModernButton
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-500 text-white font-black px-8 py-4 rounded-2xl hover:scale-105 transition-all"
            >
              إعداد أول اتصال
            </ModernButton>
          </div>
        ) : (
          connections.map((connection) => (
            <div
              key={connection.id}
              className="group bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-[2.5rem] p-6 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-300 shadow-sm"
            >
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${connection.isActive ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                  <LinkIcon className="w-8 h-8" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white truncate">{connection.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-tight">
                        {connection.sourceName}
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${connection.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {connection.isActive ? 'متصل' : 'متوقف'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-500">
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700">
                      <span className="text-[10px] text-gray-400 uppercase">البريد:</span>
                      <span className="text-gray-700 dark:text-gray-300">{connection.email}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700">
                      <span className="text-[10px] text-gray-400 uppercase">العملة:</span>
                      <span className="text-indigo-600 font-black">{connection.currency}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 uppercase">كلمة المرور:</span>
                      <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700">
                        <span className="font-mono">{showPassword[connection.id] ? connection.password : '••••••••'}</span>
                        <button onClick={() => togglePasswordVisibility(connection.id)} className="text-gray-400 hover:text-indigo-500 transition-colors">
                          {showPassword[connection.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={() => handleEditConnection(connection)}
                    className="flex-1 md:flex-none p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl hover:bg-indigo-500 hover:text-white transition-all"
                  >
                    <Search className="w-5 h-5 mx-auto" />
                  </button>
                  <button
                    onClick={() => handleDeleteConnection(connection.id)}
                    className="flex-1 md:flex-none p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                  >
                    <AlertCircle className="w-5 h-5 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <ModernModal
          isOpen={true}
          onClose={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}
          title={showEditModal ? 'تعديل الاتصال' : 'إضافة اتصال API جديد'}
        >
          <div className="space-y-6 pt-4" dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100 dark:border-gray-700">
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-500">اسم الاتصال وصفته</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: نظام التدريب الخارجي"
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-950 border-2 border-gray-100 dark:border-gray-800 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-gray-500">المصدر المطلوب</label>
                <select
                  value={formData.sourceId}
                  onChange={(e) => setFormData({ ...formData, sourceId: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-950 border-2 border-gray-100 dark:border-gray-800 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold"
                >
                  <option value="">اختر المصدر...</option>
                  {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-500">رابط الـ API الأساسي (URL)</label>
                <input
                  type="url"
                  value={formData.apiUrl}
                  onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                  placeholder="https://api.external-service.com/v1"
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-950 border-2 border-gray-100 dark:border-gray-800 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold text-left font-mono"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-500">البريد الإلكتروني / اليوزر</label>
                  <input
                    type="text"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-950 border-2 border-gray-100 dark:border-gray-800 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-500">كلمة المرور / السيكريت</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-950 border-2 border-gray-100 dark:border-gray-800 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                onClick={showEditModal ? handleUpdateConnection : handleAddConnection}
                className="flex-1 py-5 bg-indigo-500 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {showEditModal ? 'حفظ التعديلات' : 'إتمام الإضافة'}
              </button>
              <button
                onClick={testApiConnection}
                disabled={testingConnection}
                className="px-10 py-5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-[1.5rem] font-black text-lg hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                {testingConnection ? 'جاري الفحص...' : 'فحص الاتصال'}
              </button>
            </div>
          </div>
        </ModernModal>
      )}
    </div>
  );
}

export default ApiIntegrations;
