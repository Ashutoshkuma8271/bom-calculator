import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { BOM, ExportOptions } from '../types';
import { formatCurrency } from './utils';

export const exportToExcel = (bom: BOM, options: ExportOptions) => {
  const workbook = XLSX.utils.book_new();
  
  // Create data for export
  const data = [
    ['BOM Details'],
    ['Name', bom.name],
    ['Description', bom.description || ''],
    ['Project Code', bom.projectCode || ''],
    ['Version', bom.version],
    ['Status', bom.status],
    ['Created', new Date(bom.createdAt).toLocaleDateString()],
    [],
    ['Cost Summary'],
    ['Total Material Cost', formatCurrency(bom.totalMaterialCost)],
    ['Total Labor Cost', formatCurrency(bom.totalLaborCost)],
    ['Overhead', formatCurrency(bom.totalOverhead)],
    ['Profit Margin', formatCurrency(bom.totalProfit)],
    ['Grand Total', formatCurrency(bom.grandTotal)],
    [],
  ];

  if (options.includeCosts) {
    data.push(['Materials']);
    data.push(['Material Name', 'Quantity', 'Unit', 'Cost per Unit', 'Waste %', 'Total Cost']);
    bom.items.forEach(item => {
      data.push([
        item.materialName,
        item.quantity,
        item.unit,
        formatCurrency(item.costPerUnit),
        `${item.wastePercentage || 0}%`,
        formatCurrency(item.totalCost),
      ]);
    });
    data.push([]);
  }

  if (options.includeLabor) {
    data.push(['Labor Costs']);
    data.push(['Labor Type', 'Hours', 'Hourly Rate', 'Total Cost']);
    bom.laborItems.forEach(item => {
      data.push([
        item.laborName,
        item.hours,
        formatCurrency(item.hourlyRate),
        formatCurrency(item.totalCost),
      ]);
    });
  }

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'BOM');
  
  XLSX.writeFile(workbook, `${bom.name.replace(/[^a-z0-9]/gi, '_')}_BOM.xlsx`);
};

export const exportToPDF = (bom: BOM, options: ExportOptions) => {
  const doc = new jsPDF();
  
  let yPosition = 20;
  
  // Title
  doc.setFontSize(20);
  doc.text('Bill of Materials', 105, yPosition, { align: 'center' });
  yPosition += 15;
  
  // BOM Details
  doc.setFontSize(12);
  doc.text(`Name: ${bom.name}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Project Code: ${bom.projectCode || 'N/A'}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Version: ${bom.version}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Status: ${bom.status}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Created: ${new Date(bom.createdAt).toLocaleDateString()}`, 20, yPosition);
  yPosition += 15;
  
  // Cost Summary
  doc.setFontSize(14);
  doc.text('Cost Summary', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.text(`Total Material Cost: ${formatCurrency(bom.totalMaterialCost)}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Total Labor Cost: ${formatCurrency(bom.totalLaborCost)}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Overhead: ${formatCurrency(bom.totalOverhead)}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Profit Margin: ${formatCurrency(bom.totalProfit)}`, 20, yPosition);
  yPosition += 8;
  
  doc.setFontSize(12);
  doc.text(`Grand Total: ${formatCurrency(bom.grandTotal)}`, 20, yPosition);
  yPosition += 15;
  
  if (options.includeCosts && bom.items.length > 0) {
    // Materials Table
    doc.setFontSize(14);
    doc.text('Materials', 20, yPosition);
    yPosition += 10;
    
    // Table header
    doc.setFontSize(9);
    doc.text('Material', 20, yPosition);
    doc.text('Qty', 70, yPosition);
    doc.text('Unit', 90, yPosition);
    doc.text('Cost/Unit', 110, yPosition);
    doc.text('Total', 150, yPosition);
    yPosition += 6;
    
    // Table rows
    bom.items.forEach(item => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(item.materialName.substring(0, 20), 20, yPosition);
      doc.text(item.quantity.toString(), 70, yPosition);
      doc.text(item.unit, 90, yPosition);
      doc.text(formatCurrency(item.costPerUnit), 110, yPosition);
      doc.text(formatCurrency(item.totalCost), 150, yPosition);
      yPosition += 6;
    });
    yPosition += 10;
  }
  
  if (options.includeLabor && bom.laborItems.length > 0) {
    // Labor Table
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Labor Costs', 20, yPosition);
    yPosition += 10;
    
    // Table header
    doc.setFontSize(9);
    doc.text('Labor Type', 20, yPosition);
    doc.text('Hours', 80, yPosition);
    doc.text('Rate', 100, yPosition);
    doc.text('Total', 140, yPosition);
    yPosition += 6;
    
    // Table rows
    bom.laborItems.forEach(item => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(item.laborName.substring(0, 25), 20, yPosition);
      doc.text(item.hours.toString(), 80, yPosition);
      doc.text(formatCurrency(item.hourlyRate), 100, yPosition);
      doc.text(formatCurrency(item.totalCost), 140, yPosition);
      yPosition += 6;
    });
  }
  
  doc.save(`${bom.name.replace(/[^a-z0-9]/gi, '_')}_BOM.pdf`);
};

export const exportAllBOMsToExcel = (boms: BOM[]) => {
  const workbook = XLSX.utils.book_new();
  
  const data = [
    ['BOM Name', 'Project Code', 'Version', 'Status', 'Total Material Cost', 'Total Labor Cost', 'Grand Total', 'Created Date'],
    ...boms.map(bom => [
      bom.name,
      bom.projectCode || '',
      bom.version,
      bom.status,
      bom.totalMaterialCost,
      bom.totalLaborCost,
      bom.grandTotal,
      new Date(bom.createdAt).toLocaleDateString(),
    ]),
  ];
  
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'All BOMs');
  
  XLSX.writeFile(workbook, 'All_BOMs.xlsx');
};