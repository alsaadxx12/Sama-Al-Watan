import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface PrintSettings {
    gatesColumnLabel: string;
    internalColumnLabel: string;
    externalColumnLabel: string;
    flyColumnLabel: string;
    primaryColor: string;
    textColor: string;
    logoUrl: string;
    footerAddress: string;
    companyNameLabel: string;
    receiptNoLabel: string;
    dateLabel: string;
    dayLabel: string;
    receivedFromLabel: string;
    amountReceivedLabel: string;
    amountInWordsLabel: string;
    detailsLabel: string;
    phoneLabel: string;
    cashierLabel: string;
    recipientSignatureLabel: string;
    directorSignatureLabel: string;
}

const DEFAULT_SETTINGS: PrintSettings = {
    gatesColumnLabel: 'العمود الأول',
    internalColumnLabel: 'العمود الثاني',
    externalColumnLabel: 'العمود الثالث',
    flyColumnLabel: 'العمود الرابع',
    primaryColor: '#4A0E6B',
    textColor: '#111827',
    logoUrl: "",
    footerAddress: '9647730308111 - 964771800033 | كربلاء - شارع الإسكان - قرب مستشفى احمد الوائلي',
    companyNameLabel: 'شركة الروضتين للسفر والسياحة',
    receiptNoLabel: 'Receipt No:',
    dateLabel: 'Date:',
    dayLabel: 'Day:',
    receivedFromLabel: 'Received From',
    amountReceivedLabel: 'Amount Received',
    amountInWordsLabel: 'The amount is written',
    detailsLabel: 'Details',
    phoneLabel: 'Phone Number',
    cashierLabel: 'منظم الوصل',
    recipientSignatureLabel: 'توقيع المستلم',
    directorSignatureLabel: 'المدير'
};

export function usePrintSettings() {
    const [settings, setSettings] = useState<PrintSettings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const settingsRef = doc(db, 'settings', 'print');
                const docSnap = await getDoc(settingsRef);
                if (docSnap.exists()) {
                    setSettings(prev => ({
                        ...prev,
                        ...docSnap.data()
                    }));
                }
            } catch (error) {
                console.error("Error loading print settings:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();
    }, []);

    return { settings, isLoading };
}
