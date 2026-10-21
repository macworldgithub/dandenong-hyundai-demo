import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { FileUpload } from '../../components/ui/FileUpload';
import { importBankStatementApi } from '../../api/bank';

interface StatementUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankAccountId: string;
  onSuccess: () => void;
}

export const StatementUploadModal: React.FC<StatementUploadModalProps> = ({
  isOpen,
  onClose,
  bankAccountId,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      await importBankStatementApi(bankAccountId, file);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to parse and import statement');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Bank Statement"
      subtitle="Upload standard NAB CSV or XLSX electronic statement"
      maxWidth="md"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-none text-xs text-[#b92b24]">
            {error}
          </div>
        )}

        <FileUpload
          accept=".csv,.xlsx,.xls"
          onFileSelect={handleFileSelect}
          isLoading={isLoading}
          title="Drop NAB CSV / XLSX Statement"
          subtitle="Requires Date, Description, and Amount or Debit and Credit columns"
        />

        <p className="text-[11px] text-[#858580] text-center">
          Upload transaction-level bank exports. Weekly management packs and summary reports are not bank statements.
        </p>
        <p className="text-[11px] text-[#858580] text-center">
          Incoming transactions will run through the real-time candidate scoring engine.
        </p>
      </div>
    </Modal>
  );
};
