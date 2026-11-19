import { describe, it, expect } from 'vitest';
import {
  filterAndSortOrders,
  summarizeByPaymentMethod,
  getPaymentMethodLabel,
} from '../../pages/ProfitLossPage';
import { buildExcelWorkbook } from '../../utils/exportUtils';
import type { Order } from '../../types';

const sampleOrders: Order[] = [
  {
    id: 'ord-1',
    invoiceNumber: 'INV-001',
    outletId: 'du',
    outletName: 'Cabang Dago',
    orderType: 'takeaway',
    items: [{ menuId: 'm1', name: 'Menu A', price: 25000, costPrice: 12000, quantity: 2 }],
    subtotal: 50000,
    discount: 0,
    total: 50000,
    hppTotal: 24000,
    paymentMethod: 'CASH',
    cashierName: 'Siti',
    status: 'PAID',
    createdAt: '2026-11-19T03:00:00.000Z',
  },
  {
    id: 'ord-2',
    invoiceNumber: 'INV-002',
    outletId: 'du',
    outletName: 'Cabang Dago',
    orderType: 'dine-in',
    items: [{ menuId: 'm2', name: 'Menu B', price: 60000, costPrice: 25000, quantity: 2 }],
    subtotal: 120000,
    discount: 0,
    total: 120000,
    hppTotal: 50000,
    paymentMethod: 'QRIS',
    cashierName: 'Budi',
    status: 'PAID',
    createdAt: '2026-11-19T05:00:00.000Z',
  },
  {
    id: 'ord-3',
    invoiceNumber: 'INV-003',
    outletId: 'riau',
    outletName: 'Cabang Riau',
    orderType: 'takeaway',
    items: [{ menuId: 'm3', name: 'Menu C', price: 30000, costPrice: 10000, quantity: 1 }],
    subtotal: 30000,
    discount: 0,
    total: 30000,
    hppTotal: 10000,
    paymentMethod: 'DUITKU_QRIS',
    cashierName: 'Rina',
    status: 'PAID',
    createdAt: '2026-11-19T04:00:00.000Z',
  },
  {
    id: 'ord-4',
    invoiceNumber: 'INV-004',
    outletId: 'du',
    outletName: 'Cabang Dago',
    orderType: 'takeaway',
    items: [{ menuId: 'm1', name: 'Menu A', price: 25000, costPrice: 12000, quantity: 1 }],
    subtotal: 25000,
    discount: 0,
    total: 25000,
    hppTotal: 12000,
    paymentMethod: 'CASH',
    cashierName: 'Siti',
    status: 'VOIDED',
    createdAt: '2026-11-19T06:00:00.000Z',
  },
];

describe('White-Box Testing: ProfitLossPage Financial Sorting, Payment Method Breakdown & Excel Export', () => {
  it('excludes VOIDED orders and summarizes paid orders by payment method', () => {
    const summary = summarizeByPaymentMethod(sampleOrders);
    expect(summary).toHaveLength(3);
    expect(summary[0].method).toBe('QRIS');
    expect(summary[0].revenue).toBe(120000);
    expect(summary[0].grossProfit).toBe(70000);
    expect(summary[0].sharePct).toBeCloseTo(60, 1);

    const cash = summary.find((s) => s.method === 'CASH');
    expect(cash?.txCount).toBe(1);
    expect(cash?.revenue).toBe(50000);
  });

  it('filters by payment method and sorts by payment method A-Z / Z-A and nominal', () => {
    const onlyCash = filterAndSortOrders(sampleOrders, {
      outletId: 'all',
      paymentMethod: 'CASH',
      dateRange: 'ALL',
      searchQuery: '',
      sortBy: 'date_desc',
    });
    expect(onlyCash.map((o) => o.id)).toEqual(['ord-1']);

    const sortedByMethodAsc = filterAndSortOrders(sampleOrders, {
      outletId: 'all',
      paymentMethod: 'ALL',
      dateRange: 'ALL',
      searchQuery: '',
      sortBy: 'method_asc',
    });
    expect(sortedByMethodAsc.map((o) => getPaymentMethodLabel(o.paymentMethod))).toEqual([
      'QRIS Dinamis (Gateway)',
      'QRIS Statis',
      'Tunai (Cash)',
    ]);

    const sortedByTotalDesc = filterAndSortOrders(sampleOrders, {
      outletId: 'all',
      paymentMethod: 'ALL',
      dateRange: 'ALL',
      searchQuery: '',
      sortBy: 'total_desc',
    });
    expect(sortedByTotalDesc.map((o) => o.id)).toEqual(['ord-2', 'ord-1', 'ord-3']);
  });

  it('builds multi-sheet XLSX workbook with Ringkasan, Metode Pembayaran, and Detail Transaksi', () => {
    const wb = buildExcelWorkbook([
      { name: 'Ringkasan Laba Rugi', rows: [['Omzet', 200000], ['Laba', 116000]] },
      { name: 'Per Metode Pembayaran', rows: [['Metode', 'Nominal'], ['QRIS', 120000]] },
      { name: 'Detail Transaksi', rows: [['Invoice', 'Total'], ['INV-001', 50000]] },
    ]);

    expect(wb.SheetNames).toEqual([
      'Ringkasan Laba Rugi',
      'Per Metode Pembayaran',
      'Detail Transaksi',
    ]);
    expect(wb.Sheets['Ringkasan Laba Rugi']['B1'].v).toBe(200000);
    expect(wb.Sheets['Per Metode Pembayaran']['A2'].v).toBe('QRIS');
  });
});
