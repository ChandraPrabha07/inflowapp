import React, { useState } from 'react';
import { X, Mail, Copy, Check, ExternalLink, Shield } from 'lucide-react';
import { Expense, UserAuth } from '../types';

interface WarrantyEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense;
  user: UserAuth;
}

export const WarrantyEmailModal: React.FC<WarrantyEmailModalProps> = ({
  isOpen,
  onClose,
  expense,
  user,
}) => {
  if (!isOpen) return null;

  const [userName, setUserName] = useState(user.fullName || 'Customer');
  const [faultCategory, setFaultCategory] = useState('Hardware / Component Failure');
  const [detailedIssue, setDetailedIssue] = useState('');
  const [serialNumber, setSerialNumber] = useState(expense.serialNumber || '');
  const [modelNumber, setModelNumber] = useState(expense.modelNumber || '');
  const [copied, setCopied] = useState(false);

  const itemsListStr = expense.items && expense.items.length > 0
    ? expense.items.map((i) => `${i.qty}x ${i.name}`).join(', ')
    : 'Purchased Product';

  const generateEmailText = () => {
    return `Subject: Formal Warranty Claim Request - ${expense.merchantName} Invoice #${expense.id}

Dear ${expense.merchantName} Service & Support Team,

My name is ${userName}. I am submitting a formal warranty service claim for the product purchased from ${expense.merchantName} that is currently covered under active warranty until ${expense.warrantyExpiry || 'Active Term'}.

Product & Purchase Summary:
- Retailer / Merchant: ${expense.merchantName}
- Transaction Date: ${expense.transactionDate}
- Warranty Term: ${expense.warrantyMonths} Months (Valid until ${expense.warrantyExpiry || 'Active Coverage'})
- Product(s): ${itemsListStr}
- Serial Number: ${serialNumber || 'Not specified on bill'}
- Model Number: ${modelNumber || 'Not specified'}
- Invoice Amount: ₹${expense.totalAmount.toLocaleString('en-IN')}

Fault Category:
${faultCategory}

Detailed Problem Description & Concern:
${detailedIssue.trim() ? detailedIssue : 'Product experienced hardware/operational malfunction under normal usage parameters during active warranty period.'}

I have attached the original tax invoice and purchase proof logged via Inflow. Please advise on the nearest authorized service center location, carry-in procedure, or home pickup arrangement.

Best regards,
${userName}
Contact Email: ${user.email}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateEmailText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMailTo = () => {
    const subject = encodeURIComponent(`Warranty Claim Request - ${expense.merchantName} - ${serialNumber ? `S/N: ${serialNumber}` : `Invoice #${expense.id}`}`);
    const body = encodeURIComponent(generateEmailText());
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50 flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-base">Generate Warranty Claim Email</h3>
              <p className="text-xs text-neutral-500">{expense.merchantName} • {expense.warrantyMonths}m Warranty</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Your Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Rahul Sharma"
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Fault Category</label>
              <select
                value={faultCategory}
                onChange={(e) => setFaultCategory(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Hardware / Component Failure">Hardware / Component Failure</option>
                <option value="Power / Battery / Charging Defect">Power / Battery / Charging Defect</option>
                <option value="Display / Screen Flickering or Lines">Display / Screen Flickering or Lines</option>
                <option value="Audio / Speaker Static Distortion">Audio / Speaker Static Distortion</option>
                <option value="Overheating & Sudden Shutdowns">Overheating & Sudden Shutdowns</option>
                <option value="Physical Manufacturing Defect">Physical Manufacturing Defect</option>
                <option value="Other Malfunction">Other Malfunction</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Serial Number</label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="e.g. SN-88291039"
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Model Number</label>
              <input
                type="text"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                placeholder="e.g. M1 Pro 16"
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1">
              Detailing Your Specific Concern & Problem
            </label>
            <textarea
              rows={3}
              value={detailedIssue}
              onChange={(e) => setDetailedIssue(e.target.value)}
              placeholder="Describe the exact issue or hardware defect (e.g., Battery drains from 100% to 0% in 15 minutes; power port loose; screen shows green vertical line...)"
              className="w-full p-2.5 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Preview */}
          <div className="pt-2">
            <label className="block font-bold text-neutral-900 mb-1 flex items-center justify-between">
              <span>Generated Warranty Claim Draft</span>
              <span className="text-[10px] text-neutral-400 font-mono">Service Ticket Draft</span>
            </label>
            <textarea
              rows={9}
              readOnly
              value={generateEmailText()}
              className="w-full p-3 bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-[11px] text-neutral-800 outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={handleCopy}
            className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Warranty Email Draft'}</span>
          </button>

          <button
            onClick={handleMailTo}
            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Email App</span>
          </button>
        </div>
      </div>
    </div>
  );
};
