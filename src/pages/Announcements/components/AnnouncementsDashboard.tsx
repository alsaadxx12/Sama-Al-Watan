import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Users, Contact, UserX, ChevronRight, Megaphone } from 'lucide-react';

interface AnnouncementsDashboardProps {
    onOpenComprehensive: () => void;
    onOpenGroups: () => void;
    onOpenContacts: () => void;
    onOpenExclusions: () => void;
}

const AnnouncementsDashboard: React.FC<AnnouncementsDashboardProps> = ({
    onOpenComprehensive,
    onOpenGroups,
    onOpenContacts,
    onOpenExclusions
}) => {
    const { theme } = useTheme();

    const cards = [
        {
            id: 'comprehensive',
            title: 'إعلان شامل',
            description: 'إرسال للعملاء وجهات الاتصال مع استيراد إكسل',
            icon: <Megaphone className="w-8 h-8" />,
            bg: 'bg-amber-500',
            onClick: onOpenComprehensive
        },
        {
            id: 'groups',
            title: 'مجموعات الواتساب',
            description: 'تحديد المجموعات المستهدفة',
            icon: <Users className="w-8 h-8" />,
            bg: 'bg-indigo-600',
            onClick: onOpenGroups
        },
        {
            id: 'contacts',
            title: 'جهات الاتصال',
            description: 'تحديد الأفراد المستهدفين',
            icon: <Contact className="w-8 h-8" />,
            bg: 'bg-purple-600',
            onClick: onOpenContacts
        },
        {
            id: 'exclusions',
            title: 'الاستثناءات والمراجعة',
            description: 'إدارة المستبعدين من الإرسال',
            icon: <UserX className="w-8 h-8" />,
            bg: 'bg-rose-600',
            onClick: onOpenExclusions
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {cards.map((card) => (
                <button
                    key={card.id}
                    onClick={card.onClick}
                    className={`relative overflow-hidden rounded-[2.5rem] border shadow-xl flex items-stretch text-right h-44 transition-all hover:shadow-2xl hover:border-indigo-500/20 ${theme === 'dark' ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-100'
                        }`}
                >
                    {/* Left/Main Content Section */}
                    <div className="flex-1 p-8 flex flex-col justify-center min-w-0 pr-10">
                        <h3 className="font-black text-2xl leading-tight mb-2 text-gray-800 dark:text-gray-100">
                            {card.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-bold leading-relaxed">
                            {card.description}
                        </p>
                    </div>

                    {/* Right Split Section (Vibrant Solid) */}
                    <div className={`w-36 flex items-center justify-center relative ${card.bg}`}>
                        <div className="text-white">
                            {card.icon}
                        </div>

                        {/* Static Action Indicator */}
                        <div className="absolute bottom-6 right-1/2 translate-x-1/2 p-2.5 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg border border-white/10">
                            <ChevronRight className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default AnnouncementsDashboard;
