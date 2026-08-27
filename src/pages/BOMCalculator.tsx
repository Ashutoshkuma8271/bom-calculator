import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, 
  Trash2, 
  Save, 
  Download, 
  FileSpreadsheet, 
  Calculator, 
  Clock, 
  Sparkles,
  RotateCcw,
  Flame,
  Package,
  Sliders,
  Snowflake,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import useBOMStore from '../stores/bomStore';
import { formatCurrency, generateId } from '../lib/utils';
import { exportToExcel, exportToPDF } from '../lib/export';
import { BOM, BOMFormData } from '../types';
import { getProductImage } from '../lib/productImages';

const bomSchema = z.object({
  name: z.string().min(1, 'BOM name is required'),
  description: z.string().optional(),
  projectCode: z.string().optional(),
  category: z.string().optional(),
  batchQuantity: z.number().min(1, 'Batch quantity must be at least 1').optional(),
  batchUnit: z.string().optional(),
  storageCondition: z.string().optional(),
  overheadPercentage: z.number().min(0).max(100),
  profitMargin: z.number().min(0).max(1000),
  items: z.array(
    z.object({
      materialId: z.string().min(1, 'Material is required'),
      materialName: z.string().min(1, 'Material name is required'),
      quantity: z.number().min(0.001, 'Quantity must be greater than 0'),
      unit: z.string().min(1, 'Unit is required'),
      costPerUnit: z.number().min(0, 'Cost must be positive'),
      wastePercentage: z.number().min(0).max(100).optional(),
      category: z.string().optional(),
    })
  ).min(1, 'At least one ingredient or material is required'),
  laborItems: z.array(
    z.object({
      laborId: z.string().min(1, 'Labor item is required'),
      laborName: z.string().min(1, 'Labor name is required'),
      hours: z.number().min(0.01, 'Hours must be greater than 0'),
      hourlyRate: z.number().min(0, 'Hourly rate must be positive'),
      operationType: z.string().optional(),
    })
  ),
});

const triggerConfetti = () => {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.8 },
    colors: ['#059669', '#10b981', '#34d399', '#0284c7']
  });
};

const BOMCalculator: React.FC = () => {
  const { 
    boms, 
    materials, 
    laborCosts, 
    currentBOM, 
    addBOM, 
    updateBOM, 
    calculateBOMTotals,
    setCurrentBOM,
    currency
  } = useBOMStore();

  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'materials' | 'labor' | 'overheads'>('materials');

  const defaultValues: BOMFormData = {
    name: currentBOM?.name || '',
    description: currentBOM?.description || '',
    projectCode: currentBOM?.projectCode || '',
    category: currentBOM?.category || 'Food & Ready-to-Cook',
    batchQuantity: currentBOM?.batchQuantity || 500,
    batchUnit: currentBOM?.batchUnit || 'boxes',
    storageCondition: currentBOM?.storageCondition || 'Frozen (-18°C)',
    overheadPercentage: currentBOM?.overheadPercentage || 8.0,
    profitMargin: currentBOM?.profitMargin || 25.0,
    items: currentBOM?.items || [
      {
        materialId: materials[0]?.id || 'mat-1',
        materialName: materials[0]?.name || 'Prime Chicken Breast Boneless Mince',
        quantity: 50,
        unit: materials[0]?.unit || 'kg',
        costPerUnit: materials[0]?.costPerUnit || 240,
        wastePercentage: 2,
        category: materials[0]?.category || 'Proteins & Meats',
      },
    ],
    laborItems: currentBOM?.laborItems || [
      {
        laborId: laborCosts[0]?.id || 'lab-1',
        laborName: laborCosts[0]?.name || 'Meat Deboning & Precision Mincing',
        hours: 5,
        hourlyRate: laborCosts[0]?.hourlyRate || 220,
        operationType: 'Preparation',
      },
    ],
  };

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BOMFormData>({
    resolver: zodResolver(bomSchema) as any,
    defaultValues,
  });

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control,
    name: 'items',
  });

  const {
    fields: laborFields,
    append: appendLabor,
    remove: removeLabor,
  } = useFieldArray({
    control,
    name: 'laborItems',
  });

  const watchedValues = watch();
  const calculatedTotals = calculateBOMTotals(watchedValues);

  // Sync form when currentBOM changes
  useEffect(() => {
    if (currentBOM) {
      reset({
        name: currentBOM.name,
        description: currentBOM.description || '',
        projectCode: currentBOM.projectCode || '',
        category: currentBOM.category || 'Food & Ready-to-Cook',
        batchQuantity: currentBOM.batchQuantity || 500,
        batchUnit: currentBOM.batchUnit || 'boxes',
        storageCondition: currentBOM.storageCondition || 'Frozen (-18°C)',
        overheadPercentage: currentBOM.overheadPercentage,
        profitMargin: currentBOM.profitMargin,
        items: currentBOM.items,
        laborItems: currentBOM.laborItems,
      });
    }
  }, [currentBOM, reset]);

  const handleMaterialSelect = (index: number, materialId: string) => {
    const selectedMaterial = materials.find((m) => m.id === materialId);
    if (selectedMaterial) {
      setValue(`items.${index}.materialId`, selectedMaterial.id);
      setValue(`items.${index}.materialName`, selectedMaterial.name);
      setValue(`items.${index}.unit`, selectedMaterial.unit);
      setValue(`items.${index}.costPerUnit`, selectedMaterial.costPerUnit);
      setValue(`items.${index}.category`, selectedMaterial.category);
    }
  };

  const handleLaborSelect = (index: number, laborId: string) => {
    const selectedLabor = laborCosts.find((l) => l.id === laborId);
    if (selectedLabor) {
      setValue(`laborItems.${index}.laborId`, selectedLabor.id);
      setValue(`laborItems.${index}.laborName`, selectedLabor.name);
      setValue(`laborItems.${index}.hourlyRate`, selectedLabor.hourlyRate);
      setValue(`laborItems.${index}.operationType`, selectedLabor.category);
    }
  };

  const handleLoadTemplate = (preset: BOM) => {
    reset({
      name: `${preset.name} (Custom)`,
      description: preset.description || '',
      projectCode: preset.projectCode ? `${preset.projectCode}-C` : 'AF-CUSTOM',
      category: preset.category || 'Food & Ready-to-Cook',
      batchQuantity: preset.batchQuantity || 500,
      batchUnit: preset.batchUnit || 'boxes',
      storageCondition: preset.storageCondition || 'Frozen (-18°C)',
      overheadPercentage: preset.overheadPercentage,
      profitMargin: preset.profitMargin,
      items: preset.items.map(it => ({
        materialId: it.materialId,
        materialName: it.materialName,
        quantity: it.quantity,
        unit: it.unit,
        costPerUnit: it.costPerUnit,
        wastePercentage: it.wastePercentage || 0,
        category: it.category,
      })),
      laborItems: preset.laborItems.map(lb => ({
        laborId: lb.laborId,
        laborName: lb.laborName,
        hours: lb.hours,
        hourlyRate: lb.hourlyRate,
        operationType: lb.operationType,
      })),
    });
    setTemplateModalOpen(false);
    triggerConfetti();
    toast.success(`Loaded recipe: ${preset.name}`);
  };

  const onSubmit = (data: BOMFormData) => {
    const bom: BOM = {
      id: currentBOM?.id || generateId(),
      ...data,
      items: data.items.map((item, index) => ({
        ...item,
        id: currentBOM?.items[index]?.id || generateId(),
        totalCost: item.quantity * item.costPerUnit * (1 + (item.wastePercentage || 0) / 100),
      })),
      laborItems: data.laborItems.map((item, index) => ({
        ...item,
        id: currentBOM?.laborItems[index]?.id || generateId(),
        totalCost: item.hours * item.hourlyRate,
      })),
      totalMaterialCost: calculatedTotals.totalMaterialCost || 0,
      totalLaborCost: calculatedTotals.totalLaborCost || 0,
      totalOverhead: calculatedTotals.totalOverhead || 0,
      totalProfit: calculatedTotals.totalProfit || 0,
      grandTotal: calculatedTotals.grandTotal || 0,
      costPerUnit: calculatedTotals.costPerUnit || 0,
      suggestedSellingPrice: calculatedTotals.suggestedSellingPrice || 0,
      version: currentBOM?.version || '1.0',
      createdAt: currentBOM?.createdAt || new Date(),
      updatedAt: new Date(),
      status: currentBOM?.status || 'active',
    };

    if (currentBOM) {
      updateBOM(currentBOM.id, bom);
      toast.success('BOM updated successfully');
    } else {
      addBOM(bom);
      setCurrentBOM(bom);
      toast.success('New BOM created successfully');
    }
    triggerConfetti();
  };

  const handleExportExcel = () => {
    const bomToExport: BOM = {
      id: currentBOM?.id || generateId(),
      ...watchedValues,
      items: watchedValues.items.map((item, index) => ({
        ...item,
        id: currentBOM?.items[index]?.id || generateId(),
        totalCost: item.quantity * item.costPerUnit * (1 + (item.wastePercentage || 0) / 100),
      })),
      laborItems: watchedValues.laborItems.map((item, index) => ({
        ...item,
        id: currentBOM?.laborItems[index]?.id || generateId(),
        totalCost: item.hours * item.hourlyRate,
      })),
      totalMaterialCost: calculatedTotals.totalMaterialCost || 0,
      totalLaborCost: calculatedTotals.totalLaborCost || 0,
      totalOverhead: calculatedTotals.totalOverhead || 0,
      totalProfit: calculatedTotals.totalProfit || 0,
      grandTotal: calculatedTotals.grandTotal || 0,
      costPerUnit: calculatedTotals.costPerUnit || 0,
      suggestedSellingPrice: calculatedTotals.suggestedSellingPrice || 0,
      version: currentBOM?.version || '1.0',
      createdAt: currentBOM?.createdAt || new Date(),
      updatedAt: new Date(),
      status: currentBOM?.status || 'active',
    };

    exportToExcel(bomToExport, {
      format: 'excel',
      includeCosts: true,
      includeLabor: true,
      includeSummary: true,
    });
    toast.success('Excel exported successfully');
  };

  const handleExportPDF = () => {
    const bomToExport: BOM = {
      id: currentBOM?.id || generateId(),
      ...watchedValues,
      items: watchedValues.items.map((item, index) => ({
        ...item,
        id: currentBOM?.items[index]?.id || generateId(),
        totalCost: item.quantity * item.costPerUnit * (1 + (item.wastePercentage || 0) / 100),
      })),
      laborItems: watchedValues.laborItems.map((item, index) => ({
        ...item,
        id: currentBOM?.laborItems[index]?.id || generateId(),
        totalCost: item.hours * item.hourlyRate,
      })),
      totalMaterialCost: calculatedTotals.totalMaterialCost || 0,
      totalLaborCost: calculatedTotals.totalLaborCost || 0,
      totalOverhead: calculatedTotals.totalOverhead || 0,
      totalProfit: calculatedTotals.totalProfit || 0,
      grandTotal: calculatedTotals.grandTotal || 0,
      costPerUnit: calculatedTotals.costPerUnit || 0,
      suggestedSellingPrice: calculatedTotals.suggestedSellingPrice || 0,
      version: currentBOM?.version || '1.0',
      createdAt: currentBOM?.createdAt || new Date(),
      updatedAt: new Date(),
      status: currentBOM?.status || 'active',
    };

    exportToPDF(bomToExport, {
      format: 'pdf',
      includeCosts: true,
      includeLabor: true,
      includeSummary: true,
    });
    toast.success('PDF report generated');
  };

  const batchQty = watchedValues.batchQuantity || 1;
  const unitCost = (calculatedTotals.grandTotal || 0) / batchQty;
  const rawCostRatio = calculatedTotals.grandTotal ? ((calculatedTotals.totalMaterialCost || 0) / calculatedTotals.grandTotal) * 100 : 0;
  const laborCostRatio = calculatedTotals.grandTotal ? ((calculatedTotals.totalLaborCost || 0) / calculatedTotals.grandTotal) * 100 : 0;
  const overheadCostRatio = calculatedTotals.grandTotal ? ((calculatedTotals.totalOverhead || 0) / calculatedTotals.grandTotal) * 100 : 0;
  const profitCostRatio = calculatedTotals.grandTotal ? ((calculatedTotals.totalProfit || 0) / calculatedTotals.grandTotal) * 100 : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-16"
    >
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
                  {currentBOM ? `Edit BOM: ${currentBOM.name}` : 'BOM Recipe & Cost Calculator'}
                </h1>
                {currentBOM && (
                  <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    v{currentBOM.version}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Live ingredient yield calculations, blast freezing labor, and unit economics.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setTemplateModalOpen(true)}
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
          >
            <Sparkles className="h-4 w-4 mr-1.5 text-emerald-600 dark:text-emerald-400" />
            <span>Load Preset Recipe</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => {
              setCurrentBOM(null);
              reset(defaultValues);
              toast.info('Calculator reset to blank state');
            }}
            className="inline-flex items-center px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-all"
            title="Reset Form"
          >
            <RotateCcw className="h-4 w-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1.5 text-emerald-600 dark:text-emerald-400" />
            <span>Excel</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleExportPDF}
            className="inline-flex items-center px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
          >
            <Download className="h-4 w-4 mr-1.5 text-slate-600 dark:text-slate-400" />
            <span>PDF</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleSubmit(onSubmit)}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-extrabold shadow-sm transition-all"
          >
            <Save className="h-4 w-4 mr-1.5" />
            <span>Save BOM</span>
          </motion.button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2-Columns: Recipe Details & Tables */}
        <div className="lg:col-span-2 space-y-6">
          {/* General & Batch Configuration Card */}
          <div className="fresh-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Flame className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white font-display">Batch & Product Specification</h2>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Step 1 of 3</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Product / Recipe BOM Name <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="e.g. Akira Gourmet Chicken Cheese Momos"
                  className="w-full px-3.5 py-2 text-sm text-slate-900 dark:text-white font-medium"
                />
                {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Project / SKU Code</label>
                <input
                  {...register('projectCode')}
                  type="text"
                  placeholder="e.g. AF-MOM-001"
                  className="w-full px-3.5 py-2 text-sm text-slate-900 dark:text-white font-medium font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  {...register('category')}
                  className="w-full px-3.5 py-2 text-sm text-slate-900 dark:text-white font-medium"
                >
                  <option value="Food & Ready-to-Cook">Food & Ready-to-Cook</option>
                  <option value="Meat & Poultry">Meat & Poultry</option>
                  <option value="Cold Chain & Logistics">Cold Chain & Logistics</option>
                  <option value="Packaging Assembly">Packaging Assembly</option>
                  <option value="Industrial Parts">Industrial Parts</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Batch Output Size <span className="text-slate-400 dark:text-slate-500 font-normal">(Units per batch run)</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    {...register('batchQuantity', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className="w-2/3 px-3.5 py-2 text-sm text-slate-900 dark:text-white font-bold font-mono"
                  />
                  <input
                    {...register('batchUnit')}
                    type="text"
                    placeholder="boxes / pcs"
                    className="w-1/3 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 font-medium text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Storage Condition</label>
                <select
                  {...register('storageCondition')}
                  className="w-full px-3.5 py-2 text-sm text-slate-900 dark:text-white font-medium"
                >
                  <option value="Frozen (-18°C)">Frozen (-18°C) • Blast Freezing</option>
                  <option value="Chilled (2-4°C)">Chilled (2-4°C) • Cold Room</option>
                  <option value="Ambient">Ambient • Dry Storage</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Recipe / Production Notes</label>
                <input
                  {...register('description')}
                  type="text"
                  placeholder="e.g. Requires -40°C IQF tunnel freeze for 25 mins prior to nitrogen packaging."
                  className="w-full px-3.5 py-2 text-sm text-slate-700 dark:text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Tab Navigation for Composition Details */}
          <div className="flex overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 space-x-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('materials')}
              className={`pb-3 px-3 text-xs font-extrabold flex items-center space-x-2 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'materials'
                  ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400 dark:border-emerald-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Package className="h-4 w-4 shrink-0" />
              <span>1. Ingredients & Materials ({itemFields.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('labor')}
              className={`pb-3 px-3 text-xs font-extrabold flex items-center space-x-2 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'labor'
                  ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400 dark:border-emerald-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Clock className="h-4 w-4 shrink-0" />
              <span>2. Labor & Operations ({laborFields.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('overheads')}
              className={`pb-3 px-3 text-xs font-extrabold flex items-center space-x-2 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'overheads'
                  ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400 dark:border-emerald-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sliders className="h-4 w-4 shrink-0" />
              <span>3. Overheads & Margin ({watchedValues.profitMargin}%)</span>
            </button>
          </div>

          {/* Tab 1: Ingredients & Raw Materials */}
          {activeTab === 'materials' && (
            <motion.div 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="fresh-card p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">Raw Ingredients & Packaging Components</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Pick from inventory or input custom items with scrap/waste % allowance.</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() =>
                    appendItem({
                      materialId: materials[0]?.id || generateId(),
                      materialName: materials[0]?.name || 'New Ingredient',
                      quantity: 1,
                      unit: materials[0]?.unit || 'kg',
                      costPerUnit: materials[0]?.costPerUnit || 100,
                      wastePercentage: 0,
                      category: materials[0]?.category || 'Proteins & Meats',
                    })
                  }
                  className="inline-flex items-center px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all border border-emerald-200/80 dark:border-emerald-800"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  <span>Add Line Item</span>
                </motion.button>
              </div>

              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {itemFields.map((field, index) => {
                    const item = watchedValues.items?.[index];
                    const rowCost = (item?.quantity || 0) * (item?.costPerUnit || 0) * (1 + (item?.wastePercentage || 0) / 100);

                    return (
                      <motion.div
                        key={field.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0, overflow: 'hidden' }}
                        transition={{ duration: 0.2 }}
                        className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all space-y-3"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                          {/* Material Selector / Name */}
                          <div className="sm:col-span-5">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
                              Ingredient / Material
                            </label>
                            <select
                              value={item?.materialId || ''}
                              onChange={(e) => handleMaterialSelect(index, e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-semibold"
                            >
                              <option value="">-- Choose from Inventory --</option>
                              {materials.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name} ({m.category} • {formatCurrency(m.costPerUnit, currency)}/{m.unit})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Quantity */}
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
                              Batch Qty
                            </label>
                            <div className="flex items-center space-x-1">
                              <input
                                {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                type="number"
                                step="0.01"
                                min="0.001"
                                className="w-full px-2 py-1.5 text-xs text-slate-900 dark:text-white font-bold"
                              />
                              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 w-8">{item?.unit}</span>
                            </div>
                          </div>

                          {/* Unit Cost */}
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
                              Rate / Unit
                            </label>
                            <input
                              {...register(`items.${index}.costPerUnit`, { valueAsNumber: true })}
                              type="number"
                              step="0.01"
                              min="0"
                              className="w-full px-2 py-1.5 text-xs text-slate-900 dark:text-white font-medium font-mono"
                            />
                          </div>

                          {/* Waste % */}
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
                              Scrap / Waste %
                            </label>
                            <input
                              {...register(`items.${index}.wastePercentage`, { valueAsNumber: true })}
                              type="number"
                              step="0.5"
                              min="0"
                              max="100"
                              placeholder="0%"
                              className="w-full px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 font-mono"
                            />
                          </div>

                          {/* Actions & Row Total */}
                          <div className="sm:col-span-1 flex items-center justify-end">
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              type="button"
                              onClick={() => removeItem(index)}
                              disabled={itemFields.length <= 1}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors disabled:opacity-30"
                              title="Remove Line"
                            >
                              <Trash2 className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/50 dark:border-slate-800">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            {item?.category && (
                              <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold mr-2">
                                {item.category}
                              </span>
                            )}
                            Line Total (with {item?.wastePercentage || 0}% allowance):
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono">
                            {formatCurrency(rowCost, currency)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-100 dark:border-emerald-800/60 flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300">
                <span>Total Raw Materials & Ingredients Cost</span>
                <span className="text-sm font-extrabold font-mono">{formatCurrency(calculatedTotals.totalMaterialCost || 0, currency)}</span>
              </div>
            </motion.div>
          )}

          {/* Tab 2: Labor & Processing */}
          {activeTab === 'labor' && (
            <motion.div 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="fresh-card p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">Labor & Machine Operations</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Mincing, dumpling folding, blast freezing, nitrogen flush, quality inspections.</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() =>
                    appendLabor({
                      laborId: laborCosts[0]?.id || generateId(),
                      laborName: laborCosts[0]?.name || 'Manual Operation',
                      hours: 2,
                      hourlyRate: laborCosts[0]?.hourlyRate || 180,
                      operationType: 'General Processing',
                    })
                  }
                  className="inline-flex items-center px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all border border-emerald-200/80 dark:border-emerald-800"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  <span>Add Operation</span>
                </motion.button>
              </div>

              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {laborFields.map((field, index) => {
                    const labor = watchedValues.laborItems?.[index];
                    const rowLaborCost = (labor?.hours || 0) * (labor?.hourlyRate || 0);

                    return (
                      <motion.div
                        key={field.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0, overflow: 'hidden' }}
                        transition={{ duration: 0.2 }}
                        className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all space-y-3"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                          <div className="sm:col-span-6">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
                              Operation / Role
                            </label>
                            <select
                              value={labor?.laborId || ''}
                              onChange={(e) => handleLaborSelect(index, e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-semibold"
                            >
                              <option value="">-- Choose Processing Operation --</option>
                              {laborCosts.map((l) => (
                                <option key={l.id} value={l.id}>
                                  {l.name} ({l.category} • {formatCurrency(l.hourlyRate, currency)}/hr)
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
                              Total Hours
                            </label>
                            <input
                              {...register(`laborItems.${index}.hours`, { valueAsNumber: true })}
                              type="number"
                              step="0.25"
                              min="0.1"
                              className="w-full px-2 py-1.5 text-xs text-slate-900 dark:text-white font-bold font-mono"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
                              Hourly Rate ({currency})
                            </label>
                            <input
                              {...register(`laborItems.${index}.hourlyRate`, { valueAsNumber: true })}
                              type="number"
                              step="10"
                              min="0"
                              className="w-full px-2 py-1.5 text-xs text-slate-900 dark:text-white font-medium font-mono"
                            />
                          </div>

                          <div className="sm:col-span-1 flex items-center justify-end">
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              type="button"
                              onClick={() => removeLabor(index)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              title="Remove Operation"
                            >
                              <Trash2 className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/50 dark:border-slate-800">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            {labor?.hours || 0} hrs @ {formatCurrency(labor?.hourlyRate || 0, currency)}/hr
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono">
                            {formatCurrency(rowLaborCost, currency)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-xl border border-blue-100 dark:border-blue-800/60 flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-300">
                <span>Total Labor & Processing Cost</span>
                <span className="text-sm font-extrabold font-mono">{formatCurrency(calculatedTotals.totalLaborCost || 0, currency)}</span>
              </div>
            </motion.div>
          )}

          {/* Tab 3: Overheads & Margins */}
          {activeTab === 'overheads' && (
            <motion.div 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="fresh-card p-5 space-y-5"
            >
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">Overhead, Cold-Chain Utilities & Profit Markup</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Fine-tune power (blast freezer refrigeration), QA compliance, and target gross margin.</p>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Overhead & Facility Utilities %</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Refrigeration power, factory rent, quality inspections.</p>
                    </div>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                      {watchedValues.overheadPercentage}%
                    </span>
                  </div>
                  <input
                    {...register('overheadPercentage', { valueAsNumber: true })}
                    type="range"
                    min="0"
                    max="30"
                    step="0.5"
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    <span>0% (Lean)</span>
                    <span>10% (Standard Food Plant)</span>
                    <span>30% (High Utility)</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Target Profit Margin %</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Markup applied to total production costs to determine selling price.</p>
                    </div>
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                      +{watchedValues.profitMargin}%
                    </span>
                  </div>
                  <input
                    {...register('profitMargin', { valueAsNumber: true })}
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    <span>0% (At Cost)</span>
                    <span>25% (Wholesale Target)</span>
                    <span>50%+ (Premium Retail)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Sticky Sidebar: Live Economics & Pricing Summary */}
        <div className="space-y-5">
          <div className="fresh-card p-5 sticky top-20 space-y-5">
            {/* Header Product Preview with Real Photo */}
            <div className="relative h-32 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <img
                src={getProductImage({ name: watchedValues.name, category: watchedValues.category })}
                alt={watchedValues.name || 'Recipe Preview'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
              
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-white bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded border border-white/20">
                  {watchedValues.projectCode || 'AF-BOM'}
                </span>
              </div>

              {watchedValues.storageCondition && (
                <div className="absolute top-2.5 right-2.5">
                  <span className="text-[10px] font-semibold text-cyan-200 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-cyan-400/30 flex items-center gap-1">
                    <Snowflake className="h-2.5 w-2.5 text-cyan-300" />
                    {watchedValues.storageCondition}
                  </span>
                </div>
              )}

              <div className="absolute bottom-2.5 left-3 right-3 text-white">
                <p className="text-xs font-bold font-display truncate drop-shadow">
                  {watchedValues.name || 'Untitled Recipe'}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-300">
                  <span>{watchedValues.category || 'Food & Ready-to-Cook'}</span>
                  <span className="font-bold text-emerald-300">Batch: {watchedValues.batchQuantity || 1} {watchedValues.batchUnit || 'units'}</span>
                </div>
              </div>
            </div>

            {/* Grand Total Hero */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 dark:from-emerald-950/80 dark:via-slate-900 dark:to-black text-white shadow-md space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Total Batch Cost & Margin</span>
              <p className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
                {formatCurrency(calculatedTotals.grandTotal || 0, currency)}
              </p>
              <div className="pt-2 border-t border-emerald-900/60 flex items-center justify-between text-xs text-emerald-200/90">
                <span>Cost Per {watchedValues.batchUnit || 'Unit'}:</span>
                <span className="font-bold text-white text-sm font-mono">
                  {formatCurrency(unitCost, currency)}
                </span>
              </div>
            </div>

            {/* Visual Cost Composition Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span>Cost Composition</span>
                <span>100%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div style={{ width: `${rawCostRatio}%` }} className="bg-emerald-600 transition-all duration-300" title={`Materials: ${rawCostRatio.toFixed(1)}%`} />
                <div style={{ width: `${laborCostRatio}%` }} className="bg-sky-500 transition-all duration-300" title={`Labor: ${laborCostRatio.toFixed(1)}%`} />
                <div style={{ width: `${overheadCostRatio}%` }} className="bg-amber-500 transition-all duration-300" title={`Overheads: ${overheadCostRatio.toFixed(1)}%`} />
                <div style={{ width: `${profitCostRatio}%` }} className="bg-emerald-400 transition-all duration-300" title={`Profit: ${profitCostRatio.toFixed(1)}%`} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-600" /> Ingredients ({rawCostRatio.toFixed(0)}%)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-500" /> Labor ({laborCostRatio.toFixed(0)}%)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Overheads ({overheadCostRatio.toFixed(0)}%)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Net Profit ({profitCostRatio.toFixed(0)}%)</span>
              </div>
            </div>

            {/* Detailed Breakdown List */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Raw Materials & Packaging</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(calculatedTotals.totalMaterialCost || 0, currency)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Labor & Processing</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(calculatedTotals.totalLaborCost || 0, currency)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Overhead ({watchedValues.overheadPercentage}%)</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(calculatedTotals.totalOverhead || 0, currency)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold pt-1 border-t border-dashed border-slate-200 dark:border-slate-800">
                <span>Net Profit Markup ({watchedValues.profitMargin}%)</span>
                <span className="font-extrabold font-mono">{formatCurrency(calculatedTotals.totalProfit || 0, currency)}</span>
              </div>
            </div>

            {/* Suggested Selling Pricing */}
            <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Recommended Wholesale Price</span>
                <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
                  {formatCurrency(unitCost, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs">
                <span>Suggested Retail MRP (1.35x)</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {formatCurrency(unitCost * 1.35, currency)}
                </span>
              </div>
            </div>

            {/* Save Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 transition-all"
            >
              <Save className="h-4 w-4" />
              <span>{currentBOM ? 'Update BOM & Save' : 'Save as Active BOM'}</span>
            </motion.button>
          </div>
        </div>
      </form>

      {/* Preset Recipe Modal */}
      <AnimatePresence>
        {templateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm" 
              onClick={() => setTemplateModalOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Load Akira Fresh Recipe Preset</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Select a pre-configured BOM to quickly calculate custom batch yields.</p>
                </div>
                <button
                  onClick={() => setTemplateModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {boms.map((preset) => {
                  const presetImg = preset.imageUrl || getProductImage(preset);
                  return (
                    <motion.div
                      key={preset.id}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleLoadTemplate(preset)}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 cursor-pointer transition-all space-y-2.5 group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={presetImg}
                          alt={preset.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                              {preset.projectCode || 'AF-BOM'}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              {preset.batchQuantity} {preset.batchUnit}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-display truncate">
                            {preset.name}
                          </h4>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>
                      <div className="pt-2 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold border-t border-slate-200/50 dark:border-slate-800">
                        <span className="font-mono">{formatCurrency(preset.grandTotal, currency)}</span>
                        <span>Use Template →</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BOMCalculator;
