import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Download, 
  Copy, 
  Trash2, 
  Edit, 
  Eye, 
  FileText, 
  Snowflake, 
  X,
  Layers,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { toast } from 'sonner';
import useBOMStore from '../stores/bomStore';
import { formatCurrency } from '../lib/utils';
import { exportToPDF } from '../lib/export';
import { BOM } from '../types';
import { getProductImage } from '../lib/productImages';
import ImageWithFallback from '../components/ImageWithFallback';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 320 }
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

  const categories = useMemo(() => Array.from(new Set(boms.map((b) => b.category).filter(Boolean))), [boms]);

  const filteredBOMs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return boms.filter((bom) => {
      const matchesSearch =
        !q ||
        bom.name.toLowerCase().includes(q) ||
        bom.projectCode?.toLowerCase().includes(q) ||
        bom.description?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || bom.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || bom.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [boms, searchQuery, statusFilter, categoryFilter]);

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
            <div className="p-2 rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
                Bill of Materials Registry
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage all ready-to-cook recipes, packaging BOMs, and batch cost structures.</p>
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
          <Search className="h-4 w-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by recipe title, SKU code (AF-MOM-001), ingredients..."
            className="w-full pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white font-medium placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
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
            className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200/80 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'table' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </motion.div>

      {/* BOM Count & Quick Stats Bar */}
      <motion.div variants={itemVariants} className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>Showing <strong className="text-slate-900 dark:text-white font-mono">{filteredBOMs.length}</strong> of {boms.length} registered BOMs</span>
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
          <Snowflake className="h-3.5 w-3.5" />
          Cold Chain Verified
        </span>
      </motion.div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBOMs.map((bom) => {
            const itemImage = bom.imageUrl || getProductImage(bom);
            return (
              <motion.div
                key={bom.id}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="fresh-card overflow-hidden flex flex-col justify-between hover:border-emerald-400 dark:hover:border-emerald-600 group shadow-sm hover:shadow-md transition-all"
              >
                <div>
                  {/* Photo Header */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <ImageWithFallback
                      src={itemImage}
                      alt={bom.name}
                      fallbackCategory={bom.category}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
                    
                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-mono font-extrabold text-white bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/20">
                        {bom.projectCode || 'AF-BOM'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/90 text-white backdrop-blur-sm">
                        v{bom.version}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize backdrop-blur-sm ${
                        bom.status === 'active' 
                          ? 'bg-emerald-600/90 text-white' 
                          : bom.status === 'draft'
                          ? 'bg-amber-600/90 text-white'
                          : 'bg-slate-700/90 text-slate-200'
                      }`}>
                        {bom.status}
                      </span>
                    </div>

                    {/* Top Right Storage Condition */}
                    {bom.storageCondition && (
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-semibold text-cyan-200 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-cyan-400/30 flex items-center gap-1">
                          <Snowflake className="h-2.5 w-2.5 text-cyan-300" />
                          {bom.storageCondition}
                        </span>
                      </div>
                    )}

                    {/* Bottom overlay with category */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="font-semibold text-emerald-300 drop-shadow flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {bom.category || 'Food & Ready-to-Cook'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-300">
                        {new Date(bom.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4.5 space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug font-display line-clamp-1">
                        {bom.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {bom.description || 'Ready-to-cook recipe and batch cost structure.'}
                      </p>
                    </div>

                    {/* Batch & Margin Info */}
                    <div className="py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Batch Output</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{bom.batchQuantity || 1} {bom.batchUnit || 'units'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Unit Production Cost</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          {formatCurrency(bom.costPerUnit || (bom.grandTotal / (bom.batchQuantity || 1)), currency)}
                        </span>
                      </div>
                    </div>

                    {/* Items & labor details */}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5 text-slate-400" />
                        {bom.items.length} Ingredients
                      </span>
                      <span>{bom.laborItems.length} Operations</span>
                      <span className="text-emerald-700 dark:text-emerald-300 font-bold font-mono bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800/50">
                        +{bom.profitMargin}% Margin
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price & Action Footer */}
                <div className="p-4.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">Grand Batch Total</span>
                    <span className="text-lg font-extrabold text-slate-900 dark:text-white font-display font-mono">
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
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-2xs"
                      title="Edit BOM"
                    >
                      Edit
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedBOM(bom)}
                      className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Quick View"
                    >
                      <Eye className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDuplicate(bom.id)}
                      className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(bom.id, bom.name)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        /* Table View */
        <motion.div variants={itemVariants} className="fresh-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Recipe & Photo</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Batch Yield</th>
                  <th className="py-3 px-4">Ingredients Cost</th>
                  <th className="py-3 px-4">Labor Cost</th>
                  <th className="py-3 px-4">Grand Total</th>
                  <th className="py-3 px-4">Unit Cost</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredBOMs.map((bom) => {
                  const itemImage = bom.imageUrl || getProductImage(bom);
                  return (
                    <tr key={bom.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <ImageWithFallback
                            src={itemImage}
                            alt={bom.name}
                            fallbackCategory={bom.category}
                            className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-mono font-bold text-slate-400 dark:text-slate-500">{bom.projectCode || 'AF-BOM'}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                v{bom.version}
                              </span>
                            </div>
                            <p className="font-bold text-slate-900 dark:text-white mt-0.5 text-sm font-display">{bom.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {bom.category || 'Food & Ready-to-Cook'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-semibold font-mono">
                        {bom.batchQuantity || 1} {bom.batchUnit || 'units'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-medium font-mono">
                        {formatCurrency(bom.totalMaterialCost, currency)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-medium font-mono">
                        {formatCurrency(bom.totalLaborCost, currency)}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white font-mono">
                        {formatCurrency(bom.grandTotal, currency)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
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
                            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => exportToPDF(bom, { format: 'pdf', includeCosts: true, includeLabor: true, includeSummary: true })}
                            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg"
                            title="Export PDF"
                          >
                            <Download className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => handleDuplicate(bom.id)}
                            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            title="Duplicate"
                          >
                            <Copy className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => handleDelete(bom.id, bom.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm" 
              onClick={() => setSelectedBOM(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-3xl bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Cover Image */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                <ImageWithFallback
                  src={selectedBOM.imageUrl || getProductImage(selectedBOM)}
                  alt={selectedBOM.name}
                  fallbackCategory={selectedBOM.category}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                
                <button
                  onClick={() => setSelectedBOM(null)}
                  className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full backdrop-blur-md transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="absolute bottom-4 left-6 right-6 text-white">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                      {selectedBOM.projectCode || 'AF-BOM'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-500 text-slate-950">
                      v{selectedBOM.version}
                    </span>
                    {selectedBOM.storageCondition && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-cyan-900/80 text-cyan-200 border border-cyan-500/30">
                        {selectedBOM.storageCondition}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold font-display">{selectedBOM.name}</h3>
                </div>
              </div>

              <div className="p-6 pt-0 space-y-5">
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedBOM.description}</p>

                {/* Summary Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Ingredients</span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">{formatCurrency(selectedBOM.totalMaterialCost, currency)}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Labor & QA</span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">{formatCurrency(selectedBOM.totalLaborCost, currency)}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Overhead + Margin</span>
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{formatCurrency(selectedBOM.totalOverhead + selectedBOM.totalProfit, currency)}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-emerald-100 block">Grand Total</span>
                    <span className="text-base font-extrabold font-mono">{formatCurrency(selectedBOM.grandTotal, currency)}</span>
                  </div>
                </div>

                {/* Ingredients Table */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Recipe Composition & Yield</h4>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                        <tr>
                          <th className="p-2.5">Item Name</th>
                          <th className="p-2.5">Quantity</th>
                          <th className="p-2.5">Unit Rate</th>
                          <th className="p-2.5">Waste %</th>
                          <th className="p-2.5 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {selectedBOM.items.map((item) => (
                          <tr key={item.id}>
                            <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">{item.materialName}</td>
                            <td className="p-2.5 text-slate-600 dark:text-slate-300">{item.quantity} {item.unit}</td>
                            <td className="p-2.5 text-slate-600 dark:text-slate-300 font-mono">{formatCurrency(item.costPerUnit, currency)}</td>
                            <td className="p-2.5 text-slate-500 dark:text-slate-400">{item.wastePercentage || 0}%</td>
                            <td className="p-2.5 font-bold text-slate-900 dark:text-white text-right font-mono">{formatCurrency(item.totalCost, currency)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => exportToPDF(selectedBOM, { format: 'pdf', includeCosts: true, includeLabor: true, includeSummary: true })}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center space-x-1.5"
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
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BOMList;
