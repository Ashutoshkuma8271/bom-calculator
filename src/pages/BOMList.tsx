import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Copy, 
  Trash2,
  Eye,
  Download,
  Sparkles,
  ArrowUpRight,
  FileText
} from 'lucide-react';
import useBOMStore from '../stores/bomStore';
import { formatCurrency } from '../lib/utils';
import { exportToExcel, exportToPDF, exportAllBOMsToExcel } from '../lib/export';
import { BOM, ExportOptions } from '../types';

const BOMList: React.FC = () => {
  const { boms, deleteBOM, duplicateBOM, setCurrentBOM } = useBOMStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'active' | 'archived'>('all');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const filteredBOMs = boms.filter((bom) => {
    const matchesSearch = bom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (bom.projectCode && bom.projectCode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || bom.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this BOM?')) {
      deleteBOM(id);
      setMenuOpen(null);
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateBOM(id);
    setMenuOpen(null);
  };

  const handleEdit = (bom: BOM) => {
    setCurrentBOM(bom);
    setMenuOpen(null);
  };

  const handleExportExcel = (bom: BOM) => {
    const options: ExportOptions = {
      format: 'excel',
      includeCosts: true,
      includeLabor: true,
      includeSummary: true,
    };
    exportToExcel(bom, options);
    setMenuOpen(null);
  };

  const handleExportPDF = (bom: BOM) => {
    const options: ExportOptions = {
      format: 'pdf',
      includeCosts: true,
      includeLabor: true,
      includeSummary: true,
    };
    exportToPDF(bom, options);
    setMenuOpen(null);
  };

  const handleExportAll = () => {
    exportAllBOMsToExcel(filteredBOMs);
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-xl shadow-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              BOM List
            </h1>
            <p className="mt-1 text-slate-500">Manage your premium Bill of Materials</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportAll}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white rounded-xl hover:from-secondary-600 hover:to-secondary-700 transition-all duration-200 shadow-md shadow-secondary-500/25 hover:shadow-lg hover:shadow-secondary-500/30 hover:-translate-y-0.5"
          >
            <Download className="h-5 w-5 mr-2" />
            Export All
          </button>
          <Link
            to="/calculator"
            className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5"
          >
            Create New BOM
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search BOMs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all duration-200"
            />
          </div>
          
          <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <Filter className="h-5 w-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent border-none focus:ring-0 text-slate-700 font-medium cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* BOM Table */}
      <div className="bg-white rounded-2xl shadow-premium border border-slate-100 overflow-hidden">
        {filteredBOMs.length === 0 ? (
          <div className="p-16 text-center">
            <div className="bg-gradient-to-br from-slate-100 to-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-10 w-10 text-slate-300" />
            </div>
            <p className="text-slate-500 mb-4">No BOMs found</p>
            <Link
              to="/calculator"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-md"
            >
              Create your first BOM
              <ArrowUpRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    BOM Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Project Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Version
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Total Cost
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBOMs.map((bom) => (
                  <tr key={bom.id} className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-white transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-2 rounded-lg">
                          <Sparkles className="h-4 w-4 text-primary-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{bom.name}</div>
                          {bom.description && (
                            <div className="text-sm text-slate-500">{bom.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {bom.projectCode || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {bom.version}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        bom.status === 'active' ? 'bg-gradient-to-r from-secondary-100 to-secondary-50 text-secondary-700' :
                        bom.status === 'draft' ? 'bg-gradient-to-r from-premium-gold-100 to-premium-gold-50 text-premium-gold-700' :
                        'bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700'
                      }`}>
                        {bom.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                      {formatCurrency(bom.grandTotal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(bom.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpen(menuOpen === bom.id ? null : bom.id)}
                          className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-100"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                        
                        {menuOpen === bom.id && (
                          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-premium-lg border border-slate-100 z-10 overflow-hidden">
                            <div className="py-2">
                              <Link
                                to="/calculator"
                                onClick={() => handleEdit(bom)}
                                className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-white transition-colors"
                              >
                                <Edit className="h-4 w-4 mr-3 text-slate-400" />
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDuplicate(bom.id)}
                                className="flex items-center w-full px-4 py-3 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-white transition-colors"
                              >
                                <Copy className="h-4 w-4 mr-3 text-slate-400" />
                                Duplicate
                              </button>
                              <button
                                onClick={() => handleExportExcel(bom)}
                                className="flex items-center w-full px-4 py-3 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-white transition-colors"
                              >
                                <Download className="h-4 w-4 mr-3 text-slate-400" />
                                Export Excel
                              </button>
                              <button
                                onClick={() => handleExportPDF(bom)}
                                className="flex items-center w-full px-4 py-3 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-white transition-colors"
                              >
                                <Download className="h-4 w-4 mr-3 text-slate-400" />
                                Export PDF
                              </button>
                              <div className="border-t border-slate-100 my-1" />
                              <button
                                onClick={() => handleDelete(bom.id)}
                                className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="h-4 w-4 mr-3" />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BOMList;