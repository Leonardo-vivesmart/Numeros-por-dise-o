import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { AppState } from '../types';
import { calculateAnnualTotal, formatCurrency, formatPercent, MONTHS, calculateYoYGrowth } from '../utils';

export function exportToPDF(state: AppState) {
  const { companyInfo, years, salesData, goals } = state;
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(24, 24, 27); // zinc-900
  doc.text('Reporte de Ventas', 14, 22);
  
  doc.setFontSize(12);
  doc.setTextColor(113, 113, 122); // zinc-500
  doc.text(`Empresa: ${companyInfo.name || 'Sin nombre'}`, 14, 32);
  doc.text(`Moneda: ${companyInfo.currency}`, 14, 38);
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 44);

  // Metas
  doc.setFontSize(16);
  doc.setTextColor(24, 24, 27);
  doc.text('Metas Anuales', 14, 56);
  
  autoTable(doc, {
    startY: 62,
    head: [['PyF (Mínimo)', 'MPyF (Recomendado)', 'SPyF (Ambicioso)']],
    body: [[
      formatCurrency(goals.pyf, companyInfo.currency),
      formatCurrency(goals.mpyf, companyInfo.currency),
      formatCurrency(goals.spyf, companyInfo.currency)
    ]],
    theme: 'grid',
    headStyles: { fillColor: [24, 24, 27] },
  });

  // Ventas Mensuales
  doc.text('Registro de Ventas Mensuales', 14, (doc as any).lastAutoTable.finalY + 15);
  
  const tableHead = [
    'Mes', 
    ...years.map(y => y.toString()), 
    years.length > 1 ? `Vs. ${years[years.length - 2]} ($)` : 'Vs. Año Anterior ($)', 
    years.length > 1 ? `Vs. ${years[years.length - 2]} (%)` : 'Vs. Año Anterior (%)'
  ];
  const tableBody = MONTHS.map((month, index) => {
    const row = [month];
    years.forEach(year => {
      const val = salesData[year]?.[index];
      row.push(val !== null ? formatCurrency(val, companyInfo.currency) : '-');
    });
    
    // YoY Growth & Diff
    if (years.length >= 2) {
      const currentYear = years[years.length - 1];
      const prevYear = years[years.length - 2];
      const currentVal = salesData[currentYear]?.[index];
      const prevVal = salesData[prevYear]?.[index];
      
      if (currentVal !== null && currentVal !== undefined && prevVal !== null && prevVal !== undefined) {
        const diff = currentVal - prevVal;
        row.push(formatCurrency(diff, companyInfo.currency));
      } else {
        row.push('-');
      }
      
      const growth = calculateYoYGrowth(currentVal, prevVal);
      row.push(growth !== null ? formatPercent(growth) : '-');
    } else {
      row.push('-');
      row.push('-');
    }
    
    return row;
  });

  // Totales
  const totalsRow = ['TOTAL ANUAL'];
  years.forEach(year => {
    totalsRow.push(formatCurrency(calculateAnnualTotal(salesData[year]), companyInfo.currency));
  });
  
  if (years.length >= 2) {
    const currentTotal = calculateAnnualTotal(salesData[years[years.length - 1]]);
    const prevTotal = calculateAnnualTotal(salesData[years[years.length - 2]]);
    
    const diff = currentTotal - prevTotal;
    totalsRow.push(formatCurrency(diff, companyInfo.currency));
    
    const growth = calculateYoYGrowth(currentTotal, prevTotal);
    totalsRow.push(growth !== null ? formatPercent(growth) : '-');
  } else {
    totalsRow.push('-');
    totalsRow.push('-');
  }
  
  tableBody.push(totalsRow);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [tableHead],
    body: tableBody,
    theme: 'striped',
    headStyles: { fillColor: [24, 24, 27] },
    footStyles: { fillColor: [244, 244, 245], textColor: [24, 24, 27], fontStyle: 'bold' },
    didParseCell: function(data) {
      if (data.row.index === tableBody.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [244, 244, 245];
      }
    }
  });

  doc.save(`Reporte_Ventas_${companyInfo.name || 'Empresa'}_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportToExcel(state: AppState) {
  const { companyInfo, years, salesData, goals } = state;
  const wb = XLSX.utils.book_new();

  // Hoja 1: Ventas
  const salesSheetData = [];
  salesSheetData.push([`Reporte de Ventas - ${companyInfo.name || 'Sin nombre'}`]);
  salesSheetData.push([`Moneda: ${companyInfo.currency}`]);
  salesSheetData.push([]);
  
  const headerRow = [
    'Mes', 
    ...years.map(y => y.toString()), 
    years.length > 1 ? `Vs. ${years[years.length - 2]} ($)` : 'Vs. Año Anterior ($)', 
    years.length > 1 ? `Vs. ${years[years.length - 2]} (%)` : 'Vs. Año Anterior (%)'
  ];
  salesSheetData.push(headerRow);

  MONTHS.forEach((month, index) => {
    const row: any[] = [month];
    years.forEach(year => {
      row.push(salesData[year]?.[index] || 0);
    });
    
    if (years.length >= 2) {
      const currentYear = years[years.length - 1];
      const prevYear = years[years.length - 2];
      const currentVal = salesData[currentYear]?.[index];
      const prevVal = salesData[prevYear]?.[index];
      
      if (currentVal !== null && currentVal !== undefined && prevVal !== null && prevVal !== undefined) {
        row.push(currentVal - prevVal);
      } else {
        row.push('');
      }
      
      const growth = calculateYoYGrowth(currentVal, prevVal);
      row.push(growth !== null ? growth : '');
    } else {
      row.push('');
      row.push('');
    }
    salesSheetData.push(row);
  });

  const totalsRow: any[] = ['TOTAL ANUAL'];
  years.forEach(year => {
    totalsRow.push(calculateAnnualTotal(salesData[year]));
  });
  
  if (years.length >= 2) {
    const currentTotal = calculateAnnualTotal(salesData[years[years.length - 1]]);
    const prevTotal = calculateAnnualTotal(salesData[years[years.length - 2]]);
    
    totalsRow.push(currentTotal - prevTotal);
    
    const growth = calculateYoYGrowth(currentTotal, prevTotal);
    totalsRow.push(growth !== null ? growth : '');
  } else {
    totalsRow.push('');
    totalsRow.push('');
  }
  salesSheetData.push(totalsRow);

  const wsSales = XLSX.utils.aoa_to_sheet(salesSheetData);
  XLSX.utils.book_append_sheet(wb, wsSales, 'Ventas');

  // Hoja 2: Metas
  const goalsSheetData = [
    ['Metas Anuales', 'Monto'],
    ['PyF (Mínimo)', goals.pyf],
    ['MPyF (Recomendado)', goals.mpyf],
    ['SPyF (Ambicioso)', goals.spyf],
  ];
  const wsGoals = XLSX.utils.aoa_to_sheet(goalsSheetData);
  XLSX.utils.book_append_sheet(wb, wsGoals, 'Metas');

  XLSX.writeFile(wb, `Reporte_Ventas_${companyInfo.name || 'Empresa'}_${new Date().toISOString().split('T')[0]}.xlsx`);
}
