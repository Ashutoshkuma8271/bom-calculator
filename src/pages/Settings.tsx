import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Sparkles, 
  Download, 
  Save, 
  RotateCcw, 
  Flame, 
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import useBOMStore from '../stores/bomStore';

const Settings: React.FC = () => {
  const { currency, setCurrency, resetToDefaults, boms, materials, laborCosts } = useBOMStore();
  const [companyName, setCompanyName] = useState('Akira Fresh Gourmet Foods');
  const [plantLocation, setPlantLocation] = useState('Cold Chain Hub, New Delhi & Gurgaon');
  const [defaultMargin, setDefaultMargin] = useState(25.0);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('akira_company_name', companyName);
    localStorage.setItem('akira_plant_loc', plantLocation);
    toast.success('Facility preferences saved');
  };

  const handleBackupExport = () => {
    const data = {
      boms,
      materials,
      laborCosts,
      currency,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `akira-fresh-bom-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup exported as JSON');
  };

  const handleResetData = () => {
    if (confirm('Reset all recipe BOMs, materials, and labor operations to Akira Fresh initial sample presets?')) {
      resetToDefaults();
      toast.success('Reset to Akira Fresh sample presets');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs">
          <SettingsIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
            System & Facility Configuration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Configure company profile, currencies, cold chain defaults, and data backups.</p>
        </div>
      </div>

      {/* Facility & Enterprise Settings */}
      <div className="fresh-card p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Flame className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white font-display">Enterprise & Manufacturing Facility</h2>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/60">
            Akira Fresh Core
          </span>
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company / Brand Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Default Workspace Currency</label>
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  toast.success(`Currency switched to ${e.target.value}`);
                }}
                className="w-full px-3.5 py-2 text-sm text-slate-900 dark:text-white font-bold cursor-pointer"
              >
                <option value="INR">Indian Rupee (₹ INR)</option>
                <option value="USD">US Dollar ($ USD)</option>
                <option value="EUR">Euro (€ EUR)</option>
                <option value="GBP">British Pound (£ GBP)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Primary Cold Chain Hub</label>
              <input
                type="text"
                value={plantLocation}
                onChange={(e) => setPlantLocation(e.target.value)}
                className="w-full px-3.5 py-2 text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Default Recipe Margin %</label>
              <input
                type="number"
                step="0.5"
                value={defaultMargin}
                onChange={(e) => setDefaultMargin(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-sm text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Save className="h-4 w-4 mr-1.5" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>

      {/* Backup & Sample Presets */}
      <div className="fresh-card p-6 space-y-5">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white font-display">Data Management & Backup</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Export Complete Database</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Download a full JSON snapshot of all recipes, BOMs, raw materials, labor tables, and settings.
              </p>
            </div>
            <button
              onClick={handleBackupExport}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
            >
              <Download className="h-4 w-4 mr-1.5" />
              <span>Export Backup JSON</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Restore Akira Fresh Sample Data</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Reset all BOMs and materials back to default Akira Momos, Seekh Kebabs & Shipper presets.
              </p>
            </div>
            <button
              onClick={handleResetData}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-300 text-xs font-bold transition-colors"
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              <span>Reset to Sample Presets</span>
            </button>
          </div>
        </div>
      </div>

      {/* Brand Attribution Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-950 dark:from-emerald-950/90 dark:via-slate-900 dark:to-black text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-800/40 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold">Akira Fresh D2C Platform</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-xs text-emerald-200/85 dark:text-emerald-200/80">
            Visit the official online storefront at akirafresh.in for gourmet ready-to-cook delicacies.
          </p>
        </div>
        <a
          href="https://akirafresh.in"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-all shadow-md"
        >
          <span>Open akirafresh.in</span>
          <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
        </a>
      </div>
    </div>
  );
};

export default Settings;
