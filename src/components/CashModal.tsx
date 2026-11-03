import React, { useState } from 'react';
import { formatRupiah } from '../services/api';

interface CashModalProps {
  isOpen: boolean;
  onClose: () => void;
  grandTotal: number;
  onSuccessPay: (received: number, change: number) => void;
}

export const CashModal: React.FC<CashModalProps> = ({
  isOpen,
  onClose,
  grandTotal,
  onSuccessPay,
}) => {
  const [cashInput, setCashInput] = useState<number>(grandTotal);

  if (!isOpen) return null;

  const change = Math.max(0, cashInput - grandTotal);
  const isEnough = cashInput >= grandTotal;

  const handleQuickAdd = (amount: number) => {
    setCashInput(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-[#002045] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0284c7] text-2xl">payments</span>
            <div>
              <h3 className="font-display font-bold text-sm tracking-wide">Pembayaran Tunai (Cash)</h3>
              <p className="text-[10px] text-sky-200">Kalkulator Uang Kembalian Kasir</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-3 sm:space-y-4 flex-1 overflow-y-auto no-scrollbar">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Total Tagihan
            </span>
            <div className="font-display font-extrabold text-xl sm:text-2xl text-[#002045] mt-0.5">
              {formatRupiah(grandTotal)}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nominal Uang Diterima:
            </label>
            <input
              type="number"
              value={cashInput || ''}
              onChange={(e) => setCashInput(Number(e.target.value) || 0)}
              className="w-full text-center text-lg sm:text-xl font-display font-bold text-slate-900 px-3 py-2 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:border-[#0284c7] focus:outline-none"
            />
          </div>

          {/* Quick Denominations */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <button
              onClick={() => handleQuickAdd(grandTotal)}
              className="py-2.5 min-h-[40px] bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition tactile-btn active:scale-95"
            >
              Uang Pas
            </button>
            {[50000, 100000, 150000, 200000, 500000].map((nominal) => (
              <button
                key={nominal}
                onClick={() => handleQuickAdd(nominal)}
                className="py-2.5 min-h-[40px] bg-slate-100 hover:bg-sky-50 hover:text-sky-800 rounded-xl text-xs font-bold font-mono transition tactile-btn active:scale-95"
              >
                {nominal / 1000}k
              </button>
            ))}
          </div>

          {/* Kembalian Result */}
          <div className={`p-3.5 sm:p-4 rounded-xl border text-center transition ${
            isEnough ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
          }`}>
            <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider block ${
              isEnough ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              {isEnough ? 'Uang Kembalian' : 'Uang Kurang'}
            </span>
            <div className={`font-display font-extrabold text-xl sm:text-2xl mt-0.5 ${
              isEnough ? 'text-emerald-800' : 'text-rose-800'
            }`}>
              {formatRupiah(Math.abs(cashInput - grandTotal))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 min-h-[42px] border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition tactile-btn active:scale-95"
          >
            Batal
          </button>
          <button
            disabled={!isEnough}
            onClick={() => onSuccessPay(cashInput, change)}
            className="flex-1 py-2.5 min-h-[42px] bg-[#002045] hover:bg-[#00142b] disabled:opacity-40 text-white rounded-xl font-display font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition tactile-btn active:scale-95"
          >
            <span className="material-symbols-outlined text-base">print</span>
            <span>Konfirmasi & Cetak Struk</span>
          </button>
        </div>
      </div>
    </div>
  );
};
