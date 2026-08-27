import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BOM, ExportOptions, Material } from '../types';
import { formatCurrency } from './utils';

// Helper to escape CSV values
const escapeCSV = (val: any): string => {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
};

// Helper to trigger browser download for CSV / Text
const downloadBlob = (content: string, filename: string, mimeType: string = 'text/csv;charset=utf-8;') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export a single Bill of Materials (BOM) to CSV format
 */
export const exportToCSV = (bom: BOM, options?: Partial<ExportOptions>) => {
  const curr = options?.currency || 'INR';
  const lines: string[] = [];

  // Header Banner
  lines.push(['AKIRA FRESH - BILL OF MATERIALS & COST SPECIFICATION'].map(escapeCSV).join(','));
  lines.push(['Generated On', new Date().toLocaleString()].map(escapeCSV).join(','));
  lines.push('');

  // BOM Specification Metadata
  lines.push(['RECIPE & BATCH SPECIFICATIONS'].map(escapeCSV).join(','));
  lines.push(['BOM Name', bom.name].map(escapeCSV).join(','));
  lines.push(['Project Code', bom.projectCode || 'N/A'].map(escapeCSV).join(','));
  lines.push(['Category', bom.category || 'General'].map(escapeCSV).join(','));
  lines.push(['Version', `v${bom.version}`].map(escapeCSV).join(','));
  lines.push(['Status', bom.status.toUpperCase()].map(escapeCSV).join(','));
  lines.push(['Batch Size', `${bom.batchQuantity || 1} ${bom.batchUnit || 'units'}`].map(escapeCSV).join(','));
  lines.push(['Storage Condition', bom.storageCondition || 'Ambient'].map(escapeCSV).join(','));
  lines.push(['Created Date', new Date(bom.createdAt).toLocaleDateString()].map(escapeCSV).join(','));
  if (bom.description) {
    lines.push(['Description', bom.description].map(escapeCSV).join(','));
  }
  lines.push('');

  // Cost & Margin Economics
  lines.push(['FINANCIAL & UNIT ECONOMICS SUMMARY'].map(escapeCSV).join(','));
  lines.push(['Metric', 'Amount', 'Currency'].map(escapeCSV).join(','));
  lines.push(['Total Material Cost (Raw Meats & Ingredients)', bom.totalMaterialCost.toFixed(2), curr].map(escapeCSV).join(','));
  lines.push(['Total Labor & Processing Cost', bom.totalLaborCost.toFixed(2), curr].map(escapeCSV).join(','));
  lines.push(['Prime Cost (Materials + Labor)', (bom.totalMaterialCost + bom.totalLaborCost).toFixed(2), curr].map(escapeCSV).join(','));
  lines.push([`Overhead Absorption (${bom.overheadPercentage || 0}%)`, bom.totalOverhead.toFixed(2), curr].map(escapeCSV).join(','));
  lines.push([`Target Profit Margin (${bom.profitMargin || 0}%)`, bom.totalProfit.toFixed(2), curr].map(escapeCSV).join(','));
  lines.push(['Grand Total Batch Cost', bom.grandTotal.toFixed(2), curr].map(escapeCSV).join(','));
  lines.push(['Cost Per Unit', (bom.costPerUnit || (bom.grandTotal / (bom.batchQuantity || 1))).toFixed(2), curr].map(escapeCSV).join(','));
  lines.push(['Suggested Selling Price', (bom.suggestedSellingPrice || ((bom.costPerUnit || (bom.grandTotal / (bom.batchQuantity || 1))) * 1.35)).toFixed(2), curr].map(escapeCSV).join(','));
  lines.push('');

  // Ingredients & Raw Materials Breakdown
  if (bom.items && bom.items.length > 0) {
    lines.push(['RAW MATERIALS & INGREDIENTS BREAKDOWN'].map(escapeCSV).join(','));
    lines.push(['#', 'Material Name', 'Category', 'Quantity', 'Unit', `Cost / Unit (${curr})`, 'Waste %', `Effective Total Cost (${curr})`].map(escapeCSV).join(','));
    
    bom.items.forEach((item, idx) => {
      lines.push([
        idx + 1,
        item.materialName,
        item.category || 'Raw Ingredient',
        item.quantity,
        item.unit,
        item.costPerUnit.toFixed(2),
        `${item.wastePercentage || 0}%`,
        item.totalCost.toFixed(2)
      ].map(escapeCSV).join(','));
    });

    lines.push(['', '', '', '', '', 'Total Material Cost:', '', bom.totalMaterialCost.toFixed(2)].map(escapeCSV).join(','));
    lines.push('');
  }

  // Labor & Operations Breakdown
  if (bom.laborItems && bom.laborItems.length > 0) {
    lines.push(['LABOR & PROCESSING OPERATIONS'].map(escapeCSV).join(','));
    lines.push(['#', 'Operation / Labor Role', 'Operation Type', 'Hours', `Hourly Rate (${curr})`, `Total Labor Cost (${curr})`].map(escapeCSV).join(','));
    
    bom.laborItems.forEach((item, idx) => {
      lines.push([
        idx + 1,
        item.laborName,
        item.operationType || 'Production',
        item.hours,
        item.hourlyRate.toFixed(2),
        item.totalCost.toFixed(2)
      ].map(escapeCSV).join(','));
    });

    lines.push(['', '', '', '', 'Total Labor Cost:', bom.totalLaborCost.toFixed(2)].map(escapeCSV).join(','));
    lines.push('');
  }

  // Cold Chain & Compliance Notes
  lines.push(['COMPLIANCE & COLD CHAIN NOTES'].map(escapeCSV).join(','));
  lines.push(['Cold-Chain Storage', bom.storageCondition || 'Maintain optimal cold-chain logistics'].map(escapeCSV).join(','));
  lines.push(['Confidentiality', 'Akira Fresh Proprietary Recipe Specification'].map(escapeCSV).join(','));

  const csvContent = lines.join('\r\n');
  const filename = `${bom.name.replace(/[^a-z0-9]/gi, '_')}_BOM_${new Date().toISOString().split('T')[0]}.csv`;
  downloadBlob(csvContent, filename);
};

/**
 * Export all BOMs in registry to a CSV summary table
 */
export const exportAllBOMsToCSV = (boms: BOM[], currency: string = 'INR') => {
  const lines: string[] = [];

  lines.push(['AKIRA FRESH - ALL BILL OF MATERIALS REGISTRY SUMMARY'].map(escapeCSV).join(','));
  lines.push(['Exported On', new Date().toLocaleString()].map(escapeCSV).join(','));
  lines.push(['Total BOM Count', boms.length].map(escapeCSV).join(','));
  lines.push('');

  lines.push([
    'Project Code',
    'BOM Name',
    'Category',
    'Version',
    'Status',
    'Batch Quantity',
    'Batch Unit',
    'Storage Condition',
    `Material Cost (${currency})`,
    `Labor Cost (${currency})`,
    `Overhead Cost (${currency})`,
    `Profit Amount (${currency})`,
    `Grand Total (${currency})`,
    `Cost Per Unit (${currency})`,
    `Selling Price (${currency})`,
    'Created Date'
  ].map(escapeCSV).join(','));

  boms.forEach(bom => {
    const costPerUnit = bom.costPerUnit || (bom.grandTotal / (bom.batchQuantity || 1));
    const sellingPrice = bom.suggestedSellingPrice || (costPerUnit * (1 + (bom.profitMargin || 25) / 100));

    lines.push([
      bom.projectCode || 'N/A',
      bom.name,
      bom.category || 'General',
      `v${bom.version}`,
      bom.status.toUpperCase(),
      bom.batchQuantity || 1,
      bom.batchUnit || 'units',
      bom.storageCondition || 'Ambient',
      bom.totalMaterialCost.toFixed(2),
      bom.totalLaborCost.toFixed(2),
      bom.totalOverhead.toFixed(2),
      bom.totalProfit.toFixed(2),
      bom.grandTotal.toFixed(2),
      costPerUnit.toFixed(2),
      sellingPrice.toFixed(2),
      new Date(bom.createdAt).toLocaleDateString()
    ].map(escapeCSV).join(','));
  });

  const totalValue = boms.reduce((sum, b) => sum + b.grandTotal, 0);
  lines.push('');
  lines.push(['', '', '', '', '', '', '', 'PORTFOLIO TOTAL:', '', '', '', '', totalValue.toFixed(2), '', '', ''].map(escapeCSV).join(','));

  const csvContent = lines.join('\r\n');
  const filename = `AkiraFresh_All_BOMs_${new Date().toISOString().split('T')[0]}.csv`;
  downloadBlob(csvContent, filename);
};

/**
 * Export Material Inventory to CSV
 */
export const exportMaterialsToCSV = (materials: Material[], currency: string = 'INR') => {
  const lines: string[] = [];

  lines.push(['AKIRA FRESH - RAW MATERIALS & INGREDIENT INVENTORY'].map(escapeCSV).join(','));
  lines.push(['Exported On', new Date().toLocaleString()].map(escapeCSV).join(','));
  lines.push(['Total Items', materials.length].map(escapeCSV).join(','));
  lines.push('');

  lines.push([
    'Material Name',
    'Category',
    'Unit',
    `Cost Per Unit (${currency})`,
    'In Stock',
    'Reorder Level',
    'Stock Status',
    `Inventory Value (${currency})`,
    'Storage Condition',
    'Supplier',
    'Description'
  ].map(escapeCSV).join(','));

  materials.forEach(m => {
    const isLow = (m.inStock || 0) <= (m.reorderLevel || 0);
    const stockVal = m.costPerUnit * (m.inStock || 0);

    lines.push([
      m.name,
      m.category,
      m.unit,
      m.costPerUnit.toFixed(2),
      m.inStock || 0,
      m.reorderLevel || 0,
      isLow ? 'LOW STOCK' : 'ADEQUATE',
      stockVal.toFixed(2),
      m.storageCondition || 'Ambient',
      m.supplier || 'N/A',
      m.description || ''
    ].map(escapeCSV).join(','));
  });

  const totalInvValue = materials.reduce((s, m) => s + (m.costPerUnit * (m.inStock || 0)), 0);
  lines.push('');
  lines.push(['', '', '', '', '', '', 'TOTAL INVENTORY VALUE:', totalInvValue.toFixed(2), '', '', ''].map(escapeCSV).join(','));

  const csvContent = lines.join('\r\n');
  const filename = `AkiraFresh_Inventory_${new Date().toISOString().split('T')[0]}.csv`;
  downloadBlob(csvContent, filename);
};

/**
 * Export a single BOM to a polished, professional PDF report
 */
export const exportToPDF = (bom: BOM, options?: Partial<ExportOptions>) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const curr = options?.currency || 'INR';
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = 14;

  // Header Background Banner (Brand Emerald/Forest Green)
  doc.setFillColor(6, 78, 59); // #064e3b
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Accent gold line
  doc.setFillColor(234, 179, 8); // #eab308
  doc.rect(0, 27.5, pageWidth, 1.5, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('AKIRA FRESH', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(209, 250, 229);
  doc.text('READY-TO-COOK & GOURMET MEATS | BILL OF MATERIALS SPECIFICATION', margin, 18);

  // Status & Date on top-right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`DOC REF: ${bom.projectCode || 'AF-BOM'}`, pageWidth - margin, 12, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(209, 250, 229);
  doc.text(`Date: ${new Date().toLocaleDateString()} | v${bom.version}`, pageWidth - margin, 18, { align: 'right' });

  currentY = 36;

  // Recipe Specification Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(bom.name, margin, currentY);

  currentY += 5;
  if (bom.description) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    const splitDesc = doc.splitTextToSize(bom.description, pageWidth - (margin * 2));
    doc.text(splitDesc, margin, currentY);
    currentY += (splitDesc.length * 4.2) + 2;
  }

  // Key Metadata Grid (Box)
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 20, 2, 2, 'FD');

  const colW = (pageWidth - (margin * 2)) / 4;

  // Col 1: Category
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('CATEGORY', margin + 4, currentY + 6);
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(bom.category || 'Ready-to-Cook', margin + 4, currentY + 14);

  // Col 2: Batch Size
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('BATCH QUANTITY', margin + colW + 4, currentY + 6);
  doc.setFontSize(9);
  doc.setTextColor(5, 150, 105);
  doc.setFont('helvetica', 'bold');
  doc.text(`${bom.batchQuantity || 1} ${bom.batchUnit || 'units'}`, margin + colW + 4, currentY + 14);

  // Col 3: Storage
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('STORAGE CONDITION', margin + (colW * 2) + 4, currentY + 6);
  doc.setFontSize(9);
  doc.setTextColor(2, 132, 199);
  doc.text(bom.storageCondition || 'Chilled (2-4°C)', margin + (colW * 2) + 4, currentY + 14);

  // Col 4: Status
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('STATUS', margin + (colW * 3) + 4, currentY + 6);
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(bom.status.toUpperCase(), margin + (colW * 3) + 4, currentY + 14);

  currentY += 26;

  // KPI Highlight Banner
  const kpiW = (pageWidth - (margin * 2) - 6) / 3;
  
  // KPI 1: Grand Total
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(167, 243, 208); // emerald-200
  doc.roundedRect(margin, currentY, kpiW, 16, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 95, 70);
  doc.text('BATCH TOTAL COST', margin + 4, currentY + 5.5);
  doc.setFontSize(11);
  doc.text(formatCurrency(bom.grandTotal, curr), margin + 4, currentY + 12);

  // KPI 2: Unit Cost
  doc.setFillColor(240, 249, 255); // sky-50
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(margin + kpiW + 3, currentY, kpiW, 16, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setTextColor(3, 105, 161);
  doc.text('COST PER UNIT', margin + kpiW + 7, currentY + 5.5);
  doc.setFontSize(11);
  const costPerUnit = bom.costPerUnit || (bom.grandTotal / (bom.batchQuantity || 1));
  doc.text(formatCurrency(costPerUnit, curr), margin + kpiW + 7, currentY + 12);

  // KPI 3: Target Margin / Selling Price
  doc.setFillColor(254, 252, 232); // yellow-50
  doc.setDrawColor(254, 240, 138);
  doc.roundedRect(margin + (kpiW * 2) + 6, currentY, kpiW, 16, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setTextColor(133, 77, 14);
  doc.text(`SELLING PRICE (${bom.profitMargin || 0}% MARGIN)`, margin + (kpiW * 2) + 10, currentY + 5.5);
  doc.setFontSize(11);
  const sellingPrice = bom.suggestedSellingPrice || (costPerUnit * (1 + (bom.profitMargin || 25) / 100));
  doc.text(formatCurrency(sellingPrice, curr), margin + (kpiW * 2) + 10, currentY + 12);

  currentY += 22;

  // Table 1: Raw Materials & Ingredients
  if (bom.items && bom.items.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('1. Raw Materials & Formulation Ingredients', margin, currentY);
    currentY += 2;

    const tableRows = bom.items.map((item, idx) => [
      (idx + 1).toString(),
      item.materialName,
      item.category || 'Ingredient',
      `${item.quantity} ${item.unit}`,
      formatCurrency(item.costPerUnit, curr),
      `${item.wastePercentage || 0}%`,
      formatCurrency(item.totalCost, curr)
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['#', 'Material Name', 'Category', 'Quantity', 'Cost / Unit', 'Waste', 'Total Cost']],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [6, 78, 59],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'left'
      },
      styles: {
        fontSize: 7.5,
        textColor: [51, 65, 85],
        cellPadding: 2.2,
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 'auto', fontStyle: 'bold' },
        2: { cellWidth: 28 },
        3: { cellWidth: 22, halign: 'right' },
        4: { cellWidth: 24, halign: 'right' },
        5: { cellWidth: 16, halign: 'center' },
        6: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
      },
      foot: [['', 'Total Material Cost', '', '', '', '', formatCurrency(bom.totalMaterialCost, curr)]],
      footStyles: {
        fillColor: [241, 245, 249],
        textColor: [6, 95, 70],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'right'
      },
      margin: { left: margin, right: margin },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // Table 2: Labor Costs (Check page break)
  if (bom.laborItems && bom.laborItems.length > 0) {
    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('2. Processing & Cold-Chain Labor Operations', margin, currentY);
    currentY += 2;

    const laborRows = bom.laborItems.map((item, idx) => [
      (idx + 1).toString(),
      item.laborName,
      item.operationType || 'Preparation',
      `${item.hours} hrs`,
      formatCurrency(item.hourlyRate, curr),
      formatCurrency(item.totalCost, curr)
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['#', 'Operation / Role', 'Operation Stage', 'Hours Allocated', 'Hourly Rate', 'Total Labor Cost']],
      body: laborRows,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 118, 110], // teal-700
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'left'
      },
      styles: {
        fontSize: 7.5,
        textColor: [51, 65, 85],
        cellPadding: 2.2,
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 'auto', fontStyle: 'bold' },
        2: { cellWidth: 32 },
        3: { cellWidth: 26, halign: 'right' },
        4: { cellWidth: 26, halign: 'right' },
        5: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
      },
      foot: [['', 'Total Labor Cost', '', '', '', formatCurrency(bom.totalLaborCost, curr)]],
      footStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 118, 110],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'right'
      },
      margin: { left: margin, right: margin },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // Cost Waterfall & Economics Breakdown Box
  if (currentY > pageHeight - 55) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Cost Economics & Absorption Summary', margin, currentY);
  currentY += 4;

  const summaryRows = [
    ['Direct Material Cost', formatCurrency(bom.totalMaterialCost, curr)],
    ['Direct Processing Labor Cost', formatCurrency(bom.totalLaborCost, curr)],
    ['Prime Production Cost (Materials + Labor)', formatCurrency(bom.totalMaterialCost + bom.totalLaborCost, curr)],
    [`Overhead & Cold-Chain Logistics (${bom.overheadPercentage || 0}%)`, formatCurrency(bom.totalOverhead, curr)],
    [`Target Net Profit (${bom.profitMargin || 0}%)`, formatCurrency(bom.totalProfit, curr)],
    ['Grand Total Formulation Value', formatCurrency(bom.grandTotal, curr)],
    [`Calculated Unit Cost (per ${bom.batchUnit || 'unit'})`, formatCurrency(costPerUnit, curr)],
    ['Recommended Retail / Wholesale Price', formatCurrency(sellingPrice, curr)],
  ];

  autoTable(doc, {
    startY: currentY,
    body: summaryRows,
    theme: 'plain',
    styles: {
      fontSize: 8,
      textColor: [51, 65, 85],
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 'auto', fontStyle: 'bold' },
      1: { cellWidth: 40, halign: 'right', fontStyle: 'bold', textColor: [6, 95, 70] },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Add ISO / Cold-Chain Quality Disclaimer Box
  if (currentY <= pageHeight - 24) {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 14, 1.5, 1.5, 'F');
    doc.setFontSize(6.8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('QUALITY & COLD-CHAIN NOTICE: All ingredients must be received and stored strictly within the specified temperature range.', margin + 3, currentY + 4.5);
    doc.text('Recipe specifications and unit economics are proprietary to Akira Fresh. Ensure HACCP/FSSAI sanitary compliance during batch processing.', margin + 3, currentY + 9);
  }

  // Footer on all pages
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Akira Fresh BOM Engine - Confidential & Proprietary', margin, pageHeight - 6);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  }

  const filename = `${bom.name.replace(/[^a-z0-9]/gi, '_')}_BOM_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

/**
 * Export All BOMs to a clean multi-page Executive PDF Catalog
 */
export const exportAllBOMsToPDF = (boms: BOM[], currency: string = 'INR') => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Header Banner
  doc.setFillColor(6, 78, 59);
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setFillColor(234, 179, 8);
  doc.rect(0, 23.5, pageWidth, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('AKIRA FRESH - RECIPE PORTFOLIO & BILL OF MATERIALS MASTER REGISTRY', margin, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(209, 250, 229);
  doc.text(`Executive Summary Report | Generated: ${new Date().toLocaleDateString()} | Total Recipes: ${boms.length}`, margin, 17);

  const totalValue = boms.reduce((s, b) => s + b.grandTotal, 0);
  const totalMat = boms.reduce((s, b) => s + b.totalMaterialCost, 0);
  const totalLab = boms.reduce((s, b) => s + b.totalLaborCost, 0);

  const tableRows = boms.map((bom, idx) => {
    const unitCost = bom.costPerUnit || (bom.grandTotal / (bom.batchQuantity || 1));
    const sellPrice = bom.suggestedSellingPrice || (unitCost * (1 + (bom.profitMargin || 25) / 100));

    return [
      (idx + 1).toString(),
      bom.projectCode || 'N/A',
      bom.name,
      bom.category || 'General',
      `${bom.batchQuantity || 1} ${bom.batchUnit || 'units'}`,
      bom.storageCondition || 'Ambient',
      formatCurrency(bom.totalMaterialCost, currency),
      formatCurrency(bom.totalLaborCost, currency),
      formatCurrency(bom.grandTotal, currency),
      formatCurrency(unitCost, currency),
      formatCurrency(sellPrice, currency),
      bom.status.toUpperCase()
    ];
  });

  autoTable(doc, {
    startY: 30,
    head: [['#', 'SKU', 'Recipe / BOM Name', 'Category', 'Batch Size', 'Storage', 'Materials', 'Labor', 'Batch Total', 'Unit Cost', 'Sell Price', 'Status']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [6, 78, 59],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left'
    },
    styles: {
      fontSize: 7.5,
      textColor: [51, 65, 85],
      cellPadding: 2.2,
    },
    columnStyles: {
      0: { cellWidth: 7, halign: 'center' },
      1: { cellWidth: 18, fontStyle: 'bold' },
      2: { cellWidth: 'auto', fontStyle: 'bold' },
      3: { cellWidth: 26 },
      4: { cellWidth: 20 },
      5: { cellWidth: 24 },
      6: { cellWidth: 20, halign: 'right' },
      7: { cellWidth: 20, halign: 'right' },
      8: { cellWidth: 22, halign: 'right', fontStyle: 'bold', textColor: [6, 95, 70] },
      9: { cellWidth: 20, halign: 'right' },
      10: { cellWidth: 20, halign: 'right', fontStyle: 'bold' },
      11: { cellWidth: 16, halign: 'center' },
    },
    foot: [['', '', 'PORTFOLIO TOTALS', '', '', '', formatCurrency(totalMat, currency), formatCurrency(totalLab, currency), formatCurrency(totalValue, currency), '', '', '']],
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [6, 95, 70],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'right'
    },
    margin: { left: margin, right: margin },
  });

  // Footer on all pages
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 8, pageWidth - margin, pageHeight - 8);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Akira Fresh BOM Executive Catalog - Confidential', margin, pageHeight - 4);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 4, { align: 'right' });
  }

  doc.save(`AkiraFresh_All_BOMs_Master_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Legacy Excel Export (kept for full backward compatibility)
 */
export const exportToExcel = (bom: BOM, options: ExportOptions) => {
  const workbook = XLSX.utils.book_new();
  const curr = options.currency || 'INR';
  
  const data: (string | number)[][] = [
    ['AKIRA FRESH - BILL OF MATERIALS'],
    ['Name', bom.name],
    ['Description', bom.description || ''],
    ['Project Code', bom.projectCode || ''],
    ['Category', bom.category || ''],
    ['Batch Size', `${bom.batchQuantity || 1} ${bom.batchUnit || 'units'}`],
    ['Storage Condition', bom.storageCondition || ''],
    ['Version', bom.version],
    ['Status', bom.status],
    ['Created', new Date(bom.createdAt).toLocaleDateString()],
    [],
    ['Cost Summary'],
    ['Total Material Cost', formatCurrency(bom.totalMaterialCost, curr)],
    ['Total Labor Cost', formatCurrency(bom.totalLaborCost, curr)],
    ['Overhead', formatCurrency(bom.totalOverhead, curr)],
    ['Profit Margin', formatCurrency(bom.totalProfit, curr)],
    ['Grand Total', formatCurrency(bom.grandTotal, curr)],
    ['Cost Per Unit', formatCurrency(bom.costPerUnit || (bom.grandTotal / (bom.batchQuantity || 1)), curr)],
    ['Suggested Selling Price', formatCurrency(bom.suggestedSellingPrice || ((bom.costPerUnit || (bom.grandTotal / (bom.batchQuantity || 1))) * 1.35), curr)],
    [],
  ];

  if (options.includeCosts && bom.items) {
    data.push(['Materials & Ingredients']);
    data.push(['Material Name', 'Category', 'Quantity', 'Unit', 'Cost per Unit', 'Waste %', 'Total Cost']);
    bom.items.forEach(item => {
      data.push([
        item.materialName,
        item.category || '',
        item.quantity,
        item.unit,
        formatCurrency(item.costPerUnit, curr),
        `${item.wastePercentage || 0}%`,
        formatCurrency(item.totalCost, curr),
      ]);
    });
    data.push([]);
  }

  if (options.includeLabor && bom.laborItems) {
    data.push(['Labor & Operations']);
    data.push(['Labor Type', 'Operation Type', 'Hours', 'Hourly Rate', 'Total Cost']);
    bom.laborItems.forEach(item => {
      data.push([
        item.laborName,
        item.operationType || '',
        item.hours,
        formatCurrency(item.hourlyRate, curr),
        formatCurrency(item.totalCost, curr),
      ]);
    });
  }

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'BOM');
  XLSX.writeFile(workbook, `${bom.name.replace(/[^a-z0-9]/gi, '_')}_BOM.xlsx`);
};

export const exportAllBOMsToExcel = (boms: BOM[], currency: string = 'INR') => {
  const workbook = XLSX.utils.book_new();
  
  const data: (string | number)[][] = [
    ['BOM Name', 'Project Code', 'Category', 'Batch Qty', 'Batch Unit', 'Storage', 'Version', 'Status', 'Material Cost', 'Labor Cost', 'Overhead', 'Profit', 'Grand Total', 'Cost Per Unit', 'Selling Price', 'Created Date'],
    ...boms.map(bom => [
      bom.name,
      bom.projectCode || '',
      bom.category || '',
      bom.batchQuantity || 1,
      bom.batchUnit || 'units',
      bom.storageCondition || '',
      bom.version,
      bom.status,
      bom.totalMaterialCost,
      bom.totalLaborCost,
      bom.totalOverhead,
      bom.totalProfit,
      bom.grandTotal,
      bom.costPerUnit || (bom.grandTotal / (bom.batchQuantity || 1)),
      bom.suggestedSellingPrice || ((bom.costPerUnit || (bom.grandTotal / (bom.batchQuantity || 1))) * 1.35),
      new Date(bom.createdAt).toLocaleDateString(),
    ]),
  ];
  
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'All BOMs');
  XLSX.writeFile(workbook, 'AkiraFresh_All_BOMs.xlsx');
};
