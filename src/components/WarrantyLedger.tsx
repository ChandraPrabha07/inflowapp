import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Calendar,
  Copy,
  Check,
  Mail,
} from 'lucide-react';
import { Expense, UserAuth } from '../types';
import { WarrantyEmailModal } from './WarrantyEmailModal';

interface WarrantyLedgerProps {
  expenses: Expense[];
  user: UserAuth;
}

export const WarrantyLedger: React.FC<WarrantyLedgerProps> = ({ expenses, user }) => {
  const warrantyExpenses = expenses.filter(
    (e) => e.warrantyMonths > 0 && e.warrantyStatus !== 'none'
  );

  const activeWarranties = warrantyExpenses.filter(
    (e) => e.warrantyStatus === 'active' || e.warrantyStatus === 'expiring_soon'
  );

  const expiredWarranties = warrantyExpenses.filter((e) => e.warrantyStatus === 'expired');

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [claimModalExpense, setClaimModalExpense] = useState<Expense | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900">Product Warranty Ledger & Claims</h2>
            <p className="text-xs text-neutral-600 mt-0.5">
              Monitor active manufacturer coverage for electronics & appliances, store serial numbers, and generate service claim emails detailing your specific concern.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-white px-3.5 py-1.5 rounded-xl border border-sky-200 text-center">
            <p className="text-xs font-bold text-sky-900">{activeWarranties.length} Products</p>
            <p className="text-[10px] text-sky-700">Active Protection</p>
          </div>
        </div>
      </div>

      {/* Active Warranties */}
      <div className="space-y-3">
        <h3 className="font-bold text-neutral-900 text-sm flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-sky-600" />
          <span>Active Manufacturer Warranties ({activeWarranties.length})</span>
        </h3>

        {activeWarranties.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200 space-y-2">
            <Shield className="w-8 h-8 text-neutral-400 mx-auto" />
            <p className="font-bold text-neutral-800 text-sm">No Active Warranties Recorded</p>
            <p className="text-xs text-neutral-500">
              When you scan or log electronic items with warranty months (e.g., Croma laptop, Reliance Digital appliance), they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeWarranties.map((exp) => (
              <div
                key={exp.id}
                className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs space-y-3 hover:border-sky-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                        {exp.warrantyMonths} Months ({exp.warrantyStatus === 'expiring_soon' ? 'Ending Soon!' : 'Protected'})
                      </span>
                      <h4 className="font-bold text-neutral-900 text-base mt-1.5">{exp.merchantName}</h4>
                      <p className="text-xs text-neutral-500">
                        Valid until <span className="font-semibold text-neutral-800">{exp.warrantyExpiry}</span>
                      </p>
                    </div>
                    <span className="font-extrabold text-neutral-900 text-sm">
                      ₹{exp.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Serial Number & Model */}
                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1 text-xs">
                    {exp.serialNumber ? (
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500 text-[11px]">S/N:</span>
                        <div className="flex items-center space-x-1 font-mono font-bold text-neutral-800">
                          <span>{exp.serialNumber}</span>
                          <button
                            onClick={() => handleCopy(exp.serialNumber!, exp.id)}
                            className="text-neutral-400 hover:text-neutral-700 p-0.5"
                            title="Copy Serial Number"
                          >
                            {copiedId === exp.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-neutral-400 italic">No serial number saved</p>
                    )}

                    {exp.modelNumber && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-neutral-500">Model:</span>
                        <span className="font-medium text-neutral-700">{exp.modelNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Products */}
                  <p className="text-xs text-neutral-600 line-clamp-1">
                    {exp.items.map((i) => i.name).join(', ')}
                  </p>
                </div>

                {/* Action button */}
                <button
                  onClick={() => setClaimModalExpense(exp)}
                  className="w-full bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer mt-2"
                >
                  <Mail className="w-3.5 h-3.5 text-sky-600" />
                  <span>Generate Warranty Claim Email</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expired Warranties */}
      {expiredWarranties.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-neutral-200">
          <h3 className="font-bold text-neutral-500 text-xs uppercase tracking-wider">
            Expired Coverage History ({expiredWarranties.length})
          </h3>

          <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100 text-xs">
            {expiredWarranties.map((exp) => (
              <div key={exp.id} className="p-3.5 flex items-center justify-between opacity-75">
                <div>
                  <p className="font-bold text-neutral-800">{exp.merchantName}</p>
                  <p className="text-neutral-500">
                    Warranty Expired on {exp.warrantyExpiry} • {exp.serialNumber ? `S/N: ${exp.serialNumber}` : 'No S/N'}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[11px] bg-neutral-100 text-neutral-600">
                  Expired
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Claim Email Generator Modal */}
      {claimModalExpense && (
        <WarrantyEmailModal
          isOpen={Boolean(claimModalExpense)}
          onClose={() => setClaimModalExpense(null)}
          expense={claimModalExpense}
          user={user}
        />
      )}
    </div>
  );
};
