import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Save, 
  Plus, 
  Trash2, 
  Download, 
  Calculator as CalculatorIcon,
  Package,
  User,
  Percent,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import useBOMStore from '../stores/bomStore';
import { formatCurrency, generateId } from '../lib/utils';
import { exportToExcel, exportToPDF } from '../lib/export';
import { BOMFormData, BOMItem, BOMLaborItem, ExportOptions } from '../types';

const bomSchema = z.object({
  name: z.string().min(1, 'BOM name is required'),
  description: z.string().optional(),
  projectCode: z.string().optional(),
  overheadPercentage: z.number().min(0).max(100),
  profitMargin: z.number().min(0).max(100),
  items: z.array(z.object({
    materialId: z.string(),
    materialName: z.string().min(1, 'Material name is required'),
    quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
    unit: z.string().min(1, 'Unit is required'),
    costPerUnit: z.number().min(0, 'Cost must be non-negative'),
    wastePercentage: z.number().min(0).max(100).optional(),
  })),
  laborItems: z.array(z.object({
    laborId: z.string(),
    laborName: z.string().min(1, 'Labor name is required'),
    hours: z.number().min(0.01, 'Hours must be greater than 0'),
    hourlyRate: z.number().min(0, 'Rate must be non-negative'),
  })),
});

const BOMCalculator: React.FC = () => {
  const { materials, laborCosts, addBOM, currentBOM, setCurrentBOM, calculateBOMTotals } = useBOMStore();
  
  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue,
    formState: { errors } 
  } = useForm<BOMFormData>({
    resolver: zodResolver(bomSchema),
    defaultValues: {
      name: currentBOM?.name || '',
      description: currentBOM?.description || '',
      projectCode: currentBOM?.projectCode || '',
      overheadPercentage: currentBOM?.overheadPercentage || 10,
      profitMargin: currentBOM?.profitMargin || 15,
      items: currentBOM?.items.map(item => ({
        materialId: item.materialId,
        materialName: item.materialName,
        quantity: item.quantity,
        unit: item.unit,
        costPerUnit: item.costPerUnit,
        wastePercentage: item.wastePercentage,
      })) || [],
      laborItems: currentBOM?.laborItems.map(item => ({
        laborId: item.laborId,
        laborName: item.laborName,
        hours: item.hours,
        hourlyRate: item.hourlyRate,
      })) || [],
    },
  });

  const watchedValues = watch();
  const calculatedTotals = calculateBOMTotals(watchedValues);

  const addMaterialItem = () => {
    const newItems = [...watchedValues.items, {
      materialId: generateId(),
      materialName: '',
      quantity: 1,
      unit: 'pcs',
      costPerUnit: 0,
      wastePercentage: 0,
    }];
    setValue('items', newItems);
  };

  const addLaborItem = () => {
    const newLaborItems = [...watchedValues.laborItems, {
      laborId: generateId(),
      laborName: '',
      hours: 1,
      hourlyRate: 0,
    }];
    setValue('laborItems', newLaborItems);
  };

  const removeMaterialItem = (index: number) => {
    const newItems = watchedValues.items.filter((_, i) => i !== index);
    setValue('items', newItems);
  };

  const removeLaborItem = (index: number) => {
    const newLaborItems = watchedValues.laborItems.filter((_, i) => i !== index);
    setValue('laborItems', newLaborItems);
  };

  const handleExportExcel = () => {
    const bom = {
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
      ...calculatedTotals,
      version: currentBOM?.version || '1.0',
      createdAt: currentBOM?.createdAt || new Date(),
      updatedAt: new Date(),
      status: 'draft' as const,
    };

    const options: ExportOptions = {
      format: 'excel',
      includeCosts: true,
      includeLabor: true,
      includeSummary: true,
    };
    exportToExcel(bom, options);
  };

  const handleExportPDF = () => {
    const bom = {
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
      ...calculatedTotals,
      version: currentBOM?.version || '1.0',
      createdAt: currentBOM?.createdAt || new Date(),
      updatedAt: new Date(),
      status: 'draft' as const,
    };

    const options: ExportOptions = {
      format: 'pdf',
      includeCosts: true,
      includeLabor: true,
      includeSummary: true,
    };
    exportToPDF(bom, options);
  };

  const onSubmit = (data: BOMFormData) => {
    const bom = {
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
      ...calculatedTotals,
      version: currentBOM?.version || '1.0',
      createdAt: currentBOM?.createdAt || new Date(),
      updatedAt: new Date(),
      status: 'draft' as const,
    };
    
    addBOM(bom);
    setCurrentBOM(null);
    alert('BOM saved successfully!');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-xl shadow-lg">
            <CalculatorIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              BOM Calculator
            </h1>
            <p className="mt-1 text-slate-500">Create and manage premium Bill of Materials</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setCurrentBOM(null)}
            className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 hover:text-slate-900"
          >
            Clear
          </button>
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white rounded-xl hover:from-secondary-600 hover:to-secondary-700 transition-all duration-200 shadow-md shadow-secondary-500/25 hover:shadow-lg hover:shadow-secondary-500/30 hover:-translate-y-0.5"
          >
            <Download className="h-5 w-5 mr-2" />
            Export Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl hover:from-accent-600 hover:to-accent-700 transition-all duration-200 shadow-md shadow-accent-500/25 hover:shadow-lg hover:shadow-accent-500/30 hover:-translate-y-0.5"
          >
            <Download className="h-5 w-5 mr-2" />
            Export PDF
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5"
          >
            <Save className="h-5 w-5 mr-2" />
            Save BOM
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-2 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Basic Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                BOM Name *
              </label>
              <input
                {...register('name')}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all duration-200"
                placeholder="Enter BOM name"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Project Code
              </label>
              <input
                {...register('projectCode')}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all duration-200"
                placeholder="Enter project code"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all duration-200 resize-none"
                placeholder="Enter BOM description"
              />
            </div>
          </div>
        </div>

        {/* Materials */}
        <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 p-2 rounded-lg">
                <Package className="h-5 w-5 text-secondary-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Materials</h2>
            </div>
            <button
              type="button"
              onClick={addMaterialItem}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white rounded-xl hover:from-secondary-600 hover:to-secondary-700 transition-all duration-200 shadow-md shadow-secondary-500/25 hover:shadow-lg hover:shadow-secondary-500/30 hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </button>
          </div>
          
          <div className="space-y-4">
            {watchedValues.items.map((item, index) => (
              <div key={index} className="border border-slate-200 rounded-xl p-6 space-y-4 bg-gradient-to-br from-slate-50 to-white hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-secondary-100 to-secondary-50 p-2 rounded-lg">
                      <Package className="h-5 w-5 text-secondary-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Material {index + 1}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMaterialItem(index)}
                    className="text-red-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">
                      Material Name *
                    </label>
                    <input
                      {...register(`items.${index}.materialName`)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500 transition-all duration-200 text-sm"
                      placeholder="Material name"
                    />
                    {errors.items?.[index]?.materialName && (
                      <p className="mt-1 text-xs text-red-500">{errors.items[index]?.materialName?.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500 transition-all duration-200 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">
                      Unit *
                    </label>
                    <input
                      {...register(`items.${index}.unit`)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500 transition-all duration-200 text-sm"
                      placeholder="pcs, kg, m"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">
                      Cost per Unit *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.costPerUnit`, { valueAsNumber: true })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500 transition-all duration-200 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">
                      Waste %
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        {...register(`items.${index}.wastePercentage`, { valueAsNumber: true })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500 transition-all duration-200 text-sm"
                        placeholder="0"
                      />
                      <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                  
                  <div className="flex items-end">
                    <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 p-3 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Total</p>
                      <p className="text-sm font-semibold text-secondary-700">
                        {formatCurrency(item.quantity * item.costPerUnit * (1 + (item.wastePercentage || 0) / 100))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Labor Costs */}
        <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-accent-50 to-accent-100 p-2 rounded-lg">
                <User className="h-5 w-5 text-accent-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Labor Costs</h2>
            </div>
            <button
              type="button"
              onClick={addLaborItem}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl hover:from-accent-600 hover:to-accent-700 transition-all duration-200 shadow-md shadow-accent-500/25 hover:shadow-lg hover:shadow-accent-500/30 hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Labor
            </button>
          </div>
          
          <div className="space-y-4">
            {watchedValues.laborItems.map((item, index) => (
              <div key={index} className="border border-slate-200 rounded-xl p-6 space-y-4 bg-gradient-to-br from-slate-50 to-white hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-accent-100 to-accent-50 p-2 rounded-lg">
                      <User className="h-5 w-5 text-accent-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Labor {index + 1}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLaborItem(index)}
                    className="text-red-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">
                      Labor Type *
                    </label>
                    <input
                      {...register(`laborItems.${index}.laborName`)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all duration-200 text-sm"
                      placeholder="e.g., Assembly, Installation"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">
                      Hours *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      {...register(`laborItems.${index}.hours`, { valueAsNumber: true })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all duration-200 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">
                      Hourly Rate *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register(`laborItems.${index}.hourlyRate`, { valueAsNumber: true })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all duration-200 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="md:col-span-3 flex items-end">
                    <div className="bg-gradient-to-br from-accent-50 to-accent-100 p-3 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Total</p>
                      <p className="text-sm font-semibold text-accent-700">
                        {formatCurrency(item.hours * item.hourlyRate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Summary */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-premium-lg p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                <CalculatorIcon className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold">Cost Summary</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Overhead Percentage
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  {...register('overheadPercentage', { valueAsNumber: true })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-white/20 focus:border-white/40 text-white placeholder-slate-400 backdrop-blur-sm transition-all duration-200"
                />
                <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Profit Margin
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  {...register('profitMargin', { valueAsNumber: true })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-white/20 focus:border-white/40 text-white placeholder-slate-400 backdrop-blur-sm transition-all duration-200"
                />
                <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4 pt-6 border-t border-white/10">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Total Material Cost</span>
              <span className="font-medium text-white">{formatCurrency(calculatedTotals.totalMaterialCost || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Total Labor Cost</span>
              <span className="font-medium text-white">{formatCurrency(calculatedTotals.totalLaborCost || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Overhead ({watchedValues.overheadPercentage}%)</span>
              <span className="font-medium text-white">{formatCurrency(calculatedTotals.totalOverhead || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Profit Margin ({watchedValues.profitMargin}%)</span>
              <span className="font-medium text-white">{formatCurrency(calculatedTotals.totalProfit || 0)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-4 border-t border-white/10">
              <span className="text-white">Grand Total</span>
              <span className="bg-gradient-to-r from-primary-400 to-premium-gold-400 bg-clip-text text-transparent">
                {formatCurrency(calculatedTotals.grandTotal || 0)}
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BOMCalculator;