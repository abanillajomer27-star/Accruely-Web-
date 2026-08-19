import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { LeaveAccrualInputs, LeaveAccrualResults } from '../types';
import { formatNum } from './calculator';

/**
 * Exports Leave Accrual Calculation to a real Excel (.xlsx) file with working Excel formulas.
 */
export function exportLeaveAccrualToExcel(
  inputs: LeaveAccrualInputs,
  results: LeaveAccrualResults
): void {
  const wb = XLSX.utils.book_new();

  const empName = inputs.employeeName?.trim() || 'Employee';
  const sanitizedName = empName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];

  // ==========================================
  // SHEET 1: Calculation Workpaper with Formulas
  // ==========================================
  const wsData: (string | number | null)[][] = [
    ['ACCRUELY — LEAVE ACCRUAL CALCULATION WORKPAPER', null, null, null],
    ['Australian National Employment Standards (NES) Compliant', null, null, null],
    ['Generated Date:', new Date().toLocaleString('en-AU'), null, null],
    [null, null, null, null],
    ['1. EMPLOYEE & PAY RUN DETAILS', null, null, null],
    ['Employee Name', inputs.employeeName || 'John Smith', null, null],
    ['Leave Accrual Profile', inputs.profile, null, null],
    ['Pay Frequency', inputs.payFrequency, null, null],
    ['Standard Hours Per Day', Number(inputs.standardHoursPerDay) || 7.6, 'hours/day', null],
    ['Total Hours For Pay Period', Number(inputs.totalHoursForPeriod) || 76.0, 'hours', null],
    [null, null, null, null],
    ['2. HOURS WORKED & LEAVE TAKEN (THIS PAY RUN)', null, null, null],
    ['Ordinary Hours Worked', Number(inputs.ordinaryHours) || 0, 'hours', null],
    ['Public Holiday Hours', Number(inputs.publicHolidayHours) || 0, 'hours', null],
    ['Annual Leave Taken', Number(inputs.annualLeaveTaken) || 0, 'hours', null],
    ['Personal Leave Taken', Number(inputs.personalLeaveTaken) || 0, 'hours', null],
    ['Total Paid Hours', null, 'hours', 'Formula: Ordinary + Holiday + AL Taken + PL Taken'],
    ['Leave Without Pay (LWOP) Hours', null, 'hours', 'Formula: MAX(0, Total Period Hours - Total Paid Hours)'],
    [null, null, null, null],
    ['3. ANNUAL LEAVE (AL) ACCRUAL', null, null, null],
    ['Opening Annual Leave Balance', Number(inputs.annualLeaveOpeningBalance) || 0, 'hours', null],
    ['Annual Leave Accrual Rate', Number(results.annualLeaveAccrualRate) || 0, 'hrs/paid hr', inputs.profile === 'Casual Employee' ? 'Casual (0.00)' : 'NES FT/PT (4 weeks ÷ 52 weeks = 0.076923)'],
    ['Annual Leave Accrued This Pay', null, 'hours', 'Formula: Total Paid Hours × AL Accrual Rate'],
    ['Available Annual Leave', null, 'hours', 'Formula: Opening Balance + AL Accrued'],
    ['Less: Annual Leave Taken', null, 'hours', 'Formula: AL Taken from Row 15'],
    ['Closing Annual Leave Balance', null, 'hours', 'Formula: Available AL - AL Taken'],
    ['Closing AL Equivalent (Days)', null, 'days', 'Formula: Closing AL Balance ÷ Standard Hours Per Day'],
    ['Closing AL Equivalent (Weeks)', null, 'weeks', 'Formula: Closing AL Balance ÷ (Standard Hours Per Day × 5)'],
    [null, null, null, null],
    ['4. PERSONAL / CARER\'S LEAVE (PL) ACCRUAL', null, null, null],
    ['Opening Personal Leave Balance', Number(inputs.personalLeaveOpeningBalance) || 0, 'hours', null],
    ['Personal Leave Accrual Rate', Number(results.personalLeaveAccrualRate) || 0, 'hrs/paid hr', inputs.profile === 'Casual Employee' ? 'Casual (0.00)' : 'NES FT/PT (10 days ÷ 260 days = 0.038462)'],
    ['Personal Leave Accrued This Pay', null, 'hours', 'Formula: Total Paid Hours × PL Accrual Rate'],
    ['Available Personal Leave', null, 'hours', 'Formula: Opening Balance + PL Accrued'],
    ['Less: Personal Leave Taken', null, 'hours', 'Formula: PL Taken from Row 16'],
    ['Closing Personal Leave Balance', null, 'hours', 'Formula: Available PL - PL Taken'],
    ['Closing PL Equivalent (Days)', null, 'days', 'Formula: Closing PL Balance ÷ Standard Hours Per Day'],
    ['Closing PL Equivalent (Weeks)', null, 'weeks', 'Formula: Closing PL Balance ÷ (Standard Hours Per Day × 5)'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = [
    { wch: 38 }, // Column A (Labels)
    { wch: 24 }, // Column B (Values / Formulas)
    { wch: 16 }, // Column C (Units)
    { wch: 55 }, // Column D (Formula Notes)
  ];

  // Insert Working Excel Formulas (1-indexed row numbers)
  // Row 17: Total Paid Hours = B13 + B14 + B15 + B16
  ws['B17'] = { t: 'n', f: 'B13+B14+B15+B16', v: results.totalPaidHours };

  // Row 18: Leave Without Pay Hours = MAX(0, B10 - B17)
  ws['B18'] = { t: 'n', f: 'MAX(0,B10-B17)', v: results.leaveWithoutPayHours };

  // Row 23: Annual Leave Accrued = B17 * B22
  ws['B23'] = { t: 'n', f: 'B17*B22', v: results.annualLeaveAccrued };

  // Row 24: Available Annual Leave = B21 + B23
  ws['B24'] = { t: 'n', f: 'B21+B23', v: results.availableAnnualLeave };

  // Row 25: Less: AL Taken = B15
  ws['B25'] = { t: 'n', f: 'B15', v: inputs.annualLeaveTaken || 0 };

  // Row 26: Closing AL Balance = B24 - B25
  ws['B26'] = { t: 'n', f: 'B24-B25', v: results.annualLeaveClosingBalance };

  // Row 27: Closing AL Equivalent (Days) = B26 / B9
  const stdPerDay = Number(inputs.standardHoursPerDay) || 7.6;
  ws['B27'] = { t: 'n', f: 'B26/B9', v: results.annualLeaveClosingBalance / stdPerDay };

  // Row 28: Closing AL Equivalent (Weeks) = B26 / (B9 * 5)
  ws['B28'] = { t: 'n', f: 'B26/(B9*5)', v: results.annualLeaveClosingBalance / (stdPerDay * 5) };

  // Row 33: Personal Leave Accrued = B17 * B32
  ws['B33'] = { t: 'n', f: 'B17*B32', v: results.personalLeaveAccrued };

  // Row 34: Available Personal Leave = B31 + B33
  ws['B34'] = { t: 'n', f: 'B31+B33', v: results.availablePersonalLeave };

  // Row 35: Less: PL Taken = B16
  ws['B35'] = { t: 'n', f: 'B16', v: inputs.personalLeaveTaken || 0 };

  // Row 36: Closing PL Balance = B34 - B35
  ws['B36'] = { t: 'n', f: 'B34-B35', v: results.personalLeaveClosingBalance };

  // Row 37: Closing PL Equivalent (Days) = B36 / B9
  ws['B37'] = { t: 'n', f: 'B36/B9', v: results.personalLeaveClosingBalance / stdPerDay };

  // Row 38: Closing PL Equivalent (Weeks) = B36 / (B9 * 5)
  ws['B38'] = { t: 'n', f: 'B36/(B9*5)', v: results.personalLeaveClosingBalance / (stdPerDay * 5) };

  XLSX.utils.book_append_sheet(wb, ws, 'Leave Calculation');

  // ==========================================
  // SHEET 2: Reference & Audit Notes
  // ==========================================
  const refData: (string | null)[][] = [
    ['ACCRUELY — LEAVE ACCRUAL STATUTORY REFERENCE & AUDIT GUIDE', null],
    [null, null],
    ['Topic', 'Statutory Basis & Formula Methodology'],
    [
      'Annual Leave Entitlement',
      'Under section 87 of the Fair Work Act 2009 (Cth), full-time and part-time employees accrue 4 weeks of paid annual leave per year of service (pro-rata for part-time). Standard accrual rate = 4 weeks ÷ 52 weeks = 0.0769230769 hours per paid ordinary hour.',
    ],
    [
      'Personal/Carer\'s Leave Entitlement',
      'Under section 96 of the Fair Work Act 2009 (Cth), full-time employees are entitled to 10 days of paid personal/carer\'s leave per year. Standard accrual rate = 10 days ÷ 260 working days = 0.0384615385 hours per paid ordinary hour.',
    ],
    [
      'Casual Employees',
      'Under the NES, casual employees receive a casual loading (typically 25%) in lieu of paid leave and do not accrue annual or paid personal/carer\'s leave (Accrual Rate = 0.00).',
    ],
    [
      'Paid Hours vs Unpaid Leave',
      'Leave accrues progressively during each pay period on ordinary hours worked and paid leave (Annual Leave, Personal Leave, Public Holidays). Leave does not accrue on unpaid leave (Leave Without Pay / LWOP).',
    ],
    [
      'Formula Integrity',
      'All calculation cells in Sheet 1 contain dynamic Excel formulas linking inputs to outputs so that internal audits, bookkeepers, and accountants can verify mathematical calculations.',
    ],
  ];

  const wsRef = XLSX.utils.aoa_to_sheet(refData);
  wsRef['!cols'] = [{ wch: 30 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsRef, 'Statutory Reference');

  // Save the workbook
  XLSX.writeFile(wb, `Accruely_Leave_Accrual_${sanitizedName}_${dateStr}.xlsx`);
}

/**
 * Exports Leave Accrual Calculation to a clean, professional PDF workpaper.
 */
export function exportLeaveAccrualToPDF(
  inputs: LeaveAccrualInputs,
  results: LeaveAccrualResults
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const empName = inputs.employeeName?.trim() || 'John Smith';
  const sanitizedName = empName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = new Date().toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const stdPerDay = Number(inputs.standardHoursPerDay) || 7.6;
  const stdPerWeek = stdPerDay * 5;

  // Header Banner
  doc.setFillColor(234, 88, 12); // Orange-600
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('ACCRUELY', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('LEAVE ACCRUAL STATEMENT & WORKPAPER', 14, 18);

  doc.setFontSize(8);
  doc.text(`Generated: ${dateStr} ${timeStr}`, 196, 15, { align: 'right' });

  // Body Content Setup
  let y = 32;

  // Section 1: Employee Information Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 30, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('EMPLOYEE & PAY PERIOD PARAMETERS', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  doc.text('Employee Name:', 18, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(empName, 55, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Profile:', 18, y + 19);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(inputs.profile, 55, y + 19);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Pay Frequency:', 18, y + 25);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(inputs.payFrequency, 55, y + 25);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Std Hours / Day:', 120, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${formatNum(stdPerDay, 2)} hrs`, 165, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Total Period Hours:', 120, y + 19);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${formatNum(inputs.totalHoursForPeriod, 2)} hrs`, 165, y + 19);

  y += 36;

  // Section 2: Hours Worked & Paid Table
  doc.setFillColor(255, 247, 237); // orange-50
  doc.setDrawColor(254, 215, 170); // orange-200
  doc.roundedRect(14, y, 182, 38, 2, 2, 'FD');

  doc.setTextColor(154, 52, 18); // orange-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('HOURS WORKED & LEAVE TAKEN (THIS PAY RUN)', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  doc.text('• Ordinary Hours Worked:', 18, y + 13);
  doc.text(`${formatNum(inputs.ordinaryHours, 2)} hrs`, 85, y + 13, { align: 'right' });

  doc.text('• Public Holiday Hours:', 18, y + 19);
  doc.text(`${formatNum(inputs.publicHolidayHours, 2)} hrs`, 85, y + 19, { align: 'right' });

  doc.text('• Annual Leave Taken:', 105, y + 13);
  doc.text(`${formatNum(inputs.annualLeaveTaken, 2)} hrs`, 185, y + 13, { align: 'right' });

  doc.text('• Personal Leave Taken:', 105, y + 19);
  doc.text(`${formatNum(inputs.personalLeaveTaken, 2)} hrs`, 185, y + 19, { align: 'right' });

  // Divider inside section 2
  doc.setDrawColor(254, 215, 170);
  doc.line(18, y + 24, 192, y + 24);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(194, 65, 12);
  doc.text('TOTAL PAID HOURS (ACCRUABLE):', 18, y + 31);
  doc.setFontSize(10);
  doc.text(`${formatNum(results.totalPaidHours, 2)} hrs`, 85, y + 31, { align: 'right' });

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Leave Without Pay (LWOP):', 105, y + 31);
  doc.text(`${formatNum(results.leaveWithoutPayHours, 2)} hrs`, 185, y + 31, { align: 'right' });

  y += 44;

  // Section 3: Annual Leave Card
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 52, 2, 2, 'FD');

  doc.setFillColor(234, 88, 12);
  doc.rect(14, y, 182, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('ANNUAL LEAVE (AL) RECONCILIATION', 18, y + 5);
  doc.setFontSize(8);
  doc.text(`Accrual Rate: ${formatNum(results.annualLeaveAccrualRate, 6)} hrs/hr`, 190, y + 5, { align: 'right' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  doc.text('Opening Annual Leave Balance:', 18, y + 14);
  doc.text(`${formatNum(inputs.annualLeaveOpeningBalance, 4)} hrs`, 190, y + 14, { align: 'right' });

  doc.text('Add: Annual Leave Accrued This Pay Run:', 18, y + 20);
  doc.setTextColor(22, 101, 52); // green-800
  doc.text(`+${formatNum(results.annualLeaveAccrued, 4)} hrs`, 190, y + 20, { align: 'right' });

  doc.setTextColor(71, 85, 105);
  doc.text('Available Annual Leave Balance:', 18, y + 26);
  doc.text(`${formatNum(results.availableAnnualLeave, 4)} hrs`, 190, y + 26, { align: 'right' });

  doc.text('Less: Annual Leave Taken This Pay Run:', 18, y + 32);
  doc.setTextColor(185, 28, 28); // red-700
  doc.text(`−${formatNum(inputs.annualLeaveTaken, 2)} hrs`, 190, y + 32, { align: 'right' });

  doc.setDrawColor(226, 232, 240);
  doc.line(18, y + 36, 192, y + 36);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('CLOSING ANNUAL LEAVE BALANCE:', 18, y + 43);
  doc.setFontSize(11);
  doc.setTextColor(194, 65, 12);
  doc.text(`${formatNum(results.annualLeaveClosingBalance, 4)} hrs`, 190, y + 43, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Equivalent: ≈ ${formatNum(results.annualLeaveClosingBalance / stdPerDay, 2)} standard days | ${formatNum(results.annualLeaveClosingBalance / stdPerWeek, 2)} standard weeks`,
    18,
    y + 48
  );

  y += 58;

  // Section 4: Personal Leave Card
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 52, 2, 2, 'FD');

  doc.setFillColor(234, 88, 12);
  doc.rect(14, y, 182, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('PERSONAL / CARER\'S LEAVE (PL) RECONCILIATION', 18, y + 5);
  doc.setFontSize(8);
  doc.text(`Accrual Rate: ${formatNum(results.personalLeaveAccrualRate, 6)} hrs/hr`, 190, y + 5, { align: 'right' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  doc.text('Opening Personal Leave Balance:', 18, y + 14);
  doc.text(`${formatNum(inputs.personalLeaveOpeningBalance, 4)} hrs`, 190, y + 14, { align: 'right' });

  doc.text('Add: Personal Leave Accrued This Pay Run:', 18, y + 20);
  doc.setTextColor(22, 101, 52); // green-800
  doc.text(`+${formatNum(results.personalLeaveAccrued, 4)} hrs`, 190, y + 20, { align: 'right' });

  doc.setTextColor(71, 85, 105);
  doc.text('Available Personal Leave Balance:', 18, y + 26);
  doc.text(`${formatNum(results.availablePersonalLeave, 4)} hrs`, 190, y + 26, { align: 'right' });

  doc.text('Less: Personal Leave Taken This Pay Run:', 18, y + 32);
  doc.setTextColor(185, 28, 28); // red-700
  doc.text(`−${formatNum(inputs.personalLeaveTaken, 2)} hrs`, 190, y + 32, { align: 'right' });

  doc.setDrawColor(226, 232, 240);
  doc.line(18, y + 36, 192, y + 36);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('CLOSING PERSONAL LEAVE BALANCE:', 18, y + 43);
  doc.setFontSize(11);
  doc.setTextColor(194, 65, 12);
  doc.text(`${formatNum(results.personalLeaveClosingBalance, 4)} hrs`, 190, y + 43, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Equivalent: ≈ ${formatNum(results.personalLeaveClosingBalance / stdPerDay, 2)} standard days | ${formatNum(results.personalLeaveClosingBalance / stdPerWeek, 2)} standard weeks`,
    18,
    y + 48
  );

  y += 58;

  // Footer / Compliance Note
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 280, 196, 280);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Accruely Payroll Suite • Compliant with Fair Work Act 2009 National Employment Standards (NES) • Retain as payroll workpaper.',
    105,
    286,
    { align: 'center' }
  );

  // Save the PDF
  doc.save(`Accruely_Leave_Accrual_${sanitizedName}_${new Date().toISOString().split('T')[0]}.pdf`);
}
