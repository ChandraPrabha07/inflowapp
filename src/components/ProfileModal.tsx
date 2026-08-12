import React, { useState } from 'react';
import { X, User, Mail, ShieldCheck, Receipt, RotateCcw, Shield, LogOut, CheckCircle2 } from 'lucide-react';
import { UserAuth, Expense } from '../types';
import { saveUserSession, clearUserSession } from '../lib/supabase';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAuth;
  setUser: (u: UserAuth) => void;
  expenses: Expense[];
  onOpenAuth: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  setUser,
  expenses,
  onOpenAuth,
}) => {
  if (!isOpen) return null;

  const [fullName, setFullName] = useState(user.fullName || '');
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // User Stats
  const totalExpensesCount = expenses.length;
  const totalSpent = expenses.reduce((sum, e) => sum + e.totalAmount, 0);
  const activeReturnsCount = expenses.filter(
    (e) => e.returnStatus === 'eligible' || e.returnStatus === 'expiring_soon'
  ).length;
  const activeWarrantiesCount = expenses.filter(
    (e) => e.warrantyStatus === 'active' || e.warrantyStatus === 'expiring_soon'
  ).length;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: UserAuth = {
      ...user,
      fullName: fullName.trim() || 'User',
    };
    saveUserSession(updatedUser);
    setUser(updatedUser);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleSignOut = () => {
    clearUserSession();
    const guestUser: UserAuth = {
      id: 'guest-user',
      email: 'user@inflow.app',
      fullName: 'Inflow User',
      isGuest: true,
      authProvider: 'local',
    };
    saveUserSession(guestUser);
    setUser(guestUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-sm">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-base">User Profile</h3>
              <p className="text-xs text-neutral-500">Account overview & stats</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {/* Profile Card */}
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Account Details</p>
                {!isEditing ? (
                  <h4 className="font-bold text-neutral-900 text-lg mt-0.5">{user.fullName || 'User'}</h4>
                ) : (
                  <form onSubmit={handleSaveProfile} className="mt-1 flex items-center space-x-2">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="px-2.5 py-1 border border-neutral-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      placeholder="Your Full Name"
                      required
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                    >
                      Save
                    </button>
                  </form>
                )}
                <p className="text-xs text-neutral-600 flex items-center space-x-1 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{user.email}</span>
                </p>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-2.5 py-1 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-100 rounded-lg shadow-2xs"
                >
                  Edit Name
                </button>
              )}
            </div>

            <div className="pt-2 border-t border-neutral-200/80 flex items-center justify-between text-xs text-neutral-500">
              <span>Account Type</span>
              <span className="font-semibold text-neutral-800 bg-white px-2 py-0.5 rounded-md border border-neutral-200">
                {user.isGuest ? 'Guest User' : 'Authenticated User'}
              </span>
            </div>
          </div>

          {/* Key Activity Summary */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Ledger Activity Summary</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white border border-neutral-200 rounded-xl space-y-1">
                <div className="flex items-center text-neutral-500 space-x-1.5">
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Expenses Logged</span>
                </div>
                <p className="text-base font-bold text-neutral-900">{totalExpensesCount} Receipts</p>
              </div>

              <div className="p-3 bg-white border border-neutral-200 rounded-xl space-y-1">
                <div className="flex items-center text-neutral-500 space-x-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  <span>Active Returns</span>
                </div>
                <p className="text-base font-bold text-neutral-900">{activeReturnsCount} Open Windows</p>
              </div>

              <div className="p-3 bg-white border border-neutral-200 rounded-xl space-y-1">
                <div className="flex items-center text-neutral-500 space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-sky-600" />
                  <span>Active Warranties</span>
                </div>
                <p className="text-base font-bold text-neutral-900">{activeWarrantiesCount} Covered</p>
              </div>

              <div className="p-3 bg-white border border-neutral-200 rounded-xl space-y-1">
                <div className="flex items-center text-neutral-500 space-x-1.5">
                  <span className="font-bold text-xs text-emerald-600">₹</span>
                  <span>Total Expenditure</span>
                </div>
                <p className="text-base font-bold text-neutral-900">₹{totalSpent.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
            <button
              onClick={handleSignOut}
              className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center space-x-1.5 py-1.5 px-3 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              Switch Account / Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
