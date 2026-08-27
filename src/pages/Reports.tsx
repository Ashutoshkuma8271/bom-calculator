import React from 'react';
import { BarChart3, Download, FileText, Sparkles, TrendingUp } from 'lucide-react';
import useBOMStore from '../stores/bomStore';
import { formatCurrency } from '../lib/utils';
import { exportAllBOMsToExcel } from '../lib/export';

const Reports: React.FC = () => {
  const { boms } = useBOMStore;

  const totalValue = boms.reduce((sum, bom) => sum + bom.grandTotal, 0);
  const totalMaterialCost = boms.reduce((sum, bom) => sum + bom.totalMaterialCost, 0);
  const totalLaborCost = boms.reduce((sum, bom) => sum + bom.totalLaborCost, 0);

  const costBreakdown = [
    { name: 'Materials', value: totalMaterialCost, gradient: 'from-primary-500 to-primary-600', bgGradient: 'from-primary-50 to-primary-100' },
    { name: 'Labor', value: totalLaborCost, gradient: 'from-secondary-500 to-secondary-600', bgGradient: 'from-secondary-50 to-secondary-100' },
    { name: 'Overhead', value: boms.reduce((sum, bom) => sum + bom.totalOverhead, 0), gradient: 'from-premium-gold-500 to-premium-gold-600', bgGradient: 'from-premium-gold-50 to-premium-gold-100' },
    { name: 'Profit', value: boms.reduce((sum, bom) => sum + bom.totalProfit, 0), gradient: 'from-accent-500 to-accent-600', bgGradient: 'from-accent-50 to-accent-100' },
  ];

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-accent-500 to-accent-600 p-2 rounded-xl shadow-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Reports
            </h1>
            <p className="mt-1 text-slate-500">Analyze your premium BOM costs and generate reports</p>
          </div>
        </div>
        <button 
          onClick={() => exportAllBOMsToExcel(boms)}
          className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5"
        >
          <Download className="h-5 w-5 mr-2" />
          Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-6 hover:shadow-premium-lg transition-all duration-300 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total BOMs</p>
              <p className="mt-2 text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{boms.length}</p>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-3 rounded-xl">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-6 hover:shadow-premium-lg transition-all duration-300 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Value</p>
              <p className="mt-2 text-2xl font-bold bg-gradient-to-r from-premium-gold-500 to-premium-gold-600 bg-clip-text text-transparent">{formatCurrency(totalValue)}</p>
            </div>
            <div className="bg-gradient-to-br from-premium-gold-50 to-premium-gold-100 p-3 rounded-xl">
              <TrendingUp className="h-6 w-6 text-premium-gold-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-6 hover:shadow-premium-lg transition-all duration-300 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Material Costs</p>
              <p className="mt-2 text-2xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">{formatCurrency(totalMaterialCost)}</p>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-3 rounded-xl">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-6 hover:shadow-premium-lg transition-all duration-300 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Labor Costs</p>
              <p className="mt-2 text-2xl font-bold bg-gradient-to-r from-secondary-500 to-secondary-600 bg-clip-text text-transparent">{formatCurrency(totalLaborCost)}</p>
            </div>
            <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 p-3 rounded-xl">
              <FileText className="h-6 w-6 text-secondary-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-br from-accent-50 to-accent-100 p-2 rounded-lg">
            <Sparkles className="h-5 w-5 text-accent-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Cost Breakdown</h2>
        </div>
        <div className="space-y-6">
          {costBreakdown.map((item) => (
            <div key={item.name}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 font-medium">{item.name}</span>
                <span className="font-semibold text-slate-900">{formatCurrency(item.value)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${item.gradient} rounded-full transition-all duration-500`}
                  style={{ width: `${totalValue > 0 ? (item.value / totalValue) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent BOMs Table */}
      <div className="bg-white rounded-2xl shadow-premium border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-lg font-semibold text-slate-900">Recent BOMs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Materials
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Labor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {boms.slice(-5).reverse().map((bom) => (
                <tr key={bom.id} className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-white transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                    {bom.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {formatCurrency(bom.totalMaterialCost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {formatCurrency(bom.totalLaborCost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                    {formatCurrency(bom.grandTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;