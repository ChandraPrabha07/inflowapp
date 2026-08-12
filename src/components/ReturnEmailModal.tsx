import React, { useState } from 'react';
import { X, Mail, Copy, Check, ExternalLink, RotateCcw } from 'lucide-react';
import { Expense, UserAuth } from '../types';

interface ReturnEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense;
  user: UserAuth;
}

export const ReturnEmailModal: React.FC<ReturnEmailModalProps> = ({
  isOpen,
  onClose,
  expense,
  user,
}) => {
  if (!isOpen) return null;

  const [userName, setUserName] = useState(user.fullName || 'Customer');
  const [reason, setReason] = useState('Defective/Damaged product received');
  const [customReason, setCustomReason] = useState('');
  const [detailedConcern, setDetailedConcern] = useState('');
  const [preferredResolution, setPreferredResolution] = useState('Refund to Original Payment Method');
  const [copied, setCopied] = useState(false);

  const selectedReasonText = reason === 'Other/Custom Reason' ? customReason : reason;

  const itemsListStr = expense.items && expense.items.length > 0
    ? expense.items.map((i) => `${i.qty}x ${i.name}`).join(', ')
    : 'Purchased Item(s)';

  const generateEmailText = () => {
    return `Subject: Formal Return Request - ${expense.merchantName} Invoice #${expense.id}

Dear ${expense.merchantName} Customer Support Team,

My name is ${userName}. I am writing to formally request a return / refund for my purchase made at ${expense.merchantName} on ${expense.transactionDate}.

Purchase Summary:
- Store / Retailer: ${expense.merchantName}
- Transaction Date: ${expense.transactionDate}
- Invoice Total: ₹${expense.totalAmount.toLocaleString('en-IN')}
- Return Deadline: ${expense.returnDeadline || 'Within Policy Window'}
- Items Purchased: ${itemsListStr}
${expense.serialNumber ? `- Serial Number: ${expense.serialNumber}` : ''}

Reason for Return:
${selectedReasonText}

Detailed Concern & Issue Description:
${detailedConcern.trim() ? detailedConcern : 'Item is being returned within the valid return policy window in unused condition with original tax invoice.'}

Preferred Resolution:
${preferredResolution}

I have attached the original tax invoice and purchase details logged via Inflow. Please confirm receipt and provide return pickup arrangement or drop-off guidelines.

Thank you,
${userName}
Contact Email: ${user.email}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateEmailText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMailTo = () => {
    const subject = encodeURIComponent(`Formal Return Request - ${expense.merchantName} Invoice #${expense.id}`);
    const body = encodeURIComponent(generateEmailText());
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50 flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-base">Generate Return Email Request</h3>
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

        {/* Scrollable Form & Preview */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* User Name & Reason Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Your Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Rahul Sharma"
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Reason for Return</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Defective/Damaged product received">Defective / Damaged on arrival</option>
                <option value="Size or fit mismatch">Size or fit mismatch</option>
                <option value="Incorrect product delivered">Incorrect product delivered</option>
                <option value="Product does not match description">Product does not match description</option>
                <option value="Quality dissatisfaction">Quality dissatisfaction</option>
                <option value="Changed mind within return window">Changed mind within return window</option>
                <option value="Other/Custom Reason">Other / Custom Reason</option>
              </select>
            </div>
          </div>

          {reason === 'Other/Custom Reason' && (
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Custom Reason Title</label>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Specify reason..."
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-neutral-700 mb-1">
              Detailing Your Specific Concern
            </label>
            <textarea
              rows={3}
              value={detailedConcern}
              onChange={(e) => setDetailedConcern(e.target.value)}
              placeholder="Describe what went wrong or why you wish to return (e.g. Left speaker has heavy static noise; seams came loose after unboxing...)"
              className="w-full p-2.5 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1">Preferred Resolution</label>
            <select
              value={preferredResolution}
              onChange={(e) => setPreferredResolution(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="Refund to Original Payment Method">Refund to Original Payment Method</option>
              <option value="Replacement Unit / Direct Exchange">Replacement Unit / Direct Exchange</option>
              <option value="Store Credit / Gift Card Voucher">Store Credit / Gift Card Voucher</option>
            </select>
          </div>

          {/* Generated Email Preview */}
          <div className="pt-2">
            <label className="block font-bold text-neutral-900 mb-1 flex items-center justify-between">
              <span>Generated Return Request Draft</span>
              <span className="text-[10px] text-neutral-400 font-mono">Ready to Send</span>
            </label>
            <textarea
              rows={9}
              readOnly
              value={generateEmailText()}
              className="w-full p-3 bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-[11px] text-neutral-800 outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={handleCopy}
            className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Return Email Draft'}</span>
          </button>

          <button
            onClick={handleMailTo}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Email App</span>
          </button>
        </div>
      </div>
    </div>
  );
};
