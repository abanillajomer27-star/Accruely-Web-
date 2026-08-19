import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { PLCalculatorInputs, PLCalculatorResults } from '../types';
import { formatNum, formatDateDisplay } from './calculator';

/**
 * Exports PL Opening Balance & Xero Reconciliation to a live Excel (.xlsx) workbook with working Excel formulas.
 */
export function exportPLOpeningBalanceToExcel(
  inputs: PLCalculatorInputs,
  results: PLCalculatorResults
): void {
  const wb = XLSX.utils.book_new();

  const empName = inputs.employeeName?.trim() || 'Employee';
  const sanitizedName = empName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];

  const stdPerDay = Number(inputs.standardHoursPerDay) || 7.6;

  // Sheet data array
  const wsData: (string | number | null)[][] = [
    ['ACCRUELY — PL OPENING BALANCE & XERO RECONCILIATION WORKPAPER', null, null, null],
    ['Australian National Employment Standards (NES) Compliant', null, null, null],
    ['Generated Date:', new Date().toLocaleString('en-AU'), null, null],
    [null, null, null, null],
    ['1. EMPLOYEE & SCHEDULE DETAILS', null, null, null],
    ['Employee Name', inputs.employeeName || 'John Smith', null, null],
    ['Standard Hours Per Day', stdPerDay, 'hours/day', null],
    [null, null, null, null],
    ['2. OLD PERIOD ENTITLEMENT (PRIOR RATE / PART-TIME)', null, null, null],
    ['Commencement Date', inputs.oldPeriod.commencementDate ? formatDateDisplay(inputs.oldPeriod.commencementDate) : 'Not specified', null, null],
    ['Calculation Date', inputs.oldPeriod.calculationDate ? formatDateDisplay(inputs.oldPeriod.calculationDate) : 'Not specified', null, null],
    ['Annual Entitlement (Old)', Number(inputs.oldPeriod.annualEntitlement) || 76.0, 'hours/yr', null],
    ['Completed Years (Old)', Number(inputs.oldPeriod.completedYears) || 0, 'years', null],
    ['Remaining Weeks (Old)', Number(inputs.oldPeriod.remainingWeeks) || 0, 'weeks', null],
    ['Additional Year Hours (Old)', null, 'hours', 'Formula: Completed Years × Annual Entitlement'],
    ['Weekly Accrual Rate (Old)', null, 'hrs/wk', 'Formula: Annual Entitlement ÷ 52 weeks'],
    ['Remaining Weeks Hours (Old)', null, 'hours', 'Formula: Remaining Weeks × Weekly Accrual Rate'],
    ['Total Leave Earned (Old Period)', null, 'hours', 'Formula: Additional Year Hours + Remaining Weeks Hours'],
    [null, null, null, null],
    ['3. NEW PERIOD ENTITLEMENT (CURRENT RATE / FULL-TIME)', null, null, null],
    ['Commencement Date', inputs.newPeriod.commencementDate ? formatDateDisplay(inputs.newPeriod.commencementDate) : 'Not specified', null, null],
    ['Calculation Date', inputs.newPeriod.calculationDate ? formatDateDisplay(inputs.newPeriod.calculationDate) : 'Not specified', null, null],
    ['Annual Entitlement (New)', Number(inputs.newPeriod.annualEntitlement) || 76.0, 'hours/yr', null],
    ['Completed Years (New)', Number(inputs.newPeriod.completedYears) || 0, 'years', null],
    ['Remaining Weeks (New)', Number(inputs.newPeriod.remainingWeeks) || 0, 'weeks', null],
    ['Additional Year Hours (New)', null, 'hours', 'Formula: Completed Years × Annual Entitlement'],
    ['Weekly Accrual Rate (New)', null, 'hrs/wk', 'Formula: Annual Entitlement ÷ 52 weeks'],
    ['Remaining Weeks Hours (New)', null, 'hours', 'Formula: Remaining Weeks × Weekly Accrual Rate'],
    ['Total Leave Earned (New Period)', null, 'hours', 'Formula: Additional Year Hours + Remaining Weeks Hours'],
    [null, null, null, null],
    ['4. TOTAL ACCRUED & HISTORICAL LEAVE TAKEN', null, null, null],
    ['Grand Total Leave Earned', null, 'hours', 'Formula: Old Period Total + New Period Total'],
    ['Leave Used (Pre-MYOB)', Number(inputs.leaveUsedPreMYOB) || 0, 'hours', null],
    ['Leave Used (MYOB)', Number(inputs.leaveUsedMYOB) || 0, 'hours', null],
    ['Leave Used (Xero)', Number(inputs.leaveUsedXero) || 0, 'hours', null],
    ['Leave Used (Other/Manual)', Number(inputs.leaveUsedOther) || 0, 'hours', null],
    ['Total Leave Taken', null, 'hours', 'Formula: SUM(Pre-MYOB + MYOB + Xero + Other)'],
    ['Target Balance (Net Entitlement)', null, 'hours', 'Formula: Grand Total Earned - Total Leave Taken'],
    ['Target Balance Equivalent (Days)', null, 'days', 'Formula: Target Balance ÷ Standard Hours Per Day'],
    ['Target Balance Equivalent (Weeks)', null, 'weeks', 'Formula: Target Balance ÷ (Standard Hours Per Day × 5)'],
    [null, null, null, null],
    ['5. XERO PAYROLL RECONCILIATION & ADJUSTMENT', null, null, null],
    ['Current Opening Balance in Xero', Number(inputs.currentOpeningBalanceXero) || 0, 'hours', null],
    ['Current Balance in Xero', Number(inputs.currentXeroBalance) || 0, 'hours', null],
    ['Updated Opening Balance for Xero', null, 'hours', 'Formula: Current Opening + Target Balance - Current Xero Balance'],
    ['Required Adjustment in Xero', null, 'hours', 'Formula: Updated Opening Balance - Current Opening Balance'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 38 },
    { wch: 22 },
    { wch: 14 },
    { wch: 55 },
  ];

  // Old Period Formulas:
  ws['B15'] = { t: 'n', f: 'B13*B12', v: results.oldRate.additionalYearHours };
  ws['B16'] = { t: 'n', f: 'B12/52', v: results.oldRate.weeklyAccrualRate };
  ws['B17'] = { t: 'n', f: 'B14*B16', v: results.oldRate.remainingWeeksHours };
  ws['B18'] = { t: 'n', f: 'B15+B17', v: results.oldRate.totalLeaveEarned };

  // New Period Formulas:
  ws['B26'] = { t: 'n', f: 'B24*B23', v: results.newRate.additionalYearHours };
  ws['B27'] = { t: 'n', f: 'B23/52', v: results.newRate.weeklyAccrualRate };
  ws['B28'] = { t: 'n', f: 'B25*B27', v: results.newRate.remainingWeeksHours };
  ws['B29'] = { t: 'n', f: 'B26+B28', v: results.newRate.totalLeaveEarned };

  // Grand Total Leave Earned = B18 + B29
  ws['B32'] = { t: 'n', f: 'B18+B29', v: results.grandTotalLeaveEarned };

  // Total Leave Taken = SUM(B33:B36)
  ws['B37'] = { t: 'n', f: 'SUM(B33:B36)', v: results.totalLeaveUsed };

  // Target Balance = B32 - B37
  ws['B38'] = { t: 'n', f: 'B32-B37', v: results.targetBalance };

  // Target Balance Days = B38 / B7
  ws['B39'] = { t: 'n', f: 'B38/B7', v: results.targetBalance / stdPerDay };

  // Target Balance Weeks = B38 / (B7 * 5)
  ws['B40'] = { t: 'n', f: 'B38/(B7*5)', v: results.targetBalance / (stdPerDay * 5) };

  // Updated Opening Balance in Xero = B42 + B38 - B43
  ws['B44'] = { t: 'n', f: 'B42+B38-B43', v: results.xeroUpdatedBalance };

  // Required Adjustment = B44 - B42
  ws['B45'] = { t: 'n', f: 'B44-B42', v: results.xeroUpdatedBalance - (Number(inputs.currentOpeningBalanceXero) || 0) };

  XLSX.utils.book_append_sheet(wb, ws, 'PL Opening Reconciliation');

  const filename = `Accruely_PL_Reconciliation_${sanitizedName}_${dateStr}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Exports PL Opening Balance & Xero Reconciliation to a clean professional PDF document.
 */
export function exportPLOpeningBalanceToPDF(
  inputs: PLCalculatorInputs,
  results: PLCalculatorResults
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const empName = inputs.employeeName?.trim() || 'Employee';
  const sanitizedName = empName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];

  let y = 14;

  // Header Banner
  doc.setFillColor(234, 88, 12); // Orange 600
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('ACCRUELY — PERSONAL LEAVE RECONCILIATION', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Australian NES Entitlement & Xero Opening Balance Workpaper', 14, 17);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-AU')}`, 196, 17, { align: 'right' });

  y = 32;

  // Employee Card
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
  doc.text('Standard Hours / Day:', 110, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formatNum(inputs.standardHoursPerDay || 7.6, 2)} hrs`, 158, y + 6);

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

  // Section 1: Old Period Entitlement
  y = drawSectionHeader('1. Old Rate Period (Prior Entitlement)', y);
  y = drawRow('Annual Entitlement (Old)', `${formatNum(inputs.oldPeriod.annualEntitlement, 2)} hrs/yr`, y);
  y = drawRow('Completed Full Years', `${inputs.oldPeriod.completedYears} yrs (= ${formatNum(results.oldRate.additionalYearHours, 2)} hrs)`, y);
  y = drawRow('Remaining Fractional Weeks', `${inputs.oldPeriod.remainingWeeks} wks (= ${formatNum(results.oldRate.remainingWeeksHours, 2)} hrs)`, y);
  y = drawRow('Total Earned (Old Period)', `${formatNum(results.oldRate.totalLeaveEarned, 2)} hrs`, y, true);

  y += 4;

  // Section 2: New Period Entitlement
  y = drawSectionHeader('2. New Rate Period (Current Entitlement)', y);
  y = drawRow('Annual Entitlement (New)', `${formatNum(inputs.newPeriod.annualEntitlement, 2)} hrs/yr`, y);
  y = drawRow('Completed Full Years', `${inputs.newPeriod.completedYears} yrs (= ${formatNum(results.newRate.additionalYearHours, 2)} hrs)`, y);
  y = drawRow('Remaining Fractional Weeks', `${inputs.newPeriod.remainingWeeks} wks (= ${formatNum(results.newRate.remainingWeeksHours, 2)} hrs)`, y);
  y = drawRow('Total Earned (New Period)', `${formatNum(results.newRate.totalLeaveEarned, 2)} hrs`, y, true);

  y += 4;

  // Section 3: Summary & Leave Taken
  y = drawSectionHeader('3. Entitlement Earned & Leave Taken Summary', y);
  y = drawRow('Grand Total Leave Earned (Old + New)', `${formatNum(results.grandTotalLeaveEarned, 2)} hrs`, y, true);
  y = drawRow('Less Total Historical Leave Taken', `− ${formatNum(results.totalLeaveUsed, 2)} hrs`, y);
  y = drawRow('Target Net Entitlement Balance', `${formatNum(results.targetBalance, 2)} hrs`, y, true, true);
  y = drawRow('Equivalent in Standard Days / Weeks', `${formatNum(results.targetBalance / (inputs.standardHoursPerDay || 7.6), 2)} days  •  ${formatNum(results.targetBalance / ((inputs.standardHoursPerDay || 7.6) * 5), 2)} weeks`, y);

  y += 4;

  // Section 4: Xero Reconciliation
  y = drawSectionHeader('4. Xero Payroll Opening Balance Adjustment', y);
  y = drawRow('Current Opening Balance in Xero', `${formatNum(inputs.currentOpeningBalanceXero, 2)} hrs`, y);
  y = drawRow('Current Balance in Xero', `${formatNum(inputs.currentXeroBalance, 2)} hrs`, y);
  y = drawRow('Target Balance Required', `${formatNum(results.targetBalance, 2)} hrs`, y);
  y = drawRow('Updated Opening Balance for Xero', `${formatNum(results.xeroUpdatedBalance, 2)} hrs`, y, true, true);

  const adjustment = results.xeroUpdatedBalance - (Number(inputs.currentOpeningBalanceXero) || 0);
  y = drawRow('Net Opening Balance Adjustment', `${adjustment >= 0 ? '+' : ''}${formatNum(adjustment, 2)} hrs`, y, true);

  y += 8;

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
  doc.text('Accruely • Australian Payroll Tools • Fair Work NES Compliant Calculation Workpaper', 105, 288, { align: 'center' });

  const filename = `Accruely_PL_Reconciliation_${sanitizedName}_${dateStr}.pdf`;
  doc.save(filename);
}
