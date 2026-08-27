import { create } from 'zustand';
import { BOM, Material, LaborCost, BOMFormData } from '../types';
import { getProductImage, getMaterialImage, AKIRA_PRODUCT_IMAGES, MATERIAL_IMAGES } from '../lib/productImages';

interface BOMStore {
  // State
  boms: BOM[];
  materials: Material[];
  laborCosts: LaborCost[];
  currentBOM: BOM | null;
  currency: string;
  
  // Currency
  setCurrency: (currency: string) => void;
  
  // BOM Actions
  addBOM: (bom: BOM) => void;
  updateBOM: (id: string, bom: Partial<BOM>) => void;
  deleteBOM: (id: string) => void;
  setCurrentBOM: (bom: BOM | null) => void;
  duplicateBOM: (id: string) => void;
  resetToDefaults: () => void;
  
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

// Initial Sample Akira Fresh Materials & Ingredients
const INITIAL_MATERIALS: Material[] = [
  {
    id: 'mat-1',
    name: 'Prime Chicken Breast Boneless Mince',
    category: 'Proteins & Meats',
    unit: 'kg',
    costPerUnit: 240,
    supplier: 'Akira Fresh Direct Farms',
    imageUrl: MATERIAL_IMAGES.chicken,
    description: 'Hygienically deboned, 100% antibiotic residue free chicken mince',
    inStock: 1250,
    reorderLevel: 300,
    storageCondition: 'Chilled (2-4°C)',
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-02-10'),
  },
  {
    id: 'mat-2',
    name: 'Prime Himalayan Mutton Mince',
    category: 'Proteins & Meats',
    unit: 'kg',
    costPerUnit: 680,
    supplier: 'Akira Premium Livestock',
    imageUrl: MATERIAL_IMAGES.mutton,
    description: 'Grass-fed lean mutton mince, vacuum chilled',
    inStock: 480,
    reorderLevel: 100,
    storageCondition: 'Chilled (2-4°C)',
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-02-10'),
  },
  {
    id: 'mat-3',
    name: 'Artisanal Mozzarella & Cheddar Shred Blend',
    category: 'Dairy & Binders',
    unit: 'kg',
    costPerUnit: 420,
    supplier: 'Dairy Valley Co.',
    imageUrl: MATERIAL_IMAGES.cheese,
    description: 'High-melt cheese blend for dumpling & patty filling',
    inStock: 320,
    reorderLevel: 80,
    storageCondition: 'Chilled (2-4°C)',
    createdAt: new Date('2026-01-18'),
    updatedAt: new Date('2026-02-12'),
  },
  {
    id: 'mat-4',
    name: 'Dimsum & Momo Ultra-Fine Wheat Wrapper Flour',
    category: 'Bakery & Flour',
    unit: 'kg',
    costPerUnit: 58,
    supplier: 'Golden Grain Mills',
    imageUrl: MATERIAL_IMAGES.flour,
    description: 'High elasticity unbleached dough flour for thin dumpling skins',
    inStock: 2200,
    reorderLevel: 500,
    storageCondition: 'Ambient',
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-01-28'),
  },
  {
    id: 'mat-5',
    name: 'Akira Secret Momo Seasoning & Herb Emulsion',
    category: 'Spices & Seasonings',
    unit: 'kg',
    costPerUnit: 350,
    supplier: 'SpiceCraft Natural Extracts',
    imageUrl: MATERIAL_IMAGES.spice,
    description: 'Infused roasted garlic, fresh shallot, scallion, and Himalayan herbs',
    inStock: 160,
    reorderLevel: 40,
    storageCondition: 'Ambient',
    createdAt: new Date('2026-01-20'),
    updatedAt: new Date('2026-02-15'),
  },
  {
    id: 'mat-6',
    name: 'Kashmiri Saffron & Seekh Kebab Spice Blend',
    category: 'Spices & Seasonings',
    unit: 'kg',
    costPerUnit: 520,
    supplier: 'Royal Spices Ltd.',
    imageUrl: MATERIAL_IMAGES.spice,
    description: 'Stone ground aromatic spices for authentic seekh kebabs',
    inStock: 95,
    reorderLevel: 25,
    storageCondition: 'Ambient',
    createdAt: new Date('2026-01-22'),
    updatedAt: new Date('2026-02-18'),
  },
  {
    id: 'mat-7',
    name: 'Japanese Panko Crispy Breadcrumbs',
    category: 'Bakery & Flour',
    unit: 'kg',
    costPerUnit: 140,
    supplier: 'Tokyo Crumb Express',
    imageUrl: MATERIAL_IMAGES.panko,
    description: 'Extra flaky needle crumbs for nuggets & popcorn coating',
    inStock: 850,
    reorderLevel: 200,
    storageCondition: 'Ambient',
    createdAt: new Date('2026-01-12'),
    updatedAt: new Date('2026-02-01'),
  },
  {
    id: 'mat-8',
    name: 'Multi-Layer Barrier Vacuum Pouch (500g)',
    category: 'Packaging & Boxes',
    unit: 'pcs',
    costPerUnit: 6.5,
    supplier: 'FlexiPack Solutions',
    imageUrl: MATERIAL_IMAGES.packaging,
    description: 'High-barrier nylon/PE pouch for blast frozen storage (-40°C rated)',
    inStock: 18500,
    reorderLevel: 3000,
    storageCondition: 'Ambient',
    createdAt: new Date('2026-01-05'),
    updatedAt: new Date('2026-02-05'),
  },
  {
    id: 'mat-9',
    name: 'Akira Fresh Branded Retail Paperboard Box',
    category: 'Packaging & Boxes',
    unit: 'pcs',
    costPerUnit: 12.0,
    supplier: 'PrintKraft Eco Packaging',
    imageUrl: MATERIAL_IMAGES.packaging,
    description: 'FSC Certified matte UV coated retail box with window',
    inStock: 12000,
    reorderLevel: 2500,
    storageCondition: 'Ambient',
    createdAt: new Date('2026-01-05'),
    updatedAt: new Date('2026-02-05'),
  },
  {
    id: 'mat-10',
    name: 'Cold-Chain Phase-Change Gel Ice Sheet (-15°C)',
    category: 'Cold Chain & Logistics',
    unit: 'pcs',
    costPerUnit: 18.5,
    supplier: 'PolarFrost Cold Chain',
    imageUrl: MATERIAL_IMAGES.ice,
    description: 'Reusable non-toxic thermal refrigerant for 48hr transit',
    inStock: 4500,
    reorderLevel: 1000,
    storageCondition: 'Frozen (-18°C)',
    createdAt: new Date('2026-01-08'),
    updatedAt: new Date('2026-02-14'),
  },
  {
    id: 'mat-11',
    name: 'Expanded Polystyrene (EPS) Thermal Shipper Box',
    category: 'Cold Chain & Logistics',
    unit: 'pcs',
    costPerUnit: 65.0,
    supplier: 'ThermoShield India',
    imageUrl: MATERIAL_IMAGES.box,
    description: 'High-density insulated shipping box for direct customer home deliveries',
    inStock: 1200,
    reorderLevel: 300,
    storageCondition: 'Ambient',
    createdAt: new Date('2026-01-08'),
    updatedAt: new Date('2026-02-14'),
  },
  {
    id: 'mat-12',
    name: 'Pure Virgin Cold-Pressed Mustard Oil & Ghee',
    category: 'Dairy & Binders',
    unit: 'kg',
    costPerUnit: 280,
    supplier: 'Vedic Naturals',
    imageUrl: MATERIAL_IMAGES.oil,
    description: 'Aromatic fat blend for binding and searing kebabs',
    inStock: 420,
    reorderLevel: 100,
    storageCondition: 'Ambient',
    createdAt: new Date('2026-01-20'),
    updatedAt: new Date('2026-02-20'),
  }
];

// Initial Labor & Processing Activities
const INITIAL_LABOR: LaborCost[] = [
  {
    id: 'lab-1',
    name: 'Meat Deboning & Precision Mincing',
    hourlyRate: 220,
    category: 'Preparation & Processing',
    description: 'Sanitary batch trimming, grading, and temperature controlled mincing',
  },
  {
    id: 'lab-2',
    name: 'Dumpling & Momos Folding Line',
    hourlyRate: 180,
    category: 'Assembly & Crafting',
    description: 'Manual or semi-automated dumpling dough rolling, stuffing, and pleating',
  },
  {
    id: 'lab-3',
    name: 'Kebab Skewer Shaping & Flash Char',
    hourlyRate: 240,
    category: 'Cooking & Roasting',
    description: 'Precision weight forming onto skewers and flash charcoal searing',
  },
  {
    id: 'lab-4',
    name: 'Blast Freezing (-40°C IQF Tunnel Operation)',
    hourlyRate: 320,
    category: 'Freezing & Cold Chain',
    description: 'Individual Quick Freezing to lock cell moisture & freshness at peak',
  },
  {
    id: 'lab-5',
    name: 'Nitrogen Flush Vacuum Packing & Quality Check',
    hourlyRate: 190,
    category: 'Packaging & QA',
    description: 'Hermetic sealing, metal detection, and weight validation',
  },
  {
    id: 'lab-6',
    name: 'Cold-Chain Shipping Assembly & Gel Packing',
    hourlyRate: 160,
    category: 'Fulfillment & Logistics',
    description: 'Thermal box packing with phase change gel packs for home delivery',
  }
];

// Initial Sample BOMs inspired by Akira Fresh product lineup
const INITIAL_BOMS: BOM[] = [
  {
    id: 'bom-akira-1',
    name: 'Akira Gourmet Chicken Cheese Momos (Batch: 5,000 Pcs / 500 Boxes)',
    description: 'Premium ready-to-cook juicy minced chicken & cheddar-mozzarella filled dumplings with ultra-thin wrappers.',
    projectCode: 'AF-MOM-001',
    category: 'Food & Ready-to-Cook',
    imageUrl: AKIRA_PRODUCT_IMAGES[0].url,
    batchQuantity: 500,
    batchUnit: 'boxes (10 pcs/box)',
    storageCondition: 'Frozen (-18°C)',
    version: '2.4',
    status: 'active',
    overheadPercentage: 8.5,
    profitMargin: 25.0,
    items: [
      {
        id: 'bi-1',
        materialId: 'mat-1',
        materialName: 'Prime Chicken Breast Boneless Mince',
        quantity: 75,
        unit: 'kg',
        costPerUnit: 240,
        wastePercentage: 2,
        totalCost: 18360,
        category: 'Proteins & Meats',
      },
      {
        id: 'bi-2',
        materialId: 'mat-3',
        materialName: 'Artisanal Mozzarella & Cheddar Shred Blend',
        quantity: 25,
        unit: 'kg',
        costPerUnit: 420,
        wastePercentage: 1,
        totalCost: 10605,
        category: 'Dairy & Binders',
      },
      {
        id: 'bi-3',
        materialId: 'mat-4',
        materialName: 'Dimsum & Momo Ultra-Fine Wheat Wrapper Flour',
        quantity: 45,
        unit: 'kg',
        costPerUnit: 58,
        wastePercentage: 3,
        totalCost: 2688.3,
        category: 'Bakery & Flour',
      },
      {
        id: 'bi-4',
        materialId: 'mat-5',
        materialName: 'Akira Secret Momo Seasoning & Herb Emulsion',
        quantity: 8,
        unit: 'kg',
        costPerUnit: 350,
        wastePercentage: 1,
        totalCost: 2828,
        category: 'Spices & Seasonings',
      },
      {
        id: 'bi-5',
        materialId: 'mat-8',
        materialName: 'Multi-Layer Barrier Vacuum Pouch (500g)',
        quantity: 500,
        unit: 'pcs',
        costPerUnit: 6.5,
        wastePercentage: 1.5,
        totalCost: 3298.75,
        category: 'Packaging & Boxes',
      },
      {
        id: 'bi-6',
        materialId: 'mat-9',
        materialName: 'Akira Fresh Branded Retail Paperboard Box',
        quantity: 500,
        unit: 'pcs',
        costPerUnit: 12.0,
        wastePercentage: 1,
        totalCost: 6060,
        category: 'Packaging & Boxes',
      },
    ],
    laborItems: [
      {
        id: 'bli-1',
        laborId: 'lab-1',
        laborName: 'Meat Deboning & Precision Mincing',
        hours: 6,
        hourlyRate: 220,
        totalCost: 1320,
        operationType: 'Prep',
      },
      {
        id: 'bli-2',
        laborId: 'lab-2',
        laborName: 'Dumpling & Momos Folding Line',
        hours: 24,
        hourlyRate: 180,
        totalCost: 4320,
        operationType: 'Assembly',
      },
      {
        id: 'bli-3',
        laborId: 'lab-4',
        laborName: 'Blast Freezing (-40°C IQF Tunnel Operation)',
        hours: 5,
        hourlyRate: 320,
        totalCost: 1600,
        operationType: 'Freezing',
      },
      {
        id: 'bli-4',
        laborId: 'lab-5',
        laborName: 'Nitrogen Flush Vacuum Packing & Quality Check',
        hours: 8,
        hourlyRate: 190,
        totalCost: 1520,
        operationType: 'Packaging',
      },
    ],
    totalMaterialCost: 43840.05,
    totalLaborCost: 8760.0,
    totalOverhead: 4471.0,
    totalProfit: 14267.76,
    grandTotal: 71338.81,
    costPerUnit: 114.14,
    suggestedSellingPrice: 142.68,
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-24'),
  },
  {
    id: 'bom-akira-2',
    name: 'Akira Royal Mutton Seekh Kebab (Batch: 1,000 Packs / 4,000 Skewers)',
    description: 'Melt-in-mouth spiced Kashmiri Himalayan lamb seekh kebabs, flash-charcoal roasted & blast frozen.',
    projectCode: 'AF-KEB-002',
    category: 'Food & Ready-to-Cook',
    imageUrl: AKIRA_PRODUCT_IMAGES[1].url,
    batchQuantity: 1000,
    batchUnit: 'packs (4 skewers/pack)',
    storageCondition: 'Frozen (-18°C)',
    version: '1.8',
    status: 'active',
    overheadPercentage: 9.0,
    profitMargin: 30.0,
    items: [
      {
        id: 'bi-7',
        materialId: 'mat-2',
        materialName: 'Prime Himalayan Mutton Mince',
        quantity: 280,
        unit: 'kg',
        costPerUnit: 680,
        wastePercentage: 2,
        totalCost: 194208,
        category: 'Proteins & Meats',
      },
      {
        id: 'bi-8',
        materialId: 'mat-6',
        materialName: 'Kashmiri Saffron & Seekh Kebab Spice Blend',
        quantity: 18,
        unit: 'kg',
        costPerUnit: 520,
        wastePercentage: 1,
        totalCost: 9453.6,
        category: 'Spices & Seasonings',
      },
      {
        id: 'bi-9',
        materialId: 'mat-12',
        materialName: 'Pure Virgin Cold-Pressed Mustard Oil & Ghee',
        quantity: 22,
        unit: 'kg',
        costPerUnit: 280,
        wastePercentage: 1,
        totalCost: 6221.6,
        category: 'Dairy & Binders',
      },
      {
        id: 'bi-10',
        materialId: 'mat-8',
        materialName: 'Multi-Layer Barrier Vacuum Pouch (500g)',
        quantity: 1000,
        unit: 'pcs',
        costPerUnit: 6.5,
        wastePercentage: 2,
        totalCost: 6630,
        category: 'Packaging & Boxes',
      },
      {
        id: 'bi-11',
        materialId: 'mat-9',
        materialName: 'Akira Fresh Branded Retail Paperboard Box',
        quantity: 1000,
        unit: 'pcs',
        costPerUnit: 12.0,
        wastePercentage: 1,
        totalCost: 12120,
        category: 'Packaging & Boxes',
      },
    ],
    laborItems: [
      {
        id: 'bli-5',
        laborId: 'lab-1',
        laborName: 'Meat Deboning & Precision Mincing',
        hours: 14,
        hourlyRate: 220,
        totalCost: 3080,
        operationType: 'Prep',
      },
      {
        id: 'bli-6',
        laborId: 'lab-3',
        laborName: 'Kebab Skewer Shaping & Flash Char',
        hours: 28,
        hourlyRate: 240,
        totalCost: 6720,
        operationType: 'Cooking',
      },
      {
        id: 'bli-7',
        laborId: 'lab-4',
        laborName: 'Blast Freezing (-40°C IQF Tunnel Operation)',
        hours: 8,
        hourlyRate: 320,
        totalCost: 2560,
        operationType: 'Freezing',
      },
      {
        id: 'bli-8',
        laborId: 'lab-5',
        laborName: 'Nitrogen Flush Vacuum Packing & Quality Check',
        hours: 16,
        hourlyRate: 190,
        totalCost: 3040,
        operationType: 'Packaging',
      },
    ],
    totalMaterialCost: 228633.2,
    totalLaborCost: 15400.0,
    totalOverhead: 21962.99,
    totalProfit: 79799.46,
    grandTotal: 345795.65,
    costPerUnit: 265.99,
    suggestedSellingPrice: 345.80,
    createdAt: new Date('2026-02-05'),
    updatedAt: new Date('2026-02-26'),
  },
  {
    id: 'bom-akira-tikka',
    name: 'Akira Smoky Tandoori Chicken Tikka (Batch: 800 Packs / 320kg)',
    description: 'Tender antibiotic-free chicken breast chunks marinated in Kashmiri chilies, hung curd, and roasted spices.',
    projectCode: 'AF-TIK-003',
    category: 'Food & Ready-to-Cook',
    imageUrl: AKIRA_PRODUCT_IMAGES[2].url,
    batchQuantity: 800,
    batchUnit: 'packs (400g/pack)',
    storageCondition: 'Frozen (-18°C)',
    version: '2.0',
    status: 'active',
    overheadPercentage: 8.0,
    profitMargin: 28.0,
    items: [
      {
        id: 'bi-tik-1',
        materialId: 'mat-1',
        materialName: 'Prime Chicken Breast Boneless Mince',
        quantity: 260,
        unit: 'kg',
        costPerUnit: 240,
        wastePercentage: 2,
        totalCost: 63648,
        category: 'Proteins & Meats',
      },
      {
        id: 'bi-tik-2',
        materialId: 'mat-6',
        materialName: 'Kashmiri Saffron & Seekh Kebab Spice Blend',
        quantity: 14,
        unit: 'kg',
        costPerUnit: 520,
        wastePercentage: 1,
        totalCost: 7352.8,
        category: 'Spices & Seasonings',
      },
      {
        id: 'bi-tik-3',
        materialId: 'mat-12',
        materialName: 'Pure Virgin Cold-Pressed Mustard Oil & Ghee',
        quantity: 16,
        unit: 'kg',
        costPerUnit: 280,
        wastePercentage: 1,
        totalCost: 4524.8,
        category: 'Dairy & Binders',
      },
      {
        id: 'bi-tik-4',
        materialId: 'mat-8',
        materialName: 'Multi-Layer Barrier Vacuum Pouch (500g)',
        quantity: 800,
        unit: 'pcs',
        costPerUnit: 6.5,
        wastePercentage: 1.5,
        totalCost: 5278,
        category: 'Packaging & Boxes',
      },
      {
        id: 'bi-tik-5',
        materialId: 'mat-9',
        materialName: 'Akira Fresh Branded Retail Paperboard Box',
        quantity: 800,
        unit: 'pcs',
        costPerUnit: 12.0,
        wastePercentage: 1,
        totalCost: 9696,
        category: 'Packaging & Boxes',
      },
    ],
    laborItems: [
      {
        id: 'bli-tik-1',
        laborId: 'lab-1',
        laborName: 'Meat Deboning & Precision Mincing',
        hours: 10,
        hourlyRate: 220,
        totalCost: 2200,
        operationType: 'Prep',
      },
      {
        id: 'bli-tik-2',
        laborId: 'lab-3',
        laborName: 'Kebab Skewer Shaping & Flash Char',
        hours: 16,
        hourlyRate: 240,
        totalCost: 3840,
        operationType: 'Cooking',
      },
      {
        id: 'bli-tik-3',
        laborId: 'lab-4',
        laborName: 'Blast Freezing (-40°C IQF Tunnel Operation)',
        hours: 6,
        hourlyRate: 320,
        totalCost: 1920,
        operationType: 'Freezing',
      },
      {
        id: 'bli-tik-4',
        laborId: 'lab-5',
        laborName: 'Nitrogen Flush Vacuum Packing & Quality Check',
        hours: 10,
        hourlyRate: 190,
        totalCost: 1900,
        operationType: 'Packaging',
      },
    ],
    totalMaterialCost: 90499.6,
    totalLaborCost: 9860.0,
    totalOverhead: 8028.77,
    totalProfit: 30348.84,
    grandTotal: 138737.21,
    costPerUnit: 135.48,
    suggestedSellingPrice: 173.42,
    createdAt: new Date('2026-02-08'),
    updatedAt: new Date('2026-02-25'),
  },
  {
    id: 'bom-akira-patty',
    name: 'Akira Crispy Chicken Burger Patty (Batch: 1,200 Packs / 4,800 Patties)',
    description: 'Golden Japanese panko-breaded spiced chicken patties, flash pre-fried and blast frozen for air fryer convenience.',
    projectCode: 'AF-PAT-004',
    category: 'Food & Ready-to-Cook',
    imageUrl: AKIRA_PRODUCT_IMAGES[3].url,
    batchQuantity: 1200,
    batchUnit: 'packs (4 patties/pack)',
    storageCondition: 'Frozen (-18°C)',
    version: '1.5',
    status: 'active',
    overheadPercentage: 7.5,
    profitMargin: 26.0,
    items: [
      {
        id: 'bi-pat-1',
        materialId: 'mat-1',
        materialName: 'Prime Chicken Breast Boneless Mince',
        quantity: 320,
        unit: 'kg',
        costPerUnit: 240,
        wastePercentage: 1.5,
        totalCost: 77952,
        category: 'Proteins & Meats',
      },
      {
        id: 'bi-pat-2',
        materialId: 'mat-7',
        materialName: 'Japanese Panko Crispy Breadcrumbs',
        quantity: 80,
        unit: 'kg',
        costPerUnit: 140,
        wastePercentage: 2,
        totalCost: 11424,
        category: 'Bakery & Flour',
      },
      {
        id: 'bi-pat-3',
        materialId: 'mat-5',
        materialName: 'Akira Secret Momo Seasoning & Herb Emulsion',
        quantity: 12,
        unit: 'kg',
        costPerUnit: 350,
        wastePercentage: 1,
        totalCost: 4242,
        category: 'Spices & Seasonings',
      },
      {
        id: 'bi-pat-4',
        materialId: 'mat-8',
        materialName: 'Multi-Layer Barrier Vacuum Pouch (500g)',
        quantity: 1200,
        unit: 'pcs',
        costPerUnit: 6.5,
        wastePercentage: 1.5,
        totalCost: 7917,
        category: 'Packaging & Boxes',
      },
      {
        id: 'bi-pat-5',
        materialId: 'mat-9',
        materialName: 'Akira Fresh Branded Retail Paperboard Box',
        quantity: 1200,
        unit: 'pcs',
        costPerUnit: 12.0,
        wastePercentage: 1,
        totalCost: 14544,
        category: 'Packaging & Boxes',
      },
    ],
    laborItems: [
      {
        id: 'bli-pat-1',
        laborId: 'lab-1',
        laborName: 'Meat Deboning & Precision Mincing',
        hours: 12,
        hourlyRate: 220,
        totalCost: 2640,
        operationType: 'Prep',
      },
      {
        id: 'bli-pat-2',
        laborId: 'lab-2',
        laborName: 'Dumpling & Momos Folding Line',
        hours: 18,
        hourlyRate: 180,
        totalCost: 3240,
        operationType: 'Assembly',
      },
      {
        id: 'bli-pat-3',
        laborId: 'lab-4',
        laborName: 'Blast Freezing (-40°C IQF Tunnel Operation)',
        hours: 8,
        hourlyRate: 320,
        totalCost: 2560,
        operationType: 'Freezing',
      },
      {
        id: 'bli-pat-4',
        laborId: 'lab-5',
        laborName: 'Nitrogen Flush Vacuum Packing & Quality Check',
        hours: 12,
        hourlyRate: 190,
        totalCost: 2280,
        operationType: 'Packaging',
      },
    ],
    totalMaterialCost: 116079.0,
    totalLaborCost: 10720.0,
    totalOverhead: 9509.93,
    totalProfit: 35440.32,
    grandTotal: 171749.25,
    costPerUnit: 113.59,
    suggestedSellingPrice: 143.12,
    createdAt: new Date('2026-02-12'),
    updatedAt: new Date('2026-02-26'),
  },
  {
    id: 'bom-akira-3',
    name: 'Akira Cold-Chain Home Delivery Kit (Batch: 500 Shipper Kits)',
    description: 'Thermal cold-chain shipping insulated box with -15°C phase change refrigerant sheets for 48-hour doorstep freshness.',
    projectCode: 'AF-LOG-003',
    category: 'Cold Chain & Logistics',
    imageUrl: AKIRA_PRODUCT_IMAGES[7].url,
    batchQuantity: 500,
    batchUnit: 'shippers',
    storageCondition: 'Ambient',
    version: '1.2',
    status: 'active',
    overheadPercentage: 6.0,
    profitMargin: 20.0,
    items: [
      {
        id: 'bi-12',
        materialId: 'mat-11',
        materialName: 'Expanded Polystyrene (EPS) Thermal Shipper Box',
        quantity: 500,
        unit: 'pcs',
        costPerUnit: 65.0,
        wastePercentage: 1,
        totalCost: 32825,
        category: 'Cold Chain & Logistics',
      },
      {
        id: 'bi-13',
        materialId: 'mat-10',
        materialName: 'Cold-Chain Phase-Change Gel Ice Sheet (-15°C)',
        quantity: 1000,
        unit: 'pcs',
        costPerUnit: 18.5,
        wastePercentage: 0.5,
        totalCost: 18592.5,
        category: 'Cold Chain & Logistics',
      },
    ],
    laborItems: [
      {
        id: 'bli-9',
        laborId: 'lab-6',
        laborName: 'Cold-Chain Shipping Assembly & Gel Packing',
        hours: 12,
        hourlyRate: 160,
        totalCost: 1920,
        operationType: 'Logistics',
      },
    ],
    totalMaterialCost: 51417.5,
    totalLaborCost: 1920.0,
    totalOverhead: 3200.25,
    totalProfit: 11307.55,
    grandTotal: 67845.3,
    costPerUnit: 113.08,
    suggestedSellingPrice: 135.69,
    createdAt: new Date('2026-02-10'),
    updatedAt: new Date('2026-02-22'),
  }
];

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return defaultValue;
    const parsed = JSON.parse(saved, (k, v) => {
      if (k === 'createdAt' || k === 'updatedAt') return new Date(v);
      return v;
    });

    // Decorate loaded BOMs or materials if image is missing
    if (Array.isArray(parsed)) {
      return parsed.map((item: any) => {
        if (!item.imageUrl) {
          if ('grandTotal' in item || 'items' in item) {
            item.imageUrl = getProductImage(item);
          } else if ('costPerUnit' in item && 'inStock' in item) {
            item.imageUrl = getMaterialImage(item);
          }
        }
        return item;
      }) as unknown as T;
    }

    return parsed;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to local storage', e);
  }
};

const useBOMStore = create<BOMStore>()((set, get) => ({
  // Initial state with persistence fallback
  boms: loadFromStorage('akira_boms', INITIAL_BOMS),
  materials: loadFromStorage('akira_materials', INITIAL_MATERIALS),
  laborCosts: loadFromStorage('akira_labor', INITIAL_LABOR),
  currentBOM: null,
  currency: localStorage.getItem('akira_currency') || 'INR',
  
  setCurrency: (currency: string) => {
    localStorage.setItem('akira_currency', currency);
    set({ currency });
  },

  // BOM Actions
  addBOM: (bom) => {
    set((state) => {
      const nextBOMs = [bom, ...state.boms];
      saveToStorage('akira_boms', nextBOMs);
      return { boms: nextBOMs };
    });
  },
  
  updateBOM: (id, updatedBOM) => {
    set((state) => {
      const nextBOMs = state.boms.map((bom) =>
        bom.id === id ? { ...bom, ...updatedBOM, updatedAt: new Date() } : bom
      );
      saveToStorage('akira_boms', nextBOMs);
      return {
        boms: nextBOMs,
        currentBOM: state.currentBOM?.id === id
          ? { ...state.currentBOM, ...updatedBOM, updatedAt: new Date() }
          : state.currentBOM,
      };
    });
  },
  
  deleteBOM: (id) => {
    set((state) => {
      const nextBOMs = state.boms.filter((bom) => bom.id !== id);
      saveToStorage('akira_boms', nextBOMs);
      return {
        boms: nextBOMs,
        currentBOM: state.currentBOM?.id === id ? null : state.currentBOM,
      };
    });
  },
  
  setCurrentBOM: (bom) => set({ currentBOM: bom }),
  
  duplicateBOM: (id) => {
    set((state) => {
      const bomToDuplicate = state.boms.find((b) => b.id === id);
      if (!bomToDuplicate) return state;
      
      const duplicatedBOM: BOM = {
        ...bomToDuplicate,
        id: `bom-${Date.now()}`,
        name: `${bomToDuplicate.name} (Copy)`,
        version: `${(parseFloat(bomToDuplicate.version || '1.0') + 0.1).toFixed(1)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'draft',
      };
      
      const nextBOMs = [duplicatedBOM, ...state.boms];
      saveToStorage('akira_boms', nextBOMs);
      return { boms: nextBOMs };
    });
  },

  resetToDefaults: () => {
    saveToStorage('akira_boms', INITIAL_BOMS);
    saveToStorage('akira_materials', INITIAL_MATERIALS);
    saveToStorage('akira_labor', INITIAL_LABOR);
    set({
      boms: INITIAL_BOMS,
      materials: INITIAL_MATERIALS,
      laborCosts: INITIAL_LABOR,
      currentBOM: null,
    });
  },
  
  // Material Actions
  addMaterial: (material) => {
    set((state) => {
      const next = [material, ...state.materials];
      saveToStorage('akira_materials', next);
      return { materials: next };
    });
  },
  
  updateMaterial: (id, updatedMaterial) => {
    set((state) => {
      const next = state.materials.map((material) =>
        material.id === id ? { ...material, ...updatedMaterial, updatedAt: new Date() } : material
      );
      saveToStorage('akira_materials', next);
      return { materials: next };
    });
  },
  
  deleteMaterial: (id) => {
    set((state) => {
      const next = state.materials.filter((material) => material.id !== id);
      saveToStorage('akira_materials', next);
      return { materials: next };
    });
  },
  
  // Labor Cost Actions
  addLaborCost: (laborCost) => {
    set((state) => {
      const next = [...state.laborCosts, laborCost];
      saveToStorage('akira_labor', next);
      return { laborCosts: next };
    });
  },
  
  updateLaborCost: (id, updatedLaborCost) => {
    set((state) => {
      const next = state.laborCosts.map((laborCost) =>
        laborCost.id === id ? { ...laborCost, ...updatedLaborCost } : laborCost
      );
      saveToStorage('akira_labor', next);
      return { laborCosts: next };
    });
  },
  
  deleteLaborCost: (id) => {
    set((state) => {
      const next = state.laborCosts.filter((laborCost) => laborCost.id !== id);
      saveToStorage('akira_labor', next);
      return { laborCosts: next };
    });
  },
  
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
    
    const totalOverhead = (totalMaterialCost + totalLaborCost) * ((formData.overheadPercentage || 0) / 100);
    const subtotal = totalMaterialCost + totalLaborCost + totalOverhead;
    const totalProfit = subtotal * ((formData.profitMargin || 0) / 100);
    const grandTotal = subtotal + totalProfit;
    
    const batchQty = formData.batchQuantity && formData.batchQuantity > 0 ? formData.batchQuantity : 1;
    const costPerUnit = subtotal / batchQty;
    const suggestedSellingPrice = grandTotal / batchQty;
    
    return {
      totalMaterialCost,
      totalLaborCost,
      totalOverhead,
      totalProfit,
      grandTotal,
      costPerUnit,
      suggestedSellingPrice,
    };
  },
}));

export default useBOMStore;
