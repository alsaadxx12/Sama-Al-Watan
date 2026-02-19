import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, collection, getDocs, writeBatch, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

type Theme = 'light' | 'dark';

interface Certificate {
  id: string;
  imageUrl: string;
  pages: string[];
  logoUrl: string;
  title: string;
  rotation: number;
}

interface TrainerCertificate {
  id: string;
  name: string;
  title: string;
  imageUrl: string;
  certificatePages: string[];
}

interface BoardAccreditation {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
}

interface CustomSettings {
  logoUrl: string;
  headerLogoUrl: string;
  loginLogoUrl: string;
  headerGradient: string;
  logoSize: number;
  certificates: Certificate[];
  trainerCertificates: TrainerCertificate[];
  boardAccreditations: BoardAccreditation[];
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  mapLat: number;
  mapLng: number;
}

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  customSettings: CustomSettings;
  setCustomSettings: (settings: CustomSettings) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_SETTINGS: CustomSettings = {
  logoUrl: '',
  headerLogoUrl: '',
  loginLogoUrl: '',
  headerGradient: 'from-indigo-700 via-indigo-800 to-blue-800',
  logoSize: 40,
  certificates: [],
  trainerCertificates: [],
  boardAccreditations: [],
  contactPhone: '',
  contactEmail: '',
  contactAddress: '',
  mapLat: 33.3152,
  mapLng: 44.3661,
};

const SETTINGS_CACHE_KEY = 'customThemeSettings';

const getCachedSettings = (): CustomSettings => {
  try {
    const cached = localStorage.getItem(SETTINGS_CACHE_KEY);
    if (cached) return { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
  } catch { }
  return DEFAULT_SETTINGS;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light'; // Default to light theme
  });

  const [customSettings, setCustomSettingsState] = useState<CustomSettings>(getCachedSettings);

  // Load certificates from subcollection
  const loadCertificates = async (): Promise<Certificate[]> => {
    try {
      const certsCol = collection(db, 'settings', 'theme', 'certificates');
      const snapshot = await getDocs(certsCol);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Certificate));
    } catch {
      return [];
    }
  };

  // Load trainer certificates from subcollection + pages from sub-subcollection
  const loadTrainerCertificates = async (): Promise<TrainerCertificate[]> => {
    try {
      const col = collection(db, 'settings', 'theme', 'trainerCertificates');
      const snapshot = await getDocs(col);
      const results: TrainerCertificate[] = [];
      for (const d of snapshot.docs) {
        const data = d.data();
        // Load pages from sub-subcollection
        const pagesCol = collection(db, 'settings', 'theme', 'trainerCertificates', d.id, 'pages');
        const pagesSnap = await getDocs(pagesCol);
        const pages = pagesSnap.docs
          .sort((a, b) => Number(a.id) - Number(b.id))
          .map(p => p.data().dataUrl as string);
        const certificatePages = pages.length > 0 ? pages : (data.certificatePages || []);
        results.push({
          id: d.id,
          name: data.name || '',
          title: data.title || '',
          imageUrl: certificatePages[0] || data.imageUrl || '',
          certificatePages,
        });
      }
      return results;
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const settingsRef = doc(db, 'settings', 'theme');

    const unsubscribe = onSnapshot(settingsRef, async (docSnap) => {
      if (docSnap.exists()) {
        const rawData = docSnap.data();
        // Load certificates from subcollections
        const certs = await loadCertificates();
        const trainerCerts = await loadTrainerCertificates();
        // Fallback: if subcollection is empty but doc has old field, use that
        const certificates = certs.length > 0 ? certs : (rawData.certificates || []);
        const trainerCertificates = trainerCerts.length > 0 ? trainerCerts : (rawData.trainerCertificates || []);
        const data = { ...DEFAULT_SETTINGS, ...rawData, certificates, trainerCertificates } as CustomSettings;
        setCustomSettingsState(data);
        try { localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(data)); } catch { }
      } else {
        setDoc(settingsRef, DEFAULT_SETTINGS).catch(() => { });
      }
    }, () => {
      setCustomSettingsState(getCachedSettings());
    });

    return () => unsubscribe();
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('theme', newTheme);
  };

  const setCustomSettings = async (newSettings: CustomSettings) => {
    try {
      const settingsRef = doc(db, 'settings', 'theme');
      const { certificates, trainerCertificates, ...themeOnly } = newSettings;

      // 1. Save theme settings WITHOUT certificates (keeps doc small)
      await setDoc(settingsRef, { ...themeOnly, certificates: [], trainerCertificates: [] }, { merge: true });

      // 2. Save each certificate as its own document in subcollection
      const certsCol = collection(db, 'settings', 'theme', 'certificates');

      // Delete existing certificate docs
      const existingSnap = await getDocs(certsCol);
      const batch = writeBatch(db);
      existingSnap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();

      // Write new certificate docs (each gets its own 1MB limit)
      for (const cert of certificates) {
        const certRef = doc(certsCol, cert.id);
        await setDoc(certRef, cert);
      }

      // 3. Save trainer certificates — main data in doc, pages in sub-subcollection
      const trainerCol = collection(db, 'settings', 'theme', 'trainerCertificates');
      // Delete existing trainer cert docs and their pages sub-subcollections
      const existingTrainerSnap = await getDocs(trainerCol);
      for (const existingDoc of existingTrainerSnap.docs) {
        const existingPagesCol = collection(db, 'settings', 'theme', 'trainerCertificates', existingDoc.id, 'pages');
        const existingPagesSnap = await getDocs(existingPagesCol);
        if (existingPagesSnap.docs.length > 0) {
          const pagesBatch = writeBatch(db);
          existingPagesSnap.docs.forEach(p => pagesBatch.delete(p.ref));
          await pagesBatch.commit();
        }
      }
      const trainerBatch = writeBatch(db);
      existingTrainerSnap.docs.forEach(d => trainerBatch.delete(d.ref));
      await trainerBatch.commit();

      // Write new trainer certs — doc stores name/title only, pages go to sub-subcollection
      for (const tc of trainerCertificates) {
        const tcRef = doc(trainerCol, tc.id);
        await setDoc(tcRef, { id: tc.id, name: tc.name, title: tc.title, imageUrl: '' });
        // Save each page as its own document
        const pagesCol = collection(db, 'settings', 'theme', 'trainerCertificates', tc.id, 'pages');
        for (let pi = 0; pi < (tc.certificatePages || []).length; pi++) {
          const pageRef = doc(pagesCol, String(pi));
          await setDoc(pageRef, { dataUrl: tc.certificatePages[pi] });
        }
      }

      // Update local state immediately
      setCustomSettingsState(newSettings);
      try { localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(newSettings)); } catch { }
    } catch (e) {
      console.error("Failed to save custom theme settings to Firestore", e);
      throw e;
    }
  };

  useEffect(() => {
    setTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, customSettings, setCustomSettings }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
