import React, { useState, useEffect } from 'react';
import {
  Wallet,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Edit2,
  Check,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Expense, UserAuth } from '../types';
import { getMonthlyBudgetLimit, saveMonthlyBudgetLimit } from '../lib/storage';

interface MonthlyBudgetWidgetProps {
  expenses: Expense[];
  user: UserAuth;
  onBudgetUpdated?: () => void;
}

export const MonthlyBudgetWidget: React.FC<MonthlyBudgetWidgetProps> = ({
  expenses,
  user,
  onBudgetUpdated,
}) => {
  const [budgetLimit, setBudgetLimit] = useState<number>(30000);
  const [isEditing, setIsEditing] = useState(false);
  const [tempLimit, setTempLimit] = useState<string>('30000');

  useEffect(() => {
    const limit = getMonthlyBudgetLimit(user.id);
    setBudgetLimit(limit);
    setTempLimit(limit.toString());
  }, [user.id]);

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(tempLimit);
    if (!isNaN(parsed) && parsed > 0) {
      setBudgetLimit(parsed);
      saveMonthlyBudgetLimit(parsed, user.id);
      setIsEditing(false);
      if (onBudgetUpdated) onBudgetUpdated();
    }
  };

  // Date Math for Current Month and Month End
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth(); // 0-indexed
  const currentDay = now.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonthName = monthNames[currentMonthIdx];

  // Days in current month & days remaining
  const totalDaysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
  const daysRemaining = totalDaysInMonth - currentDay;

  // Robust current month expense filter (handles YYYY-MM-DD or standard Date strings)
  const currentMonthExpenses = expenses.filter((e) => {
    if (!e.transactionDate) return false;
    // Parse expense date
    const d = new Date(e.transactionDate);
    if (isNaN(d.getTime())) {
      // Fallback string check
      const yyyy = currentYear;
      const mm = String(currentMonthIdx + 1).padStart(2, '0');
      return e.transactionDate.startsWith(`${yyyy}-${mm}`);
    }
    return d.getFullYear() === currentYear && d.getMonth() === currentMonthIdx;
  });

  const currentMonthSpent = currentMonthExpenses.reduce((sum, e) => sum + e.totalAmount, 0);
  const totalAllTimeSpent = expenses.reduce((sum, e) => sum + e.totalAmount, 0);

  const percentSpent = Math.min(100, Math.round((currentMonthSpent / budgetLimit) * 100));
  const isExceeded = currentMonthSpent > budgetLimit;
  const isWarning = !isExceeded && currentMonthSpent >= budgetLimit * 0.8;
  const isNormal = !isExceeded && !isWarning;

  const overBudgetAmount = currentMonthSpent - budgetLimit;
  const remainingBudget = Math.max(0, budgetLimit - currentMonthSpent);
  const safeDailyAllowance = daysRemaining > 0 ? Math.round(remainingBudget / daysRemaining) : 0;

  return (
    <div className="space-y-3">
      {/* EXCEEDED BUDGET / WARNING ALERT NOTIFICATION BANNER */}
      {isExceeded && (
        <div className="p-4 bg-red-500/10 border-2 border-red-500 rounded-2xl text-red-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-xs">
              <AlertOctagon className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600 text-white uppercase tracking-wider">
                  Budget Limit Exceeded
                </span>
                <span className="text-xs font-mono font-bold text-red-700">
                  {percentSpent}% Spent
                </span>
              </div>
              <h4 className="text-sm font-bold text-red-900 mt-1">
                Exceeded {currentMonthName} budget by ₹{overBudgetAmount.toLocaleString('en-IN')}!
              </h4>
              <p className="text-xs text-red-700 mt-0.5">
                Total spent is ₹{currentMonthSpent.toLocaleString('en-IN')} against your set limit of ₹{budgetLimit.toLocaleString('en-IN')}. There are <span className="font-bold">{daysRemaining} days remaining</span> in {currentMonthName}.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="self-start sm:self-center px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Adjust Monthly Limit</span>
          </button>
        </div>
      )}

      {isWarning && (
        <div className="p-4 bg-amber-500/10 border-2 border-amber-400 rounded-2xl text-amber-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white uppercase tracking-wider">
                  Approaching Monthly Limit
                </span>
                <span className="text-xs font-mono font-bold text-amber-800">
                  {percentSpent}% Spent
                </span>
              </div>
              <h4 className="text-sm font-bold text-amber-900 mt-1">
                You have used 80%+ of your {currentMonthName} budget!
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                ₹{remainingBudget.toLocaleString('en-IN')} remaining for the final <span className="font-bold">{daysRemaining} days</span> of {currentMonthName} (Recommended max: ₹{safeDailyAllowance.toLocaleString('en-IN')}/day).
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="self-start sm:self-center px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Budget</span>
          </button>
        </div>
      )}

      {/* MAIN BUDGET CONTROL & PROGRESS TRACKER CARD */}
      <div className="p-5 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
              isExceeded ? 'bg-red-600' : isWarning ? 'bg-amber-500' : 'bg-emerald-600'
            }`}>
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-neutral-900 text-base">
                  {currentMonthName} {currentYear} Expense Budget
                </h3>
                <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-md text-[10px] font-mono font-semibold">
                  {daysRemaining} Days Left in Month
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Track current monthly spending against your customized cap
              </p>
            </div>
          </div>

          {/* Edit Budget Limit Controls */}
          {!isEditing ? (
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Set Limit</p>
                <p className="text-base font-extrabold text-neutral-900">₹{budgetLimit.toLocaleString('en-IN')}</p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-neutral-500 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                title="Change monthly budget limit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveBudget} className="flex items-center space-x-2 bg-neutral-50 p-2 rounded-xl border border-neutral-300">
              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-xs font-bold text-neutral-500">₹</span>
                <input
                  type="number"
                  min={1000}
                  step={500}
                  value={tempLimit}
                  onChange={(e) => setTempLimit(e.target.value)}
                  className="w-28 pl-6 pr-2 py-1 text-xs font-bold border border-neutral-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-2 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-lg text-xs"
              >
                Cancel
              </button>
            </form>
          )}
        </div>

        {/* Progress Bar & Numerical Metrics */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-neutral-700">
              Spent: <span className={isExceeded ? 'text-red-600 font-extrabold' : isWarning ? 'text-amber-600 font-extrabold' : 'text-emerald-700'}>
                ₹{currentMonthSpent.toLocaleString('en-IN')}
              </span>
            </span>
            <span className="text-neutral-500">
              Budget Cap: ₹{budgetLimit.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Bar track */}
          <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden p-0.5 border border-neutral-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isExceeded ? 'bg-red-600' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(4, Math.round((currentMonthSpent / budgetLimit) * 100)))}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
              <p className="text-[10px] text-neutral-500 font-semibold uppercase">{currentMonthName} Spent</p>
              <p className="text-sm font-extrabold text-neutral-900 mt-0.5">₹{currentMonthSpent.toLocaleString('en-IN')}</p>
            </div>

            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
              <p className="text-[10px] text-neutral-500 font-semibold uppercase">
                {isExceeded ? 'Amount Over Budget' : 'Remaining Balance'}
              </p>
              <p className={`text-sm font-extrabold mt-0.5 ${isExceeded ? 'text-red-600' : 'text-emerald-700'}`}>
                {isExceeded ? `+₹${overBudgetAmount.toLocaleString('en-IN')}` : `₹${remainingBudget.toLocaleString('en-IN')}`}
              </p>
            </div>

            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
              <p className="text-[10px] text-neutral-500 font-semibold uppercase">Month End Date</p>
              <p className="text-sm font-extrabold text-neutral-900 mt-0.5">
                {currentMonthName} {totalDaysInMonth}
              </p>
            </div>

            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
              <p className="text-[10px] text-neutral-500 font-semibold uppercase">Daily Safe Limit</p>
              <p className="text-sm font-extrabold text-neutral-900 mt-0.5">
                {isExceeded ? '₹0/day' : `₹${safeDailyAllowance.toLocaleString('en-IN')}/day`}
              </p>
            </div>
          </div>

          {totalAllTimeSpent > currentMonthSpent && (
            <p className="text-[11px] text-neutral-500 italic pt-1 text-right">
              * Note: Total spending across all past months in your ledger is ₹{totalAllTimeSpent.toLocaleString('en-IN')}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
