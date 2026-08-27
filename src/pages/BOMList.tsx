import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  FileSpreadsheet, 
  Copy, 
  Trash2, 
  Edit, 
  Eye, 
  FileText, 
  MoreVertical,
  Layers,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Snowflake,
  ExternalLink,
  Flame,
  ArrowUpDown,
  X
} from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { toast } from 'sonner';
import useBOMStore from '../stores/bomStore';
import { formatCurrency } from '../lib/utils';
import { exportToExcel, exportToPDF } from '../lib/export';
import { BOM } from '../types';

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

const BOMList: React.FC = () => {
  const { boms, deleteBOM, duplicateBOM, setCurrentBOM, currency } = useBOMStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedBOM, setSelectedBOM] = useState<BOM | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const categories = Array.from(new Set(boms.map((b) => b.category).filter(Boolean)));

  const filteredBOMs = boms.filter((bom) => {
    const matchesSearch =
      bom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bom.projectCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bom.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bom.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || bom.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteBOM(id);
      toast.success('BOM deleted successfully');
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateBOM(id);
    toast.success('BOM duplicated as copy');
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
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
                Bill of Materials Registry
              </h1>
              <p className="text-xs text-slate-500">Manage all ready-to-cook recipes, packaging BOMs, and batch cost structures.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/calculator"
              onClick={() => setCurrentBOM(null)}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-extrabold shadow-sm transition-all"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              <span>Create New BOM</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Filter and Search Bar */}
      <motion.div variants={itemVariants} className="fresh-card p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by recipe title, SKU code (AF-MOM-001), ingredients..."
            className="w-full pl-10 pr-4 py-2 text-xs text-slate-900 font-medium placeholder-slate-400"
          />
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200/80">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </motion.div>

      {/* BOM Count & Quick Stats Bar */}
      <motion.div variants={itemVariants} className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Showing <strong className="text-slate-900 font-mono">{filteredBOMs.length}</strong> of {boms.length} registered BOMs</span>
        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
          <Snowflake className="h-3.5 w-3.5" />
          Cold Chain Verified
        </span>
      </motion.div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBOMs.map((bom) => (
            <motion.div
              key={bom.id}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="fresh-card p-5 flex flex-col justify-between hover:border-emerald-400 group"
            >
              <div>
                {/* Header tags */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {bom.projectCode || 'AF-BOM'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100">
                      v{bom.version}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      bom.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : bom.status === 'draft'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {bom.status}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(bom.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {/* Title and description */}
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug font-display">
                  {bom.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {bom.description || 'Ready-to-cook recipe and cost specification.'}
                </p>

                {/* Batch and Storage Details */}
                <div className="mt-3 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Batch Output</span>
                    <span className="font-bold text-slate-800 font-mono">{bom.batchQuantity || 1} {bom.batchUnit || 'units'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Storage Temp</span>
                    <span className="font-bold text-cyan-700">{bom.storageCondition || 'Frozen (-18°C)'}</span>
                  </div>
                </div>

                {/* Items & labor pill */}
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                  <span>{bom.items.length} Ingredients</span>
                  <span>•</span>
                  <span>{bom.laborItems.length} Operations</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold font-mono">+{bom.profitMargin}% Margin</span>
                </div>
              </div>

              {/* Price & Action Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Grand Batch Total</span>
                  <span className="text-lg font-extrabold text-slate-900 font-display">
                    {formatCurrency(bom.grandTotal, currency)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => {
                      setCurrentBOM(bom);
                      navigate('/calculator');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
                    title="Edit BOM"
                  >
                    Edit
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedBOM(bom)}
                    className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    title="Quick View"
                  >
                    <Eye className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDuplicate(bom.id)}
                    className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(bom.id, bom.name)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        /* Table View */
        <motion.div variants={itemVariants} className="fresh-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Code / Recipe Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Batch Yield</th>
                  <th className="py-3 px-4">Ingredients Cost</th>
                  <th className="py-3 px-4">Labor Cost</th>
                  <th className="py-3 px-4">Grand Total</th>
                  <th className="py-3 px-4">Unit Cost</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBOMs.map((bom) => (
                  <tr key={bom.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-slate-400">{bom.projectCode || 'AF-BOM'}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800">
                            v{bom.version}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 mt-0.5 text-sm font-display">{bom.name}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {bom.category || 'Food & Ready-to-Cook'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-semibold font-mono">
                      {bom.batchQuantity || 1} {bom.batchUnit || 'units'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium font-mono">
                      {formatCurrency(bom.totalMaterialCost, currency)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium font-mono">
                      {formatCurrency(bom.totalLaborCost, currency)}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 font-mono">
                      {formatCurrency(bom.grandTotal, currency)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700 font-mono">
                      {formatCurrency(bom.costPerUnit || bom.grandTotal / (bom.batchQuantity || 1), currency)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => {
                            setCurrentBOM(bom);
                            navigate('/calculator');
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => exportToPDF(bom, { format: 'pdf', includeCosts: true, includeLabor: true, includeSummary: true })}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                          title="Export PDF"
                        >
                          <Download className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => handleDuplicate(bom.id)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                          title="Duplicate"
                        >
                          <Copy className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => handleDelete(bom.id, bom.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* BOM Detail Modal */}
      <AnimatePresence>
        {selectedBOM && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" 
              onClick={() => setSelectedBOM(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 z-10 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-slate-400">{selectedBOM.projectCode || 'AF-BOM'}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                      v{selectedBOM.version}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1 font-display">{selectedBOM.name}</h3>
                  <p className="text-xs text-slate-500">{selectedBOM.description}</p>
                </div>
                <button
                  onClick={() => setSelectedBOM(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Ingredients</span>
                  <span className="text-base font-extrabold text-slate-900 font-mono">{formatCurrency(selectedBOM.totalMaterialCost, currency)}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Labor & QA</span>
                  <span className="text-base font-extrabold text-slate-900 font-mono">{formatCurrency(selectedBOM.totalLaborCost, currency)}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Overhead + Margin</span>
                  <span className="text-base font-extrabold text-emerald-700 font-mono">{formatCurrency(selectedBOM.totalOverhead + selectedBOM.totalProfit, currency)}</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-emerald-200 block">Grand Total</span>
                  <span className="text-base font-extrabold font-mono">{formatCurrency(selectedBOM.grandTotal, currency)}</span>
                </div>
              </div>

              {/* Ingredients Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Recipe Composition & Yield</h4>
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                      <tr>
                        <th className="p-2.5">Item Name</th>
                        <th className="p-2.5">Quantity</th>
                        <th className="p-2.5">Unit Rate</th>
                        <th className="p-2.5">Waste %</th>
                        <th className="p-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedBOM.items.map((item) => (
                        <tr key={item.id}>
                          <td className="p-2.5 font-semibold text-slate-800">{item.materialName}</td>
                          <td className="p-2.5 text-slate-600">{item.quantity} {item.unit}</td>
                          <td className="p-2.5 text-slate-600 font-mono">{formatCurrency(item.costPerUnit, currency)}</td>
                          <td className="p-2.5 text-slate-500">{item.wastePercentage || 0}%</td>
                          <td className="p-2.5 font-bold text-slate-900 text-right font-mono">{formatCurrency(item.totalCost, currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => exportToPDF(selectedBOM, { format: 'pdf', includeCosts: true, includeLabor: true, includeSummary: true })}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center space-x-1.5"
                >
                  <Download className="h-4 w-4" />
                  <span>Export PDF</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setCurrentBOM(selectedBOM);
                    navigate('/calculator');
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition-all"
                >
                  Open in Calculator
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BOMList;

