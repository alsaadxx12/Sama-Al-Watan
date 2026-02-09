import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Printer, Loader2, AlertTriangle } from 'lucide-react';
import { usePrintSettings } from '../hooks/usePrintSettings';
import { generateVoucherHTML } from './Accounts/components/PrintTemplate';

const PublicVoucher: React.FC = () => {
  const { voucherId } = useParams<{ voucherId: string }>();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const convertToIQD = searchParams.get('convertToIQD') === 'true';

  const [voucherData, setVoucherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showButtons, setShowButtons] = useState(true);
  const [previewHtml, setPreviewHtml] = useState('');

  const { settings: printSettings, isLoading: isLoadingSettings } = usePrintSettings();

  useEffect(() => {
    const fetchVoucher = async () => {
      if (!voucherId) {
        setError('معرّف السند غير موجود');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const voucherRef = doc(db, 'vouchers', voucherId);
        const voucherDoc = await getDoc(voucherRef);

        if (!voucherDoc.exists()) {
          setError('السند غير موجود أو تم حذفه');
        } else {
          const data = voucherDoc.data();
          const formattedData = {
            ...data,
            id: voucherDoc.id,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          };
          setVoucherData(formattedData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError('حدث خطأ أثناء تحميل بيانات السند');
      } finally {
        setLoading(false);
      }
    };

    fetchVoucher();
  }, [voucherId]);

  useEffect(() => {
    const generateHTML = async () => {
      if (voucherData && !isLoadingSettings) {
        const urlRate = searchParams.get('rate');
        const exchangeRate = urlRate ? parseFloat(urlRate) : (voucherData.exchangeRate || 1);

        const voucherWithMeta = {
          ...voucherData,
          convertToIQD,
          exchangeRate,
          gatesColumnLabel: printSettings.gatesColumnLabel,
          internalColumnLabel: printSettings.internalColumnLabel,
          externalColumnLabel: printSettings.externalColumnLabel,
          flyColumnLabel: printSettings.flyColumnLabel
        };

        const html = await generateVoucherHTML(voucherWithMeta, printSettings);
        setPreviewHtml(html);
      }
    };

    generateHTML();
  }, [voucherData, printSettings, isLoadingSettings, convertToIQD, searchParams]);

  useEffect(() => {
    const handleBeforePrint = () => setShowButtons(false);
    const handleAfterPrint = () => setShowButtons(true);

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    if (previewHtml && !loading && !searchParams.get('noAutoPrint')) {
      const printTimeout = setTimeout(() => {
        window.print();
      }, 1000);
      return () => clearTimeout(printTimeout);
    }

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [previewHtml, loading, searchParams]);

  const handlePrint = () => {
    window.print();
  };

  if (loading || isLoadingSettings) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-bold">جاري تحميل السند والإعدادات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 bg-gray-100 dark:bg-gray-900">
        <AlertTriangle className="w-16 h-16 text-red-500" />
        <h2 className="mt-6 text-2xl font-bold text-gray-800 dark:text-white">حدث خطأ</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
        <button
          onClick={() => navigate('/accounts')}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
        >
          العودة إلى الحسابات
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 sm:p-8 bg-gray-100 dark:bg-gray-950`}>
      <div className="max-w-4xl mx-auto">
        {showButtons && (
          <div className="flex justify-center items-center gap-4 mb-6 no-print">
            <button
              onClick={() => navigate('/accounts')}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all shadow-sm`}
            >
              العودة للحسابات
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform active:scale-95"
            >
              <Printer className="w-4 h-4" />
              طباعة السند
            </button>
          </div>
        )}

        <div className="printable-content bg-white shadow-2xl rounded-2xl overflow-hidden">
          <iframe
            srcDoc={previewHtml}
            className="w-full aspect-[210/148] border-none"
            title="Voucher"
            style={{ width: '100%', height: '148mm' }}
          />
        </div>

        <style>{`
          @media print {
            body { background: white !important; padding: 0 !important; margin: 0 !important; }
            .no-print { display: none !important; }
            .printable-content { 
              box-shadow: none !important; 
              border: none !important; 
              border-radius: 0 !important; 
              width: 100% !important; 
              height: 100% !important;
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
            }
            .max-w-4xl { max-width: none !important; }
            iframe { height: 148mm !important; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default PublicVoucher;
