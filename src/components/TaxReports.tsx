import React from 'react';
import {
  FileSpreadsheet,
  Download,
  Briefcase,
  IndianRupee,
  Building2,
  CheckCircle2,
  AlertCircle,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { Expense } from '../types';
import { generateTaxReportSummary, exportExpensesToCSV } from '../lib/storage';

interface TaxReportsProps {
  expenses: Expense[];
}

export const TaxReports: React.FC<TaxReportsProps> = ({ expenses }) => {
  const summary = generateTaxReportSummary(expenses);
  const deductibleExpenses = expenses.filter((e) => e.isTaxDeductible);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold flex-shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900">Tax & Business Expense Summary</h2>
            <p className="text-xs text-neutral-600 mt-0.5">
              Organize tax-deductible purchases, track GST Input Tax Credits (ITC), and generate clean reports for your accounting or CA.
            </p>
          </div>
        </div>

        <button
          onClick={() => exportExpensesToCSV(expenses)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center space-x-2 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Download Tax Ledger CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Tax Deductible</p>
          <p className="text-2xl font-bold text-emerald-700">₹{summary.totalTaxDeductible.toLocaleString('en-IN')}</p>
          <p className="text-xs text-neutral-500">{summary.deductibleItemCount} Deductible Invoices</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Claimable GST (ITC)</p>
          <p className="text-2xl font-bold text-emerald-700">₹{summary.claimableGst.toLocaleString('en-IN')}</p>
          <p className="text-xs text-neutral-500">Input Tax Credit</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Ledger Volume</p>
          <p className="text-2xl font-bold text-neutral-900">₹{summary.totalSpending.toLocaleString('en-IN')}</p>
          <p className="text-xs text-neutral-500">{summary.itemCount} Total Purchases</p>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-5 space-y-4">
        <h3 className="font-bold text-neutral-900 text-sm">Category Tax Deductions Breakdown</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase font-semibold">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3">Total Spent</th>
                <th className="p-3">Deductible Portion</th>
                <th className="p-3">Deduction %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {summary.categoryBreakdown.map((row) => {
                const percentage = row.amount > 0 ? Math.round((row.deductibleAmount / row.amount) * 100) : 0;
                return (
                  <tr key={row.category} className="hover:bg-neutral-50/80">
                    <td className="p-3 font-bold text-neutral-900">{row.category}</td>
                    <td className="p-3 text-neutral-700">₹{row.amount.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-bold text-emerald-700">₹{row.deductibleAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-neutral-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="font-semibold text-neutral-700">{percentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax Deductible Items Ledger */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-neutral-900 text-sm">Flagged Business Expense Invoices ({deductibleExpenses.length})</h3>
          <span className="text-xs text-neutral-500">GST Input Tax Credit Eligible</span>
        </div>

        {deductibleExpenses.length === 0 ? (
          <p className="text-xs text-neutral-500 italic py-4">No purchases currently flagged as tax-deductible.</p>
        ) : (
          <div className="divide-y divide-neutral-100 text-xs">
            {deductibleExpenses.map((exp) => (
              <div key={exp.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-neutral-900">{exp.merchantName}</p>
                  <p className="text-neutral-500">
                    {exp.transactionDate} • {exp.taxCategory || 'Work Expense'}
                    {exp.gstin && ` • GSTIN: ${exp.gstin}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-neutral-900">₹{exp.totalAmount.toLocaleString('en-IN')}</p>
                  <p className="text-emerald-700 text-[11px] font-medium">GST: ₹{exp.gstAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
