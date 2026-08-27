import React, { useState } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  Download, 
  Check, 
  X, 
  Sparkles, 
  FileDown, 
  Layers, 
  Snowflake,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { BOM, ExportOptions } from '../types';
import { exportToPDF, exportToCSV, exportToExcel } from '../lib/export';
import { formatCurrency } from '../lib/utils';
import useBOMStore from '../stores/bomStore';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  bom: BOM | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, bom }) => {
  const { currency } = useBOMStore();
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'csv' | 'excel'>('pdf');
  const [includeCosts, setIncludeCosts] = useState(true);
  const [includeLabor, setIncludeLabor] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !bom) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const options: ExportOptions = {
        format: selectedFormat,
        includeCosts,
        includeLabor,
        includeSummary,
        currency,
      };

      if (selectedFormat === 'pdf') {
        exportToPDF(bom, options);
        toast.success(`Generated official PDF specification for "${bom.name}"`, {
          icon: <FileText className="w-4 h-4 text-emerald-500" />
        });
      } else if (selectedFormat === 'csv') {
        exportToCSV(bom, options);
        toast.success(`Exported CSV dataset for "${bom.name}"`, {
          icon: <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
        });
      } else {
        exportToExcel(bom, options);
        toast.success(`Generated Excel workbook for "${bom.name}"`, {
          icon: <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
        });
      }

      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 400);
    } catch (error) {
      console.error('Export error', error);
      toast.error('Failed to generate export file. Please try again.');
      setIsExporting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          {/* Header Banner */}
          <div className="relative bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 p-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Professional Reporting Engine</span>
            </div>
            <h3 className="text-xl font-extrabold font-display">Export Bill of Materials</h3>
            <p className="text-xs text-emerald-200/80 mt-0.5 line-clamp-1">
              {bom.name} ({bom.projectCode || 'AF-BOM'}) • Batch: {bom.batchQuantity || 1} {bom.batchUnit || 'units'}
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Format Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Select Export Format
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {/* PDF Option */}
                <button
                  type="button"
                  onClick={() => setSelectedFormat('pdf')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
                    selectedFormat === 'pdf'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 ${
                    selectedFormat === 'pdf' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold">PDF Document</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Official Spec</span>
                </button>

                {/* CSV Option */}
                <button
                  type="button"
                  onClick={() => setSelectedFormat('csv')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
                    selectedFormat === 'csv'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 ${
                    selectedFormat === 'csv' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold">CSV Dataset</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Universal Table</span>
                </button>

                {/* Excel Option */}
                <button
                  type="button"
                  onClick={() => setSelectedFormat('excel')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
                    selectedFormat === 'excel'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 ${
                    selectedFormat === 'excel' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold">Excel (.xlsx)</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Multi-Sheet</span>
                </button>
              </div>
            </div>

            {/* Customization Options */}
            <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Report Sections Included
              </span>

              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Raw Materials & Ingredients Breakdown ({bom.items?.length || 0} items)
                </span>
                <input
                  type="checkbox"
                  checked={includeCosts}
                  onChange={(e) => setIncludeCosts(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Labor & Cold-Chain Processing Operations ({bom.laborItems?.length || 0} stages)
                </span>
                <input
                  type="checkbox"
                  checked={includeLabor}
                  onChange={(e) => setIncludeLabor(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Economics Summary, Margins & Suggested Selling Price
                </span>
                <input
                  type="checkbox"
                  checked={includeSummary}
                  onChange={(e) => setIncludeSummary(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>

            {/* Summary preview badge */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs">
              <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Batch Value: <strong>{formatCurrency(bom.grandTotal, currency)}</strong></span>
              </div>
              <div className="flex items-center space-x-1 text-cyan-700 dark:text-cyan-400 font-semibold">
                <Snowflake className="w-3.5 h-3.5" />
                <span>{bom.storageCondition || 'Chilled'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isExporting}
                onClick={handleExport}
                className="flex-2 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isExporting 
                    ? 'Generating File...' 
                    : `Download ${selectedFormat.toUpperCase()} Report`
                  }
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExportModal;
