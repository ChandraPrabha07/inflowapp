import { Expense, TaxReportSummary, ReturnStatus, WarrantyStatus } from '../types';
import { getSupabaseClient } from './supabase';

export function getUserStorageKey(userId?: string): string {
  const id = userId || 'guest-local-user';
  return `inflow_expenses_${id}`;
}

export function getBudgetStorageKey(userId?: string): string {
  const id = userId || 'guest-local-user';
  return `inflow_budget_${id}`;
}

export function calculateReturnStatus(
  transactionDateStr: string,
  returnWindowDays: number,
  currentStatus?: ReturnStatus
): { status: ReturnStatus; deadline: string | undefined } {
  if (!returnWindowDays || returnWindowDays <= 0) {
    return { status: 'none', deadline: undefined };
  }

  if (currentStatus === 'returned' || currentStatus === 'return_requested') {
    const txDate = new Date(transactionDateStr);
    txDate.setDate(txDate.getDate() + returnWindowDays);
    return { status: currentStatus, deadline: txDate.toISOString().split('T')[0] };
  }

  const txDate = new Date(transactionDateStr);
  txDate.setDate(txDate.getDate() + returnWindowDays);
  const deadlineStr = txDate.toISOString().split('T')[0];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = txDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: 'expired', deadline: deadlineStr };
  } else if (diffDays <= 3) {
    return { status: 'expiring_soon', deadline: deadlineStr };
  } else {
    return { status: 'eligible', deadline: deadlineStr };
  }
}

export function calculateWarrantyStatus(
  transactionDateStr: string,
  warrantyMonths: number
): { status: WarrantyStatus; expiry: string | undefined } {
  if (!warrantyMonths || warrantyMonths <= 0) {
    return { status: 'none', expiry: undefined };
  }

  const txDate = new Date(transactionDateStr);
  txDate.setMonth(txDate.getMonth() + warrantyMonths);
  const expiryStr = txDate.toISOString().split('T')[0];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = txDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: 'expired', expiry: expiryStr };
  } else if (diffDays <= 30) {
    return { status: 'expiring_soon', expiry: expiryStr };
  } else {
    return { status: 'active', expiry: expiryStr };
  }
}

export function getSampleExpenses(): Expense[] {
  const today = new Date();

  // 1 day ago
  const d1 = new Date(today);
  d1.setDate(d1.getDate() - 1);
  const d1Str = d1.toISOString().split('T')[0];

  // 2 days ago
  const d2 = new Date(today);
  d2.setDate(d2.getDate() - 2);
  const d2Str = d2.toISOString().split('T')[0];

  // 3 days ago
  const d3 = new Date(today);
  d3.setDate(d3.getDate() - 3);
  const d3Str = d3.toISOString().split('T')[0];

  // 5 days ago
  const d4 = new Date(today);
  d4.setDate(d4.getDate() - 5);
  const d4Str = d4.toISOString().split('T')[0];

  // 7 days ago
  const d5 = new Date(today);
  d5.setDate(d5.getDate() - 7);
  const d5Str = d5.toISOString().split('T')[0];

  const sample1Return = calculateReturnStatus(d1Str, 7);
  const sample1Warranty = calculateWarrantyStatus(d1Str, 24);

  const sample2Return = calculateReturnStatus(d2Str, 7);
  const sample2Warranty = calculateWarrantyStatus(d2Str, 12);

  const sample3Return = calculateReturnStatus(d3Str, 7);
  const sample3Warranty = calculateWarrantyStatus(d3Str, 0);

  const sample4Return = calculateReturnStatus(d4Str, 30);
  const sample4Warranty = calculateWarrantyStatus(d4Str, 24);

  const sample5Return = calculateReturnStatus(d5Str, 0);
  const sample5Warranty = calculateWarrantyStatus(d5Str, 0);

  return [
    {
      id: 'exp-sample-1',
      merchantName: 'Croma Retail',
      transactionDate: d1Str,
      totalAmount: 64990,
      currency: 'INR',
      category: 'Electronics',
      gstAmount: 9913,
      gstin: '27AAACC0123P1ZH',
      isTaxDeductible: true,
      taxCategory: 'Hardware',
      paymentMethod: 'Credit Card',
      items: [
        { id: 'item-101', name: 'MacBook Air M2 8GB 256GB Space Grey', qty: 1, price: 62990, gstRate: 18 },
        { id: 'item-102', name: 'Croma ZipCare 2-Yr Extended Plan', qty: 1, price: 2000, gstRate: 18 },
      ],
      returnWindowDays: 7,
      returnStatus: sample1Return.status,
      returnDeadline: sample1Return.deadline,
      warrantyMonths: 24,
      warrantyStatus: sample1Warranty.status,
      warrantyExpiry: sample1Warranty.expiry,
      serialNumber: 'C02HG891Q6L4',
      modelNumber: 'MLXW3HN/A',
      notes: 'Purchased for client software development work. Claim GST Input Tax Credit.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'exp-sample-2',
      merchantName: 'Reliance Digital',
      transactionDate: d2Str,
      totalAmount: 34990,
      currency: 'INR',
      category: 'Electronics',
      gstAmount: 5337,
      gstin: '27AAACR0101M1ZA',
      isTaxDeductible: true,
      taxCategory: 'Office Supplies',
      paymentMethod: 'UPI',
      items: [
        { id: 'item-201', name: 'LG 27-inch 4K UHD IPS Monitor (USB-C)', qty: 1, price: 34990, gstRate: 18 },
      ],
      returnWindowDays: 7,
      returnStatus: sample2Return.status,
      returnDeadline: sample2Return.deadline,
      warrantyMonths: 12,
      warrantyStatus: sample2Warranty.status,
      warrantyExpiry: sample2Warranty.expiry,
      serialNumber: '304NTBK09231',
      modelNumber: '27UP850-W',
      notes: 'Primary office display screen. Check return window before 7 days if color calibration is off.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'exp-sample-3',
      merchantName: 'D-Mart',
      transactionDate: d3Str,
      totalAmount: 4850,
      currency: 'INR',
      category: 'Groceries',
      gstAmount: 242,
      gstin: '27AABCD3451K1Z9',
      isTaxDeductible: false,
      paymentMethod: 'Debit Card',
      items: [
        { id: 'item-301', name: 'Monthly Provisions & Dry Fruits', qty: 1, price: 3200, gstRate: 5 },
        { id: 'item-302', name: 'Cleaning Supplies & Detergent Pack', qty: 1, price: 1650, gstRate: 18 },
      ],
      returnWindowDays: 7,
      returnStatus: sample3Return.status,
      returnDeadline: sample3Return.deadline,
      warrantyMonths: 0,
      warrantyStatus: 'none',
      notes: 'Monthly kitchen groceries & household essentials.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'exp-sample-4',
      merchantName: 'Decathlon India',
      transactionDate: d4Str,
      totalAmount: 8999,
      currency: 'INR',
      category: 'Apparel',
      gstAmount: 1100,
      gstin: '29AAACD9981E1Z0',
      isTaxDeductible: false,
      paymentMethod: 'UPI',
      items: [
        { id: 'item-401', name: 'Ergonomic Treadmill Mat & Resistance Set', qty: 1, price: 3999, gstRate: 12 },
        { id: 'item-402', name: 'Kiprun Long Distance Running Shoes', qty: 1, price: 5000, gstRate: 12 },
      ],
      returnWindowDays: 30,
      returnStatus: sample4Return.status,
      returnDeadline: sample4Return.deadline,
      warrantyMonths: 24,
      warrantyStatus: sample4Warranty.status,
      warrantyExpiry: sample4Warranty.expiry,
      notes: '30 days return policy via Decathlon App membership.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'exp-sample-5',
      merchantName: 'Apollo Pharmacy',
      transactionDate: d5Str,
      totalAmount: 1840,
      currency: 'INR',
      category: 'Health',
      gstAmount: 220,
      gstin: '27AAACA1290N1Z3',
      isTaxDeductible: true,
      taxCategory: 'Medical',
      paymentMethod: 'UPI',
      items: [
        { id: 'item-501', name: 'Prescription Medicines & Vitamins', qty: 1, price: 1840, gstRate: 12 },
      ],
      returnWindowDays: 0,
      returnStatus: 'none',
      warrantyMonths: 0,
      warrantyStatus: 'none',
      notes: 'Annual health checkup supplements & wellness items.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export function loadExpenses(userId?: string): Expense[] {
  try {
    const key = getUserStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      // Returns empty array by default for clean user experience as requested.
      return [];
    }
    const expenses: Expense[] = JSON.parse(raw);

    // Re-evaluate return and warranty status dynamically based on current date
    return expenses.map((exp) => {
      const ret = calculateReturnStatus(exp.transactionDate, exp.returnWindowDays, exp.returnStatus);
      const war = calculateWarrantyStatus(exp.transactionDate, exp.warrantyMonths);
      return {
        ...exp,
        returnStatus: ret.status,
        returnDeadline: ret.deadline,
        warrantyStatus: war.status,
        warrantyExpiry: war.expiry,
      };
    });
  } catch (e) {
    console.error('Error loading expenses from storage:', e);
    return [];
  }
}

export function saveAllExpenses(expenses: Expense[], userId?: string): void {
  try {
    const key = getUserStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(expenses));

    // Asynchronously sync with Supabase 'expenses' table if user is logged in
    if (userId && userId !== 'guest-local-user') {
      syncExpensesToSupabase(expenses, userId);
    }
  } catch (e) {
    console.error('Error saving expenses to storage:', e);
  }
}

async function syncExpensesToSupabase(expenses: Expense[], userId: string) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    // Map to Supabase table row format
    const rows = expenses.map((e) => ({
      id: e.id,
      user_id: userId,
      merchant_name: e.merchantName,
      transaction_date: e.transactionDate,
      total_amount: e.totalAmount,
      currency: e.currency,
      category: e.category,
      gst_amount: e.gstAmount,
      gstin: e.gstin,
      is_tax_deductible: e.isTaxDeductible,
      tax_category: e.taxCategory,
      payment_method: e.paymentMethod,
      return_window_days: e.returnWindowDays,
      return_status: e.returnStatus,
      return_deadline: e.returnDeadline,
      warranty_months: e.warrantyMonths,
      warranty_status: e.warrantyStatus,
      warranty_expiry: e.warrantyExpiry,
      serial_number: e.serialNumber,
      model_number: e.modelNumber,
      notes: e.notes,
      items: e.items,
      updated_at: new Date().toISOString(),
    }));

    if (rows.length > 0) {
      await supabase.from('expenses').upsert(rows, { onConflict: 'id' });
    }
  } catch (err) {
    // Ignore if table is not created yet in Supabase SQL schema
    console.warn('Supabase expense table sync notice:', err);
  }
}

export function loadSampleExpensesForUser(userId?: string): Expense[] {
  const sample = getSampleExpenses();
  saveAllExpenses(sample, userId);
  return sample;
}

export function clearUserExpenses(userId?: string): void {
  try {
    const key = getUserStorageKey(userId);
    localStorage.removeItem(key);
  } catch (e) {
    console.error('Error clearing user expenses:', e);
  }
}

// Budget Limit Storage
export function getMonthlyBudgetLimit(userId?: string): number {
  try {
    const key = getBudgetStorageKey(userId);
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = Number(stored);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading monthly budget limit:', e);
  }
  return 30000; // Default budget limit ₹30,000
}

export function saveMonthlyBudgetLimit(limit: number, userId?: string): void {
  try {
    const key = getBudgetStorageKey(userId);
    localStorage.setItem(key, limit.toString());
  } catch (e) {
    console.error('Error saving monthly budget limit:', e);
  }
}

export function addExpense(
  expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'returnStatus' | 'returnDeadline' | 'warrantyStatus' | 'warrantyExpiry'>,
  userId?: string
): Expense {
  const expenses = loadExpenses(userId);

  const ret = calculateReturnStatus(expenseData.transactionDate, expenseData.returnWindowDays);
  const war = calculateWarrantyStatus(expenseData.transactionDate, expenseData.warrantyMonths);

  const newExpense: Expense = {
    ...expenseData,
    id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId,
    returnStatus: ret.status,
    returnDeadline: ret.deadline,
    warrantyStatus: war.status,
    warrantyExpiry: war.expiry,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  expenses.unshift(newExpense);
  saveAllExpenses(expenses, userId);
  return newExpense;
}

export function updateExpense(id: string, updates: Partial<Expense>, userId?: string): Expense | null {
  const expenses = loadExpenses(userId);
  const idx = expenses.findIndex((e) => e.id === id);
  if (idx === -1) return null;

  const existing = expenses[idx];
  const updatedTxDate = updates.transactionDate || existing.transactionDate;
  const updatedReturnDays = updates.returnWindowDays !== undefined ? updates.returnWindowDays : existing.returnWindowDays;
  const updatedWarrantyMonths = updates.warrantyMonths !== undefined ? updates.warrantyMonths : existing.warrantyMonths;

  const ret = calculateReturnStatus(updatedTxDate, updatedReturnDays, updates.returnStatus || existing.returnStatus);
  const war = calculateWarrantyStatus(updatedTxDate, updatedWarrantyMonths);

  const updated: Expense = {
    ...existing,
    ...updates,
    returnStatus: ret.status,
    returnDeadline: ret.deadline,
    warrantyStatus: war.status,
    warrantyExpiry: war.expiry,
    updatedAt: new Date().toISOString(),
  };

  expenses[idx] = updated;
  saveAllExpenses(expenses, userId);
  return updated;
}

export function deleteExpense(id: string, userId?: string): boolean {
  let expenses = loadExpenses(userId);
  const initialLength = expenses.length;
  expenses = expenses.filter((e) => e.id !== id);
  saveAllExpenses(expenses, userId);

  if (userId && userId !== 'guest-local-user') {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        supabase.from('expenses').delete().eq('id', id).eq('user_id', userId).then();
      }
    } catch (e) {
      console.warn('Supabase delete expense notice:', e);
    }
  }

  return expenses.length < initialLength;
}

export function generateTaxReportSummary(expenses: Expense[]): TaxReportSummary {
  let totalSpending = 0;
  let totalTaxDeductible = 0;
  let totalGstPaid = 0;
  let claimableGst = 0;
  let deductibleItemCount = 0;

  const categoryMap: Record<string, { total: number; deductible: number }> = {};

  expenses.forEach((exp) => {
    totalSpending += exp.totalAmount;
    totalGstPaid += exp.gstAmount || 0;

    if (!categoryMap[exp.category]) {
      categoryMap[exp.category] = { total: 0, deductible: 0 };
    }
    categoryMap[exp.category].total += exp.totalAmount;

    if (exp.isTaxDeductible) {
      totalTaxDeductible += exp.totalAmount;
      claimableGst += exp.gstAmount || 0;
      deductibleItemCount++;
      categoryMap[exp.category].deductible += exp.totalAmount;
    }
  });

  const categoryBreakdown = Object.keys(categoryMap).map((cat) => ({
    category: cat,
    amount: categoryMap[cat].total,
    deductibleAmount: categoryMap[cat].deductible,
  }));

  return {
    totalSpending,
    totalTaxDeductible,
    totalGstPaid,
    claimableGst,
    categoryBreakdown,
    itemCount: expenses.length,
    deductibleItemCount,
  };
}

export function exportExpensesToCSV(expenses: Expense[]): void {
  const headers = [
    'Expense ID',
    'Date',
    'Merchant Name',
    'Category',
    'Total Amount (INR)',
    'GST Amount (INR)',
    'GSTIN',
    'Is Tax Deductible',
    'Tax Category',
    'Payment Method',
    'Return Days',
    'Return Deadline',
    'Return Status',
    'Warranty Months',
    'Warranty Expiry',
    'Warranty Status',
    'Serial Number',
    'Model Number',
    'Notes',
  ];

  const rows = expenses.map((e) => [
    `"${e.id}"`,
    `"${e.transactionDate}"`,
    `"${e.merchantName.replace(/"/g, '""')}"`,
    `"${e.category}"`,
    e.totalAmount,
    e.gstAmount || 0,
    `"${e.gstin || ''}"`,
    e.isTaxDeductible ? 'YES' : 'NO',
    `"${e.taxCategory || ''}"`,
    `"${e.paymentMethod}"`,
    e.returnWindowDays,
    `"${e.returnDeadline || ''}"`,
    `"${e.returnStatus}"`,
    e.warrantyMonths,
    `"${e.warrantyExpiry || ''}"`,
    `"${e.warrantyStatus}"`,
    `"${e.serialNumber || ''}"`,
    `"${e.modelNumber || ''}"`,
    `"${(e.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `inflow_expenses_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportExpensesToJSON(expenses: Expense[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(expenses, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `inflow_backup_ledger_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function importExpensesFromJSON(jsonString: string, userId?: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      return { success: false, count: 0, error: 'JSON backup file must contain an array of expenses.' };
    }
    saveAllExpenses(parsed, userId);
    return { success: true, count: parsed.length };
  } catch (e: any) {
    return { success: false, count: 0, error: e.message || 'Invalid JSON syntax.' };
  }
}
