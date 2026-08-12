import React from 'react';
import {
  PlusCircle,
  Receipt,
  RotateCcw,
  Shield,
  FileSpreadsheet,
  PieChart,
  User,
  LogIn,
} from 'lucide-react';
import { UserAuth } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserAuth;
  onOpenScanner: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenScanner,
  onOpenAuth,
  onOpenProfile,
}) => {
  const navItems = [
    { id: 'expenses', label: 'Expense Ledger', icon: Receipt },
    { id: 'returns', label: 'Return Windows', icon: RotateCcw },
    { id: 'warranties', label: 'Warranties', icon: Shield },
    { id: 'tax', label: 'Tax & Business', icon: FileSpreadsheet },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
  ];

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-neutral-900">Inflow</span>
              <p className="text-xs text-neutral-500 hidden sm:block">
                Expense, Return Window & Warranty Ledger
              </p>
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={user.isGuest ? onOpenAuth : onOpenProfile}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-xs font-medium text-neutral-800 transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[11px] font-bold">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
              <span className="truncate max-w-[110px] sm:max-w-none">
                {user.fullName || (user.isGuest ? 'Sign In' : user.email)}
              </span>
            </button>

            <button
              onClick={onOpenScanner}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Scan Bill / Add Expense</span>
              <span className="sm:hidden">Scan</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto no-scrollbar border-t border-neutral-100 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-neutral-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
