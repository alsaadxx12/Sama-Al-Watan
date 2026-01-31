import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Users, History, UserX, Contact, Megaphone, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import GroupsContainer from './components/GroupsContainer';
import ContactsContainer from './components/ContactsContainer';
import ExclusionsContainer from './components/ExclusionsContainer';
import HistoryContainer from './components/HistoryContainer';
import AnnouncementsDashboard from './components/AnnouncementsDashboard';
import ModernModal from '../../components/ModernModal';
import { useAuth } from '../../contexts/AuthContext';

import { getGlobalWhatsAppSettings } from '../../lib/collections/whatsapp';

const Announcements: React.FC = () => {
    const { theme } = useTheme();
    const { checkPermission } = useAuth();
    const [activeTab, setActiveTab] = useState<'send' | 'history'>('send');
    const [selectedTargets, setSelectedTargets] = useState<any[]>([]);
    const [exclusions, setExclusions] = useState<Set<string>>(new Set());
    const [selectedAccount, setSelectedAccount] = useState<{ instance_id: string; token: string } | null>(null);

    // Modal states
    const [isGroupsModalOpen, setIsGroupsModalOpen] = useState(false);
    const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
    const [isExclusionsModalOpen, setIsExclusionsModalOpen] = useState(false);

    // Permission check
    const hasViewPermission = checkPermission('announcements', 'view');
    const hasAddPermission = checkPermission('announcements', 'add');

    // Load default account at top level
    React.useEffect(() => {
        const loadDefaultAccount = async () => {
            if (selectedAccount) return;
            try {
                const settings = await getGlobalWhatsAppSettings();
                const activeAccount = settings.find(acc => acc.is_active);
                if (activeAccount) {
                    setSelectedAccount({
                        instance_id: activeAccount.instance_id,
                        token: activeAccount.token
                    });
                }
            } catch (err) {
                console.error('Failed to load default account:', err);
            }
        };
        loadDefaultAccount();
    }, []);

    if (!hasViewPermission) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="p-4 bg-red-500/10 rounded-full mb-4">
                    <UserX className="w-12 h-12 text-red-500" />
                </div>
                <h2 className="text-xl font-black text-gray-800 dark:text-white">ليس لديك صلاحية الوصول لهذه الصفحة</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">يرجى مراجعة إدارة النظام لطلب الصلاحيات.</p>
            </div>
        );
    }

    const toggleTarget = (target: any) => {
        setSelectedTargets(prev => {
            const exists = prev.find(t => t.id === target.id);
            if (exists) return prev.filter(t => t.id !== target.id);
            return [...prev, target];
        });
    };

    const selectAllTargets = (targets: any[]) => {
        setSelectedTargets(prev => {
            const existingIds = prev.map(t => t.id);
            const newTargets = targets.filter(t => !existingIds.includes(t.id));
            return [...prev, ...newTargets];
        });
    };

    const deselectTargets = (ids: string[]) => {
        setSelectedTargets(prev => prev.filter(t => !ids.includes(t.id)));
    };

    const toggleExclusion = (id: string) => {
        setExclusions(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const filteredTargets = selectedTargets.filter(t => !exclusions.has(t.id));

    const handleBroadcastSent = async (data: any) => {
        try {
            const historyRef = collection(db, 'announcements_history');
            await addDoc(historyRef, {
                ...data,
                recipients: filteredTargets.map(t => ({ id: t.id, name: t.name, type: t.type })),
                timestamp: new Date().toISOString(),
                status: 'completed'
            });
            console.log('History saved successfully');
        } catch (err) {
            console.error('Error saving history:', err);
        }
    };

    const handleResend = (historyItem: any) => {
        const messageInput = document.querySelector('textarea');
        if (messageInput) {
            messageInput.value = historyItem.message || '';
            const event = new Event('input', { bubbles: true });
            messageInput.dispatchEvent(event);
        }

        if (historyItem.recipients && Array.isArray(historyItem.recipients)) {
            setSelectedTargets(historyItem.recipients);
        }

        setActiveTab('send');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        إعلانات الواتساب
                    </h1>
                    <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        إرسال الإعلانات والتبليغات للمجموعات وجهات الاتصال
                    </p>
                </div>

                <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl shadow-inner border border-gray-200/50 dark:border-gray-700/50">
                    <button
                        onClick={() => setActiveTab('send')}
                        className={`px-6 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'send'
                            ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Megaphone className="w-4 h-4" />
                        <span>إرسال إعلان</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'history'
                            ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <History className="w-4 h-4" />
                        <span>سجل الإعلانات</span>
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                <motion.div
                    key="announcements-main"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <div className="space-y-6">
                        <AnnouncementsDashboard
                            onOpenGroups={() => setIsGroupsModalOpen(true)}
                            onOpenContacts={() => setIsContactsModalOpen(true)}
                            onOpenExclusions={() => setIsExclusionsModalOpen(true)}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xl font-black flex items-center gap-2">
                                <History className="w-5 h-5 text-amber-500" />
                                <span>سجل الإعلانات</span>
                            </h2>
                        </div>
                        <HistoryContainer onResend={handleResend} />
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Selection Modals */}
            <ModernModal
                isOpen={isGroupsModalOpen}
                onClose={() => setIsGroupsModalOpen(false)}
                title="مجموعات الواتساب"
                icon={<Users />}
                iconColor="blue"
                size="xl"
                hideHeader={true}
                closeButtonVariant="danger"
            >
                <GroupsContainer
                    onToggleTarget={toggleTarget}
                    onSelectAll={selectAllTargets}
                    onDeselectAll={deselectTargets}
                    selectedIds={new Set(selectedTargets.map(t => t.id))}
                    exclusions={exclusions}
                    onBroadcastComplete={handleBroadcastSent}
                    selectedAccount={selectedAccount}
                    setSelectedAccount={setSelectedAccount}
                />
            </ModernModal>

            <ModernModal
                isOpen={isContactsModalOpen}
                onClose={() => setIsContactsModalOpen(false)}
                title="جهات الاتصال"
                icon={<Contact />}
                iconColor="purple"
                size="xl"
                hideHeader={true}
                closeButtonVariant="danger"
            >
                <ContactsContainer
                    onToggleTarget={toggleTarget}
                    onSelectAll={selectAllTargets}
                    onDeselectAll={deselectTargets}
                    selectedIds={new Set(selectedTargets.map(t => t.id))}
                    exclusions={exclusions}
                    onBroadcastComplete={handleBroadcastSent}
                    selectedAccount={selectedAccount}
                    setSelectedAccount={setSelectedAccount}
                />
            </ModernModal>

            <ModernModal
                isOpen={isExclusionsModalOpen}
                onClose={() => setIsExclusionsModalOpen(false)}
                title="إدارة الاستثناءات"
                icon={<UserX />}
                iconColor="red"
                size="md"
                hideHeader={true}
                closeButtonVariant="danger"
                footer={
                    <div className="flex items-center justify-between w-full">
                        <span className="text-sm font-bold opacity-60">سيتم الإرسال إلى {filteredTargets.length} مستهدف</span>
                        <div className="flex gap-3">
                            <button onClick={() => setIsExclusionsModalOpen(false)} className="px-6 py-2 rounded-xl font-bold bg-gray-100 dark:bg-gray-800">إغلاق</button>
                            <button
                                onClick={() => setIsExclusionsModalOpen(false)}
                                disabled={filteredTargets.length === 0 || !hasAddPermission}
                                className="px-8 py-2 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50"
                            >
                                <Plus className="w-4 h-4" />
                                العودة للاختيار
                            </button>
                        </div>
                    </div>
                }
            >
                <ExclusionsContainer
                    exclusions={exclusions}
                    onToggleExclusion={toggleExclusion}
                    onClearAll={() => setExclusions(new Set())}
                    account={selectedAccount}
                />
            </ModernModal>
        </div>
    );
};

export default Announcements;
