import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Package, Sparkles, ArrowUpRight } from 'lucide-react';
import useBOMStore from '../stores/bomStore';
import { formatCurrency, generateId } from '../lib/utils';
import { Material } from '../types';

const Materials: React.FC = () => {
  const { materials, addMaterial, updateMaterial, deleteMaterial } = useBOMStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    costPerUnit: 0,
    supplier: '',
    description: '',
  });

  const filteredMaterials = materials.filter((material) =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMaterial) {
      updateMaterial(editingMaterial.id, {
        ...formData,
        updatedAt: new Date(),
      });
      setEditingMaterial(null);
    } else {
      addMaterial({
        id: generateId(),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    setFormData({
      name: '',
      category: '',
      unit: '',
      costPerUnit: 0,
      supplier: '',
      description: '',
    });
    setShowForm(false);
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      category: material.category,
      unit: material.unit,
      costPerUnit: material.costPerUnit,
      supplier: material.supplier || '',
      description: material.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this material?')) {
      deleteMaterial(id);
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 p-2 rounded-xl shadow-lg">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Materials
            </h1>
            <p className="mt-1 text-slate-500">Manage your premium material inventory</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingMaterial(null);
            setFormData({
              name: '',
              category: '',
              unit: '',
              costPerUnit: 0,
              supplier: '',
              description: '',
            });
            setShowForm(true);
          }}
          className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Material
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all duration-200"
          />
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-8 animate-fade-in">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-2 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              {editingMaterial ? 'Edit Material' : 'Add New Material'}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Material Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all duration-200"
                  placeholder="Enter material name"
                  required={!editingMaterial}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category *
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Unit *
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all duration-200"
                  placeholder="pcs, kg, m, etc."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cost per Unit *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.costPerUnit}
                  onChange={(e) => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Supplier
                </label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all duration-200"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all duration-200 resize-none"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5"
              >
                {editingMaterial ? 'Update' : 'Add'} Material
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.length === 0 ? (
          <div className="col-span-full p-16 text-center bg-white rounded-2xl shadow-premium border border-slate-100">
            <div className="bg-gradient-to-br from-slate-100 to-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-10 w-10 text-slate-300" />
            </div>
            <p className="text-slate-500 mb-4">No materials found</p>
            <p className="text-sm text-slate-400">Add your first material to get started</p>
          </div>
        ) : (
          filteredMaterials.map((material) => (
            <div key={material.id} className="bg-white rounded-2xl shadow-premium border border-slate-100 p-6 hover:shadow-premium-lg transition-all duration-300 card-hover group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <Package className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">{material.name}</h3>
                    <p className="text-sm text-slate-500">{material.category}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(material)}
                    className="text-slate-400 hover:text-primary-600 transition-colors p-2 rounded-lg hover:bg-primary-50"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(material.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Unit</span>
                  <span className="text-sm font-medium text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">{material.unit}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Cost</span>
                  <span className="text-sm font-semibold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                    {formatCurrency(material.costPerUnit)}
                  </span>
                </div>
                {material.supplier && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Supplier</span>
                    <span className="text-sm font-medium text-slate-900">{material.supplier}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Materials;