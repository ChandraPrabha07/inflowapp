import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { BillScannerModal } from './components/BillScannerModal';
import { ExpenseList } from './components/ExpenseList';
import { ReturnDeadlineLedger } from './components/ReturnDeadlineLedger';
import { WarrantyLedger } from './components/WarrantyLedger';
import { TaxReports } from './components/TaxReports';
import { AnalyticsCharts } from './components/AnalyticsCharts';

import { Expense, UserAuth } from './types';
import { getStoredUserSession } from './lib/supabase';
import {
  loadExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  loadSampleExpensesForUser,
} from './lib/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('expenses');
  const [user, setUser] = useState<UserAuth>(getStoredUserSession());

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Reload expenses for the logged-in user
  const refreshExpenses = (currentUser: UserAuth = user) => {
    const loaded = loadExpenses(currentUser.id);
    setExpenses(loaded);
  };

  useEffect(() => {
    refreshExpenses(user);
  }, [user.id]);

  const handleSaveExpense = (
    expenseData: Omit<
      Expense,
      'id' | 'createdAt' | 'updatedAt' | 'returnStatus' | 'returnDeadline' | 'warrantyStatus' | 'warrantyExpiry'
    >
  ) => {
    addExpense(expenseData, user.id);
    refreshExpenses(user);
  };

  const handleUpdateStatus = (id: string, updates: Partial<Expense>) => {
    updateExpense(id, updates, user.id);
    refreshExpenses(user);
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpense(id, user.id);
    refreshExpenses(user);
  };

  const handleLoadSampleData = () => {
    const samples = loadSampleExpensesForUser(user.id);
    setExpenses(samples);
  };

  const handleUserChange = (newUser: UserAuth) => {
    setUser(newUser);
    refreshExpenses(newUser);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans flex flex-col antialiased">
      {/* Top Navbar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'expenses' && (
          <ExpenseList
            expenses={expenses}
            user={user}
            onDeleteExpense={handleDeleteExpense}
            onUpdateExpenseStatus={handleUpdateStatus}
            onOpenScanner={() => setIsScannerOpen(true)}
            onLoadSampleData={handleLoadSampleData}
            onRefreshExpenses={() => refreshExpenses(user)}
          />
        )}

        {activeTab === 'returns' && (
          <ReturnDeadlineLedger
            expenses={expenses}
            user={user}
            onUpdateStatus={handleUpdateStatus}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        )}

        {activeTab === 'warranties' && (
          <WarrantyLedger expenses={expenses} user={user} />
        )}

        {activeTab === 'tax' && (
          <TaxReports expenses={expenses} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsCharts expenses={expenses} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-6 mt-12 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-neutral-800">Inflow</span>
            <span>• Expense Tracker, Return Window & Warranty Ledger</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="hover:text-neutral-900 transition-colors cursor-pointer"
            >
              Profile & Account
            </button>
            <span>•</span>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="hover:text-neutral-900 transition-colors cursor-pointer"
            >
              Sign In / Sign Up
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BillScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSaveExpense={handleSaveExpense}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
        setUser={handleUserChange}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        setUser={handleUserChange}
        expenses={expenses}
        onOpenAuth={() => setIsAuthOpen(true)}
      />
    </div>
  );
}
