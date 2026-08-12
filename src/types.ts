export type ExpenseCategory =
  | 'Groceries'
  | 'Electronics'
  | 'Dining'
  | 'Fuel'
  | 'Health'
  | 'Apparel'
  | 'Home & Living'
  | 'Utilities'
  | 'Entertainment'
  | 'Office/Business'
  | 'Other';

export type PaymentMethod =
  | 'UPI'
  | 'Credit Card'
  | 'Debit Card'
  | 'Net Banking'
  | 'Cash';

export type ReturnStatus =
  | 'none'
  | 'eligible'
  | 'expiring_soon'
  | 'expired'
  | 'return_requested'
  | 'returned';

export type WarrantyStatus = 'none' | 'active' | 'expiring_soon' | 'expired';

export interface ItemizedDetail {
  id: string;
  name: string;
  qty: number;
  price: number;
  gstRate?: number;
}

export interface Expense {
  id: string;
  userId?: string;
  merchantName: string;
  transactionDate: string; // YYYY-MM-DD
  totalAmount: number;
  currency: string; // e.g. 'INR'
  category: ExpenseCategory;
  gstAmount: number;
  gstin?: string;
  isTaxDeductible: boolean;
  taxCategory?:
    | 'Work Expense'
    | 'Business Travel'
    | 'Software & Subscriptions'
    | 'Hardware'
    | 'Medical'
    | 'Office Supplies'
    | 'Other';
  paymentMethod: PaymentMethod;
  items: ItemizedDetail[];
  
  // Return policy tracking
  returnWindowDays: number; // e.g. 7, 14, 30, 0
  returnStatus: ReturnStatus;
  returnDeadline?: string; // calculated YYYY-MM-DD
  
  // Warranty tracking
  warrantyMonths: number; // e.g. 12, 24, 36, 0
  warrantyStatus: WarrantyStatus;
  warrantyExpiry?: string; // calculated YYYY-MM-DD
  serialNumber?: string;
  modelNumber?: string;
  
  notes?: string;
  receiptImage?: string; // Base64 or URL
  rawReceiptText?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFilter {
  searchQuery: string;
  category: string;
  taxDeductibleOnly: boolean;
  returnEligibleOnly: boolean;
  activeWarrantyOnly: boolean;
  sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'return_deadline' | 'warranty_expiry';
}

export interface UserAuth {
  id: string;
  email: string;
  fullName?: string;
  isGuest: boolean;
  authProvider: 'supabase' | 'local';
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

export interface VendorPreset {
  id: string;
  name: string;
  category: ExpenseCategory;
  defaultReturnDays: number;
  defaultWarrantyMonths: number;
  badgeBg: string;
  badgeTextColor: string;
  returnGuidelines: string;
  warrantyGuidelines: string;
}

export interface TaxReportSummary {
  totalSpending: number;
  totalTaxDeductible: number;
  totalGstPaid: number;
  claimableGst: number;
  categoryBreakdown: { category: string; amount: number; deductibleAmount: number }[];
  itemCount: number;
  deductibleItemCount: number;
}
