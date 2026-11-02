import React, { useState } from 'react';
import { MenuItem, CartItem, OrderType } from '../types';
import { formatRupiah } from '../services/api';

interface PosTerminalProps {
  menus: MenuItem[];
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  updateQuantity: (menuId: string, delta: number) => void;
  removeFromCart: (menuId: string) => void;
  clearCart: () => void;
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  tableNumber: string;
  setTableNumber: (table: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  discount: number;
  setDiscount: (discount: number) => void;
  onOpenQris: () => void;
  onOpenCash: () => void;
  searchTerm: string;
}

export const PosTerminal: React.FC<PosTerminalProps> = ({
  menus,
  cart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  orderType,
  setOrderType,
  tableNumber,
  setTableNumber,
  customerName,
  setCustomerName,
  discount,
  setDiscount,
  onOpenQris,
  onOpenCash,
  searchTerm,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isMobileCartOpen, setIsMobileCartOpen] = useState<boolean>(false);

  // Filter menus based on search & category
  const filteredMenus = menus.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'dimsum') return item.category === 'kukus' || item.category === 'mentai';
    if (selectedCategory === 'makanan') return item.category === 'goreng';
    if (selectedCategory === 'minuman') return item.category === 'minuman';
    if (selectedCategory === 'promo') return item.isBestSeller;
    return true;
  });

  // Calculate totals
  const subtotal = cart.reduce((acc, it) => acc + it.menuItem.price * it.quantity, 0);
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * 0.1); // PB1 10%
  const grandTotal = taxableAmount + tax;

  return (
    <div className="flex-1 flex overflow-hidden bg-[#f8f9ff]">
      {/* COLUMN 1: LEFT CATEGORY & HARDWARE RAIL (Hidden on mobile/tablet, available via top filter chips) */}
      <aside className="hidden lg:flex w-56 lg:w-60 bg-[#f2f3f9] border-r border-slate-200 flex-col justify-between p-3 shrink-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="font-display text-[11px] font-bold text-slate-500 tracking-wider uppercase">
              Kategori Menu
            </span>
            <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
              5 Dept
            </span>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition tactile-btn ${
                selectedCategory === 'all'
                  ? 'bg-[#002045] text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">apps</span>
                <span className="font-display">Semua Menu</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {menus.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('dimsum')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition tactile-btn ${
                selectedCategory === 'dimsum'
                  ? 'bg-[#002045] text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">restaurant</span>
                <span className="font-display">Dimsum & Snacks</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${selectedCategory === 'dimsum' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                5
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('makanan')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition tactile-btn ${
                selectedCategory === 'makanan'
                  ? 'bg-[#002045] text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">lunch_dining</span>
                <span className="font-display">Makanan Utama</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${selectedCategory === 'makanan' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                2
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('minuman')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition tactile-btn ${
                selectedCategory === 'minuman'
                  ? 'bg-[#002045] text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">local_cafe</span>
                <span className="font-display">Minuman Segar</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${selectedCategory === 'minuman' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                3
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('promo')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition tactile-btn ${
                selectedCategory === 'promo'
                  ? 'bg-[#002045] text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-rose-500">local_fire_department</span>
                <span className="font-display">Best Seller Deals</span>
              </div>
              <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded">
                HOT
              </span>
            </button>
          </nav>
        </div>

        {/* Hardware & Drawer Operations */}
        <div className="space-y-2 pt-3 border-t border-slate-200">
          <button
            onClick={() => alert('Laci Kas Terbuka (F9)! Modal kas Rp 500.000 tercatat.')}
            className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-slate-100 rounded-lg text-slate-700 text-xs font-semibold border border-slate-200 tactile-btn transition"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-sky-600">point_of_sale</span>
              <span>Buka Laci Kas</span>
            </div>
            <kbd className="text-[10px] bg-slate-100 px-1 py-0.5 rounded border border-slate-200 font-mono">F9</kbd>
          </button>

          <button
            onClick={() => alert('Sesi Shift Kasir Aktif (Shift 1 - Budi Santoso)')}
            className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-rose-50 hover:text-rose-700 rounded-lg text-slate-600 text-xs font-semibold border border-slate-200 tactile-btn transition"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-amber-500">lock_clock</span>
              <span>Rekap Shift</span>
            </div>
            <span className="material-symbols-outlined text-sm">info</span>
          </button>
        </div>
      </aside>

      {/* COLUMN 2: CENTER PRODUCT CATALOG (Flex-1) */}
      <main className="flex-1 flex flex-col bg-[#f8f9ff] overflow-hidden">
        {/* Category quick filter chips */}
        <div className="px-5 py-2.5 bg-white border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-xs font-display font-bold text-slate-500 uppercase mr-1">Filter:</span>
          {['all', 'dimsum', 'makanan', 'minuman', 'promo'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap tactile-btn ${
                selectedCategory === cat
                  ? 'bg-[#0284c7] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' && 'Semua Menu'}
              {cat === 'dimsum' && 'Dimsum & Snacks'}
              {cat === 'makanan' && 'Makanan Utama'}
              {cat === 'minuman' && 'Minuman Segar'}
              {cat === 'promo' && '⭐ Best Seller'}
            </button>
          ))}
          <div className="ml-auto text-xs text-slate-500 font-medium">
            Menampilkan <strong className="text-slate-900">{filteredMenus.length}</strong> menu
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMenus.map((item) => (
              <div
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-[#0284c7] transition duration-200 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Image container with stitch styling */}
                  <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.isBestSeller && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-white font-display text-[10px] font-bold rounded-md shadow-xs">
                        BEST SELLER
                      </span>
                    )}
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-slate-900/70 text-white font-mono text-[10px] rounded backdrop-blur-xs">
                      {item.code}
                    </span>
                  </div>

                  <div className="p-3">
                    <h3 className="font-display font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-[#0284c7] transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="px-3 pb-3 pt-1 flex items-center justify-between border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Harga</span>
                    <span className="font-display font-bold text-slate-900 text-sm text-[#002045]">
                      {formatRupiah(item.price)}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item);
                    }}
                    className="w-8 h-8 rounded-xl bg-[#002045] hover:bg-[#0284c7] text-white flex items-center justify-center transition shadow-xs tactile-btn"
                    title="Tambah ke pesanan"
                  >
                    <span className="material-symbols-outlined text-lg">add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Floating Cart Action Bar */}
        {cart.length > 0 && !isMobileCartOpen && (
          <div className="md:hidden p-3 bg-white border-t border-slate-200 shadow-2xl flex items-center justify-between shrink-0">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">
                {cart.reduce((a, b) => a + b.quantity, 0)} Item Dipilih
              </span>
              <span className="text-sm font-bold text-[#002045] font-display">
                {formatRupiah(grandTotal)}
              </span>
            </div>
            <button
              onClick={() => setIsMobileCartOpen(true)}
              className="px-4 py-2 bg-[#002045] hover:bg-[#0284c7] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-base">shopping_cart</span>
              <span>Buka Keranjang ({cart.length}) &rarr;</span>
            </button>
          </div>
        )}
      </main>

      {/* COLUMN 3: RIGHT ORDER CART & CHECKOUT RAIL */}
      <aside
        className={`fixed inset-0 z-40 md:static md:z-auto w-full md:w-80 lg:w-96 bg-white border-l border-slate-200 flex flex-col justify-between shrink-0 shadow-lg transition-transform duration-200 ${
          isMobileCartOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'
        }`}
      >
        {/* Cart Header & Order Meta */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#002045] text-xl">shopping_cart</span>
              <h2 className="font-display font-bold text-slate-900 text-base">Pesanan Kasir</h2>
            </div>
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold"
                >
                  Kosongkan
                </button>
              )}
              <button
                onClick={() => setIsMobileCartOpen(false)}
                className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-200"
                title="Tutup Keranjang"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>

          {/* Dine-In / Takeaway Toggle */}
          <div className="grid grid-cols-2 gap-1 bg-slate-200/70 p-1 rounded-xl">
            <button
              onClick={() => setOrderType('DINE_IN')}
              className={`py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                orderType === 'DINE_IN' ? 'bg-white text-[#002045] shadow-xs' : 'text-slate-600'
              }`}
            >
              <span className="material-symbols-outlined text-sm">table_restaurant</span>
              <span>Dine-In (Makan Sini)</span>
            </button>
            <button
              onClick={() => setOrderType('TAKEAWAY')}
              className={`py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                orderType === 'TAKEAWAY' ? 'bg-white text-[#002045] shadow-xs' : 'text-slate-600'
              }`}
            >
              <span className="material-symbols-outlined text-sm">takeout_dining</span>
              <span>Take Away (Bungkus)</span>
            </button>
          </div>

          {/* Table number & Customer Input */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                {orderType === 'DINE_IN' ? 'Nomor Meja' : 'Antrean'}
              </label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Meja 01"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0284c7]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Nama Pelanggan
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ahmad / Meja 01"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0284c7]"
              />
            </div>
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12 text-center">
              <span className="material-symbols-outlined text-5xl mb-2 text-slate-300">point_of_sale</span>
              <p className="text-xs font-medium">Keranjang masih kosong</p>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                Pilih menu di katalog atau cari dengan tombol [F2] untuk menambahkan item.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.menuItem.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-bold text-xs text-slate-900">
                      {item.menuItem.name}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {formatRupiah(item.menuItem.price)} × {item.quantity} ={' '}
                    <strong className="text-slate-800">{formatRupiah(item.menuItem.price * item.quantity)}</strong>
                  </div>
                </div>

                {/* Counter controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.menuItem.id, -1)}
                    className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold tactile-btn"
                  >
                    -
                  </button>
                  <span className="font-display font-bold text-xs w-5 text-center text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.menuItem.id, 1)}
                    className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold tactile-btn"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.menuItem.id)}
                    className="text-slate-400 hover:text-rose-600 ml-1"
                    title="Hapus"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill Summary & Action Buttons */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} item)</span>
              <span className="font-semibold text-slate-800">{formatRupiah(subtotal)}</span>
            </div>

            <div className="flex justify-between items-center text-emerald-600">
              <span className="flex items-center gap-1">
                Diskon Promo
                {discount > 0 && (
                  <button onClick={() => setDiscount(0)} className="text-[10px] text-rose-500 underline ml-1">
                    reset
                  </button>
                )}
              </span>
              <div className="flex items-center gap-1">
                {discount === 0 ? (
                  <button
                    onClick={() => setDiscount(10000)}
                    className="text-[10px] px-1.5 py-0.5 bg-emerald-100 rounded text-emerald-700 font-bold hover:bg-emerald-200"
                  >
                    + Voucher 10k
                  </button>
                ) : (
                  <span className="font-bold">- {formatRupiah(discount)}</span>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <span>PB1 Pajak Resto (10%)</span>
              <span className="font-semibold text-slate-800">{formatRupiah(tax)}</span>
            </div>

            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
              <span className="font-display font-bold text-sm text-slate-900">Total Tagihan</span>
              <span className="font-display font-extrabold text-xl text-[#002045]">
                {formatRupiah(grandTotal)}
              </span>
            </div>
          </div>

          {/* Checkout Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              disabled={cart.length === 0}
              onClick={onOpenQris}
              className="py-3 px-2 bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl font-display font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-xs transition tactile-btn"
            >
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-lg">qr_code_2</span>
                <span>QRIS Instan</span>
              </div>
              <span className="text-[10px] text-sky-100 font-normal">Auto-Verifikasi Bank</span>
            </button>

            <button
              disabled={cart.length === 0}
              onClick={onOpenCash}
              className="py-3 px-2 bg-[#002045] hover:bg-[#00142b] disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl font-display font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-xs transition tactile-btn"
            >
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-lg">payments</span>
                <span>Uang Tunai (Cash)</span>
              </div>
              <span className="text-[10px] text-slate-300 font-normal">Kalkulator Kembalian</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};
