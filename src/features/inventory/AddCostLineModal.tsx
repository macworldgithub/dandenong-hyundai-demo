import React, { useState } from 'react';
import { Plus, AlertCircle, Wrench } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Vehicle } from '../../types/inventory';
import { addCostLineApi } from '../../api/inventory';
import { toCents } from '../../lib/money';

interface AddCostLineModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onSuccess: () => void;
}

export const AddCostLineModal: React.FC<AddCostLineModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onSuccess,
}) => {
  const [type, setType] = useState('recon');
  const [amountDollars, setAmountDollars] = useState('');
  const [sourceDocRef, setSourceDocRef] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!vehicle) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountDollars || isNaN(parseFloat(amountDollars))) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const isNegativeType = type === 'holdback' || type === 'bonus';
      const parsedAmount = Math.abs(toCents(amountDollars));
      const amountCents = isNegativeType ? -parsedAmount : parsedAmount;

      await addCostLineApi(vehicle._id, {
        type,
        amountCents,
        sourceDocRef: sourceDocRef || 'INTERNAL-ADJ',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to add cost line');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Cost Line to Vehicle"
      subtitle={`Append capitalized cost to VIN ${vehicle.vin} (${vehicle.stockNumber})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-none text-xs text-[#b92b24]">
            {error}
          </div>
        )}

        <Select
          label="Cost Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={[
            { value: 'recon', label: 'Reconditioning / Detail' },
            { value: 'transport', label: 'Freight & Transport' },
            { value: 'pdi', label: 'Pre-Delivery Inspection (PDI)' },
            { value: 'accessories', label: 'Accessories & Protection' },
            { value: 'compliance', label: 'Compliance' },
            { value: 'holdback', label: 'OEM Holdback (Reduces Cost)' },
            { value: 'bonus', label: 'Target Bonus (Reduces Cost)' },
          ]}
        />

        <Input
          label="Amount (AUD $)"
          type="number"
          step="0.01"
          required
          value={amountDollars}
          onChange={(e) => setAmountDollars(e.target.value)}
          placeholder="e.g. 450.00"
        />

        <Input
          label="Source Document Reference"
          required
          value={sourceDocRef}
          onChange={(e) => setSourceDocRef(e.target.value)}
          placeholder="e.g. RO-44910 or INV-8821"
        />

        <p className="text-[11px] text-[#858580]">
          Adding this line will instantly recompute vehicle totalCostCents and synchronize the inventory sub-ledger to the General Ledger.
        </p>

        <div className="pt-4 border-t border-[#deded9] flex justify-end gap-2">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
            <Plus className="w-3.5 h-3.5" />
            <span>Append Cost Line</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
