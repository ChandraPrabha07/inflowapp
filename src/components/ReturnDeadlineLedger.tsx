import React, { useState } from 'react';
import {
  RotateCcw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Edit,
  Mail,
  PlusCircle,
} from 'lucide-react';
import { Expense, UserAuth } from '../types';
import { EditReturnModal } from './EditReturnModal';
import { ReturnEmailModal } from './ReturnEmailModal';

interface ReturnDeadlineLedgerProps {
  expenses: Expense[];
  user: UserAuth;
  onUpdateStatus: (id: string, updates: Partial<Expense>) => void;
  onOpenScanner: () => void;
}

export const ReturnDeadlineLedger: React.FC<ReturnDeadlineLedgerProps> = ({
  expenses,
  user,
  onUpdateStatus,
  onOpenScanner,
}) => {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [emailExpense, setEmailExpense] = useState<Expense | null>(null);

  // Filter items with return windows or returnable status
  const returnEligibleExpenses = expenses.filter(
    (e) => (e.returnWindowDays > 0 || e.returnDeadline) && e.returnStatus !== 'none'
  );

  const expiringSoon = returnEligibleExpenses.filter((e) => e.returnStatus === 'expiring_soon');
  const activeEligible = returnEligibleExpenses.filter((e) => e.returnStatus === 'eligible');
  const returnedOrRequested = returnEligibleExpenses.filter(
    (e) => e.returnStatus === 'return_requested' || e.returnStatus === 'returned'
  );
  const expired = returnEligibleExpenses.filter((e) => e.returnStatus === 'expired');

  const getDaysRemaining = (deadlineStr?: string) => {
    if (!deadlineStr) return 0;
    const deadline = new Date(deadlineStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900">Return Window Deadline Ledger</h2>
            <p className="text-xs text-neutral-600 mt-0.5">
              Monitor store return windows, edit return deadlines, and generate customized return request emails with reason details.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-white px-3.5 py-1.5 rounded-xl border border-amber-200 text-center">
            <p className="text-xs font-bold text-amber-900">{expiringSoon.length} Items</p>
            <p className="text-[10px] text-amber-700">Expiring ≤ 3 Days</p>
          </div>
          <div className="bg-white px-3.5 py-1.5 rounded-xl border border-neutral-200 text-center">
            <p className="text-xs font-bold text-neutral-900">{activeEligible.length} Items</p>
            <p className="text-[10px] text-neutral-500">Active Returnable</p>
          </div>
        </div>
      </div>

      {/* Immediate Attention List */}
      {expiringSoon.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>Urgent: Return Windows Closing Soon (≤ 3 Days Remaining)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expiringSoon.map((exp) => {
              const daysLeft = getDaysRemaining(exp.returnDeadline);

              return (
                <div
                  key={exp.id}
                  className="bg-white border-2 border-amber-400 rounded-2xl p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        {daysLeft <= 0 ? 'Last Day Today!' : `${daysLeft} Days Remaining`}
                      </span>
                      <h3 className="font-bold text-neutral-900 text-base mt-1.5">{exp.merchantName}</h3>
                      <p className="text-xs text-neutral-500">
                        Purchased {exp.transactionDate} • Deadline: <span className="font-semibold text-neutral-800">{exp.returnDeadline}</span>
                      </p>
                    </div>
                    <span className="font-extrabold text-neutral-900 text-base">
                      ₹{exp.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 line-clamp-1">
                    {exp.items.map((i) => i.name).join(', ')}
                  </p>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-100">
                    <button
                      onClick={() => setEditingExpense(exp)}
                      className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Return Window</span>
                    </button>
                    <button
                      onClick={() => setEmailExpense(exp)}
                      className="bg-amber-600 hover:bg-amber-700 text-white py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Generate Return Email</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Eligible Returns */}
      <div className="space-y-3">
        <h3 className="font-bold text-neutral-900 text-sm">Active Returnable Purchases</h3>

        {activeEligible.length === 0 && expiringSoon.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200 space-y-2">
            <RotateCcw className="w-8 h-8 text-neutral-400 mx-auto" />
            <p className="font-bold text-neutral-800 text-sm">No Active Return Deadlines</p>
            <p className="text-xs text-neutral-500">
              When you scan or log expenses with a return window, they will appear here with editing options and email generation tools.
            </p>
            <button
              onClick={onOpenScanner}
              className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add / Scan Expense</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeEligible.map((exp) => {
              const daysLeft = getDaysRemaining(exp.returnDeadline);
              return (
                <div
                  key={exp.id}
                  className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs space-y-3 hover:border-neutral-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          {daysLeft} Days Left ({exp.returnWindowDays || 14}-Day Window)
                        </span>
                        <h4 className="font-bold text-neutral-900 text-sm mt-1">{exp.merchantName}</h4>
                        <p className="text-[11px] text-neutral-500">Deadline: <span className="font-medium text-neutral-700">{exp.returnDeadline || 'Not Set'}</span></p>
                      </div>
                      <span className="font-extrabold text-neutral-900 text-sm">
                        ₹{exp.totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 line-clamp-1">
                      {exp.items.map((i) => i.name).join(', ')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-neutral-100 space-y-1.5">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setEditingExpense(exp)}
                        className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit Options</span>
                      </button>

                      <button
                        onClick={() => setEmailExpense(exp)}
                        className="bg-amber-600 hover:bg-amber-700 text-white py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Mail className="w-3 h-3" />
                        <span>Return Email</span>
                      </button>
                    </div>

                    <button
                      onClick={() => onUpdateStatus(exp.id, { returnStatus: 'returned' })}
                      className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-1 rounded-xl text-xs font-semibold"
                    >
                      Mark Returned & Refunded
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Returned / Refunded History */}
      {returnedOrRequested.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-neutral-200">
          <h3 className="font-bold text-neutral-900 text-sm">Returned / Exchange History</h3>
          <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100 text-xs">
            {returnedOrRequested.map((exp) => (
              <div key={exp.id} className="p-3.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-neutral-900">{exp.merchantName}</p>
                  <p className="text-neutral-500">{exp.transactionDate} • ₹{exp.totalAmount.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{exp.returnStatus === 'returned' ? 'Returned & Refunded' : 'Return Requested'}</span>
                  </span>
                  <button
                    onClick={() => setEditingExpense(exp)}
                    className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
                    title="Edit Return Status"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {editingExpense && (
        <EditReturnModal
          isOpen={Boolean(editingExpense)}
          onClose={() => setEditingExpense(null)}
          expense={editingExpense}
          onSave={onUpdateStatus}
        />
      )}

      {emailExpense && (
        <ReturnEmailModal
          isOpen={Boolean(emailExpense)}
          onClose={() => setEmailExpense(null)}
          expense={emailExpense}
          user={user}
        />
      )}
    </div>
  );
};
