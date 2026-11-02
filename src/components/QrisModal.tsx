import React, { useState, useEffect } from 'react';
import { formatRupiah } from '../services/api';

interface QrisModalProps {
  isOpen: boolean;
  onClose: () => void;
  grandTotal: number;
  onSuccessPay: () => void;
}

export const QrisModal: React.FC<QrisModalProps> = ({
  isOpen,
  onClose,
  grandTotal,
  onSuccessPay,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(298); // ~5 minutes

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(298);
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timerStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-[#002045] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0284c7] text-2xl">qr_code_2</span>
            <div>
              <h3 className="font-display font-bold text-sm tracking-wide">QRIS Dynamic Standar</h3>
              <p className="text-[10px] text-sky-200">PT Pro Teknologi Instant Settlement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition"
          >
            ✕
          </button>
        </div>

        {/* QR Body */}
        <div className="p-6 flex flex-col items-center text-center">
          {/* Authentic QR Box with Stitch scanner indicator */}
          <div className="relative p-3 bg-white border-2 border-dashed border-slate-300 rounded-2xl shadow-inner">
            <div className="w-56 h-56 border-4 border-[#002045] p-2 flex flex-col justify-between rounded-xl bg-white relative overflow-hidden">
              {/* Corner position markers */}
              <div className="flex justify-between">
                <div className="w-10 h-10 border-4 border-[#002045] rounded-md flex items-center justify-center">
                  <div className="w-4 h-4 bg-[#002045]"></div>
                </div>
                <div className="w-10 h-10 border-4 border-[#002045] rounded-md flex items-center justify-center">
                  <div className="w-4 h-4 bg-[#002045]"></div>
                </div>
              </div>

              {/* Center QR symbol */}
              <div className="flex flex-col items-center justify-center py-2">
                <span className="material-symbols-outlined text-5xl text-[#0284c7]">qr_code_2</span>
                <span className="text-[10px] font-mono font-bold text-[#002045] tracking-widest mt-1">
                  NMID: ID102026PROTEK01
                </span>
              </div>

              {/* Bottom marker & Brand */}
              <div className="flex justify-between items-end">
                <div className="w-10 h-10 border-4 border-[#002045] rounded-md flex items-center justify-center">
                  <div className="w-4 h-4 bg-[#002045]"></div>
                </div>
                <div className="text-[9px] font-mono font-bold text-slate-500 uppercase">
                  QRIS ASPI STANDAR
                </div>
              </div>

              {/* Live Webhook Scanning Ring Indicator (From Stitch) */}
              <div className="absolute inset-x-0 top-0 h-1 bg-[#0284c7] shadow-[0_0_12px_#0284c7] animate-pulse"></div>
            </div>
          </div>

          {/* Grand Total Amount */}
          <div className="mt-4">
            <span className="text-[11px] font-display uppercase tracking-wider text-slate-500 font-bold">
              Total Pembayaran
            </span>
            <div className="font-display font-extrabold text-2xl text-[#002045] tracking-tight">
              {formatRupiah(grandTotal)}
            </div>
          </div>

          {/* Realtime Bank Status Indicator */}
          <div className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-sky-50 text-sky-800 rounded-full text-xs font-medium border border-sky-200">
            <span className="material-symbols-outlined text-[#0284c7] text-sm animate-spin">sync</span>
            <span>Menunggu notifikasi bank... <strong className="font-mono text-rose-600">{timerStr}</strong></span>
          </div>

          <p className="text-[11px] text-slate-500 mt-3 max-w-xs leading-relaxed">
            Arahkan kamera aplikasi BCA, Mandiri, GoPay, OVO, atau ShopeePay ke QR di atas untuk verifikasi otomatis.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition tactile-btn"
          >
            Batal
          </button>
          <button
            onClick={onSuccessPay}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-display font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition tactile-btn"
          >
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>Simulasi Bayar Berhasil</span>
          </button>
        </div>
      </div>
    </div>
  );
};
