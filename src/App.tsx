import { useState, useEffect } from 'react';
import { MenuItem, CartItem, Order, OrderType, PaymentMethod } from './types';
import {
  INITIAL_MENUS,
  INITIAL_ORDERS,
  calculateFinancials,
  API_BASE_URL,
} from './services/api';
import { TopNav } from './components/TopNav';
import { PosTerminal } from './components/PosTerminal';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { QrisModal } from './components/QrisModal';
import { CashModal } from './components/CashModal';
import { ReceiptModal } from './components/ReceiptModal';
import { LoginPage, UserAccount } from './components/LoginPage';

export function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [activeTab, setActiveTab] = useState<'pos' | 'dashboard'>('pos');
  const [menus, setMenus] = useState<MenuItem[]>(INITIAL_MENUS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [tableNumber, setTableNumber] = useState<string>('Meja 01');
  const [customerName, setCustomerName] = useState<string>('Pelanggan Walk-In');
  const [discount, setDiscount] = useState<number>(0);

  // Modals state
  const [isQrisOpen, setIsQrisOpen] = useState<boolean>(false);
  const [isCashOpen, setIsCashOpen] = useState<boolean>(false);
  const [activeReceipt, setActiveReceipt] = useState<Order | null>(null);

  // Attempt to fetch live menus from API on load
  useEffect(() => {
    const fetchLiveMenus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/menus`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setMenus(json.data);
          }
        }
      } catch {
        // Fallback to initial Google Stitch menus
        console.log('Using local pre-seeded menus');
      }
    };
    fetchLiveMenus();
  }, []);

  // Keyboard shortcut [F2] to focus search, [Escape] to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (input) input.focus();
      }
      if (e.key === 'Escape') {
        setIsQrisOpen(false);
        setIsCashOpen(false);
        setActiveReceipt(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cart operations
  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((it) => it.menuItem.id === item.id);
      if (existing) {
        return prev.map((it) =>
          it.menuItem.id === item.id ? { ...it, quantity: it.quantity + 1 } : it
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const updateQuantity = (menuId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((it) => {
          if (it.menuItem.id === menuId) {
            const newQty = it.quantity + delta;
            return newQty > 0 ? { ...it, quantity: newQty } : null;
          }
          return it;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (menuId: string) => {
    setCart((prev) => prev.filter((it) => it.menuItem.id !== menuId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
  };

  // Grand Total calculation
  const subtotal = cart.reduce((acc, it) => acc + it.menuItem.price * it.quantity, 0);
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * 0.1);
  const grandTotal = taxableAmount + tax;

  // Finalize order & submit
  const handleCompleteOrder = async (
    method: PaymentMethod,
    cashReceived?: number,
    changeAmount?: number
  ) => {
    const hppTotal = cart.reduce((acc, it) => acc + it.menuItem.costPrice * it.quantity, 0);
    const invoiceNumber = `INV-DEMO-${String(orders.length + 1).padStart(3, '0')}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      invoiceNumber,
      customerName: customerName.trim() || 'Pelanggan Umum',
      tableNumber: orderType === 'DINE_IN' ? tableNumber : null,
      orderType,
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
      paymentMethod: method,
      cashReceived: cashReceived || null,
      changeAmount: changeAmount || null,
      cashierName: 'Budi Santoso',
      createdAt: new Date().toISOString(),
    };

    // Update state
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setIsQrisOpen(false);
    setIsCashOpen(false);
    setActiveReceipt(newOrder);

    // Optional background sync to API
    try {
      fetch(`${API_BASE_URL}/pos/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      }).catch(() => {});
    } catch {
      // Ignored in offline demo mode
    }
  };

  const financials = calculateFinancials(orders);

  if (!currentUser) {
    return (
      <LoginPage
        onLogin={(user) => {
          setCurrentUser(user);
          if (user.role === 'OWNER') {
            setActiveTab('dashboard');
          } else {
            setActiveTab('pos');
          }
        }}
      />
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#f8f9ff]">
      {/* Top Navigation */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
      />

      {/* Main View Area */}
      {activeTab === 'pos' ? (
        <PosTerminal
          menus={menus}
          cart={cart}
          addToCart={addToCart}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          clearCart={clearCart}
          orderType={orderType}
          setOrderType={setOrderType}
          tableNumber={tableNumber}
          setTableNumber={setTableNumber}
          customerName={customerName}
          setCustomerName={setCustomerName}
          discount={discount}
          setDiscount={setDiscount}
          onOpenQris={() => setIsQrisOpen(true)}
          onOpenCash={() => setIsCashOpen(true)}
          searchTerm={searchTerm}
        />
      ) : (
        <ExecutiveDashboard
          orders={orders}
          menus={menus}
          financials={financials}
          onOpenReceipt={(ord) => setActiveReceipt(ord)}
        />
      )}

      {/* Modals */}
      <QrisModal
        isOpen={isQrisOpen}
        onClose={() => setIsQrisOpen(false)}
        grandTotal={grandTotal}
        onSuccessPay={() => handleCompleteOrder('QRIS')}
      />

      <CashModal
        isOpen={isCashOpen}
        onClose={() => setIsCashOpen(false)}
        grandTotal={grandTotal}
        onSuccessPay={(received, change) => handleCompleteOrder('CASH', received, change)}
      />

      <ReceiptModal
        order={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />
    </div>
  );
}

export default App;
