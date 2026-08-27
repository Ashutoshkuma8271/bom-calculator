import React from 'react';
import { Shield, Users, Settings as SettingsIcon, Activity, AlertTriangle, Sparkles, Download, Upload, Save } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-slate-500 to-slate-600 p-2 rounded-xl shadow-lg">
            <SettingsIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="mt-1 text-slate-500">Configure your premium BOM Calculator preferences</p>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-2 rounded-lg">
            <Sparkles className="h-5 w-5 text-primary-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">General Settings</h2>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all duration-200"
              placeholder="Enter company name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Default Currency
            </label>
            <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all duration-200">
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
              <option value="GBP">British Pound (£)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Default Overhead Percentage
            </label>
            <input
              type="number"
              step="0.1"
              defaultValue="10"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all duration-200"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Default Profit Margin
            </label>
            <input
              type="number"
              step="0.1"
              defaultValue="15"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-br from-accent-50 to-accent-100 p-2 rounded-lg">
            <Activity className="h-5 w-5 text-accent-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Data Management</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-6 border border-slate-200 rounded-xl hover:shadow-md transition-shadow bg-gradient-to-r from-slate-50 to-white">
            <div>
              <h3 className="font-semibold text-slate-900">Export Data</h3>
              <p className="text-sm text-slate-500">Download all your BOMs and materials</p>
            </div>
            <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5">
              <Download className="h-5 w-5 mr-2" />
              Export
            </button>
          </div>
          
          <div className="flex items-center justify-between p-6 border border-slate-200 rounded-xl hover:shadow-md transition-shadow bg-gradient-to-r from-slate-50 to-white">
            <div>
              <h3 className="font-semibold text-slate-900">Import Data</h3>
              <p className="text-sm text-slate-500">Import BOMs and materials from a file</p>
            </div>
            <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white rounded-xl hover:from-secondary-600 hover:to-secondary-700 transition-all duration-200 shadow-md shadow-secondary-500/25 hover:shadow-lg hover:shadow-secondary-500/30 hover:-translate-y-0.5">
              <Upload className="h-5 w-5 mr-2" />
              Import
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5">
          <Save className="h-5 w-5 mr-2" />
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;