export interface Material {
  id: string;
  name: string;
  category: string;
  unit: string;
  costPerUnit: number;
  supplier?: string;
  description?: string;
  imageUrl?: string;
  inStock?: number;
  reorderLevel?: number;
  storageCondition?: 'Frozen (-18°C)' | 'Chilled (2-4°C)' | 'Ambient' | 'Special';
  createdAt: Date;
  updatedAt: Date;
}

export interface LaborCost {
  id: string;
  name: string;
  hourlyRate: number;
  category: string;
  description?: string;
}

export interface BOMItem {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  totalCost: number;
  wastePercentage?: number;
  category?: string;
}

export interface BOMLaborItem {
  id: string;
  laborId: string;
  laborName: string;
  hours: number;
  hourlyRate: number;
  totalCost: number;
  operationType?: string;
}

export interface BOM {
  id: string;
  name: string;
  description?: string;
  projectCode?: string;
  category?: string;
  imageUrl?: string;
  batchQuantity?: number;
  batchUnit?: string;
  storageCondition?: string;
  version: string;
  items: BOMItem[];
  laborItems: BOMLaborItem[];
  overheadPercentage: number;
  profitMargin: number;
  totalMaterialCost: number;
  totalLaborCost: number;
  totalOverhead: number;
  totalProfit: number;
  grandTotal: number;
  costPerUnit?: number;
  suggestedSellingPrice?: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  status: 'draft' | 'active' | 'archived';
}

export interface BOMFormData {
  name: string;
  description?: string;
  projectCode?: string;
  category?: string;
  imageUrl?: string;
  batchQuantity?: number;
  batchUnit?: string;
  storageCondition?: string;
  overheadPercentage: number;
  profitMargin: number;
  items: Omit<BOMItem, 'id' | 'totalCost'>[];
  laborItems: Omit<BOMLaborItem, 'id' | 'totalCost'>[];
}

export interface ExportOptions {
  format: 'pdf' | 'excel';
  includeCosts: boolean;
  includeLabor: boolean;
  includeSummary: boolean;
}
