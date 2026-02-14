import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface PrintSettings {
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
    dateLabel: string;
    dayLabel: string;
    receivedFromLabel: string;
    receivedFromArabicLabel: string;
    paidToArabicLabel: string;
    amountReceivedLabel: string;
    amountInWordsLabel: string;
    detailsLabel: string;
    distributionTitleLabel: string;
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
    labelBackgroundColor: '#F3E8FF',
    textColor: '#111827',
    logoUrl: "",
    footerAddress: 'يرجى كتابة العنوان وأرقام الهواتف هنا',
    companyNameLabel: 'اسم الشركة',
    receiptTitle: 'سند قبض',
    paymentTitle: 'سند صرف',
    receiptNoLabel: 'Receipt No:',
    dateLabel: 'Date:',
    dayLabel: 'Day:',
    receivedFromLabel: 'Received From',
    receivedFromArabicLabel: 'استلمنا من السيد/ السادة:',
    paidToArabicLabel: 'ادفعوا إلى السيد/ السادة:',
    amountReceivedLabel: 'Amount Received',
    amountInWordsLabel: 'The amount is written',
    detailsLabel: 'Details',
    distributionTitleLabel: 'تفاصيل التوزيع',
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
