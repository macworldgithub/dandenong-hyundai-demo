import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, FileText, RefreshCw, Database } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { importInventoryCsvApi } from '../../api/inventory';

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ImportCsvModal: React.FC<ImportCsvModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'paste'>('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    processed: number;
    vehiclesCreated: number;
    vehiclesUpdated: number;
    dealsCreated: number;
    dealsUpdated: number;
    totalDeals?: number;
    totalVehicles?: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    setFile(null);
    setPasteText('');
    setError(null);
    setResult(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleUploadFile = async () => {
    if (!file) {
      setError('Please select a CSV file to upload.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await importInventoryCsvApi(formData);
      setResult({
        ...res.summary,
        totalDeals: res.totalDeals,
        totalVehicles: res.totalVehicles,
      });
      window.dispatchEvent(new Event('accounting-data-updated'));
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Failed to import CSV file');
    } finally {
      setLoading(false);
    }
  };

  const handleImportPreset = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await importInventoryCsvApi({ useDefaultFiles: true });
      setResult({
        ...res.summary,
        totalDeals: res.totalDeals,
        totalVehicles: res.totalVehicles,
      });
      window.dispatchEvent(new Event('accounting-data-updated'));
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Failed to import preset CSV files');
    } finally {
      setLoading(false);
    }
  };

  const handleImportPasted = async () => {
    if (!pasteText.trim()) {
      setError('Please paste CSV text to import.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await importInventoryCsvApi({ csvText: pasteText, fileName: 'pasted_deals.csv' });
      setResult({
        ...res.summary,
        totalDeals: res.totalDeals,
        totalVehicles: res.totalVehicles,
      });
      window.dispatchEvent(new Event('accounting-data-updated'));
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Failed to process pasted CSV text');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      title="Import Dealership CSV Data"
      subtitle="Import vehicle inventory, new & used deals, and deal costings into MongoDB"
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#deded9] gap-4 text-xs font-semibold">
          <button
            type="button"
            className={`pb-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-b-2 border-[#2936ff] text-[#2936ff]'
                : 'text-[#858580] hover:text-[#252525]'
            }`}
            onClick={() => {
              setActiveTab('upload');
              setError(null);
            }}
          >
            Upload File
          </button>
          <button
            type="button"
            className={`pb-2 transition-colors ${
              activeTab === 'preset'
                ? 'border-b-2 border-[#2936ff] text-[#2936ff]'
                : 'text-[#858580] hover:text-[#252525]'
            }`}
            onClick={() => {
              setActiveTab('preset');
              setError(null);
            }}
          >
            Standard Dealership CSVs
          </button>
          <button
            type="button"
            className={`pb-2 transition-colors ${
              activeTab === 'paste'
                ? 'border-b-2 border-[#2936ff] text-[#2936ff]'
                : 'text-[#858580] hover:text-[#252525]'
            }`}
            onClick={() => {
              setActiveTab('paste');
              setError(null);
            }}
          >
            Paste CSV Data
          </button>
        </div>

        {/* Tab 1: Upload File */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-[#deded9] bg-[#ffffff] p-6 text-center cursor-pointer hover:border-[#2936ff] transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="w-10 h-10 text-[#858580] mx-auto mb-2" />
              <div className="text-sm font-semibold text-[#252525]">
                {file ? file.name : 'Click to select or drag and drop a CSV file'}
              </div>
              <p className="text-xs text-[#858580] mt-1">
                Supports deal transaction registers, deal costings, and vehicle stock files.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {file && (
              <div className="flex items-center justify-between p-3 bg-[#eef1ff] border border-[#cbd5e1] text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#2936ff]" />
                  <span className="font-mono font-medium text-[#252525]">{file.name}</span>
                  <span className="text-[#858580]">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button
                  type="button"
                  className="text-[#b92b24] hover:underline"
                  onClick={() => setFile(null)}
                >
                  Remove
                </button>
              </div>
            )}

            <Button
              variant="primary"
              disabled={!file || loading}
              onClick={handleUploadFile}
              className="w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing & Saving to MongoDB...</span>
                </>
              ) : (
                <span>Upload & Import into MongoDB</span>
              )}
            </Button>
          </div>
        )}

        {/* Tab 2: Standard Dealership CSVs */}
        {activeTab === 'preset' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-[#ffffff] border border-[#deded9] space-y-2">
              <div className="font-semibold text-sm text-[#252525] flex items-center gap-2">
                <Database className="w-4 h-4 text-[#2936ff]" />
                Synchronize Default Dealership Datasets
              </div>
              <p className="text-[#64748b]">
                Imports all 4 standard Booran Dandenong Hyundai CSV datasets stored in backend:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#334155] font-mono text-[11px] pl-1">
                <li><strong className="text-[#252525]">new_deals.csv</strong>: 100 new vehicle deliveries (DH deals)</li>
                <li><strong className="text-[#252525]">used_deals.csv</strong>: 170 used vehicle deliveries (DU deals)</li>
                <li><strong className="text-[#252525]">fleet_deals.csv</strong>: 25 commercial & fleet deliveries (DHF deals)</li>
                <li><strong className="text-[#252525]">deal_costings.csv</strong>: 25 full financial jackets (selling price, GST, trade-ins, deposit, accessories)</li>
              </ul>
            </div>

            <Button
              variant="primary"
              disabled={loading}
              onClick={handleImportPreset}
              className="w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Importing Dealership Datasets...</span>
                </>
              ) : (
                <span>Import / Re-sync Dealership Datasets</span>
              )}
            </Button>
          </div>
        )}

        {/* Tab 3: Paste CSV */}
        {activeTab === 'paste' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1">
                Paste CSV Text
              </label>
              <textarea
                rows={7}
                className="w-full p-2.5 bg-[#ffffff] border border-[#deded9] font-mono text-xs text-[#252525] focus:outline-none focus:border-[#2936ff]"
                placeholder="date,salesperson_code,deal_number,model_code,description,colour_trim,customer_code,stock_number..."
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
              />
            </div>

            <Button
              variant="primary"
              disabled={!pasteText.trim() || loading}
              onClick={handleImportPasted}
              className="w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Parsing & Importing into MongoDB...</span>
                </>
              ) : (
                <span>Process & Import CSV Content</span>
              )}
            </Button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-[#fdf2f2] border border-[#f87171] text-xs text-[#991b1b] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success / Result Summary */}
        {result && (
          <div className="p-4 bg-[#f0fdf4] border border-[#86efac] text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-[#166534]">
              <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
              <span>Import Completed Successfully!</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px] text-[#252525]">
              <div className="p-2 bg-white border border-[#deded9]">
                <div className="text-[#858580] text-[10px]">PROCESSED</div>
                <div className="font-bold text-sm">{result.processed}</div>
              </div>
              <div className="p-2 bg-white border border-[#deded9]">
                <div className="text-[#858580] text-[10px]">NEW DEALS</div>
                <div className="font-bold text-sm text-[#16a34a]">+{result.dealsCreated}</div>
              </div>
              <div className="p-2 bg-white border border-[#deded9]">
                <div className="text-[#858580] text-[10px]">UPDATED DEALS</div>
                <div className="font-bold text-sm text-[#2563eb]">{result.dealsUpdated}</div>
              </div>
              <div className="p-2 bg-white border border-[#deded9]">
                <div className="text-[#858580] text-[10px]">TOTAL DEALS IN DB</div>
                <div className="font-bold text-sm">{result.totalDeals ?? 'Updated'}</div>
              </div>
            </div>
            <p className="text-[11px] text-[#166534] pt-1">
              ✓ Database integrity checked: duplicate records were prevented and existing records were updated correctly.
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-[#deded9]">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              handleReset();
              onClose();
            }}
          >
            Close
          </Button>
          {result && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                handleReset();
                onClose();
              }}
            >
              View In Inventory & Deals
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
