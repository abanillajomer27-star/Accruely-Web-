import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { WeekendPayInputs, WeekendPayResults, DaySplitResult } from '../types';
import { formatNum } from './calculator';
import { getAwardRuleById } from './weekendRules';

/**
 * Exports Weekend Pay Split & Reconciliation to a live Excel (.xlsx) workbook with working Excel formulas.
 */
export function exportWeekendPayToExcel(
  inputs: WeekendPayInputs,
  results: WeekendPayResults
): void {
  const wb = XLSX.utils.book_new();

  const empName = inputs.employeeName?.trim() || 'Employee';
  const sanitizedName = empName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];

  const rate = Number(inputs.ordinaryHourlyRate) || 0;
  const selectedRule = getAwardRuleById(inputs.selectedRuleId || inputs.payRule || 'casual-loaded');
  const awardRuleName = selectedRule.name;

  const breakdowns: DaySplitResult[] =
    results.activeDayBreakdowns || results.dailyBreakdowns || [];

  // Build Sheet Data
  const wsData: (string | number | null)[][] = [
    ['ACCRUELY — WEEKEND PAY SPLIT & RECONCILIATION WORKPAPER', null, null, null, null, null],
    ['Australian Award & Timesheet Hours Split Reconciler', null, null, null, null, null],
    ['Generated Date:', new Date().toLocaleString('en-AU'), null, null, null, null],
    [null, null, null, null, null, null],
    ['1. EMPLOYEE & AWARD RULE CONFIGURATION', null, null, null, null, null],
    ['Employee Name', inputs.employeeName || 'Jordan Miller', null, null, null, null],
    ['Ordinary Hourly Rate ($/hr)', rate, '$/hr', null, null, null],
    ['Selected Award / Pay Rule', awardRuleName, null, null, null, null],
    [null, null, null, null, null, null],
    ['2. TIMESHEET WEEKEND HOURS INPUTTED', null, null, null, null, null],
    ['Week 1 Saturday Hours', Number(inputs.w1Saturday) || (Number(inputs.saturdayHours) || 0), 'hours', null, null, null],
    ['Week 1 Sunday Hours', Number(inputs.w1Sunday) || (Number(inputs.sundayHours) || 0), 'hours', null, null, null],
    ['Week 2 Saturday Hours', Number(inputs.w2Saturday) || 0, 'hours', null, null, null],
    ['Week 2 Sunday Hours', Number(inputs.w2Sunday) || 0, 'hours', null, null, null],
    ['Total Fortnight Weekend Timesheet Hours', null, 'hours', 'Formula: SUM(B11:B14)', null, null],
    [null, null, null, null, null, null],
    ['3. DETAILED SHIFT CATEGORY SPLIT & PAY BREAKDOWN', null, null, null, null, null],
    ['Shift / Day', 'Payroll Category', 'Split Hours', 'Multiplier', 'Effective Rate ($/hr)', 'Gross Pay ($)'],
  ];

  let rowIndex = 18; // 1-indexed for the next row
  const shiftRowIndices: number[] = [];

  breakdowns.forEach((day) => {
    (day.categorySplits || []).forEach((cat) => {
      wsData.push([
        day.fullLabel || `${day.weekLabel ? day.weekLabel + ' — ' : ''}${day.dayName}`,
        cat.name,
        Number(cat.hours) || 0,
        Number(cat.multiplier) || 1.0,
        null, // Formula: Rate * Multiplier
        null, // Formula: Hours * Effective Rate
      ]);
      shiftRowIndices.push(rowIndex + 1);
      rowIndex++;
    });
  });

  if (shiftRowIndices.length === 0) {
    wsData.push(['No shift entries recorded', '-', 0, 1.0, null, null]);
    shiftRowIndices.push(rowIndex + 1);
    rowIndex++;
  }

  wsData.push([null, null, null, null, null, null]);
  rowIndex++;

  const summaryHeaderRow = rowIndex + 1;
  wsData.push(['4. SUMMARY BY PAYROLL CATEGORY (FOR XERO / MYOB ENTRY)', null, null, null, null, null]);
  wsData.push(['Payroll Category', 'Total Category Hours', 'Multiplier', 'Effective Rate ($/hr)', 'Total Gross Pay ($)', null]);
  rowIndex += 2;

  const categorySummaryStartRow = rowIndex + 1;
  results.categoryResults.forEach((catSummary) => {
    wsData.push([
      catSummary.name,
      Number(catSummary.allocatedHours) || 0,
      Number(catSummary.multiplier) || 1.0,
      null, // Effective Rate: B7 * Multiplier
      null, // Gross Pay: Total Hours * Effective Rate
      null,
    ]);
    rowIndex++;
  });
  const categorySummaryEndRow = Math.max(categorySummaryStartRow, rowIndex);

  wsData.push([null, null, null, null, null, null]);
  rowIndex++;

  // Section 5: Reconciliation
  const reconStartRow = rowIndex + 1;
  wsData.push(['5. TIMESHEET RECONCILIATION & TOTALS', null, null, null, null, null]);
  wsData.push(['Total Original Timesheet Hours', null, 'hours', 'Formula: B15', null, null]);
  wsData.push(['Total Reconciled Split Hours', null, 'hours', `Formula: SUM(C19:C${18 + shiftRowIndices.length})`, null, null]);
  wsData.push(['Hours Variance', null, 'hours', `Formula: B${reconStartRow + 2} - B${reconStartRow + 1}`, null, null]);
  wsData.push(['Total Weekend Gross Pay', null, '$', `Formula: SUM(F19:F${18 + shiftRowIndices.length})`, null, null]);

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 28 }, // Col A
    { wch: 38 }, // Col B
    { wch: 18 }, // Col C
    { wch: 14 }, // Col D
    { wch: 22 }, // Col E
    { wch: 20 }, // Col F
  ];

  // Row 15: Total Weekend Timesheet Hours = SUM(B11:B14)
  ws['B15'] = { t: 'n', f: 'SUM(B11:B14)', v: results.totalTimesheetHours };

  // Fill in formulas for Section 3 (Shift Category Splits)
  let curShiftRow = 19;
  breakdowns.forEach((day) => {
    (day.categorySplits || []).forEach((cat) => {
      const r = curShiftRow;
      // Col E (Effective Rate): = B7 * D{r}
      ws[`E${r}`] = { t: 'n', f: `B7*D${r}`, v: cat.hourlyRate || rate * (cat.multiplier || 1) };
      // Col F (Gross Pay): = C{r} * E{r}
      ws[`F${r}`] = { t: 'n', f: `C${r}*E${r}`, v: cat.pay || (Number(cat.hours) || 0) * (cat.hourlyRate || 0) };
      curShiftRow++;
    });
  });

  // Fill in formulas for Section 4 (Category Summary)
  let catSumRow = categorySummaryStartRow;
  results.categoryResults.forEach((catSummary) => {
    const r = catSumRow;
    // Col D (Effective Rate): = B7 * C{r}
    ws[`D${r}`] = { t: 'n', f: `B7*C${r}`, v: catSummary.hourlyRate };
    // Col E (Total Gross Pay): = B{r} * D{r}
    ws[`E${r}`] = { t: 'n', f: `B${r}*D${r}`, v: catSummary.categoryPay };
    catSumRow++;
  });

  // Fill in formulas for Section 5 (Reconciliation)
  const origTimesheetCell = `B${reconStartRow + 1}`;
  const splitHoursCell = `B${reconStartRow + 2}`;
  const varianceCell = `B${reconStartRow + 3}`;
  const grossPayCell = `B${reconStartRow + 4}`;

  ws[origTimesheetCell] = { t: 'n', f: 'B15', v: results.totalTimesheetHours };
  ws[splitHoursCell] = { t: 'n', f: `SUM(C19:C${18 + shiftRowIndices.length})`, v: results.totalAllocatedHours };
  ws[varianceCell] = { t: 'n', f: `${splitHoursCell}-${origTimesheetCell}`, v: results.hoursDifference };
  ws[grossPayCell] = { t: 'n', f: `SUM(F19:F${18 + shiftRowIndices.length})`, v: results.totalGrossPay };

  XLSX.utils.book_append_sheet(wb, ws, 'Weekend Pay Split');

  const filename = `Accruely_Weekend_Pay_Split_${sanitizedName}_${dateStr}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Exports Weekend Pay Split & Reconciliation to a clean professional PDF document.
 */
export function exportWeekendPayToPDF(
  inputs: WeekendPayInputs,
  results: WeekendPayResults
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const empName = inputs.employeeName?.trim() || 'Employee';
  const sanitizedName = empName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];

  const selectedRule = getAwardRuleById(inputs.selectedRuleId || inputs.payRule || 'casual-loaded');
  const awardRuleName = selectedRule.name;
  const breakdowns: DaySplitResult[] =
    results.activeDayBreakdowns || results.dailyBreakdowns || [];

  let y = 14;

  // Header Banner
  doc.setFillColor(234, 88, 12); // Orange 600
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('ACCRUELY — WEEKEND PAY SPLIT WORKPAPER', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Australian Award & Timesheet Hours Split Statement', 14, 17);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-AU')}`, 196, 17, { align: 'right' });

  y = 32;

  // Employee & Rule Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 18, 2, 2, 'FD');

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('Employee:', 18, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(empName, 40, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Base Rate:', 120, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`$${formatNum(Number(inputs.ordinaryHourlyRate) || 0, 2)}/hr`, 144, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Award Rule:', 18, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.text(awardRuleName, 40, y + 13);

  y += 26;

  const drawSectionHeader = (title: string, currentY: number) => {
    doc.setFillColor(241, 245, 249);
    doc.rect(14, currentY, 182, 6, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(title, 16, currentY + 4.5);
    return currentY + 9;
  };

  // Section 1: Timesheet Weekend Hours
  y = drawSectionHeader('1. Timesheet Weekend Hours', y);
  const drawTimesheetRow = (label: string, val: string, currentY: number) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(label, 18, currentY);
    doc.text(val, 192, currentY, { align: 'right' });
    return currentY + 4.5;
  };

  const w1Sat = Number(inputs.w1Saturday) || (Number(inputs.saturdayHours) || 0);
  const w1Sun = Number(inputs.w1Sunday) || (Number(inputs.sundayHours) || 0);
  const w2Sat = Number(inputs.w2Saturday) || 0;
  const w2Sun = Number(inputs.w2Sunday) || 0;

  y = drawTimesheetRow('Week 1 Saturday', `${formatNum(w1Sat, 2)} hrs`, y);
  y = drawTimesheetRow('Week 1 Sunday', `${formatNum(w1Sun, 2)} hrs`, y);
  if (w2Sat > 0 || w2Sun > 0) {
    y = drawTimesheetRow('Week 2 Saturday', `${formatNum(w2Sat, 2)} hrs`, y);
    y = drawTimesheetRow('Week 2 Sunday', `${formatNum(w2Sun, 2)} hrs`, y);
  }
  doc.setFont('helvetica', 'bold');
  y = drawTimesheetRow('Total Weekend Timesheet Hours', `${formatNum(results.totalTimesheetHours, 2)} hrs`, y);

  y += 3;

  // Section 2: Detailed Shifts & Category Splits
  y = drawSectionHeader('2. Shift Hours Split by Category', y);

  breakdowns.forEach((day) => {
    if (day.timesheetHours <= 0) return;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(234, 88, 12);
    doc.text(`• ${day.fullLabel || day.dayName} (${formatNum(day.timesheetHours, 2)} hrs total):`, 18, y);
    y += 4.5;

    (day.categorySplits || []).forEach((cat) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`  - ${cat.name} (${cat.multiplier || 1}x)`, 24, y);
      doc.text(`${formatNum(Number(cat.hours) || 0, 2)} hrs  •  $${formatNum(cat.hourlyRate || 0, 2)}/hr  •  $${formatNum(cat.pay || 0, 2)}`, 192, y, { align: 'right' });
      y += 4;
    });
  });

  y += 3;

  // Section 3: Summary By Payroll Category
  y = drawSectionHeader('3. Aggregated Category Summary (For Payroll Entry)', y);
  results.categoryResults.forEach((cat) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`${cat.name} (${cat.multiplier}x)`, 18, y);
    doc.text(`${formatNum(cat.allocatedHours, 2)} hrs  •  $${formatNum(cat.hourlyRate, 2)}/hr  •  $${formatNum(cat.categoryPay, 2)}`, 192, y, { align: 'right' });
    y += 5;
  });

  y += 3;

  // Section 4: Reconciliation & Totals
  y = drawSectionHeader('4. Reconciliation & Gross Pay Verification', y);
  
  doc.setFillColor(254, 243, 199);
  doc.rect(14, y - 3.5, 182, 12, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(146, 64, 14);
  doc.text('Total Original Timesheet Hours:', 18, y);
  doc.text(`${formatNum(results.totalTimesheetHours, 2)} hrs`, 192, y, { align: 'right' });
  y += 4.5;

  doc.text('Total Reconciled Split Hours:', 18, y);
  doc.text(`${formatNum(results.totalAllocatedHours, 2)} hrs`, 192, y, { align: 'right' });
  y += 4.5;

  doc.text('Total Weekend Gross Pay:', 18, y);
  doc.text(`$${formatNum(results.totalGrossPay, 2)}`, 192, y, { align: 'right' });
  y += 8;

  // Sign-off box
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, 182, 22, 2, 2);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Prepared By: ___________________________        Reviewed / Approved By: ___________________________', 20, y + 7);
  doc.text('Signature:     ___________________________        Date: ___________________________', 20, y + 14);

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Accruely • Australian Payroll Tools • Weekend Pay Timesheet Split Workpaper', 105, 288, { align: 'center' });

  const filename = `Accruely_Weekend_Pay_Split_${sanitizedName}_${dateStr}.pdf`;
  doc.save(filename);
}
