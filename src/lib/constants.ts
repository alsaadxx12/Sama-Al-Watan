import {
  BookOpen,
  Users,
  Wallet,
  Box,
  Settings,
  UserCheck,
  Briefcase,
  ClipboardList,
  Sparkles,
  Link2,
} from 'lucide-react';

export const menuItems = [
  {
    path: '/educational-dashboard',
    icon: Sparkles,
    textKey: 'لوحة التعليم',
    permissions: ['view'],
  },
  {
    path: '/relationships',
    icon: Link2,
    textKey: 'العلاقات',
  },
  {
    path: '/courses',
    icon: BookOpen,
    textKey: 'الدورات',
  },
  {
    path: '/course-applications',
    icon: ClipboardList,
    textKey: 'طلبات التقديم',
  },
  {
    path: '/attendance',
    icon: UserCheck,
    textKey: 'تسجيل الحضور',
  },
  {
    path: '/employees',
    icon: Users,
    textKey: 'الموظفين',
  },
  {
    textKey: 'الحسابات',
    icon: Wallet,
    subItems: [
      {
        path: '/accounts',
        icon: Wallet,
        textKey: 'accounts',
        permissions: ['view', 'add', 'edit', 'delete', 'print', 'currency', 'settlement', 'confirm', 'read'],
      },
      {
        path: '/safes',
        icon: Box,
        textKey: 'safes',
      },
      {
        path: '/expenses',
        icon: Briefcase,
        textKey: 'المصروفات',
      }
    ]
  },
  {
    path: '/settings',
    icon: Settings,
    textKey: 'settings',
  }
];
