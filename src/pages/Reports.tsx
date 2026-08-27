import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  DollarSign, 
  Download, 
  FileSpreadsheet, 
  Layers, 
  Calendar,
  Filter,
  CheckCircle2,
  Snowflake,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { motion, type Variants } from 'motion/react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import useBOMStore from '../stores/bomStore';
import { formatCurrency } from '../lib/utils';
import { exportToExcel, exportToPDF } from '../lib/export';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', damping: 24, stiffness: 300 }
  }
};

const Reports: React.FC = () => {
  const { boms, materials, laborCosts, currency } = useBOMStore();
  const [selectedBOMId, setSelectedBOMId] = useState<string>('all');

  const totalValue = boms.reduce((sum, bom) => sum + bom.grandTotal, 0);
  const totalMaterialCost = boms.reduce((sum, bom) => sum + bom.totalMaterialCost, 0);
  const totalLaborCost = boms.reduce((sum, bom) => sum + bom.totalLaborCost, 0);
  const totalOverhead = boms.reduce((sum, bom) => sum + bom.totalOverhead, 0);
  const totalProfit = boms.reduce((sum, bom) => sum + bom.totalProfit, 0);

  // Category spend
  const categorySpendMap: Record<string, number> = {};
  boms.forEach((b) => {
    b.items.forEach((item) => {
      const cat = item.category || 'Proteins & Meats';
      categorySpendMap[cat] = (categorySpendMap[cat] || 0) + item.totalCost;
    });
  });

  const categoryChartData = Object.entries(categorySpendMap).map(([name, value], i) => {
    const colors = ['#059669', '#0284c7', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];
    return { name, value, color: colors[i % colors.length] };
  });

  // Profitability per BOM
  const profitabilityData = boms.map((b) => ({
    name: b.name.length > 22 ? b.name.substring(0, 20) + '...' : b.name,
    ProductionCost: b.totalMaterialCost + b.totalLaborCost + b.totalOverhead,
    ProfitMargin: b.totalProfit,
    GrandTotal: b.grandTotal,
  }));

  const handleExportAllPDF = () => {
    if (boms.length === 0) return;
    exportToPDF(boms[0], {
      format: 'pdf',
      includeCosts: true,
      includeLabor: true,
      includeSummary: true,
    });
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-12"
    >
      {/* Top Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-2xl bg-emerald-700 text-white shadow-sm">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
                Cost Analytics & Margin Intelligence
              </h1>
              <p className="text-xs text-slate-500">Comprehensive yield ratios, category spend distribution, and margin metrics.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportAllPDF}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Download className="h-4 w-4 mr-1.5" />
            <span>Export Financial Report</span>
          </motion.button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants} whileHover={{ y: -3, transition: { duration: 0.2 } }} className="fresh-card p-4">
          <span className="text-[11px] uppercase font-bold text-slate-400 block">Total Pipeline Value</span>
          <span className="text-2xl font-extrabold text-slate-900 font-display font-mono mt-0.5 block">
            {formatCurrency(totalValue, currency)}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">Across {boms.length} Active BOMs</span>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -3, transition: { duration: 0.2 } }} className="fresh-card p-4">
          <span className="text-[11px] uppercase font-bold text-slate-400 block">Raw Ingredients Spend</span>
          <span className="text-2xl font-extrabold text-emerald-800 font-display font-mono mt-0.5 block">
            {formatCurrency(totalMaterialCost, currency)}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">
            {((totalMaterialCost / (totalValue || 1)) * 100).toFixed(1)}% of total cost
          </span>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -3, transition: { duration: 0.2 } }} className="fresh-card p-4">
          <span className="text-[11px] uppercase font-bold text-slate-400 block">Total Labor & Processing</span>
          <span className="text-2xl font-extrabold text-sky-800 font-display font-mono mt-0.5 block">
            {formatCurrency(totalLaborCost, currency)}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">
            {((totalLaborCost / (totalValue || 1)) * 100).toFixed(1)}% of total cost
          </span>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -3, transition: { duration: 0.2 } }} className="fresh-card p-4 bg-emerald-950 text-white">
          <span className="text-[11px] uppercase font-bold text-emerald-200 block">Total Realized Profit Margin</span>
          <span className="text-2xl font-extrabold text-white font-display font-mono mt-0.5 block">
            {formatCurrency(totalProfit, currency)}
          </span>
          <span className="text-xs text-emerald-200 mt-1 block">Target margin buffer</span>
        </motion.div>
      </motion.div>

      {/* Chart Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingredient Category Spend Breakdown */}
        <motion.div variants={itemVariants} className="fresh-card p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-display">Material Cost by Ingredient Category</h3>
            <p className="text-xs text-slate-500">Distribution across Meats, Spices, Dairy, Packaging, and Cold Chain.</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={50}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [formatCurrency(Number(val), currency), 'Spend']}
                  contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            {categoryChartData.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 border border-slate-100/80">
                <div className="flex items-center space-x-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-slate-700 font-medium truncate">{c.name}</span>
                </div>
                <span className="font-bold text-slate-900 font-mono ml-1">{formatCurrency(c.value, currency)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Batch Cost vs Profit Analysis */}
        <motion.div variants={itemVariants} className="fresh-card p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-display">Production Cost vs. Margin Markup</h3>
            <p className="text-xs text-slate-500">Comparative view per manufactured batch run.</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitabilityData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(val: any) => [formatCurrency(Number(val), currency), 'Value']}
                  contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="ProductionCost" name="Base Production Cost" fill="#047857" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ProfitMargin" name="Profit Margin Markup" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Average Margin across portfolio:</span>
            <span className="font-extrabold text-emerald-800 font-mono">
              {boms.length > 0 ? (boms.reduce((s, b) => s + b.profitMargin, 0) / boms.length).toFixed(1) : 0}%
            </span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Reports;
