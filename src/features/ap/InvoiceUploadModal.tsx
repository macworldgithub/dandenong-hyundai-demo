import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { FileUpload } from '../../components/ui/FileUpload';
import { uploadInvoiceApi } from '../../api/ap';

interface InvoiceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newInvoice: any) => void;
}

export const InvoiceUploadModal: React.FC<InvoiceUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await uploadInvoiceApi(file);
      onSuccess(res.invoice);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to upload and extract invoice');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Supplier Invoice"
      subtitle="PDF or scanned invoice document for simulated OCR extraction"
      maxWidth="md"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-none text-xs text-[#b92b24]">
            {error}
          </div>
        )}

        <FileUpload
          accept=".pdf,.png,.jpg,.jpeg"
          onFileSelect={handleFileSelect}
          isLoading={isLoading}
          title="Drop Invoice PDF or Image"
          subtitle="OCR will extract supplier, invoice number, lines, GST and bank details"
        />

        <p className="text-[11px] text-[#858580] text-center">
          Extracted fields are assigned confidence scores and queued in Capture Inbox.
        </p>
      </div>
    </Modal>
  );
};
