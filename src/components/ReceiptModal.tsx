import React from 'react';
import { Order } from '../types';
import { formatRupiah } from '../services/api';

interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Actions bar */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
            Transaksi Berhasil
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-xs transition"
          >
            ✕
          </button>
        </div>

        {/* Paper Receipt container */}
        <div className="p-4 sm:p-6 bg-[#fafafa] font-mono text-xs text-slate-800 space-y-3 sm:space-y-4 flex-1 overflow-y-auto no-scrollbar">
          {/* Header */}
          <div className="text-center space-y-1">
            <img src="/logo.png" alt="PT Pro Teknologi" className="h-8 mx-auto object-contain mb-1" />
            <h4 className="font-bold text-sm tracking-tight text-slate-900 uppercase">
              PT PRO TEKNOLOGI
            </h4>
            <p className="text-[10px] text-slate-500 leading-tight">
              Mall Grand Indonesia Branch • Jakarta Pusat<br />
              Telp: 021-8899-7700
            </p>
          </div>

          <div className="border-b border-dashed border-slate-300"></div>

          {/* Meta */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">No. Invoice:</span>
              <strong className="text-slate-900">{order.invoiceNumber}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Waktu:</span>
              <span>{new Date(order.createdAt).toLocaleTimeString('id-ID')} WIB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kasir:</span>
              <span>{order.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Pelanggan:</span>
              <span>{order.customerName} {order.tableNumber ? `(${order.tableNumber})` : ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tipe Pesanan:</span>
              <span className="font-bold uppercase">{order.orderType}</span>
            </div>
          </div>

          <div className="border-b border-dashed border-slate-300"></div>

          {/* Items */}
          <div className="space-y-2">
            {order.items.map((it, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="font-bold text-slate-900">{it.name}</div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>{it.quantity} × {formatRupiah(it.price)}</span>
                  <span className="font-semibold text-slate-900">{formatRupiah(it.price * it.quantity)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-b border-dashed border-slate-300"></div>

          {/* Totals */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatRupiah(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Diskon Promo:</span>
                <span>-{formatRupiah(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>PB1 Pajak Resto (10%):</span>
              <span>{formatRupiah(order.tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
              <span>TOTAL BAYAR:</span>
              <span>{formatRupiah(order.total)}</span>
            </div>
            <div className="flex justify-between text-slate-600 pt-1">
              <span>Metode:</span>
              <span className="font-bold uppercase">{order.paymentMethod}</span>
            </div>
            {order.cashReceived && (
              <>
                <div className="flex justify-between text-slate-600">
                  <span>Tunai Diterima:</span>
                  <span>{formatRupiah(order.cashReceived)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold">
                  <span>Kembalian:</span>
                  <span>{formatRupiah(order.changeAmount || 0)}</span>
                </div>
              </>
            )}
          </div>

          <div className="border-b border-dashed border-slate-300"></div>

          {/* Footer note */}
          <div className="text-center text-[10px] text-slate-500 space-y-1">
            <p>Terima kasih atas kunjungan Anda!</p>
            <p className="font-mono text-[9px] text-slate-400">Powered by PT Pro Teknologi POS Engine</p>
          </div>
        </div>

        {/* Footer print buttons */}
        <div className="p-3 bg-white border-t border-slate-200 flex gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="flex-1 py-2.5 min-h-[42px] bg-[#002045] hover:bg-[#001733] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs tactile-btn active:scale-95"
          >
            <span className="material-symbols-outlined text-base">print</span>
            <span>Cetak Struk Thermal</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 min-h-[42px] border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition active:scale-95"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
