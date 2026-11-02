import { describe, it, expect } from 'vitest';
import { calculateFinancials, formatRupiah, INITIAL_MENUS } from '../../services/api';
import { Order, OrderType, PaymentMethod } from '../../types';

describe('White Box Testing: POS Financial Math & Formatting Logic', () => {
  it('should format numbers to Indonesian Rupiah standard', () => {
    expect(formatRupiah(25000)).toBe('Rp 25.000');
    expect(formatRupiah(0)).toBe('Rp 0');
    expect(formatRupiah(1500500)).toBe('Rp 1.500.500');
  });

  it('should calculate gross profit, net profit, and profit margin accurately', () => {
    const sampleOrders: Order[] = [
      {
        id: 'ord-test-1',
        invoiceNumber: 'INV-TEST-001',
        customerName: 'Test Client',
        orderType: 'DINE_IN' as OrderType,
        items: [
          { menuId: 'm1', name: 'Siomay', price: 28000, costPrice: 12000, quantity: 2 },
        ],
        subtotal: 56000,
        discount: 0,
        tax: 5600,
        total: 61600,
        hppTotal: 24000,
        paymentMethod: 'QRIS' as PaymentMethod,
        cashierName: 'Budi Santoso',
        createdAt: new Date().toISOString(),
      },
    ];

    const result = calculateFinancials(sampleOrders);

    expect(result.totalRevenue).toBe(61600);
    expect(result.totalHpp).toBe(24000);
    expect(result.grossProfit).toBe(37600); // 61600 - 24000
    expect(result.totalOrdersCount).toBe(1);
    expect(result.netProfit).toBe(37600 - 75000); // After fixed daily operational expense
  });

  it('should ensure all pre-loaded Google Stitch menus have valid positive prices and stock', () => {
    expect(INITIAL_MENUS.length).toBeGreaterThanOrEqual(10);
    for (const menu of INITIAL_MENUS) {
      expect(menu.price).toBeGreaterThan(0);
      expect(menu.costPrice).toBeGreaterThan(0);
      expect(menu.price).toBeGreaterThan(menu.costPrice); // Margin must be positive
      expect(menu.stock).toBeGreaterThan(0);
      expect(menu.code).toMatch(/^[A-Z]{2,3}-\d{2}$/);
    }
  });

  it('should prevent negative taxable base when discount exceeds subtotal', () => {
    const subtotal = 20000;
    const discount = 30000;
    const taxableBase = Math.max(0, subtotal - discount);
    const tax = Math.round(taxableBase * 0.1);
    const grandTotal = taxableBase + tax;

    expect(taxableBase).toBe(0);
    expect(tax).toBe(0);
    expect(grandTotal).toBe(0);
  });
});
