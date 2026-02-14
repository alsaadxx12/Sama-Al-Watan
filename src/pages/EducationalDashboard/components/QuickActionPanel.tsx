import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import { PlusCircle, Users, ClipboardList, Settings, ArrowRightLeft } from 'lucide-react';

const QuickActionPanel: React.FC = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const isDark = theme === 'dark';

    const actions = [
        {
            label: 'دورة جديدة',
            icon: PlusCircle,
            path: '/courses',
            color: 'bg-indigo-500',
            textColor: 'text-indigo-500'
        },
        {
            label: 'طلبات الانضمام',
            icon: ClipboardList,
            path: '/course-applications',
            color: 'bg-emerald-500',
            textColor: 'text-emerald-500'
        },
        {
            label: 'إدارة الطلاب',
            icon: Users,
            path: '/courses',
            color: 'bg-blue-500',
            textColor: 'text-blue-500'
        },
        {
            label: 'سجل العمليات',
            icon: ArrowRightLeft,
            path: '/accounts',
            color: 'bg-orange-500',
            textColor: 'text-orange-500'
        },
        {
            label: 'الإعدادات',
            icon: Settings,
            path: '/settings',
            color: 'bg-gray-500',
            textColor: 'text-gray-500'
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {actions.map((action, i) => (
                <button
                    key={i}
                    onClick={() => navigate(action.path)}
                    className={`group flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${isDark
                        ? 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-700/60 hover:border-gray-600'
                        : 'bg-white border-gray-100 hover:bg-gray-50 hover:shadow-lg'
                        }`}
                >
                    <div className={`p-2 rounded-xl bg-opacity-10 ${action.color} group-hover:scale-110 transition-transform`}>
                        <action.icon className={`w-5 h-5 ${action.textColor}`} />
                    </div>
                    <span className={`text-xs font-black ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {action.label}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default QuickActionPanel;
