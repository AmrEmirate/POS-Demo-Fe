import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  FileSpreadsheet,
  FileText,
  Lock,
  CheckCircle2,
  ArrowUpDown,
  Search,
  Wallet,
  QrCode,
  CreditCard,
  Banknote,
  Receipt,
  Package,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportWorkbookToXlsx, type ExcelSheetData } from '../utils/exportUtils';
import type { Order } from '../types';

export type FinancialSortKey =
  | 'date_desc'
  | 'date_asc'
  | 'total_desc'
  | 'total_asc'
  | 'method_asc'
  | 'method_desc'
  | 'profit_desc';

export type DateRangeFilter = 'ALL' | 'TODAY' | '7D' | '30D';

export interface PaymentMethodSummary {
  method: string;
  label: string;
  txCount: number;
  revenue: number;
  hpp: number;
  grossProfit: number;
  sharePct: number;
}

export function getPaymentMethodLabel(method: string): string {
  switch (method) {
    case 'CASH':
      return 'Tunai (Cash)';
    case 'QRIS':
      return 'QRIS Statis';
    case 'DUITKU_QRIS':
      return 'QRIS Dinamis (Gateway)';
    case 'TRANSFER':
      return 'Transfer Bank / VA';
    case 'DEBIT':
      return 'Kartu Debit / EDC';
    default:
      return method;
  }
}

export function filterAndSortOrders(
  orders: Order[],
  options: {
    outletId: string;
    paymentMethod: string;
    dateRange: DateRangeFilter;
    searchQuery: string;
    sortBy: FinancialSortKey;
    nowMs?: number;
  }
): Order[] {
  const now = options.nowMs ?? Date.now();
  const q = options.searchQuery.trim().toLowerCase();

  const filtered = orders.filter((o) => {
    if (o.status !== 'PAID') return false;
    if (options.outletId !== 'all' && o.outletId !== options.outletId) return false;
    if (options.paymentMethod !== 'ALL' && o.paymentMethod !== options.paymentMethod) return false;

    if (options.dateRange !== 'ALL') {
      const createdMs = new Date(o.createdAt).getTime();
      if (options.dateRange === 'TODAY') {
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        if (createdMs < todayStart.getTime()) return false;
      } else if (options.dateRange === '7D') {
        if (createdMs < now - 7 * 24 * 60 * 60 * 1000) return false;
      } else if (options.dateRange === '30D') {
        if (createdMs < now - 30 * 24 * 60 * 60 * 1000) return false;
      }
    }

    if (q) {
      const inInvoice = o.invoiceNumber.toLowerCase().includes(q);
      const inCashier = o.cashierName.toLowerCase().includes(q);
      const inOutlet = (o.outletName || '').toLowerCase().includes(q);
      const inItems = o.items.some((item) => item.name.toLowerCase().includes(q));
      if (!inInvoice && !inCashier && !inOutlet && !inItems) return false;
    }

    return true;
  });

  return [...filtered].sort((a, b) => {
    switch (options.sortBy) {
      case 'date_asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'total_desc':
        return b.total - a.total;
      case 'total_asc':
        return a.total - b.total;
      case 'method_asc':
        return getPaymentMethodLabel(a.paymentMethod).localeCompare(
          getPaymentMethodLabel(b.paymentMethod),
          'id'
        );
      case 'method_desc':
        return getPaymentMethodLabel(b.paymentMethod).localeCompare(
          getPaymentMethodLabel(a.paymentMethod),
          'id'
        );
      case 'profit_desc':
        return b.total - b.hppTotal - (a.total - a.hppTotal);
      case 'date_desc':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
}

export function summarizeByPaymentMethod(orders: Order[]): PaymentMethodSummary[] {
  const paidOrders = orders.filter((o) => o.status === 'PAID');
  const totalRev = paidOrders.reduce((s, o) => s + o.total, 0);
  const map = new Map<string, { txCount: number; revenue: number; hpp: number }>();

  for (const order of paidOrders) {
    const prev = map.get(order.paymentMethod) || { txCount: 0, revenue: 0, hpp: 0 };
    map.set(order.paymentMethod, {
      txCount: prev.txCount + 1,
      revenue: prev.revenue + order.total,
      hpp: prev.hpp + order.hppTotal,
    });
  }

  return Array.from(map.entries())
    .map(([method, agg]) => ({
      method,
      label: getPaymentMethodLabel(method),
      txCount: agg.txCount,
      revenue: agg.revenue,
      hpp: agg.hpp,
      grossProfit: agg.revenue - agg.hpp,
      sharePct: totalRev > 0 ? (agg.revenue / totalRev) * 100 : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

const PaymentMethodIcon: React.FC<{ method: string; className?: string }> = ({
  method,
  className = 'w-4 h-4',
}) => {
  if (method === 'CASH') return <Banknote className={className} />;
  if (method === 'QRIS' || method === 'DUITKU_QRIS') return <QrCode className={className} />;
  return <CreditCard className={className} />;
};

export const ProfitLossPage: React.FC = () => {
  const {
    orders,
    pettyCashList,
    fixedExpenses,
    selectedOutletId,
    currentUser,
    logout,
    outlets,
    showNotification,
  } = useApp();

  const isOwner = currentUser.role === 'OWNER' || currentUser.role === 'AKUNTAN';
  const activeOutlet = outlets.find((o) => o.id === selectedOutletId);

  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<DateRangeFilter>('ALL');
  const [sortBy, setSortBy] = useState<FinancialSortKey>('date_desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAllRows, setShowAllRows] = useState<boolean>(false);

  // Orders for the active branch + date range (before payment-method filter, for payment summary cards)
  const scopedPaidOrders = useMemo(
    () =>
      filterAndSortOrders(orders, {
        outletId: selectedOutletId,
        paymentMethod: 'ALL',
        dateRange,
        searchQuery: '',
        sortBy: 'date_desc',
      }),
    [orders, selectedOutletId, dateRange]
  );

  // Orders after payment-method filter, search, and sort
  const filteredOrders = useMemo(
    () =>
      filterAndSortOrders(orders, {
        outletId: selectedOutletId,
        paymentMethod: paymentFilter,
        dateRange,
        searchQuery,
        sortBy,
      }),
    [orders, selectedOutletId, paymentFilter, dateRange, searchQuery, sortBy]
  );

  const paymentSummaries = useMemo(
    () => summarizeByPaymentMethod(scopedPaidOrders),
    [scopedPaidOrders]
  );

  // Available payment methods in dataset + standard ones
  const availableMethods = useMemo(() => {
    const set = new Set<string>(['CASH', 'QRIS', 'DUITKU_QRIS']);
    for (const o of orders) {
      if (o.paymentMethod) set.add(o.paymentMethod);
    }
    return Array.from(set);
  }, [orders]);

  // Top menu items from filtered orders
  const topItems = useMemo(() => {
    const itemMap = new Map<
      string,
      { name: string; qty: number; revenue: number; hpp: number }
    >();
    for (const order of filteredOrders) {
      for (const item of order.items) {
        const prev = itemMap.get(item.name) || {
          name: item.name,
          qty: 0,
          revenue: 0,
          hpp: 0,
        };
        itemMap.set(item.name, {
          name: item.name,
          qty: prev.qty + item.quantity,
          revenue: prev.revenue + item.price * item.quantity,
          hpp: prev.hpp + (item.costPrice || 0) * item.quantity,
        });
      }
    }
    return Array.from(itemMap.values()).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders]);

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-surface-card rounded-3xl border border-border-subtle shadow-sm animate-in fade-in">
        <div className="w-16 h-16 rounded-3xl bg-brand-espresso text-white flex items-center justify-center mb-4 shadow-md">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="font-display text-2xl font-bold text-brand-espresso">
          Akses Laporan Finansial Terkunci
        </h2>
        <p className="text-xs text-secondary mt-1.5 max-w-md leading-relaxed">
          Modul Laporan Keuangan, Laba Rugi, HPP, dan Arus Kas hanya dapat diakses oleh akun berwenang dengan hak akses <strong>OWNER</strong> atau <strong>AKUNTAN</strong>.
        </p>
        <button
          onClick={logout}
          className="mt-6 px-5 py-2.5 rounded-xl bg-brand-espresso hover:bg-brand-espresso-muted text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          Masuk dengan Akun Owner
        </button>
      </div>
    );
  }

  // Financial aggregates (from filteredOrders)
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalHpp = filteredOrders.reduce((sum, o) => sum + o.hppTotal, 0);
  const totalDiscount = filteredOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
  const grossProfit = totalRevenue - totalHpp;
  const grossMarginPct = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0.0';
  const avgOrderValue = filteredOrders.length > 0 ? Math.round(totalRevenue / filteredOrders.length) : 0;

  // Petty cash expenses
  const branchPettyCash = pettyCashList.filter(
    (p) => selectedOutletId === 'all' || p.outletId === selectedOutletId
  );
  const approvedPettyCash = branchPettyCash.filter((p) => p.status === 'DISETUJUI');
  const totalPettyCash = approvedPettyCash.reduce((sum, p) => sum + p.amount, 0);

  // Fixed OPEX
  const branchFixed = fixedExpenses.filter(
    (e) => selectedOutletId === 'all' || e.outletId === selectedOutletId || e.outletId === 'all'
  );
  const paidFixed = branchFixed.filter((e) => e.status === 'LUNAS');

  const totalSewa = paidFixed
    .filter((e) => e.category === 'SEWA_LAPAK')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalGaji = paidFixed
    .filter((e) => e.category === 'PAYROLL_GAJI')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalUtilitas = paidFixed
    .filter((e) => ['LISTRIK', 'AIR', 'INTERNET_POS'].includes(e.category))
    .reduce((sum, e) => sum + e.amount, 0);

  const totalOpex = totalPettyCash + totalSewa + totalGaji + totalUtilitas;
  const netProfit = grossProfit - totalOpex;
  const netMarginPct = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  const branchLabel =
    selectedOutletId === 'all'
      ? `Konsolidasi ${outlets.length} Outlet`
      : activeOutlet?.name || 'Cabang Terpilih';

  const triggerExport = (format: 'PDF' | 'EXCEL') => {
    const branchSlug =
      selectedOutletId === 'all'
        ? `Konsolidasi_${outlets.length}_Outlet`
        : (activeOutlet ? activeOutlet.name.replace(/\s+/g, '_') : 'Cabang');
    const dateStr = new Date().toISOString().slice(0, 10);

    if (format === 'EXCEL') {
      const sheets: ExcelSheetData[] = [
        {
          name: 'Ringkasan Laba Rugi',
          colWidths: [42, 22, 16, 36],
          rows: [
            ['LAPORAN KEUANGAN & LABA RUGI - PT PRO TEKNOLOGI (PRO POS)'],
            [`Cabang: ${branchLabel}`, `Filter Metode: ${paymentFilter === 'ALL' ? 'Semua Metode' : getPaymentMethodLabel(paymentFilter)}`, `Tanggal Ekspor: ${dateStr}`, `Periode: ${dateRange}`],
            [],
            ['KOMPONEN KEUANGAN', 'NOMINAL (IDR)', '% OMZET', 'KETERANGAN'],
            ['1. PENDAPATAN PENJUALAN (REVENUE)', totalRevenue, '100.0%', `${filteredOrders.length} Transaksi Terbayar`],
            ...paymentSummaries.map((pm) => [
              `   • ${pm.label}`,
              pm.revenue,
              `${pm.sharePct.toFixed(1)}%`,
              `${pm.txCount} transaksi`,
            ]),
            ['   • Total Diskon Diberikan', -totalDiscount, '-', 'Potongan harga promo / member'],
            ['2. HARGA POKOK PENJUALAN (HPP)', -totalHpp, `${totalRevenue > 0 ? ((totalHpp / totalRevenue) * 100).toFixed(1) : '0.0'}%`, 'Modal bahan baku & produk terjual'],
            ['3. LABA KOTOR (GROSS PROFIT)', grossProfit, `${grossMarginPct}%`, 'Pendapatan dikurangi HPP'],
            [],
            ['4. BEBAN OPERASIONAL (OPEX)', -totalOpex, `${totalRevenue > 0 ? ((totalOpex / totalRevenue) * 100).toFixed(1) : '0.0'}%`, 'Total biaya operasional'],
            ['   • Kas Kecil Darurat (Petty Cash)', -totalPettyCash, `${totalRevenue > 0 ? ((totalPettyCash / totalRevenue) * 100).toFixed(1) : '0.0'}%`, `${approvedPettyCash.length} pengajuan disetujui`],
            ['   • Sewa Lokasi / Lapak', -totalSewa, `${totalRevenue > 0 ? ((totalSewa / totalRevenue) * 100).toFixed(1) : '0.0'}%`, 'Biaya sewa outlet'],
            ['   • Payroll Gaji Karyawan', -totalGaji, `${totalRevenue > 0 ? ((totalGaji / totalRevenue) * 100).toFixed(1) : '0.0'}%`, 'Gaji kasir & tim operasional'],
            ['   • Utilitas (Listrik, Air, Internet POS)', -totalUtilitas, `${totalRevenue > 0 ? ((totalUtilitas / totalRevenue) * 100).toFixed(1) : '0.0'}%`, 'PLN, PDAM, Internet'],
            [],
            ['5. LABA BERSIH (NET OPERATING PROFIT)', netProfit, `${netMarginPct}%`, 'Laba kotor dikurangi total OPEX'],
          ],
        },
        {
          name: 'Per Metode Pembayaran',
          colWidths: [28, 16, 20, 18, 20, 16],
          rows: [
            ['REKAP KEUANGAN BERDASARKAN METODE PEMBAYARAN'],
            [`Cabang: ${branchLabel}`, `Tanggal: ${dateStr}`],
            [],
            ['Metode Pembayaran', 'Jml Transaksi', 'Total Omzet (Rp)', 'Total HPP (Rp)', 'Laba Kotor (Rp)', 'Kontribusi (%)'],
            ...paymentSummaries.map((pm) => [
              pm.label,
              pm.txCount,
              pm.revenue,
              pm.hpp,
              pm.grossProfit,
              Number(pm.sharePct.toFixed(1)),
            ]),
          ],
        },
        {
          name: 'Detail Transaksi',
          colWidths: [22, 22, 22, 18, 22, 14, 16, 16, 16, 16],
          rows: [
            ['BUKU BESAR DETAIL TRANSAKSI KEUANGAN'],
            [`Cabang: ${branchLabel}`, `Filter Metode: ${paymentFilter}`, `Urutan: ${sortBy}`],
            [],
            ['No. Invoice', 'Waktu Transaksi', 'Cabang / Outlet', 'Kasir', 'Metode Pembayaran', 'Jml Item', 'Subtotal (Rp)', 'Diskon (Rp)', 'Total Omzet (Rp)', 'HPP (Rp)', 'Laba Kotor (Rp)'],
            ...filteredOrders.map((o) => [
              o.invoiceNumber,
              new Date(o.createdAt).toLocaleString('id-ID'),
              o.outletName || o.outletId,
              o.cashierName,
              getPaymentMethodLabel(o.paymentMethod),
              o.items.reduce((s, it) => s + it.quantity, 0),
              o.subtotal,
              o.discount || 0,
              o.total,
              o.hppTotal,
              o.total - o.hppTotal,
            ]),
          ],
        },
        {
          name: 'Rincian Pengeluaran',
          colWidths: [18, 24, 34, 20, 18, 14],
          rows: [
            ['RINCIAN BEBAN OPERASIONAL & KAS KECIL'],
            [],
            ['Sumber', 'Kategori', 'Keterangan', 'Outlet', 'Nominal (Rp)', 'Status'],
            ...approvedPettyCash.map((p) => [
              'Kas Kecil',
              p.category || 'Operasional',
              p.description,
              p.outletName || p.outletId,
              p.amount,
              p.status,
            ]),
            ...paidFixed.map((e) => [
              'Biaya Tetap',
              e.category,
              e.title,
              e.outletId === 'all' ? 'Semua Cabang' : e.outletId,
              e.amount,
              e.status,
            ]),
          ],
        },
      ];

      exportWorkbookToXlsx(`Laporan_Keuangan_ProPOS_${branchSlug}_${dateStr}.xlsx`, sheets);
      showNotification(`File Excel (.xlsx) 4-sheet untuk ${branchLabel} berhasil diunduh!`, 'success');
      return;
    }

    // Printable PDF View with calm logo-matched corporate colors
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Laporan Keuangan Pro POS Enterprise - ${branchLabel}</title>
            <style>
              body { font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif; padding: 36px; color: #0F172A; }
              .header { border-bottom: 3px solid #113A5D; padding-bottom: 14px; margin-bottom: 22px; display: flex; justify-content: space-between; align-items: flex-end; }
              .title { font-size: 20px; font-weight: 700; color: #113A5D; margin: 0; }
              .subtitle { font-size: 12px; color: #475569; margin-top: 4px; }
              .badge { font-size: 11px; font-weight: 700; color: #D96B08; text-transform: uppercase; letter-spacing: 0.05em; }
              h3 { font-size: 13px; color: #113A5D; margin: 22px 0 8px; text-transform: uppercase; letter-spacing: 0.04em; }
              table { width: 100%; border-collapse: collapse; margin-top: 8px; }
              th, td { padding: 9px 10px; border-bottom: 1px solid #E2E8F0; font-size: 12px; }
              th { background-color: #F1F5F9; color: #113A5D; text-align: left; font-weight: 700; }
              .highlight { background-color: #FEF3C7; font-weight: 700; color: #113A5D; }
              .net { background-color: #113A5D; color: #FFFFFF; font-weight: 700; font-size: 13px; }
              .text-right { text-align: right; }
              .muted-neg { color: #64748B; }
              .footer { margin-top: 32px; font-size: 11px; color: #64748B; text-align: center; border-top: 1px solid #E2E8F0; padding-top: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="badge">PT Pro Teknologi • Laporan Keuangan Resmi</div>
                <h1 class="title">Laporan Laba Rugi &amp; Arus Kas</h1>
                <div class="subtitle">Cabang: ${branchLabel} | Metode: ${paymentFilter === 'ALL' ? 'Semua Metode' : getPaymentMethodLabel(paymentFilter)} | Dicetak: ${new Date().toLocaleString('id-ID')}</div>
              </div>
            </div>

            <h3>1. Ringkasan Laba Rugi</h3>
            <table>
              <thead>
                <tr>
                  <th>Komponen Finansial</th>
                  <th class="text-right">Nominal (Rp)</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Total Omzet Penjualan (Gross Revenue)</strong></td>
                  <td class="text-right"><strong>Rp ${totalRevenue.toLocaleString('id-ID')}</strong></td>
                  <td>${filteredOrders.length} Transaksi Terbayar</td>
                </tr>
                <tr>
                  <td>Total HPP Produk Terjual</td>
                  <td class="text-right muted-neg">-Rp ${totalHpp.toLocaleString('id-ID')}</td>
                  <td>Modal pokok penjualan</td>
                </tr>
                <tr class="highlight">
                  <td>LABA KOTOR (GROSS PROFIT)</td>
                  <td class="text-right">Rp ${grossProfit.toLocaleString('id-ID')}</td>
                  <td>Gross Margin: ${grossMarginPct}%</td>
                </tr>
                <tr>
                  <td>Kas Kecil Darurat (Petty Cash)</td>
                  <td class="text-right muted-neg">-Rp ${totalPettyCash.toLocaleString('id-ID')}</td>
                  <td>${approvedPettyCash.length} transaksi disetujui</td>
                </tr>
                <tr>
                  <td>Sewa Lokasi / Lapak</td>
                  <td class="text-right muted-neg">-Rp ${totalSewa.toLocaleString('id-ID')}</td>
                  <td>Biaya sewa cabang</td>
                </tr>
                <tr>
                  <td>Payroll Gaji Karyawan</td>
                  <td class="text-right muted-neg">-Rp ${totalGaji.toLocaleString('id-ID')}</td>
                  <td>Gaji kasir &amp; tim operasional</td>
                </tr>
                <tr>
                  <td>Utilitas (Listrik, Air, Internet POS)</td>
                  <td class="text-right muted-neg">-Rp ${totalUtilitas.toLocaleString('id-ID')}</td>
                  <td>PLN, PDAM, Internet</td>
                </tr>
                <tr class="net">
                  <td>LABA BERSIH (NET OPERATING PROFIT)</td>
                  <td class="text-right">Rp ${netProfit.toLocaleString('id-ID')}</td>
                  <td>Net Margin: ${netMarginPct}%</td>
                </tr>
              </tbody>
            </table>

            <h3>2. Rincian per Metode Pembayaran</h3>
            <table>
              <thead>
                <tr>
                  <th>Metode Pembayaran</th>
                  <th class="text-right">Transaksi</th>
                  <th class="text-right">Omzet (Rp)</th>
                  <th class="text-right">Laba Kotor (Rp)</th>
                  <th class="text-right">Porsi</th>
                </tr>
              </thead>
              <tbody>
                ${paymentSummaries
                  .map(
                    (pm) => `
                  <tr>
                    <td>${pm.label}</td>
                    <td class="text-right">${pm.txCount}</td>
                    <td class="text-right">Rp ${pm.revenue.toLocaleString('id-ID')}</td>
                    <td class="text-right">Rp ${pm.grossProfit.toLocaleString('id-ID')}</td>
                    <td class="text-right">${pm.sharePct.toFixed(1)}%</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>

            <div class="footer">
              Dokumen resmi sistem akuntansi PT Pro Teknologi (Pro POS Enterprise) • Otorisasi: ${currentUser.name}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
    showNotification('Laporan PDF siap dicetak atau disimpan!', 'success');
  };

  const displayedTransactions = showAllRows ? filteredOrders : filteredOrders.slice(0, 12);

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-xs">
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-brand-espresso text-white text-[10px] font-bold uppercase tracking-wider">
              Laporan Keuangan
            </span>
            <span className="text-xs text-secondary flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> {branchLabel}
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-brand-espresso mt-1.5">
            Pembukuan, Laba Rugi &amp; Audit Pembayaran
          </h1>
          <p className="text-xs text-secondary mt-0.5">
            Analisis detail pendapatan, HPP, beban operasional, dan sortir transaksi berdasarkan metode pembayaran.
          </p>
        </div>

        {/* Export CTAs */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => triggerExport('PDF')}
            className="inline-flex items-center gap-1.5 bg-surface-muted hover:bg-surface-container text-brand-espresso text-xs font-bold px-4 py-2.5 rounded-xl border border-border-strong transition-all active:scale-95 cursor-pointer min-h-[42px]"
          >
            <FileText className="w-4 h-4 text-brand-terracotta" />
            <span>Cetak / Ekspor PDF</span>
          </button>
          <button
            type="button"
            onClick={() => triggerExport('EXCEL')}
            className="inline-flex items-center gap-1.5 bg-brand-espresso hover:bg-brand-espresso-muted text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer min-h-[42px]"
          >
            <FileSpreadsheet className="w-4 h-4 text-brand-gold" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Filter & Payment Method Sort Bar */}
      <div className="bg-surface-card p-4 sm:p-5 rounded-2xl border border-border-subtle shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-espresso">
            <Filter className="w-4 h-4 text-brand-terracotta" />
            <span>Filter &amp; Sortir Keuangan</span>
          </div>
          {(paymentFilter !== 'ALL' || dateRange !== 'ALL' || searchQuery || sortBy !== 'date_desc') && (
            <button
              type="button"
              onClick={() => {
                setPaymentFilter('ALL');
                setDateRange('ALL');
                setSearchQuery('');
                setSortBy('date_desc');
              }}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary hover:text-brand-espresso cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari invoice, kasir, menu..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-muted border border-border-subtle text-xs text-on-surface placeholder:text-secondary/70 focus:outline-none focus:border-brand-espresso"
            />
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              aria-label="Filter Metode Pembayaran"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-muted border border-border-subtle text-xs font-semibold text-on-surface focus:outline-none focus:border-brand-espresso cursor-pointer"
            >
              <option value="ALL">Semua Metode Pembayaran</option>
              {availableMethods.map((m) => (
                <option key={m} value={m}>
                  {getPaymentMethodLabel(m)}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <select
              aria-label="Filter Periode Waktu"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangeFilter)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-muted border border-border-subtle text-xs font-semibold text-on-surface focus:outline-none focus:border-brand-espresso cursor-pointer"
            >
              <option value="ALL">Semua Periode</option>
              <option value="TODAY">Hari Ini</option>
              <option value="7D">7 Hari Terakhir</option>
              <option value="30D">30 Hari Terakhir</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="relative flex items-center">
            <ArrowUpDown className="w-3.5 h-3.5 text-secondary absolute left-3 pointer-events-none" />
            <select
              aria-label="Sortir Transaksi Keuangan"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as FinancialSortKey)}
              className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-surface-muted border border-border-subtle text-xs font-semibold text-on-surface focus:outline-none focus:border-brand-espresso cursor-pointer"
            >
              <option value="date_desc">Urutkan: Terbaru</option>
              <option value="date_asc">Urutkan: Terlama</option>
              <option value="method_asc">Sortir Metode Pembayaran (A–Z)</option>
              <option value="method_desc">Sortir Metode Pembayaran (Z–A)</option>
              <option value="total_desc">Nominal Tertinggi</option>
              <option value="total_asc">Nominal Terendah</option>
              <option value="profit_desc">Laba Kotor Tertinggi</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4 Executive High-Level KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
            1. Total Omzet Penjualan
          </span>
          <div className="font-display text-2xl font-bold text-brand-espresso mt-2 tabular-nums">
            Rp {totalRevenue.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-secondary mt-1.5 block">
            {filteredOrders.length} transaksi • Rata-rata Rp {avgOrderValue.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
            2. Harga Pokok (HPP)
          </span>
          <div className="font-display text-2xl font-bold text-slate-700 mt-2 tabular-nums">
            Rp {totalHpp.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-secondary mt-1.5 block">
            Rasio HPP: {totalRevenue > 0 ? ((totalHpp / totalRevenue) * 100).toFixed(1) : '0.0'}% dari omzet
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
            3. Laba Kotor (Gross Profit)
          </span>
          <div className="font-display text-2xl font-bold text-emerald-700 mt-2 tabular-nums">
            Rp {grossProfit.toLocaleString('id-ID')}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-semibold mt-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Gross Margin: {grossMarginPct}%</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-brand-espresso text-white shadow-sm border border-brand-espresso-muted/40">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
            4. Laba Bersih (Net Profit)
          </span>
          <div className="font-display text-2xl font-bold text-white mt-2 tabular-nums">
            Rp {netProfit.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-slate-200 font-medium mt-1.5">
            Net Margin: <strong className="text-amber-300">{netMarginPct}%</strong> (Setelah OPEX Rp {totalOpex.toLocaleString('id-ID')})
          </div>
        </div>
      </div>

      {/* Ringkasan & Sortir per Metode Pembayaran */}
      <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="font-display text-base font-bold text-brand-espresso flex items-center gap-2">
              <Wallet className="w-4 h-4 text-brand-terracotta" />
              Ringkasan Keuangan per Metode Pembayaran
            </h2>
            <p className="text-xs text-secondary mt-0.5">
              Klik salah satu kartu metode pembayaran untuk memfilter seluruh rincian transaksi dan laba di bawah.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-secondary">
            Total {scopedPaidOrders.length} transaksi terbayar
          </span>
        </div>

        {paymentSummaries.length === 0 ? (
          <div className="text-center py-8 text-xs text-secondary bg-surface-muted rounded-xl border border-border-subtle">
            Belum ada transaksi terbayar pada periode/cabang ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {paymentSummaries.map((pm) => {
              const isSelected = paymentFilter === pm.method;
              return (
                <button
                  key={pm.method}
                  type="button"
                  onClick={() => setPaymentFilter(isSelected ? 'ALL' : pm.method)}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/70 border-brand-terracotta ring-1 ring-brand-terracotta/40'
                      : 'bg-surface-muted/60 hover:bg-surface-muted border-border-subtle'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-espresso">
                      <PaymentMethodIcon method={pm.method} className="w-4 h-4 text-brand-terracotta" />
                      {pm.label}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white border border-border-subtle text-brand-espresso">
                      {pm.sharePct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="font-display text-lg font-bold text-brand-espresso mt-2 tabular-nums">
                    Rp {pm.revenue.toLocaleString('id-ID')}
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-espresso rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(4, pm.sharePct))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-secondary mt-2">
                    <span>{pm.txCount} transaksi</span>
                    <span>Laba: Rp {pm.grossProfit.toLocaleString('id-ID')}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Formal Financial Statement Ledger Table */}
      <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
        <div className="p-5 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-bold text-brand-espresso">
              Laporan Laba Rugi Komprehensif (P&amp;L Ledger)
            </h2>
            <p className="text-xs text-secondary mt-0.5">
              Rincian pendapatan per metode bayar, harga pokok penjualan, dan beban operasional.
            </p>
          </div>
          <span className="text-xs font-semibold text-brand-espresso bg-surface-muted px-3 py-1 rounded-xl border border-border-subtle self-start sm:self-auto">
            {paymentFilter === 'ALL' ? 'Semua Metode Bayar' : getPaymentMethodLabel(paymentFilter)}
          </span>
        </div>

        <div className="p-4 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[560px]">
            <thead>
              <tr className="border-b-2 border-border-strong text-secondary text-[11px] font-bold uppercase">
                <th className="py-2.5 px-3">Uraian Akun Finansial</th>
                <th className="py-2.5 px-3 text-right">Rincian Pos (Rp)</th>
                <th className="py-2.5 px-3 text-right">Subtotal / Total (Rp)</th>
                <th className="py-2.5 px-3 text-right">% Omzet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              <tr className="bg-surface-muted font-bold text-brand-espresso">
                <td className="py-3 px-3">1. PENDAPATAN OPERASIONAL (REVENUE)</td>
                <td></td>
                <td className="py-3 px-3 text-right tabular-nums">
                  Rp {totalRevenue.toLocaleString('id-ID')}
                </td>
                <td className="py-3 px-3 text-right font-bold">100.0%</td>
              </tr>
              {paymentSummaries
                .filter((pm) => paymentFilter === 'ALL' || pm.method === paymentFilter)
                .map((pm) => (
                  <tr key={pm.method} className="text-secondary">
                    <td className="py-2 px-6">
                      • Penjualan via {pm.label} ({pm.txCount} transaksi)
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      Rp {pm.revenue.toLocaleString('id-ID')}
                    </td>
                    <td></td>
                    <td className="py-2 px-3 text-right">
                      {totalRevenue > 0 ? ((pm.revenue / totalRevenue) * 100).toFixed(1) : '0.0'}%
                    </td>
                  </tr>
                ))}

              <tr className="bg-surface-muted font-bold text-brand-espresso">
                <td className="py-3 px-3">2. HARGA POKOK PENJUALAN (HPP)</td>
                <td></td>
                <td className="py-3 px-3 text-right tabular-nums text-slate-700">
                  (Rp {totalHpp.toLocaleString('id-ID')})
                </td>
                <td className="py-3 px-3 text-right font-bold text-slate-700">
                  {totalRevenue > 0 ? ((totalHpp / totalRevenue) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>
              <tr className="text-secondary">
                <td className="py-2 px-6">• Modal Bahan Baku &amp; Produk Terjual</td>
                <td className="py-2 px-3 text-right tabular-nums">
                  Rp {totalHpp.toLocaleString('id-ID')}
                </td>
                <td></td>
                <td className="py-2 px-3 text-right">
                  {totalRevenue > 0 ? ((totalHpp / totalRevenue) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>

              <tr className="bg-emerald-50/80 font-bold text-emerald-900 border-y border-emerald-200">
                <td className="py-3 px-3 text-sm">3. LABA KOTOR (GROSS PROFIT)</td>
                <td></td>
                <td className="py-3 px-3 text-right text-sm tabular-nums">
                  Rp {grossProfit.toLocaleString('id-ID')}
                </td>
                <td className="py-3 px-3 text-right text-sm">{grossMarginPct}%</td>
              </tr>

              <tr className="bg-surface-muted font-bold text-brand-espresso">
                <td className="py-3 px-3">4. BEBAN OPERASIONAL (OPEX)</td>
                <td></td>
                <td className="py-3 px-3 text-right tabular-nums text-slate-700">
                  (Rp {totalOpex.toLocaleString('id-ID')})
                </td>
                <td className="py-3 px-3 text-right font-bold text-slate-700">
                  {totalRevenue > 0 ? ((totalOpex / totalRevenue) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>
              <tr className="text-secondary">
                <td className="py-2 px-6">• Kas Kecil Darurat (Petty Cash Outlet)</td>
                <td className="py-2 px-3 text-right tabular-nums">
                  Rp {totalPettyCash.toLocaleString('id-ID')}
                </td>
                <td></td>
                <td className="py-2 px-3 text-right">
                  {totalRevenue > 0 ? ((totalPettyCash / totalRevenue) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>
              <tr className="text-secondary">
                <td className="py-2 px-6">• Sewa Lokasi / Lapak Operasional</td>
                <td className="py-2 px-3 text-right tabular-nums">
                  Rp {totalSewa.toLocaleString('id-ID')}
                </td>
                <td></td>
                <td className="py-2 px-3 text-right">
                  {totalRevenue > 0 ? ((totalSewa / totalRevenue) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>
              <tr className="text-secondary">
                <td className="py-2 px-6">• Payroll Gaji Karyawan &amp; Kasir</td>
                <td className="py-2 px-3 text-right tabular-nums">
                  Rp {totalGaji.toLocaleString('id-ID')}
                </td>
                <td></td>
                <td className="py-2 px-3 text-right">
                  {totalRevenue > 0 ? ((totalGaji / totalRevenue) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>
              <tr className="text-secondary">
                <td className="py-2 px-6">• Utilitas Listrik, Air &amp; Internet POS</td>
                <td className="py-2 px-3 text-right tabular-nums">
                  Rp {totalUtilitas.toLocaleString('id-ID')}
                </td>
                <td></td>
                <td className="py-2 px-3 text-right">
                  {totalRevenue > 0 ? ((totalUtilitas / totalRevenue) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>

              <tr className="bg-brand-espresso text-white font-bold text-sm">
                <td className="py-4 px-3 font-display text-base tracking-wide">
                  5. LABA BERSIH (NET OPERATING PROFIT)
                </td>
                <td></td>
                <td className="py-4 px-3 text-right tabular-nums font-display text-lg text-amber-300">
                  Rp {netProfit.toLocaleString('id-ID')}
                </td>
                <td className="py-4 px-3 text-right font-display text-base text-amber-300">
                  {netMarginPct}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Transaction Ledger (Sortable by Payment Method, Amount, Date) */}
      <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
        <div className="p-5 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-bold text-brand-espresso flex items-center gap-2">
              <Receipt className="w-4 h-4 text-brand-terracotta" />
              Buku Besar Rincian Transaksi Keuangan
            </h2>
            <p className="text-xs text-secondary mt-0.5">
              Menampilkan {displayedTransactions.length} dari {filteredOrders.length} transaksi sesuai filter &amp; urutan aktif.
            </p>
          </div>
          {filteredOrders.length > 12 && (
            <button
              type="button"
              onClick={() => setShowAllRows((prev) => !prev)}
              className="text-xs font-bold text-brand-espresso hover:text-brand-terracotta cursor-pointer self-start sm:self-auto"
            >
              {showAllRows ? 'Tampilkan Ringkas (12)' : `Tampilkan Semua (${filteredOrders.length})`}
            </button>
          )}
        </div>

        <div className="p-4 overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-xs text-secondary">
              Tidak ada transaksi yang cocok dengan filter pencarian atau metode pembayaran saat ini.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs min-w-[760px]">
              <thead>
                <tr className="border-b-2 border-border-strong text-secondary text-[11px] font-bold uppercase">
                  <th className="py-2.5 px-3">No. Invoice</th>
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Cabang &amp; Kasir</th>
                  <th className="py-2.5 px-3">Metode Pembayaran</th>
                  <th className="py-2.5 px-3 text-right">Item</th>
                  <th className="py-2.5 px-3 text-right">Omzet (Rp)</th>
                  <th className="py-2.5 px-3 text-right">HPP (Rp)</th>
                  <th className="py-2.5 px-3 text-right">Laba Kotor (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {displayedTransactions.map((o) => {
                  const itemQty = o.items.reduce((s, it) => s + it.quantity, 0);
                  const profit = o.total - o.hppTotal;
                  return (
                    <tr key={o.id} className="hover:bg-surface-muted/60 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-brand-espresso tabular-nums">
                        {o.invoiceNumber}
                      </td>
                      <td className="py-2.5 px-3 text-secondary tabular-nums">
                        {new Date(o.createdAt).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-on-surface">{o.outletName || o.outletId}</div>
                        <div className="text-[11px] text-secondary">{o.cashierName}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-muted border border-border-subtle text-brand-espresso font-semibold text-[11px]">
                          <PaymentMethodIcon method={o.paymentMethod} className="w-3.5 h-3.5 text-brand-terracotta" />
                          {getPaymentMethodLabel(o.paymentMethod)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-secondary">
                        {itemQty} pcs
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-bold text-brand-espresso">
                        Rp {o.total.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-secondary">
                        Rp {o.hppTotal.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-bold text-emerald-700">
                        Rp {profit.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Product Sales & Margin Breakdown */}
      <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
        <div className="p-5 border-b border-border-subtle">
          <h2 className="font-display text-base font-bold text-brand-espresso flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-terracotta" />
            Rincian Penjualan &amp; Margin per Produk
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Kontribusi produk terhadap omzet dan laba kotor sesuai filter aktif.
          </p>
        </div>
        <div className="p-4 overflow-x-auto">
          {topItems.length === 0 ? (
            <div className="text-center py-6 text-xs text-secondary">Belum ada data penjualan produk.</div>
          ) : (
            <table className="w-full text-left border-collapse text-xs min-w-[540px]">
              <thead>
                <tr className="border-b-2 border-border-strong text-secondary text-[11px] font-bold uppercase">
                  <th className="py-2.5 px-3">Nama Produk / Menu</th>
                  <th className="py-2.5 px-3 text-right">Qty Terjual</th>
                  <th className="py-2.5 px-3 text-right">Total Omzet (Rp)</th>
                  <th className="py-2.5 px-3 text-right">Total HPP (Rp)</th>
                  <th className="py-2.5 px-3 text-right">Laba Kotor (Rp)</th>
                  <th className="py-2.5 px-3 text-right">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {topItems.slice(0, 10).map((it) => {
                  const itemProfit = it.revenue - it.hpp;
                  const marginPct = it.revenue > 0 ? ((itemProfit / it.revenue) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={it.name} className="hover:bg-surface-muted/60">
                      <td className="py-2.5 px-3 font-semibold text-brand-espresso">{it.name}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-secondary">{it.qty}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-bold text-brand-espresso">
                        Rp {it.revenue.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-secondary">
                        Rp {it.hpp.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-bold text-emerald-700">
                        Rp {itemProfit.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-secondary">{marginPct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
