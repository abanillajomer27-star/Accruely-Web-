import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { StandardOTAdjustmentInputs, StandardOTAdjustmentResults } from '../types';
import { formatNum } from './calculator';

/**
 * Exports Standard OT Adjustment to a live Excel (.xlsx) workbook with working Excel formulas.
 */
export function exportStandardOTToExcel(
  inputs: StandardOTAdjustmentInputs,
  results: StandardOTAdjustmentResults
): void {
  const wb = XLSX.utils.book_new();

  const empName = inputs.employeeName?.trim() || 'Employee';
  const sanitizedName = empName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];

  const otReductionHours = (Number(inputs.standardOT) || 0) - results.adjustedStandardOT;
  const totalAdjustedHours = results.ordinaryHoursWorked + results.adjustedStandardOT;

  const wsData: (string | number | null)[][] = [
    ['ACCRUELY — STANDARD OVERTIME ADJUSTMENT WORKPAPER', null, null, null],
    ['Prorated Regular Overtime Calculation (Leave Without Pay Adjustment)', null, null, null],
    ['Generated Date:', new Date().toLocaleString('en-AU'), null, null],
    [null, null, null, null],
    ['1. EMPLOYEE & STANDARD WORK ARRANGEMENT', null, null, null],
    ['Employee Name', inputs.employeeName || 'John Smith', null, null],
    ['Standard Ordinary Hours (Pay Run)', Number(inputs.standardOrdinaryHours) || 38.0, 'hours', null],
    ['Standard Overtime (Pay Run)', Number(inputs.standardOT) || 2.0, 'hours', null],
    ['Leave Without Pay (LWOP) Days', Number(inputs.lwopDays) || 0, 'days', null],
    [null, null, null, null],
    ['2. CALCULATION BREAKDOWN WITH FORMULAS', null, null, null],
    ['Standard Hours Per Day', null, 'hours/day', 'Formula: Standard Ordinary Hours ÷ 5 days'],
    ['Total LWOP Hours Deducted', null, 'hours', 'Formula: LWOP Days × Standard Hours Per Day'],
    ['Ordinary Hours Worked This Period', null, 'hours', 'Formula: MAX(0, Standard Ordinary Hours - Total LWOP Hours)'],
    ['Effective Attendance Percentage', null, '%', 'Formula: Ordinary Hours Worked ÷ Standard Ordinary Hours'],
    ['Adjusted Standard Overtime', null, 'hours', 'Formula: Standard OT × Effective Attendance Percentage'],
    ['Overtime Reduction (Prorated Deduction)', null, 'hours', 'Formula: Standard OT - Adjusted Standard OT'],
    ['Total Adjusted Hours (Ordinary + OT)', null, 'hours', 'Formula: Ordinary Hours Worked + Adjusted Standard OT'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 38 },
    { wch: 22 },
    { wch: 14 },
    { wch: 55 },
  ];

  // 1-indexed row references:
  // Row 7: Standard Ordinary Hours = B7
  // Row 8: Standard OT = B8
  // Row 9: LWOP Days = B9
  // Row 12: Standard Hours Per Day = B7 / 5
  ws['B12'] = { t: 'n', f: 'B7/5', v: results.standardHoursPerDay };

  // Row 13: Total LWOP Hours = B9 * B12
  ws['B13'] = { t: 'n', f: 'B9*B12', v: results.lwopHours };

  // Row 14: Ordinary Hours Worked = MAX(0, B7 - B13)
  ws['B14'] = { t: 'n', f: 'MAX(0,B7-B13)', v: results.ordinaryHoursWorked };

  // Row 15: Attendance % = B14 / B7
  ws['B15'] = { t: 'n', f: 'B14/B7', v: results.attendancePercentage };

  // Row 16: Adjusted Standard OT = B8 * B15
  ws['B16'] = { t: 'n', f: 'B8*B15', v: results.adjustedStandardOT };

  // Row 17: OT Reduction = B8 - B16
  ws['B17'] = { t: 'n', f: 'B8-B16', v: otReductionHours };

  // Row 18: Total Adjusted Hours = B14 + B16
  ws['B18'] = { t: 'n', f: 'B14+B16', v: totalAdjustedHours };

  XLSX.utils.book_append_sheet(wb, ws, 'Standard OT Adjustment');

  const filename = `Accruely_StandardOT_Adjustment_${sanitizedName}_${dateStr}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Exports Standard OT Adjustment to a clean professional PDF document.
 */
export function exportStandardOTToPDF(
  inputs: StandardOTAdjustmentInputs,
  results: StandardOTAdjustmentResults
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const empName = inputs.employeeName?.trim() || 'Employee';
  const sanitizedName = empName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];

  const otReductionHours = (Number(inputs.standardOT) || 0) - results.adjustedStandardOT;
  const totalAdjustedHours = results.ordinaryHoursWorked + results.adjustedStandardOT;

  let y = 14;

  // Header Banner
  doc.setFillColor(234, 88, 12); // Orange 600
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('ACCRUELY — STANDARD OT ADJUSTMENT', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Prorated Regular Overtime Calculation with LWOP', 14, 17);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-AU')}`, 196, 17, { align: 'right' });

  y = 32;

  // Employee Details Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 16, 2, 2, 'FD');

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Employee:', 18, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(empName, 42, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('LWOP Days Taken:', 110, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${inputs.lwopDays} days (${formatNum(results.lwopHours, 2)} hrs)`, 148, y + 6);

  y += 24;

  const drawSectionHeader = (title: string, currentY: number) => {
    doc.setFillColor(241, 245, 249);
    doc.rect(14, currentY, 182, 6, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(title, 16, currentY + 4.5);
    return currentY + 9;
  };

  const drawRow = (label: string, value: string, currentY: number, isBold: boolean = false, isHighlight: boolean = false) => {
    if (isHighlight) {
      doc.setFillColor(254, 243, 199);
      doc.rect(14, currentY - 3.5, 182, 5.5, 'F');
    }
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(isHighlight ? 146 : 51, isHighlight ? 64 : 65, isHighlight ? 14 : 85);
    doc.text(label, 18, currentY);
    doc.text(value, 192, currentY, { align: 'right' });
    return currentY + 5;
  };

  // Section 1: Baseline Work Agreement
  y = drawSectionHeader('1. Standard Work Arrangement Baseline', y);
  y = drawRow('Standard Ordinary Hours', `${formatNum(inputs.standardOrdinaryHours, 2)} hrs`, y);
  y = drawRow('Standard Overtime (Fixed/Agreed)', `${formatNum(inputs.standardOT, 2)} hrs`, y);
  y = drawRow('Standard Daily Hours (5-Day Basis)', `${formatNum(results.standardHoursPerDay, 2)} hrs/day`, y);

  y += 4;

  // Section 2: Attendance & Leave Deductions
  y = drawSectionHeader('2. Leave Without Pay (LWOP) Deductions', y);
  y = drawRow('LWOP Days Taken', `${inputs.lwopDays} days`, y);
  y = drawRow('LWOP Hours Deducted', `− ${formatNum(results.lwopHours, 2)} hrs`, y);
  y = drawRow('Ordinary Hours Worked', `${formatNum(results.ordinaryHoursWorked, 2)} hrs`, y);
  y = drawRow('Effective Attendance Rate', `${(results.attendancePercentage * 100).toFixed(2)}%`, y, true);

  y += 4;

  // Section 3: Final Overtime Adjustments
  y = drawSectionHeader('3. Final Overtime Adjustment Results', y);
  y = drawRow('Original Standard Overtime', `${formatNum(inputs.standardOT, 2)} hrs`, y);
  y = drawRow('Overtime Reduction', `− ${formatNum(otReductionHours, 2)} hrs`, y);
  y = drawRow('Final Adjusted Standard Overtime', `${formatNum(results.adjustedStandardOT, 2)} hrs`, y, true, true);
  y = drawRow('Total Adjusted Hours (Ordinary + OT)', `${formatNum(totalAdjustedHours, 2)} hrs`, y, true);

  y += 12;

  // Sign-off box
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, 182, 24, 2, 2);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Prepared By: ___________________________        Reviewed / Approved By: ___________________________', 20, y + 8);
  doc.text('Signature:     ___________________________        Date: ___________________________', 20, y + 16);

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Accruely • Australian Payroll Tools • Standard OT Adjustment Workpaper', 105, 288, { align: 'center' });

  const filename = `Accruely_StandardOT_Adjustment_${sanitizedName}_${dateStr}.pdf`;
  doc.save(filename);
}
