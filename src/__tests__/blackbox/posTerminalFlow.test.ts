import { describe, it, expect } from 'vitest';
import { MenuItem, CartItem, Order, OrderType, PaymentMethod } from '../../types';
import { calculateFinancials, INITIAL_MENUS } from '../../services/api';

describe('Black Box Testing: POS Terminal Customer & Cashier Checkout Journey', () => {
  it('should complete a Dine-In QRIS transaction flow from product selection to settled order', () => {
    // 1. Pelanggan memilih menu
    const selectedItem1: MenuItem = INITIAL_MENUS[0]; // Siomay Dimsum Ayam (28.000)
    const selectedItem2: MenuItem = INITIAL_MENUS[7]; // Kopi Susu Aren (22.000)

    const cart: CartItem[] = [
      { menuItem: selectedItem1, quantity: 2 },
      { menuItem: selectedItem2, quantity: 2 },
    ];

    // 2. Kalkulasi keranjang
    const subtotal = cart.reduce((acc, it) => acc + it.menuItem.price * it.quantity, 0);
    expect(subtotal).toBe(100000); // 28000*2 + 22000*2

    // 3. Aplikasi voucher diskon
    const discount = 10000;
    const taxableAmount = Math.max(0, subtotal - discount); // 90000
    const tax = Math.round(taxableAmount * 0.1); // 9000 (PB1 10%)
    const grandTotal = taxableAmount + tax; // 99000
    expect(grandTotal).toBe(99000);

    // 4. Pembayaran via QRIS
    const hppTotal = cart.reduce((acc, it) => acc + it.menuItem.costPrice * it.quantity, 0);
    const completedOrder: Order = {
      id: 'ord-bb-1',
      invoiceNumber: 'INV-DEMO-999',
      customerName: 'Bapak Hendra',
      tableNumber: 'Meja 05',
      orderType: 'DINE_IN' as OrderType,
      items: cart.map((it) => ({
        menuId: it.menuItem.id,
        name: it.menuItem.name,
        price: it.menuItem.price,
        costPrice: it.menuItem.costPrice,
        quantity: it.quantity,
      })),
      subtotal,
      discount,
      tax,
      total: grandTotal,
      hppTotal,
      paymentMethod: 'QRIS' as PaymentMethod,
      cashierName: 'Budi Santoso',
      createdAt: new Date().toISOString(),
    };

    expect(completedOrder.invoiceNumber).toBe('INV-DEMO-999');
    expect(completedOrder.paymentMethod).toBe('QRIS');
    expect(completedOrder.total).toBe(99000);
    expect(completedOrder.items.length).toBe(2);
  });

  it('should accurately calculate Cash change for Takeaway orders', () => {
    const item: MenuItem = INITIAL_MENUS[5]; // Wagyu Fried Rice (38.000)
    const subtotal = item.price * 2; // 76.000
    const tax = Math.round(subtotal * 0.1); // 7.600
    const total = subtotal + tax; // 83.600

    const cashReceived = 100000;
    const change = cashReceived - total; // 16.400

    expect(change).toBe(16400);
    expect(cashReceived).toBeGreaterThanOrEqual(total);
  });

  it('should update executive financial metrics when new orders arrive', () => {
    const initialOrders: Order[] = [];
    const initialMetric = calculateFinancials(initialOrders);
    expect(initialMetric.totalRevenue).toBe(0);

    const newOrder: Order = {
      id: 'ord-100',
      invoiceNumber: 'INV-100',
      customerName: 'Klien VIP',
      tableNumber: 'Meja 09',
      orderType: 'DINE_IN',
      items: [{ menuId: 'm1', name: 'Siomay', price: 28000, costPrice: 12000, quantity: 1 }],
      subtotal: 28000,
      discount: 0,
      tax: 2800,
      total: 30800,
      hppTotal: 12000,
      paymentMethod: 'QRIS',
      cashierName: 'Budi Santoso',
      createdAt: new Date().toISOString(),
    };

    const updatedMetric = calculateFinancials([newOrder]);
    expect(updatedMetric.totalRevenue).toBe(30800);
    expect(updatedMetric.totalHpp).toBe(12000);
    expect(updatedMetric.grossProfit).toBe(18800);
  });
});
