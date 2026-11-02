import React from 'react';
import { Order, MenuItem, FinancialMetric } from '../types';
import { formatRupiah } from '../services/api';

interface ExecutiveDashboardProps {
  orders: Order[];
  menus: MenuItem[];
  financials: FinancialMetric;
  onOpenReceipt: (order: Order) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  orders,
  menus,
  financials,
  onOpenReceipt,
}) => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#f8f9ff] p-6 space-y-6">
      {/* Executive Welcome Bar */}
      <div className="bg-gradient-to-r from-[#002045] to-[#003875] text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center p-1 backdrop-blur-xs">
            <img src="/logo.png" alt="PT Pro Teknologi" className="h-10 w-auto object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono uppercase tracking-wider">
                Executive Owner Terminal
              </span>
              <span className="text-xs text-sky-200">PT Pro Teknologi Showcase</span>
            </div>
            <h1 className="text-2xl font-display font-extrabold tracking-tight mt-1">
              Laporan Keuangan & HPP Real-time
            </h1>
            <p className="text-xs text-sky-200 mt-0.5">
              Cabang: <strong>Mall Grand Indonesia (GI-01)</strong> | Periode: <strong>Hari Ini (Live)</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-white/10 border border-white/15 px-4 py-2.5 rounded-xl backdrop-blur-xs text-right">
            <span className="text-[10px] text-sky-200 uppercase font-semibold block">Total Transaksi</span>
            <span className="text-xl font-display font-bold">{orders.length} Pesanan</span>
          </div>
          <div className="bg-emerald-500/20 border border-emerald-400/30 px-4 py-2.5 rounded-xl backdrop-blur-xs text-right">
            <span className="text-[10px] text-emerald-200 uppercase font-semibold block">Margin Keuntungan</span>
            <span className="text-xl font-display font-bold text-emerald-300">
              {financials.profitMarginPct}%
            </span>
          </div>
        </div>
      </div>

      {/* KPI 5-Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Omzet */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Omzet</span>
            <span className="material-symbols-outlined text-[#0284c7] text-lg">trending_up</span>
          </div>
          <div className="text-xl font-display font-bold text-[#002045]">
            {formatRupiah(financials.totalRevenue)}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5 mt-1">
            <span className="material-symbols-outlined text-xs">arrow_upward</span>
            +18.4% vs kemarin
          </span>
        </div>

        {/* Card 2: HPP Total */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">HPP Bahan Baku</span>
            <span className="material-symbols-outlined text-amber-500 text-lg">inventory_2</span>
          </div>
          <div className="text-xl font-display font-bold text-slate-800">
            {formatRupiah(financials.totalHpp)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {((financials.totalHpp / (financials.totalRevenue || 1)) * 100).toFixed(1)}% food cost ratio
          </span>
        </div>

        {/* Card 3: Laba Kotor */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Laba Kotor</span>
            <span className="material-symbols-outlined text-emerald-600 text-lg">account_balance_wallet</span>
          </div>
          <div className="text-xl font-display font-bold text-emerald-700">
            {formatRupiah(financials.grossProfit)}
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block">
            Sebelum biaya tetap operasional
          </span>
        </div>

        {/* Card 4: Biaya Operasional */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Biaya Tetap (Sewa/Listrik)</span>
            <span className="material-symbols-outlined text-rose-500 text-lg">receipt</span>
          </div>
          <div className="text-xl font-display font-bold text-slate-800">
            {formatRupiah(75000)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Alokasi harian outlet
          </span>
        </div>

        {/* Card 5: Laba Bersih */}
        <div className="bg-white rounded-xl p-4 border-2 border-[#0284c7]/30 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-[#002045]">Laba Bersih (Net)</span>
            <span className="material-symbols-outlined text-[#0284c7] text-lg">savings</span>
          </div>
          <div className="text-xl font-display font-extrabold text-[#0284c7]">
            {formatRupiah(financials.netProfit)}
          </div>
          <span className="text-[11px] font-bold text-emerald-600 mt-1 block">
            {financials.profitMarginPct}% Profit Margin
          </span>
        </div>
      </div>

      {/* Hourly Trend & Category Sales Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly sales bar chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-base text-slate-900">
                Aktivitas Jam Sibuk (Hourly Peak Sales)
              </h2>
              <p className="text-xs text-slate-500">Omzet terdistribusi per sesi jam operasional</p>
            </div>
            <span className="px-2.5 py-1 bg-sky-50 text-sky-700 font-mono text-xs font-semibold rounded-lg">
              Peak: 12:00 - 14:00
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-100">
            {[
              { hour: '09:00', omzet: 90000, height: '35%' },
              { hour: '11:00', omzet: 180000, height: '65%' },
              { hour: '12:30', omzet: 310000, height: '100%', peak: true },
              { hour: '14:00', omzet: 140000, height: '50%' },
              { hour: '16:00', omzet: 80000, height: '30%' },
              { hour: '18:00', omzet: 220000, height: '75%' },
              { hour: '20:00', omzet: 160000, height: '55%' },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-800 transition">
                  {Math.round(bar.omzet / 1000)}k
                </span>
                <div
                  style={{ height: bar.height }}
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    bar.peak ? 'bg-[#0284c7] shadow-sm' : 'bg-slate-200 group-hover:bg-[#002045]'
                  }`}
                ></div>
                <span className="text-[10px] font-display font-semibold text-slate-600">
                  {bar.hour}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Contribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="font-display font-bold text-base text-slate-900">
              Komposisi Penjualan
            </h2>
            <p className="text-xs text-slate-500 mb-4">Kontribusi omzet per kategori menu</p>

            <div className="space-y-3">
              {[
                { cat: 'Dimsum & Snacks', pct: 48, color: 'bg-[#002045]' },
                { cat: 'Makanan Utama (Wagyu & Bebek)', pct: 32, color: 'bg-[#0284c7]' },
                { cat: 'Minuman (Kopi & Matcha)', pct: 20, color: 'bg-[#10b981]' },
              ].map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{c.cat}</span>
                    <span className="font-mono font-bold text-slate-900">{c.pct}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div style={{ width: `${c.pct}%` }} className={`h-full ${c.color} rounded-full`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
            💡 <strong>Rekomendasi AI:</strong> Tingkatkan bundle menu <em>Dimsum + Kopi Aren</em> saat jam makan siang untuk menaikkan average basket size sebesar 22%.
          </div>
        </div>
      </div>

      {/* Menu HPP & Margin Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-base text-slate-900">
              Analisis HPP & Margin Laba per Menu
            </h2>
            <p className="text-xs text-slate-500">Transparansi margin keuntungan tiap porsi produk</p>
          </div>
          <span className="text-xs bg-slate-100 px-3 py-1 rounded-lg text-slate-700 font-semibold">
            {menus.length} Produk Terdaftar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-display font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-4">Nama Produk</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Harga Jual</th>
                <th className="py-3 px-4">HPP (Modal)</th>
                <th className="py-3 px-4">Margin Laba</th>
                <th className="py-3 px-4">Food Cost %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {menus.map((item) => {
                const margin = item.price - item.costPrice;
                const marginPct = ((margin / item.price) * 100).toFixed(1);
                const foodCostPct = ((item.costPrice / item.price) * 100).toFixed(1);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">{item.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{item.name}</td>
                    <td className="py-3 px-4 uppercase text-[10px] font-bold text-slate-500">{item.category}</td>
                    <td className="py-3 px-4 font-display font-bold text-[#002045]">{formatRupiah(item.price)}</td>
                    <td className="py-3 px-4 text-slate-600">{formatRupiah(item.costPrice)}</td>
                    <td className="py-3 px-4 font-display font-bold text-emerald-600">
                      {formatRupiah(margin)} ({marginPct}%)
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        Number(foodCostPct) <= 40 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {foodCostPct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Transaksi Terbaru */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-base text-slate-900">
              Audit Struk & Riwayat Pesanan Hari Ini
            </h2>
            <p className="text-xs text-slate-500">Seluruh transaksi terverifikasi dengan invoice resmi</p>
          </div>
          <span className="text-xs text-slate-500">Sinkronisasi Cloud POS API</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-display font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. Invoice</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4">Metode Bayar</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Kasir</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono font-bold text-[#002045]">{ord.invoiceNumber}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {ord.customerName} {ord.tableNumber ? `(${ord.tableNumber})` : ''}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                      {ord.orderType}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ord.paymentMethod === 'QRIS' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {ord.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-display font-bold text-[#002045]">
                    {formatRupiah(ord.total)}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{ord.cashierName}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onOpenReceipt(ord)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-[#002045] hover:text-white rounded-lg text-slate-700 text-xs font-semibold transition"
                    >
                      Lihat Struk
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
