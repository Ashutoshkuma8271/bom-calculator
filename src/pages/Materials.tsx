import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Snowflake,
  X
} from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { toast } from 'sonner';
import useBOMStore from '../stores/bomStore';
import { formatCurrency, generateId, getCategoryBadgeColor } from '../lib/utils';
import { Material } from '../types';

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

const Materials: React.FC = () => {
  const { materials, addMaterial, updateMaterial, deleteMaterial, currency } = useBOMStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    category: string;
    unit: string;
    costPerUnit: number;
    supplier: string;
    description: string;
    inStock: number;
    reorderLevel: number;
    storageCondition: 'Frozen (-18°C)' | 'Chilled (2-4°C)' | 'Ambient' | 'Special';
  }>({
    name: '',
    category: 'Proteins & Meats',
    unit: 'kg',
    costPerUnit: 100,
    supplier: 'Akira Fresh Direct Farms',
    description: '',
    inStock: 500,
    reorderLevel: 100,
    storageCondition: 'Chilled (2-4°C)',
  });

  const categories = [
    'Proteins & Meats',
    'Spices & Seasonings',
    'Dairy & Binders',
    'Bakery & Flour',
    'Packaging & Boxes',
    'Cold Chain & Logistics',
  ];

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.supplier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setEditingMaterial(null);
    setFormData({
      name: '',
      category: 'Proteins & Meats',
      unit: 'kg',
      costPerUnit: 150,
      supplier: 'Akira Fresh Partner',
      description: '',
      inStock: 250,
      reorderLevel: 50,
      storageCondition: 'Chilled (2-4°C)',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      category: material.category,
      unit: material.unit,
      costPerUnit: material.costPerUnit,
      supplier: material.supplier || '',
      description: material.description || '',
      inStock: material.inStock || 100,
      reorderLevel: material.reorderLevel || 20,
      storageCondition: material.storageCondition || 'Chilled (2-4°C)',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Material name is required');
      return;
    }

    if (editingMaterial) {
      updateMaterial(editingMaterial.id, {
        ...formData,
        updatedAt: new Date(),
      });
      toast.success('Material updated successfully');
    } else {
      const newMaterial: Material = {
        id: generateId(),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addMaterial(newMaterial);
      toast.success('Material added to inventory');
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Remove "${name}" from materials database?`)) {
      deleteMaterial(id);
      toast.success('Material deleted');
    }
  };

  const lowStockCount = materials.filter(m => (m.inStock || 0) <= (m.reorderLevel || 0)).length;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-12"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
                Ingredients & Packaging Inventory
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Unit prices, supplier sourcing, cold-room storage specs, and real-time inventory.</p>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenAdd}
          className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-extrabold shadow-sm transition-all"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          <span>Add New Material</span>
        </motion.button>
      </motion.div>

      {/* KPI Chips */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="fresh-card p-4 flex items-center justify-between"
        >
          <div>
            <p className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500">Total Items in Catalog</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5 font-display">{materials.length}</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            <Package className="h-5 w-5" />
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="fresh-card p-4 flex items-center justify-between"
        >
          <div>
            <p className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500">Cold Chain Storage Items</p>
            <p className="text-2xl font-extrabold text-cyan-700 dark:text-cyan-400 mt-0.5 font-display">
              {materials.filter(m => m.storageCondition?.includes('Frozen') || m.storageCondition?.includes('Chilled')).length}
            </p>
          </div>
          <div className="p-2.5 rounded-2xl bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300">
            <Snowflake className="h-5 w-5" />
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="fresh-card p-4 flex items-center justify-between"
        >
          <div>
            <p className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500">Reorder Threshold Alerts</p>
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 font-display">
              {lowStockCount} Items
            </p>
          </div>
          <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </motion.div>
      </motion.div>

      {/* Filter and Search Bar */}
      <motion.div variants={itemVariants} className="fresh-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search raw ingredients, meats, spices, barrier pouches, suppliers..."
            className="w-full pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white font-medium placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">All Material Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Material Table */}
      <motion.div variants={itemVariants} className="fresh-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Ingredient / Material</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Storage Condition</th>
                <th className="py-3.5 px-4">Cost / Unit</th>
                <th className="py-3.5 px-4">Stock Level</th>
                <th className="py-3.5 px-4">Primary Supplier</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMaterials.map((material) => {
                const isLow = (material.inStock || 0) <= (material.reorderLevel || 0);

                return (
                  <tr key={material.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm font-display">{material.name}</p>
                        {material.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{material.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadgeColor(material.category)}`}>
                        {material.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        material.storageCondition?.includes('Frozen')
                          ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800'
                          : material.storageCondition?.includes('Chilled')
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {material.storageCondition || 'Ambient'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm font-mono">
                        {formatCurrency(material.costPerUnit, currency)}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium ml-1">/{material.unit}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span className={`font-bold font-mono ${isLow ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
                          {material.inStock || 0} {material.unit}
                        </span>
                        {isLow && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                            Low
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                      {material.supplier || 'Direct'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => handleOpenEdit(material)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Material"
                        >
                          <Edit className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => handleDelete(material.id, material.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
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

      {/* Add / Edit Material Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm" 
              onClick={() => setModalOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  {editingMaterial ? 'Edit Material / Ingredient' : 'Add New Material to Catalog'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Material Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Prime Chicken Breast Boneless Mince"
                    className="w-full px-3.5 py-2 text-sm text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs text-slate-900 dark:text-white font-medium"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Storage Condition</label>
                    <select
                      value={formData.storageCondition}
                      onChange={(e) => setFormData({ ...formData, storageCondition: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs text-slate-900 dark:text-white font-medium"
                    >
                      <option value="Frozen (-18°C)">Frozen (-18°C)</option>
                      <option value="Chilled (2-4°C)">Chilled (2-4°C)</option>
                      <option value="Ambient">Ambient</option>
                      <option value="Special">Special / Nitrogen</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Cost Rate ({currency}) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.costPerUnit}
                      onChange={(e) => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2 text-sm text-slate-900 dark:text-white font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Measurement Unit</label>
                    <input
                      type="text"
                      required
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="kg, pcs, liters, g"
                      className="w-full px-3.5 py-2 text-sm text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">In Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.inStock}
                      onChange={(e) => setFormData({ ...formData, inStock: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2 text-sm text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Reorder Level Alert</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.reorderLevel}
                      onChange={(e) => setFormData({ ...formData, reorderLevel: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2 text-sm text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Supplier / Sourcing Partner</label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="e.g. Akira Direct Farms"
                    className="w-full px-3.5 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Specifications / Notes</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Grade A minced, 100% moisture sealed..."
                    className="w-full px-3.5 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-extrabold transition-all shadow-sm"
                  >
                    {editingMaterial ? 'Save Changes' : 'Add to Inventory'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Materials;
