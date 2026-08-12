import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Building2,
  Calendar,
  IndianRupee,
  ShieldAlert,
  Clock,
  Briefcase,
  Store,
} from 'lucide-react';
import { Expense, ExpenseCategory, ItemizedDetail, PaymentMethod } from '../types';
import { INDIAN_VENDOR_PRESETS } from '../data/indianVendors';

interface BillScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'returnStatus' | 'returnDeadline' | 'warrantyStatus' | 'warrantyExpiry'>) => void;
}

export const BillScannerModal: React.FC<BillScannerModalProps> = ({
  isOpen,
  onClose,
  onSaveExpense,
}) => {
  if (!isOpen) return null;

  const [inputTab, setInputTab] = useState<'upload' | 'paste' | 'vendor_quick'>('upload');
  
  // File upload state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  
  // Text input state
  const [pastedText, setPastedText] = useState('');
  
  // Processing state
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Form Fields for expense extraction preview
  const [merchantName, setMerchantName] = useState('');
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [totalAmount, setTotalAmount] = useState<number | ''>('');
  const [category, setCategory] = useState<ExpenseCategory>('Electronics');
  const [gstAmount, setGstAmount] = useState<number | ''>(0);
  const [gstin, setGstin] = useState('');
  const [isTaxDeductible, setIsTaxDeductible] = useState(false);
  const [taxCategory, setTaxCategory] = useState<any>('Hardware');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  
  const [returnWindowDays, setReturnWindowDays] = useState<number>(7);
  const [warrantyMonths, setWarrantyMonths] = useState<number>(12);
  const [serialNumber, setSerialNumber] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [notes, setNotes] = useState('');
  
  const [items, setItems] = useState<ItemizedDetail[]>([
    { id: '1', name: 'Product / Item 1', qty: 1, price: 0 },
  ]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type || 'image/jpeg');
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setSelectedImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyVendorPreset = (presetId: string) => {
    const preset = INDIAN_VENDOR_PRESETS.find((v) => v.id === presetId);
    if (!preset) return;

    setMerchantName(preset.name);
    setCategory(preset.category);
    setReturnWindowDays(preset.defaultReturnDays);
    setWarrantyMonths(preset.defaultWarrantyMonths);
    setNotes(`${preset.name} standard return & warranty rules applied.`);
    if (preset.category === 'Electronics') {
      setIsTaxDeductible(true);
      setTaxCategory('Hardware');
    }
    setScanMessage(`Applied ${preset.name} retail defaults (${preset.defaultReturnDays}-day return, ${preset.defaultWarrantyMonths}-mo warranty).`);
  };

  const handleScanReceipt = async () => {
    setIsScanning(true);
    setScanMessage('Scanning bill with AI engine...');

    try {
      const response = await fetch('/api/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType,
          textInput: pastedText,
        }),
      });

      const resData = await response.json();

      if (resData.success && resData.data) {
        const d = resData.data;
        if (d.merchantName) setMerchantName(d.merchantName);
        if (d.transactionDate) setTransactionDate(d.transactionDate);
        if (d.totalAmount !== undefined) setTotalAmount(d.totalAmount);
        if (d.category) setCategory(d.category as ExpenseCategory);
        if (d.gstAmount !== undefined) setGstAmount(d.gstAmount);
        if (d.gstin) setGstin(d.gstin);
        if (d.isTaxDeductible !== undefined) setIsTaxDeductible(d.isTaxDeductible);
        if (d.paymentMethod) setPaymentMethod(d.paymentMethod as PaymentMethod);
        if (d.returnWindowDays !== undefined) setReturnWindowDays(d.returnWindowDays);
        if (d.warrantyMonths !== undefined) setWarrantyMonths(d.warrantyMonths);
        if (d.notes) setNotes(d.notes);

        if (d.items && Array.isArray(d.items) && d.items.length > 0) {
          setItems(
            d.items.map((it: any, idx: number) => ({
              id: `item-${idx + 1}`,
              name: it.name || `Item ${idx + 1}`,
              qty: it.qty || 1,
              price: it.price || 0,
            }))
          );
        }

        setScanMessage('Receipt extracted successfully! Verify details below.');
      } else {
        setScanMessage('Scan completed. Please verify form values.');
      }
    } catch (err) {
      console.error('Scan error:', err);
      setScanMessage('Scan error occurred. Manual entry active.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: `item-${Date.now()}`, name: '', qty: 1, price: 0 },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((i) => i.id !== id));
  };

  const handleItemChange = (id: string, field: keyof ItemizedDetail, value: any) => {
    setItems(
      items.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!merchantName.trim()) {
      alert('Please specify the store or merchant name.');
      return;
    }

    const finalAmount = typeof totalAmount === 'number' ? totalAmount : 0;

    onSaveExpense({
      merchantName: merchantName.trim(),
      transactionDate,
      totalAmount: finalAmount,
      currency: 'INR',
      category,
      gstAmount: typeof gstAmount === 'number' ? gstAmount : 0,
      gstin: gstin.trim() || undefined,
      isTaxDeductible,
      taxCategory: isTaxDeductible ? taxCategory : undefined,
      paymentMethod,
      items: items.filter((i) => i.name.trim().length > 0),
      returnWindowDays,
      warrantyMonths,
      serialNumber: serialNumber.trim() || undefined,
      modelNumber: modelNumber.trim() || undefined,
      notes: notes.trim() || undefined,
      receiptImage: selectedImage || undefined,
      rawReceiptText: pastedText || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-2xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-base">Bill Scanner & Expense Logger</h3>
              <p className="text-xs text-neutral-500">Scan receipt image/text or pick an Indian retail vendor preset</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1.5 rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Input Method Selector */}
          <div className="space-y-3">
            <div className="flex p-1 bg-neutral-100 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setInputTab('upload')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                  inputTab === 'upload' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Bill Photo / PDF</span>
              </button>
              <button
                onClick={() => setInputTab('paste')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                  inputTab === 'paste' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Paste Invoice Text</span>
              </button>
              <button
                onClick={() => setInputTab('vendor_quick')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                  inputTab === 'vendor_quick' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Indian Store Presets</span>
              </button>
            </div>

            {/* Input Panels */}
            {inputTab === 'upload' && (
              <div className="border-2 border-dashed border-neutral-300 rounded-xl p-5 text-center bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
                {selectedImage ? (
                  <div className="space-y-3">
                    <img
                      src={selectedImage}
                      alt="Selected Bill"
                      className="max-h-40 mx-auto rounded-lg border border-neutral-200 object-contain"
                    />
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={handleScanReceipt}
                        disabled={isScanning}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>{isScanning ? 'Extracting with AI...' : 'Extract Data from Image'}</span>
                      </button>
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 px-3 py-2 rounded-lg text-xs font-medium"
                      >
                        Change Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer block space-y-2">
                    <UploadCloud className="w-8 h-8 text-neutral-400 mx-auto" />
                    <p className="text-xs font-semibold text-neutral-700">
                      Click or drag and drop receipt photo / PDF bill
                    </p>
                    <p className="text-[11px] text-neutral-500">Supports PNG, JPG, WEBP, or scanned digital bills</p>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}

            {inputTab === 'paste' && (
              <div className="space-y-2">
                <textarea
                  rows={4}
                  placeholder="Paste email invoice text, SMS transaction alert, or receipt transcript here (e.g., 'Croma Order #90211, Total Rs 64990, GST 18%...')."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  className="w-full p-3 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <button
                  onClick={handleScanReceipt}
                  disabled={!pastedText.trim() || isScanning}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isScanning ? 'Extracting Text...' : 'Extract Bill Info from Text'}</span>
                </button>
              </div>
            )}

            {inputTab === 'vendor_quick' && (
              <div>
                <p className="text-xs font-medium text-neutral-600 mb-2">
                  Select a popular Indian retailer to apply standard return & warranty policies:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {INDIAN_VENDOR_PRESETS.map((vp) => (
                    <button
                      key={vp.id}
                      type="button"
                      onClick={() => handleApplyVendorPreset(vp.id)}
                      className="p-2.5 border border-neutral-200 rounded-xl bg-white hover:bg-neutral-50 text-left transition-colors cursor-pointer group"
                    >
                      <p className="font-bold text-xs text-neutral-900 group-hover:text-emerald-700">{vp.name}</p>
                      <p className="text-[10px] text-neutral-500">
                        {vp.defaultReturnDays}d Return • {vp.defaultWarrantyMonths}m Warranty
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {scanMessage && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{scanMessage}</span>
            </div>
          )}

          {/* Form Fields Section */}
          <form onSubmit={handleSubmit} className="space-y-4 border-t border-neutral-200 pt-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500">
              Transaction Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Store / Merchant Name *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Croma, Reliance Digital, D-Mart"
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Transaction Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    required
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Total Amount (₹ INR) *
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="0.00"
                    value={totalAmount}
                    onChange={(e) =>
                      setTotalAmount(e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Dining">Dining</option>
                  <option value="Fuel">Fuel</option>
                  <option value="Health">Health</option>
                  <option value="Apparel">Apparel</option>
                  <option value="Home & Living">Home & Living</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Office/Business">Office/Business</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Tax & GST Section */}
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-neutral-900">Tax & Business Expense</span>
                </div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTaxDeductible}
                    onChange={(e) => setIsTaxDeductible(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-neutral-700">Flag as Tax Deductible</span>
                </label>
              </div>

              {isTaxDeductible && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                      GST Amount Paid (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={gstAmount}
                      onChange={(e) =>
                        setGstAmount(e.target.value === '' ? '' : parseFloat(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                      Merchant GSTIN
                    </label>
                    <input
                      type="text"
                      placeholder="27AAACB1010A1Z5"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs outline-none uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                      Deduction Category
                    </label>
                    <select
                      value={taxCategory}
                      onChange={(e) => setTaxCategory(e.target.value)}
                      className="w-full px-2 py-1.5 border border-neutral-300 rounded-lg text-xs outline-none"
                    >
                      <option value="Hardware">Hardware & Equipment</option>
                      <option value="Work Expense">General Work Expense</option>
                      <option value="Software & Subscriptions">Software & Cloud</option>
                      <option value="Office Supplies">Office Supplies</option>
                      <option value="Business Travel">Business Travel</option>
                      <option value="Medical">Medical Reimbursement</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Return Window & Warranty Policy Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2">
                <div className="flex items-center space-x-1.5 text-amber-800 font-bold text-xs">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Return Window Policy</span>
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-600 mb-1">Return Window (Days)</label>
                  <select
                    value={returnWindowDays}
                    onChange={(e) => setReturnWindowDays(parseInt(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs outline-none bg-white"
                  >
                    <option value={0}>No Return / Final Sale (0 Days)</option>
                    <option value={7}>7 Days (Standard Indian Retail)</option>
                    <option value={10}>10 Days (Amazon / E-commerce)</option>
                    <option value={14}>14 Days (Apple Store / Fashion)</option>
                    <option value={30}>30 Days (Decathlon / Extended)</option>
                    <option value={90}>90 Days (IKEA)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-200 space-y-2">
                <div className="flex items-center space-x-1.5 text-sky-800 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 text-sky-600" />
                  <span>Product Warranty Coverage</span>
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-600 mb-1">Warranty Period (Months)</label>
                  <select
                    value={warrantyMonths}
                    onChange={(e) => setWarrantyMonths(parseInt(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs outline-none bg-white"
                  >
                    <option value={0}>No Manufacturer Warranty (0 Months)</option>
                    <option value={6}>6 Months (Accessories)</option>
                    <option value={12}>12 Months (1 Year Standard)</option>
                    <option value={24}>24 Months (2 Years)</option>
                    <option value={36}>36 Months (3 Years)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Serial Number & Model (If applicable) */}
            {(warrantyMonths > 0 || category === 'Electronics') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Device Serial Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. C02HG891Q6L4"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-xl text-xs outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Model Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MLXW3HN/A"
                    value={modelNumber}
                    onChange={(e) => setModelNumber(e.target.value)}
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-xl text-xs outline-none uppercase"
                  />
                </div>
              </div>
            )}

            {/* Itemized Products */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-800">
                  Itemized Line Items
                </label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </button>
              </div>

              {items.map((item, index) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder={`Item ${index + 1} Name`}
                    value={item.name}
                    onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.qty}
                    onChange={(e) =>
                      handleItemChange(item.id, 'qty', parseInt(e.target.value) || 1)
                    }
                    className="w-16 px-2 py-1.5 border border-neutral-300 rounded-lg text-xs outline-none text-center"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price ₹"
                    value={item.price}
                    onChange={(e) =>
                      handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)
                    }
                    className="w-24 px-2 py-1.5 border border-neutral-300 rounded-lg text-xs outline-none"
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-neutral-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Personal Notes / Return Instructions
              </label>
              <input
                type="text"
                placeholder="e.g. Keep original invoice & box intact for return. Claim GST on ITR."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs outline-none"
              />
            </div>

            {/* Footer Submit */}
            <div className="pt-3 flex justify-end space-x-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Save Expense Entry
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
