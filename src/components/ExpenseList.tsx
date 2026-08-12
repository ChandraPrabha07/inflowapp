import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Receipt,
  RotateCcw,
  Shield,
  Briefcase,
  IndianRupee,
  Calendar,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  Grid,
  List,
  Building2,
  Tag,
  ExternalLink,
  X,
  Sparkles,
} from 'lucide-react';
import { Expense, ExpenseCategory, UserAuth } from '../types';
import { MonthlyBudgetWidget } from './MonthlyBudgetWidget';

interface ExpenseListProps {
  expenses: Expense[];
  user: UserAuth;
  onDeleteExpense: (id: string) => void;
  onUpdateExpenseStatus: (id: string, updates: Partial<Expense>) => void;
  onOpenScanner: () => void;
  onLoadSampleData: () => void;
  onRefreshExpenses?: () => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  user,
  onDeleteExpense,
  onUpdateExpenseStatus,
  onOpenScanner,
  onLoadSampleData,
  onRefreshExpenses,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [taxDeductibleOnly, setTaxDeductibleOnly] = useState(false);
  const [returnEligibleOnly, setReturnEligibleOnly] = useState(false);
  const [activeWarrantyOnly, setActiveWarrantyOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [viewStyle, setViewStyle] = useState<'cards' | 'table'>('cards');
  
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Filtered & Sorted list
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        const matchesSearch =
          exp.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (exp.serialNumber && exp.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (exp.notes && exp.notes.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesSearch) return false;

        if (selectedCategory !== 'all' && exp.category !== selectedCategory) {
          return false;
        }

        if (taxDeductibleOnly && !exp.isTaxDeductible) {
          return false;
        }

        if (
          returnEligibleOnly &&
          (exp.returnStatus === 'none' || exp.returnStatus === 'expired' || exp.returnStatus === 'returned')
        ) {
          return false;
        }

        if (
          activeWarrantyOnly &&
          (exp.warrantyStatus === 'none' || exp.warrantyStatus === 'expired')
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime();
        if (sortBy === 'date_asc') return new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime();
        if (sortBy === 'amount_desc') return b.totalAmount - a.totalAmount;
        if (sortBy === 'amount_asc') return a.totalAmount - b.totalAmount;
        return 0;
      });
  }, [
    expenses,
    searchQuery,
    selectedCategory,
    taxDeductibleOnly,
    returnEligibleOnly,
    activeWarrantyOnly,
    sortBy,
  ]);

  // Overall statistics
  const stats = useMemo(() => {
    let total = 0;
    let returnAlerts = 0;
    let activeWarranties = 0;
    let totalTaxDeductible = 0;

    expenses.forEach((e) => {
      total += e.totalAmount;
      if (e.returnStatus === 'expiring_soon' || e.returnStatus === 'eligible') {
        returnAlerts++;
      }
      if (e.warrantyStatus === 'active' || e.warrantyStatus === 'expiring_soon') {
        activeWarranties++;
      }
      if (e.isTaxDeductible) {
        totalTaxDeductible += e.totalAmount;
      }
    });

    return { total, returnAlerts, activeWarranties, totalTaxDeductible };
  }, [expenses]);

  return (
    <div className="space-y-6">
      {/* MONTHLY EXPENSE BUDGET & ALERT TRACKER */}
      <MonthlyBudgetWidget
        expenses={expenses}
        user={user}
        onBudgetUpdated={onRefreshExpenses}
      />

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Spending</p>
            <p className="text-xl font-bold text-neutral-900 mt-1">₹{stats.total.toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">{expenses.length} Total Receipts Logged</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Return Deadline Alerts</p>
            <p className="text-xl font-bold text-amber-900 mt-1">{stats.returnAlerts} Items</p>
            <p className="text-[11px] text-amber-600 mt-0.5">Active Return Window</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <RotateCcw className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-sky-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-sky-700 uppercase tracking-wider">Active Warranties</p>
            <p className="text-xl font-bold text-sky-900 mt-1">{stats.activeWarranties} Products</p>
            <p className="text-[11px] text-sky-600 mt-0.5">Protected Coverage</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Tax Deductible</p>
            <p className="text-xl font-bold text-emerald-900 mt-1">₹{stats.totalTaxDeductible.toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-emerald-600 mt-0.5">Business & Work Claims</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search store, category, serial number, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-xl text-xs font-medium bg-white text-neutral-800 outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Groceries">Groceries</option>
              <option value="Dining">Dining</option>
              <option value="Health">Health</option>
              <option value="Apparel">Apparel</option>
              <option value="Home & Living">Home & Living</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-neutral-300 rounded-xl text-xs font-medium bg-white text-neutral-800 outline-none"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
            </select>

            <div className="flex border border-neutral-200 rounded-xl p-0.5 bg-neutral-50">
              <button
                onClick={() => setViewStyle('cards')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewStyle === 'cards' ? 'bg-white shadow-xs text-neutral-900' : 'text-neutral-500'
                }`}
                title="Card View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewStyle('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewStyle === 'table' ? 'bg-white shadow-xs text-neutral-900' : 'text-neutral-500'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Toggle Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100 text-xs">
          <button
            onClick={() => setReturnEligibleOnly(!returnEligibleOnly)}
            className={`px-3 py-1 rounded-full border transition-colors flex items-center space-x-1 ${
              returnEligibleOnly
                ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <RotateCcw className="w-3 h-3" />
            <span>Return Window Open Only</span>
          </button>

          <button
            onClick={() => setActiveWarrantyOnly(!activeWarrantyOnly)}
            className={`px-3 py-1 rounded-full border transition-colors flex items-center space-x-1 ${
              activeWarrantyOnly
                ? 'bg-sky-100 border-sky-300 text-sky-900 font-bold'
                : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>Active Warranty Only</span>
          </button>

          <button
            onClick={() => setTaxDeductibleOnly(!taxDeductibleOnly)}
            className={`px-3 py-1 rounded-full border transition-colors flex items-center space-x-1 ${
              taxDeductibleOnly
                ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold'
                : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Briefcase className="w-3 h-3" />
            <span>Tax Deductible Only</span>
          </button>

          {expenses.length > 0 && (
            <button
              onClick={onLoadSampleData}
              className="ml-auto px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full border border-neutral-300 font-medium flex items-center space-x-1 transition-colors"
              title="Add sample bills for testing"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Load Sample Bills</span>
            </button>
          )}
        </div>
      </div>

      {/* Expense List Display */}
      {expenses.length === 0 ? (
        /* CLEAN EMPTY STATE FOR USER LEDGER */
        <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center">
            <Receipt className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-neutral-900 text-lg">
              Welcome{user.fullName ? `, ${user.fullName}` : ''}! Your Expense Ledger is Empty
            </h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Your bills and receipts are stored isolated under account <span className="font-semibold text-neutral-800">{user.email}</span>. Start scanning receipts or load sample bills to test features.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenScanner}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer shadow-xs inline-flex items-center space-x-2 transition-all"
            >
              <Receipt className="w-4 h-4" />
              <span>Scan Bill / Add Expense</span>
            </button>

            <button
              onClick={onLoadSampleData}
              className="bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer shadow-xs inline-flex items-center space-x-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Test with Sample Data</span>
            </button>
          </div>
        </div>
      ) : filteredExpenses.length === 0 ? (
        /* SEARCH / FILTER EMPTY STATE */
        <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <p className="font-bold text-neutral-800 text-base">No matching expenses found</p>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Try adjusting your search query or filters.
          </p>
        </div>
      ) : viewStyle === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              onClick={() => setSelectedExpense(expense)}
              className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs hover:border-neutral-300 transition-all cursor-pointer flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-neutral-900 text-base">{expense.merchantName}</h3>
                    <p className="text-xs text-neutral-500 flex items-center space-x-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{expense.transactionDate}</span>
                      <span>•</span>
                      <span>{expense.paymentMethod}</span>
                    </p>
                  </div>
                  <span className="font-extrabold text-neutral-900 text-base">
                    ₹{expense.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-neutral-100 text-neutral-700">
                    {expense.category}
                  </span>

                  {expense.isTaxDeductible && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Tax Claimable
                    </span>
                  )}

                  {expense.returnStatus === 'expiring_soon' && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      Return Expiring Soon!
                    </span>
                  )}

                  {expense.returnStatus === 'eligible' && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-100 text-emerald-800">
                      {expense.returnWindowDays}d Return Window
                    </span>
                  )}

                  {expense.warrantyStatus === 'active' && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-sky-100 text-sky-800">
                      {expense.warrantyMonths}m Warranty
                    </span>
                  )}
                </div>

                {/* Items Summary */}
                <p className="text-xs text-neutral-600 line-clamp-1 mt-2.5">
                  {expense.items && expense.items.length > 0
                    ? expense.items.map((i) => `${i.qty}x ${i.name}`).join(', ')
                    : '1 Itemized Purchase'}
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span>View Full Details</span>
                <Eye className="w-4 h-4 text-neutral-400" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase font-semibold">
              <tr>
                <th className="p-3">Merchant</th>
                <th className="p-3">Date</th>
                <th className="p-3">Category</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Return Window</th>
                <th className="p-3">Warranty</th>
                <th className="p-3">Tax Flag</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="p-3 font-bold text-neutral-900">{expense.merchantName}</td>
                  <td className="p-3 text-neutral-600">{expense.transactionDate}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md text-[11px] bg-neutral-100 text-neutral-700">
                      {expense.category}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-neutral-900">₹{expense.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="p-3">
                    {expense.returnStatus === 'expiring_soon' ? (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800">
                        Expiring Soon
                      </span>
                    ) : expense.returnStatus === 'eligible' ? (
                      <span className="px-2 py-0.5 rounded-md text-[11px] bg-emerald-100 text-emerald-800">
                        {expense.returnDeadline}
                      </span>
                    ) : (
                      <span className="text-neutral-400">Expired / None</span>
                    )}
                  </td>
                  <td className="p-3">
                    {expense.warrantyStatus === 'active' ? (
                      <span className="px-2 py-0.5 rounded-md text-[11px] bg-sky-100 text-sky-800">
                        Until {expense.warrantyExpiry}
                      </span>
                    ) : (
                      <span className="text-neutral-400">None</span>
                    )}
                  </td>
                  <td className="p-3">
                    {expense.isTaxDeductible ? (
                      <span className="px-2 py-0.5 rounded-md text-[11px] bg-emerald-100 text-emerald-800 font-semibold">
                        Yes
                      </span>
                    ) : (
                      <span className="text-neutral-400">No</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setSelectedExpense(expense)}
                      className="px-2.5 py-1 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg font-medium transition-colors cursor-pointer"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Expense Detail Modal */}
      {selectedExpense && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white font-bold flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-base">{selectedExpense.merchantName}</h3>
                  <p className="text-xs text-neutral-500">{selectedExpense.transactionDate} • {selectedExpense.paymentMethod}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedExpense(null)}
                className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg hover:bg-neutral-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-xs text-neutral-500 font-medium">Total Amount Paid</span>
                <span className="text-xl font-extrabold text-neutral-900">₹{selectedExpense.totalAmount.toLocaleString('en-IN')}</span>
              </div>

              {/* Status Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-1">
                  <p className="text-[11px] font-semibold text-neutral-500">Return Window</p>
                  <p className="font-bold text-neutral-900">
                    {selectedExpense.returnStatus === 'returned'
                      ? 'Item Returned & Refunded'
                      : selectedExpense.returnStatus === 'return_requested'
                      ? 'Return Request Submitted'
                      : selectedExpense.returnDeadline
                      ? `Deadline: ${selectedExpense.returnDeadline}`
                      : 'No Return Window'}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-1">
                  <p className="text-[11px] font-semibold text-neutral-500">Warranty Coverage</p>
                  <p className="font-bold text-neutral-900">
                    {selectedExpense.warrantyExpiry
                      ? `Valid until ${selectedExpense.warrantyExpiry}`
                      : 'No Active Warranty'}
                  </p>
                </div>
              </div>

              {/* Serial & Model Number */}
              {(selectedExpense.serialNumber || selectedExpense.modelNumber) && (
                <div className="p-3 bg-neutral-100 rounded-xl space-y-1 text-xs">
                  {selectedExpense.serialNumber && (
                    <p className="text-neutral-700">
                      <span className="font-semibold">Serial Number:</span> {selectedExpense.serialNumber}
                    </p>
                  )}
                  {selectedExpense.modelNumber && (
                    <p className="text-neutral-700">
                      <span className="font-semibold">Model Number:</span> {selectedExpense.modelNumber}
                    </p>
                  )}
                </div>
              )}

              {/* Itemized list */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500 mb-2">Itemized Breakdown</h4>
                <div className="border border-neutral-200 rounded-xl divide-y divide-neutral-100 text-xs">
                  {selectedExpense.items.map((item) => (
                    <div key={item.id} className="p-2.5 flex items-center justify-between">
                      <span className="font-medium text-neutral-800">{item.qty}x {item.name}</span>
                      <span className="font-semibold text-neutral-900">₹{item.price.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* GST & Notes */}
              {selectedExpense.isTaxDeductible && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <p className="font-bold">Tax Deductible Expense ({selectedExpense.taxCategory || 'Work'})</p>
                  <p>GST Paid: ₹{selectedExpense.gstAmount?.toLocaleString('en-IN')}</p>
                  {selectedExpense.gstin && <p>Merchant GSTIN: {selectedExpense.gstin}</p>}
                </div>
              )}

              {selectedExpense.notes && (
                <p className="text-xs text-neutral-600 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  <span className="font-semibold text-neutral-800">Notes: </span>
                  {selectedExpense.notes}
                </p>
              )}

              {selectedExpense.receiptImage && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500 mb-2">Receipt Scan</h4>
                  <img
                    src={selectedExpense.receiptImage}
                    alt="Receipt"
                    className="max-h-48 rounded-xl border border-neutral-200 object-contain mx-auto"
                  />
                </div>
              )}
            </div>

            <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between">
              <button
                onClick={() => {
                  onDeleteExpense(selectedExpense.id);
                  setSelectedExpense(null);
                }}
                className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Entry</span>
              </button>

              <button
                onClick={() => setSelectedExpense(null)}
                className="bg-neutral-900 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
