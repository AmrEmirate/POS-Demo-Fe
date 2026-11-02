export type OrderType = 'DINE_IN' | 'TAKEAWAY';
export type PaymentMethod = 'QRIS' | 'CASH' | 'DEBIT' | 'TRANSFER';

export interface MenuItem {
  id: string;
  code: string;
  name: string;
  category: 'kukus' | 'goreng' | 'mentai' | 'minuman' | 'snack' | string;
  price: number;
  costPrice: number;
  stock: number;
  description: string;
  image: string;
  isAvailable: boolean;
  isBestSeller?: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  invoiceNumber: string;
  customerName: string;
  tableNumber?: string | null;
  orderType: OrderType;
  items: {
    menuId: string;
    name: string;
    price: number;
    costPrice: number;
    quantity: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  hppTotal: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number | null;
  changeAmount?: number | null;
  cashierName: string;
  createdAt: string;
}

export interface ShiftInfo {
  id: string;
  shiftName: string;
  cashierName: string;
  terminalId: string;
  startTime: string;
  startingCash: number;
  cashSales: number;
  qrisSales: number;
  totalSales: number;
  status: 'ACTIVE' | 'CLOSED';
}

export interface FinancialMetric {
  totalRevenue: number;
  grossProfit: number;
  totalHpp: number;
  netProfit: number;
  profitMarginPct: number;
  totalOrdersCount: number;
}
