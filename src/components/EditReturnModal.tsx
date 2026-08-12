import React, { useState } from 'react';
import { X, Calendar, RotateCcw, Clock, CheckCircle2 } from 'lucide-react';
import { Expense, ReturnStatus } from '../types';

interface EditReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense;
  onSave: (id: string, updates: Partial<Expense>) => void;
}

export const EditReturnModal: React.FC<EditReturnModalProps> = ({
  isOpen,
  onClose,
  expense,
  onSave,
}) => {
  if (!isOpen) return null;

  const [returnWindowDays, setReturnWindowDays] = useState(expense.returnWindowDays || 14);
  const [returnDeadline, setReturnDeadline] = useState(expense.returnDeadline || '');
  const [returnStatus, setReturnStatus] = useState<ReturnStatus>(expense.returnStatus || 'eligible');
  const [notes, setNotes] = useState(expense.notes || '');

  // Calculate deadline helper
  const handleRecalculateDeadline = (days: number) => {
    setReturnWindowDays(days);
    if (expense.transactionDate) {
      const transDate = new Date(expense.transactionDate);
      transDate.setDate(transDate.getDate() + days);
      const yyyy = transDate.getFullYear();
      const mm = String(transDate.getMonth() + 1).padStart(2, '0');
      const dd = String(transDate.getDate()).padStart(2, '0');
      setReturnDeadline(`${yyyy}-${mm}-${dd}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(expense.id, {
      returnWindowDays: Number(returnWindowDays),
      returnDeadline,
      returnStatus,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-md overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-base">Edit Return Window Details</h3>
              <p className="text-xs text-neutral-500">{expense.merchantName} • ₹{expense.totalAmount.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Return Policy Days
            </label>
            <div className="flex space-x-2 mb-2">
              {[7, 10, 14, 30, 45].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => handleRecalculateDeadline(days)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    returnWindowDays === days
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
            <input
              type="number"
              min={0}
              value={returnWindowDays}
              onChange={(e) => setReturnWindowDays(Number(e.target.value))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Return Deadline Date
            </label>
            <input
              type="date"
              value={returnDeadline}
              onChange={(e) => setReturnDeadline(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Return Window Status
            </label>
            <select
              value={returnStatus}
              onChange={(e) => setReturnStatus(e.target.value as ReturnStatus)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="eligible">Active Return Window (Eligible)</option>
              <option value="expiring_soon">Expiring Soon (≤ 3 Days)</option>
              <option value="return_requested">Return Requested with Merchant</option>
              <option value="returned">Returned & Refunded</option>
              <option value="expired">Return Window Expired</option>
              <option value="none">Not Returnable</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Return Notes / Tracking
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Kept original receipt in drawer; store accepts returns with physical tag..."
              className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              Save Return Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
