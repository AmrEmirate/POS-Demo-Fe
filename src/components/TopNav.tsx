import React, { useState, useEffect } from 'react';
import { UserAccount } from './LoginPage';

interface TopNavProps {
  activeTab: 'pos' | 'dashboard';
  setActiveTab: (tab: 'pos' | 'dashboard') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentUser?: UserAccount | null;
  onLogout?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  currentUser,
  onLogout,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}:${seconds} WIB`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 flex justify-between items-center w-full px-4 h-16 z-50 shrink-0 shadow-xs">
      {/* Left: Brand + Branch + Search */}
      <div className="flex items-center gap-4 flex-1">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="PT Pro Teknologi"
            className="h-10 w-auto object-contain rounded bg-white p-1 border border-slate-200 shadow-xs"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-slate-900 tracking-tight text-base md:text-lg">
                Pro POS Enterprise
              </span>
              <span className="px-2 py-0.5 rounded bg-sky-100 text-[#0284c7] font-display text-[11px] font-bold">
                Showcase
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              PT Pro Teknologi
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

        {/* Branch location & Cashier info */}
        <div className="hidden lg:flex items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#0284c7] text-sm">storefront</span>
            <span className="font-semibold text-slate-800">Mall Grand Indonesia Branch</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-slate-400 text-sm">badge</span>
            <span>
              {currentUser?.role === 'OWNER' ? 'Owner: ' : currentUser?.role === 'MANAGER' ? 'Manager: ' : 'Kasir: '}
              <strong className="text-slate-900">{currentUser?.name || 'Budi Santoso'}</strong>
            </span>
          </div>
        </div>

        {/* Search Bar (Only shown in POS view) */}
        {activeTab === 'pos' && (
          <div className="relative flex-1 max-w-xs md:max-w-sm ml-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-400 text-base">search</span>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari produk / scan barcode (F2)..."
              className="w-full pl-9 pr-10 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] transition-all"
            />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
              <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-mono rounded font-semibold">
                F2
              </kbd>
            </div>
          </div>
        )}
      </div>

      {/* Right: View Switcher, Telemetry, Avatar */}
      <div className="flex items-center gap-3">
        {/* Navigation Tabs Switcher */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'pos'
                ? 'bg-[#002045] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-base">point_of_sale</span>
            <span className="font-display">Terminal Kasir</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-[#0284c7] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-base">monitoring</span>
            <span className="font-display">Owner Dashboard</span>
          </button>
        </div>

        {/* Live Clock */}
        <div className="hidden sm:block font-display font-bold text-xs text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
          {timeStr || '12:00:00 WIB'}
        </div>

        {/* Telemetry Indicator */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-semibold text-slate-700">Online (0.12s)</span>
        </div>

        {/* Avatar & Logout */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full bg-[#002045] text-white flex items-center justify-center font-display font-bold text-xs shadow-xs"
            title={`${currentUser?.name || 'Kasir'} (${currentUser?.role || 'KASIR'})`}
          >
            {currentUser?.avatarInitials || 'BS'}
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Keluar / Ganti Akun"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
