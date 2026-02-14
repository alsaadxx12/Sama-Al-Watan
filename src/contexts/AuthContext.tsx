import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  setPersistence,
  browserLocalPersistence,
  signInAnonymously
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getEmployeeByUserId, updateEmployee } from '../lib/collections/employees';

interface AuthContextType {
  user: any;
  employee: any;
  loading: boolean;
  isAnonymous: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loginAnonymously: () => Promise<void>;
  updateEmployeeProfile: (employeeId: string, data: Partial<any>) => Promise<void>;
  checkPermission: (page: string, action: string) => boolean;
  permissionLoading: boolean;
  currentUser: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [permissionLoading, setPermissionLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);

  const navigate = useNavigate();

  // Check if employee has permission to login
  const checkEmployeePermissions = (employeeData: any) => {
    if (!employeeData) throw new Error('لم يتم العثور على بيانات الموظف');

    if (!employeeData.permission_group || !employeeData.permission_group.permissions) {
      return true;
    }

    const permissions = employeeData.permission_group.permissions;
    if (permissions?.isAdmin === true) return true;

    return true;
  };

  const handleAuthStateChange = async (fbUser: User | null) => {
    setLoading(true);
    setPermissionLoading(true);
    setCurrentUser(fbUser);
    setIsAnonymous(fbUser?.isAnonymous || false);

    if (!fbUser) {
      // Don't auto-sign-in anonymously here anymore. 
      // Let components call loginAnonymously() if needed.
      setUser(null);
      setEmployee(null);
      setAuthInitialized(true);
      setPermissionLoading(false);
      setLoading(false);
      return;
    }

    const isCreatingUser = localStorage.getItem('isCreatingUser') === 'true';
    if (isCreatingUser && employee) {
      setLoading(false);
      setPermissionLoading(false);
      return;
    }

    if (fbUser && !fbUser.isAnonymous) {
      try {
        const employeeData = await getEmployeeByUserId(fbUser.uid);

        if (employeeData && !employeeData.isActive) {
          await firebaseSignOut(auth);
          setUser(null);
          setEmployee(null);
          setError('تم تعطيل حسابك. يرجى التواصل مع المسؤول');
        } else if (employeeData) {
          checkEmployeePermissions(employeeData);
          setUser(fbUser);
          setEmployee(employeeData);
        } else {
          setUser(fbUser);
          setEmployee(null);
        }
      } catch (err) {
        console.error('Error in auth state change:', err);
        setUser(null);
        setEmployee(null);
      } finally {
        setAuthInitialized(true);
        setPermissionLoading(false);
      }
    } else if (fbUser && fbUser.isAnonymous) {
      setUser(fbUser);
      setEmployee(null);
      setAuthInitialized(true);
      setPermissionLoading(false);
    } else {
      setUser(null);
      setEmployee(null);
      setAuthInitialized(true);
      setPermissionLoading(false);
    }
    setLoading(false);
  };

  const loginAnonymously = async () => {
    try {
      setLoading(true);
      await signInAnonymously(auth);
    } catch (err: any) {
      console.error('Error signing in anonymously:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);
    setPersistence(auth, browserLocalPersistence).catch(console.error);
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      if (!email || !password) throw new Error('يرجى إدخال البريد الإلكتروني وكلمة المرور');

      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const employeeData = await getEmployeeByUserId(userCredential.user.uid);

      if (!employeeData) {
        await firebaseSignOut(auth);
        throw new Error('لم يتم العثور على بيانات الموظف');
      }
      if (!employeeData.isActive) {
        await firebaseSignOut(auth);
        throw new Error('تم تعطيل حسابك. يرجى التواصل مع المسؤول');
      }

      checkEmployeePermissions(employeeData);
      setUser(userCredential.user);
      setEmployee(employeeData);

      const from = (location as any).state?.from?.pathname || '/attendance-standalone';
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Error signing in:', err);
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      setUser(null);
      setEmployee(null);
      navigate('/login', { replace: true });
    } catch (err: any) {
      console.error('Error signing out:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateEmployeeProfile = async (employeeId: string, data: Partial<any>) => {
    try {
      if (!employeeId) throw new Error('Employee ID is required');
      await updateEmployee(employeeId, data);
      setEmployee((prev: any) => prev ? { ...prev, ...data } : null);
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  const checkPermission = (page: string, action: string): boolean => {
    if (!employee || !employee.permission_group) return false;
    const permissions = employee.permission_group.permissions;
    if (permissions?.isAdmin === true) return true;

    const pageNameMap: Record<string, string> = {
      'accounts': 'الحسابات', 'الحسابات': 'accounts',
      'companies': 'الشركات', 'الشركات': 'companies',
      'employees': 'الموظفين', 'الموظفين': 'employees',
      'safes': 'الصناديق', 'الصناديق': 'safes',
      'announcements': 'اعلان', 'اعلان': 'announcements',
      'reports': 'التبليغات', 'التبليغات': 'reports',
      'settings': 'الاعدادات', 'الاعدادات': 'settings',
      'dashboard': 'لوحة التحكم', 'لوحة التحكم': 'dashboard',
      'attendance': 'تسجيل الحضور', 'تسجيل الحضور': 'attendance',
      'leaves': 'الإجازات', 'الإجازات': 'leaves'
    };

    const altPage = pageNameMap[page];
    const pagePerms = (Array.isArray(permissions?.[page]) ? permissions[page] : (altPage && Array.isArray(permissions?.[altPage]) ? permissions[altPage] : [])) as string[];

    if (action === 'read' && pagePerms.includes('view')) return true;
    return pagePerms.includes(action);
  };

  const value = {
    user,
    employee,
    loading: loading || !authInitialized,
    isAnonymous,
    permissionLoading,
    currentUser,
    error,
    signIn,
    signOut,
    loginAnonymously,
    updateEmployeeProfile,
    checkPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
