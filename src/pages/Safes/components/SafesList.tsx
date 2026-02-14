import React, { useState, useMemo } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Safe, UnconfirmedVoucher } from '../types';
import ConfirmAllModal from './ConfirmAllModal';
import { addConfirmationRecord } from '../../../lib/collections/confirmationHistory';
import { confirmMultipleVouchers } from '../../../lib/collections/safes';
import SafePhysicsCard from './SafePhysicsCard';

interface SafesListProps {
  safes: Safe[];
  unconfirmedVouchers?: UnconfirmedVoucher[];
  onEdit: (safe: Safe) => void;
  onDelete: (safeId: string) => void;
  hasEditPermission: boolean;
  hasDeletePermission: boolean;
  onConfirmVoucher?: (voucherId: string) => Promise<boolean>;
  isLoadingVouchers?: boolean;
  onViewHistory: (safe: Safe) => void;
}

const SafesList: React.FC<SafesListProps> = ({
  safes,
  unconfirmedVouchers = [],
  onEdit,
  onDelete,
  hasEditPermission,
  hasDeletePermission,
  onConfirmVoucher,
  isLoadingVouchers = false,
  onViewHistory
}) => {
  const { theme } = useTheme();
  const { employee } = useAuth();
  const [expandedSafe, setExpandedSafe] = useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedSafeForConfirm, setSelectedSafeForConfirm] = useState<{
    safe: Safe;
    vouchers: UnconfirmedVoucher[];
    unconfirmedBalance: { usd: number; iqd: number };
  } | null>(null);

  const calculateUnconfirmedBalances = () => {
    const unconfirmedBalances: Record<string, { usd: number, iqd: number }> = {};

    safes.forEach(safe => {
      unconfirmedBalances[safe.id] = { usd: 0, iqd: 0 };
    });

    unconfirmedVouchers.forEach(voucher => {
      if (!unconfirmedBalances[voucher.safeId]) {
        unconfirmedBalances[voucher.safeId] = { usd: 0, iqd: 0 };
      }

      const factor = voucher.type === 'receipt' ? 1 : -1;
      const amount = voucher.amount * factor;

      if (voucher.currency === 'USD') {
        unconfirmedBalances[voucher.safeId].usd += amount;
      } else {
        unconfirmedBalances[voucher.safeId].iqd += amount;
      }
    });

    return unconfirmedBalances;
  };

  const unconfirmedBalances = useMemo(() => calculateUnconfirmedBalances(), [unconfirmedVouchers, safes]);

  const getSafeVouchers = (safeId: string) => {
    return unconfirmedVouchers.filter(v => v.safeId === safeId);
  };



  const handleConfirmAllClick = (safe: Safe, vouchers: UnconfirmedVoucher[], unconfirmedBalance: { usd: number; iqd: number }) => {
    setSelectedSafeForConfirm({ safe, vouchers, unconfirmedBalance });
    setConfirmModalOpen(true);
  };

  const handleConfirmAll = async () => {
    if (!selectedSafeForConfirm || !employee) return;

    const { safe, vouchers, unconfirmedBalance } = selectedSafeForConfirm;

    try {
      const employeeName = employee?.name || 'Unknown';
      const employeeEmail = employee?.email || 'Unknown';
      const employeeId = employee?.id || '';

      const voucherDetails = vouchers.map(v => ({
        id: v.id,
        companyName: v.companyName || 'غير محدد',
        section: v.section || 'غير محدد',
        amount: v.amount,
        currency: v.currency,
        type: v.type
      }));

      await addConfirmationRecord(
        {
          safeId: safe.id,
          safeName: safe.name,
          unconfirmedBalanceUSD: unconfirmedBalance.usd,
          unconfirmedBalanceIQD: unconfirmedBalance.iqd,
          vouchersConfirmed: vouchers.length,
          voucherIds: vouchers.map(v => v.id),
          voucherDetails
        },
        employeeName,
        employeeEmail
      );

      await confirmMultipleVouchers(
        vouchers.map(v => v.id),
        employeeName,
        employeeId,
        safe.id
      );

      alert('تم التأكيد بنجاح!');
      setConfirmModalOpen(false);
      setSelectedSafeForConfirm(null);
    } catch (error) {
      console.error('❌ Error in confirmation process:', error);
      alert('فشل في حفظ سجل التأكيد: ' + (error as Error).message);
      setSelectedSafeForConfirm(null);
    }
  };



  return (
    <>
      {selectedSafeForConfirm && (
        <ConfirmAllModal
          isOpen={confirmModalOpen}
          onClose={() => {
            setConfirmModalOpen(false);
            setSelectedSafeForConfirm(null);
          }}
          onConfirm={handleConfirmAll}
          safeName={selectedSafeForConfirm.safe.name}
          vouchersCount={selectedSafeForConfirm.vouchers.length}
          unconfirmedBalanceUSD={selectedSafeForConfirm.unconfirmedBalance.usd}
          unconfirmedBalanceIQD={selectedSafeForConfirm.unconfirmedBalance.iqd}
        />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 items-start">
        {safes.map((safe, index) => {
          const safeVouchers = getSafeVouchers(safe.id);
          const unconfirmedBalance = unconfirmedBalances[safe.id] || { usd: 0, iqd: 0 };
          return (
            <SafePhysicsCard
              key={safe.id}
              safe={safe}
              index={index}
              unconfirmedVouchers={unconfirmedVouchers}
              unconfirmedBalance={unconfirmedBalance}
              isExpanded={expandedSafe === safe.id}
              onToggleExpand={() => setExpandedSafe(expandedSafe === safe.id ? null : safe.id)}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewHistory={onViewHistory}
              onConfirmAll={() => handleConfirmAllClick(safe, safeVouchers, unconfirmedBalance)}
              hasEditPermission={hasEditPermission}
              hasDeletePermission={hasDeletePermission}
            />
          );
        })}
      </div>
    </>
  );
};

export default SafesList;
