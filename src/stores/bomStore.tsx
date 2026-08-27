import { create } from 'zustand';
import { BOM, Material, LaborCost, BOMFormData } from '../types';

interface BOMStore {
  // State
  boms: BOM[];
  materials: Material[];
  laborCosts: LaborCost[];
  currentBOM: BOM | null;
  
  // BOM Actions
  addBOM: (bom: BOM) => void;
  updateBOM: (id: string, bom: Partial<BOM>) => void;
  deleteBOM: (id: string) => void;
  setCurrentBOM: (bom: BOM | null) => void;
  duplicateBOM: (id: string) => void;
  
  // Material Actions
  addMaterial: (material: Material) => void;
  updateMaterial: (id: string, material: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  
  // Labor Cost Actions
  addLaborCost: (laborCost: LaborCost) => void;
  updateLaborCost: (id: string, laborCost: Partial<LaborCost>) => void;
  deleteLaborCost: (id: string) => void;
  
  // Calculation helpers
  calculateBOMTotals: (formData: BOMFormData) => Partial<BOM>;
}

const useBOMStore = create<BOMStore>()((set, get) => ({
      // Initial state
      boms: [],
      materials: [],
      laborCosts: [],
      currentBOM: null,
      
      // BOM Actions
      addBOM: (bom) => set((state) => ({ boms: [...state.boms, bom] })),
      
      updateBOM: (id, updatedBOM) => set((state) => ({
        boms: state.boms.map((bom) =>
          bom.id === id ? { ...bom, ...updatedBOM, updatedAt: new Date() } : bom
        ),
        currentBOM: state.currentBOM?.id === id
          ? { ...state.currentBOM, ...updatedBOM, updatedAt: new Date() }
          : state.currentBOM,
      })),
      
      deleteBOM: (id) => set((state) => ({
        boms: state.boms.filter((bom) => bom.id !== id),
        currentBOM: state.currentBOM?.id === id ? null : state.currentBOM,
      })),
      
      setCurrentBOM: (bom) => set({ currentBOM: bom }),
      
      duplicateBOM: (id) => set((state) => {
        const bomToDuplicate = state.boms.find((b) => b.id === id);
        if (!bomToDuplicate) return state;
        
        const duplicatedBOM: BOM = {
          ...bomToDuplicate,
          id: crypto.randomUUID(),
          name: `${bomToDuplicate.name} (Copy)`,
          version: '1.0',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'draft',
        };
        
        return { boms: [...state.boms, duplicatedBOM] };
      }),
      
      // Material Actions
      addMaterial: (material) => set((state) => ({
        materials: [...state.materials, material],
      })),
      
      updateMaterial: (id, updatedMaterial) => set((state) => ({
        materials: state.materials.map((material) =>
          material.id === id ? { ...material, ...updatedMaterial, updatedAt: new Date() } : material
        ),
      })),
      
      deleteMaterial: (id) => set((state) => ({
        materials: state.materials.filter((material) => material.id !== id),
      })),
      
      // Labor Cost Actions
      addLaborCost: (laborCost) => set((state) => ({
        laborCosts: [...state.laborCosts, laborCost],
      })),
      
      updateLaborCost: (id, updatedLaborCost) => set((state) => ({
        laborCosts: state.laborCosts.map((laborCost) =>
          laborCost.id === id ? { ...laborCost, ...updatedLaborCost } : laborCost
        ),
      })),
      
      deleteLaborCost: (id) => set((state) => ({
        laborCosts: state.laborCosts.filter((laborCost) => laborCost.id !== id),
      })),
      
      // Calculation helpers
      calculateBOMTotals: (formData) => {
        const totalMaterialCost = formData.items.reduce((sum, item) => {
          const wasteMultiplier = 1 + (item.wastePercentage || 0) / 100;
          return sum + (item.quantity * item.costPerUnit * wasteMultiplier);
        }, 0);
        
        const totalLaborCost = formData.laborItems.reduce(
          (sum, item) => sum + item.hours * item.hourlyRate,
          0
        );
        
        const totalOverhead = (totalMaterialCost + totalLaborCost) * (formData.overheadPercentage / 100);
        const subtotal = totalMaterialCost + totalLaborCost + totalOverhead;
        const totalProfit = subtotal * (formData.profitMargin / 100);
        const grandTotal = subtotal + totalProfit;
        
        return {
          totalMaterialCost,
          totalLaborCost,
          totalOverhead,
          totalProfit,
          grandTotal,
        };
      },
    })
);

export default useBOMStore;