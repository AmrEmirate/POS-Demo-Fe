import type {
  BillingStatus,
  FactoryInvoice,
  FixedExpense,
  MenuItem,
  MenuRecipeItem,
  Order,
  Outlet,
  PettyCashExpense,
  RawMaterial,
  ShiftMaterialOpnameAudit,
  ShiftSession,
  SubscriptionInvoice,
  TenantInfo,
  User,
  WalletSummary,
} from '../types';

const STORAGE_KEY = 'pro_pos_demo_state_v1';

export interface DemoState {
  tenant: TenantInfo;
  users: Array<User & { password: string; pin?: string }>;
  outlets: Outlet[];
  menus: MenuItem[];
  rawMaterials: RawMaterial[];
  recipes: MenuRecipeItem[];
  orders: Order[];
  currentShift: ShiftSession | null;
  shiftHistory: ShiftSession[];
  opnameAudits: ShiftMaterialOpnameAudit[];
  pettyCash: PettyCashExpense[];
  factoryInvoices: FactoryInvoice[];
  fixedExpenses: FixedExpense[];
  billingStatus: BillingStatus;
  billingInvoices: SubscriptionInvoice[];
  walletSummary: WalletSummary;
  paymentGatewayConfig: {
    provider: string;
    merchantCode: string;
    hasApiKey: boolean;
    isProduction: boolean;
    isActive: boolean;
  };
  currentUserId: string | null;
}

const nowIso = (offsetMinutes = 0) =>
  new Date(Date.now() + offsetMinutes * 60_000).toISOString();

export function createInitialDemoState(): DemoState {
  const tenant: TenantInfo = {
    id: 'demo-tenant-1',
    name: 'Dimsum Intan (Mode Demo)',
    slug: 'demo',
    plan: 'PRO',
    status: 'ACTIVE',
    themeColor: '#FFCC00',
    pricePerOutlet: 150000,
    maxOutlets: 5,
    dailyTxLimitPerOutlet: 500,
    extraDailyTxLimit: 0,
    subscriptionExpiresAt: nowIso(60 * 24 * 30),
  };

  const outlets: Outlet[] = [
    {
      id: 'du',
      code: 'DGO-01',
      name: 'Cabang Pusat Dago',
      city: 'Bandung',
      address: 'Jl. Ir. H. Juanda No. 88, Bandung',
      manager: 'Denny Wahyudi',
      phone: '0812-3456-7890',
      targetDailySales: 5000000,
      plan: 'PRO',
      planName: 'Pro Business',
      dailyTxLimit: 500,
      monthlyTxLimit: 15000,
      isUnlimited: true,
      currentMonthTxCount: 412,
    },
    {
      id: 'riau',
      code: 'RIU-02',
      name: 'Cabang Riau Junction',
      city: 'Bandung',
      address: 'Jl. L.L.R.E. Martadinata No. 45, Bandung',
      manager: 'Denny Wahyudi',
      phone: '0813-9876-5432',
      targetDailySales: 3500000,
      plan: 'PRO',
      planName: 'Pro Business',
      dailyTxLimit: 500,
      monthlyTxLimit: 15000,
      isUnlimited: true,
      currentMonthTxCount: 289,
    },
    {
      id: 'batu',
      code: 'BHT-03',
      name: 'Cabang Buah Batu',
      city: 'Bandung',
      address: 'Jl. Buah Batu No. 112, Bandung',
      manager: 'Denny Wahyudi',
      phone: '0815-1122-3344',
      targetDailySales: 3000000,
      plan: 'PRO',
      planName: 'Pro Business',
      dailyTxLimit: 500,
      monthlyTxLimit: 15000,
      isUnlimited: true,
      currentMonthTxCount: 194,
    },
  ];

  const users: DemoState['users'] = [
    {
      id: 'u-owner',
      name: 'Hendra Pratama',
      username: 'owner',
      password: '123',
      pin: '123456',
      role: 'OWNER',
      tenantId: tenant.id,
      tenant,
    },
    {
      id: 'u-supervisor',
      name: 'Denny Wahyudi',
      username: 'supervisor',
      password: '123',
      pin: '123456',
      role: 'SUPERVISOR',
      outletId: 'du',
      outletName: 'Cabang Pusat Dago',
      tenantId: tenant.id,
      tenant,
    },
    {
      id: 'u-kasir',
      name: 'Siti Rahma',
      username: 'kasir',
      password: '123',
      pin: '123456',
      role: 'KASIR',
      outletId: 'du',
      outletName: 'Cabang Pusat Dago',
      tenantId: tenant.id,
      tenant,
    },
  ];

  const menus: MenuItem[] = [
    {
      id: 'm1',
      code: 'DIM-01',
      name: 'Siomay Ayam Udang',
      category: 'Kukus',
      price: 25000,
      costPrice: 11000,
      stock: 64,
      description: '4 pcs siomay ayam udang premium dengan saus chili oil khas.',
      image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isBestSeller: true,
    },
    {
      id: 'm2',
      code: 'DIM-02',
      name: 'Hakau Udang Kristal',
      category: 'Kukus',
      price: 28000,
      costPrice: 13500,
      stock: 42,
      description: 'Kulit transparan lentur berisi udang utuh segar.',
      image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isBestSeller: true,
    },
    {
      id: 'm3',
      code: 'DIM-03',
      name: 'Dimsum Mentai Mozzarella',
      category: 'Mentai',
      price: 32000,
      costPrice: 15000,
      stock: 38,
      description: 'Dimsum ayam panggang dengan saus mentai & keju mozzarella leleh.',
      image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isBestSeller: true,
    },
    {
      id: 'm4',
      code: 'DIM-04',
      name: 'Lumpia Kulit Tahu',
      category: 'Goreng',
      price: 24000,
      costPrice: 10500,
      stock: 50,
      description: 'Lumpia kulit tahu renyah isi udang & ayam cincang.',
      image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      id: 'm5',
      code: 'DIM-05',
      name: 'Pao Telur Asin Lava',
      category: 'Kukus',
      price: 22000,
      costPrice: 9000,
      stock: 30,
      description: 'Bakpao lembut dengan isian custard telur asin lumer.',
      image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      id: 'm6',
      code: 'DIM-06',
      name: 'Gyoza Panggang Chili Oil',
      category: 'Goreng',
      price: 27000,
      costPrice: 12000,
      stock: 35,
      description: '5 pcs gyoza panggang gurih dengan siraman chili oil.',
      image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      id: 'm7',
      code: 'MIN-01',
      name: 'Es Teh Leci Segar',
      category: 'Minuman',
      price: 15000,
      costPrice: 4500,
      stock: 100,
      description: 'Teh melati dingin dengan buah leci utuh.',
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      id: 'm8',
      code: 'MIN-02',
      name: 'Thai Tea Creamy',
      category: 'Minuman',
      price: 18000,
      costPrice: 6000,
      stock: 80,
      description: 'Racikan teh Thailand autentik dengan susu evaporasi.',
      image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
  ];

  const rawMaterials: RawMaterial[] = [
    { id: 'rm1', outletId: 'du', name: 'Adonan Ayam Udang', unit: 'gram', costPerUnit: 85, currentStock: 8500, minStock: 2000, isLowStock: false },
    { id: 'rm2', outletId: 'du', name: 'Kulit Dimsum Premium', unit: 'lembar', costPerUnit: 350, currentStock: 420, minStock: 100, isLowStock: false },
    { id: 'rm3', outletId: 'du', name: 'Saus Mentai Spesial', unit: 'gram', costPerUnit: 110, currentStock: 1800, minStock: 500, isLowStock: false },
    { id: 'rm4', outletId: 'du', name: 'Keju Mozzarella', unit: 'gram', costPerUnit: 160, currentStock: 950, minStock: 300, isLowStock: false },
    { id: 'rm5', outletId: 'du', name: 'Cup Minuman 16oz', unit: 'pcs', costPerUnit: 650, currentStock: 190, minStock: 50, isLowStock: false },
  ];

  const recipes: MenuRecipeItem[] = [
    { id: 'rec1', menuId: 'm1', menuName: 'Siomay Ayam Udang', rawMaterialId: 'rm1', rawMaterialName: 'Adonan Ayam Udang', unit: 'gram', costPerUnit: 85, quantityUsed: 100 },
    { id: 'rec2', menuId: 'm1', menuName: 'Siomay Ayam Udang', rawMaterialId: 'rm2', rawMaterialName: 'Kulit Dimsum Premium', unit: 'lembar', costPerUnit: 350, quantityUsed: 4 },
    { id: 'rec3', menuId: 'm3', menuName: 'Dimsum Mentai Mozzarella', rawMaterialId: 'rm1', rawMaterialName: 'Adonan Ayam Udang', unit: 'gram', costPerUnit: 85, quantityUsed: 100 },
    { id: 'rec4', menuId: 'm3', menuName: 'Dimsum Mentai Mozzarella', rawMaterialId: 'rm3', rawMaterialName: 'Saus Mentai Spesial', unit: 'gram', costPerUnit: 110, quantityUsed: 30 },
    { id: 'rec5', menuId: 'm3', menuName: 'Dimsum Mentai Mozzarella', rawMaterialId: 'rm4', rawMaterialName: 'Keju Mozzarella', unit: 'gram', costPerUnit: 160, quantityUsed: 20 },
    { id: 'rec6', menuId: 'm7', menuName: 'Es Teh Leci Segar', rawMaterialId: 'rm5', rawMaterialName: 'Cup Minuman 16oz', unit: 'pcs', costPerUnit: 650, quantityUsed: 1 },
  ];

  const orders: Order[] = [
    {
      id: 'ord-1',
      invoiceNumber: 'INV-DGO-261119-001',
      outletId: 'du',
      outletName: 'Cabang Pusat Dago',
      orderType: 'dine-in',
      tableNumber: '04',
      customerName: 'Budi Santoso',
      items: [
        { menuId: 'm1', name: 'Siomay Ayam Udang', price: 25000, costPrice: 11000, quantity: 2 },
        { menuId: 'm7', name: 'Es Teh Leci Segar', price: 15000, costPrice: 4500, quantity: 2 },
      ],
      subtotal: 80000,
      discount: 0,
      total: 80000,
      hppTotal: 31000,
      paymentMethod: 'CASH',
      cashReceived: 100000,
      changeAmount: 20000,
      cashierName: 'Siti Rahma',
      status: 'PAID',
      createdAt: nowIso(-180),
    },
    {
      id: 'ord-2',
      invoiceNumber: 'INV-DGO-261119-002',
      outletId: 'du',
      outletName: 'Cabang Pusat Dago',
      orderType: 'takeaway',
      customerName: 'Rina Kusuma',
      items: [
        { menuId: 'm3', name: 'Dimsum Mentai Mozzarella', price: 32000, costPrice: 15000, quantity: 3 },
        { menuId: 'm2', name: 'Hakau Udang Kristal', price: 28000, costPrice: 13500, quantity: 2 },
      ],
      subtotal: 152000,
      discount: 10000,
      total: 142000,
      hppTotal: 72000,
      paymentMethod: 'QRIS',
      cashierName: 'Siti Rahma',
      status: 'PAID',
      createdAt: nowIso(-120),
    },
    {
      id: 'ord-3',
      invoiceNumber: 'INV-RIU-261119-001',
      outletId: 'riau',
      outletName: 'Cabang Riau Junction',
      orderType: 'dine-in',
      tableNumber: '02',
      items: [
        { menuId: 'm4', name: 'Lumpia Kulit Tahu', price: 24000, costPrice: 10500, quantity: 2 },
        { menuId: 'm8', name: 'Thai Tea Creamy', price: 18000, costPrice: 6000, quantity: 2 },
      ],
      subtotal: 84000,
      discount: 0,
      total: 84000,
      hppTotal: 33000,
      paymentMethod: 'QRIS',
      cashierName: 'Denny Wahyudi',
      status: 'PAID',
      createdAt: nowIso(-90),
    },
    {
      id: 'ord-4',
      invoiceNumber: 'INV-DGO-261119-003',
      outletId: 'du',
      outletName: 'Cabang Pusat Dago',
      orderType: 'dine-in',
      tableNumber: '07',
      items: [
        { menuId: 'm6', name: 'Gyoza Panggang Chili Oil', price: 27000, costPrice: 12000, quantity: 2 },
        { menuId: 'm5', name: 'Pao Telur Asin Lava', price: 22000, costPrice: 9000, quantity: 1 },
      ],
      subtotal: 76000,
      discount: 0,
      total: 76000,
      hppTotal: 33000,
      paymentMethod: 'CASH',
      cashReceived: 80000,
      changeAmount: 4000,
      cashierName: 'Siti Rahma',
      status: 'PAID',
      createdAt: nowIso(-45),
    },
  ];

  const currentShift: ShiftSession = {
    id: 'shift-active-1',
    shiftName: 'Shift Pagi (08:00 - 16:00)',
    outletId: 'du',
    outletName: 'Cabang Pusat Dago',
    cashierId: 'u-kasir',
    cashierName: 'Siti Rahma',
    terminalId: 'POS-DGO-01',
    startTime: nowIso(-240),
    startingCash: 500000,
    cashSales: 156000,
    qrisSales: 142000,
    pettyCashOut: 35000,
    expectedCash: 500000 + 156000 - 35000,
    status: 'ACTIVE',
  };

  const shiftHistory: ShiftSession[] = [
    {
      id: 'shift-hist-1',
      shiftName: 'Shift Sore (16:00 - 22:00)',
      outletId: 'du',
      outletName: 'Cabang Pusat Dago',
      cashierId: 'u-kasir',
      cashierName: 'Siti Rahma',
      terminalId: 'POS-DGO-01',
      startTime: nowIso(-1440),
      endTime: nowIso(-1080),
      startingCash: 500000,
      cashSales: 1450000,
      qrisSales: 980000,
      pettyCashOut: 45000,
      expectedCash: 1905000,
      actualEndingCash: 1905000,
      difference: 0,
      notes: 'Kas laci pas 100%, tidak ada selisih.',
      status: 'CLOSED',
    },
  ];

  const opnameAudits: ShiftMaterialOpnameAudit[] = [
    {
      id: 'op-1',
      shiftId: 'shift-hist-1',
      shiftName: 'Shift Sore (16:00 - 22:00)',
      outletName: 'Cabang Pusat Dago',
      cashierName: 'Siti Rahma',
      shiftEndTime: nowIso(-1080),
      rawMaterialId: 'rm1',
      materialName: 'Adonan Ayam Udang',
      unit: 'gram',
      openingStock: 10000,
      restockIn: 0,
      theoreticalUsed: 1500,
      expectedClosing: 8500,
      actualClosing: 8500,
      variance: 0,
      varianceValue: 0,
      status: 'NORMAL',
    },
  ];

  const pettyCash: PettyCashExpense[] = [
    {
      id: 'pc-1',
      expenseNumber: 'PC-261119-001',
      outletId: 'du',
      outletName: 'Cabang Pusat Dago',
      cashierName: 'Siti Rahma',
      amount: 35000,
      category: 'ES_BATU',
      description: 'Beli es batu kristal 3 kantong tambahan untuk minuman',
      receiptImageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400&q=80',
      status: 'DISETUJUI',
      verifiedBy: 'Hendra Pratama',
      verifiedAt: nowIso(-100),
      createdAt: nowIso(-150),
    },
    {
      id: 'pc-2',
      expenseNumber: 'PC-261119-002',
      outletId: 'du',
      outletName: 'Cabang Pusat Dago',
      cashierName: 'Siti Rahma',
      amount: 22000,
      category: 'GALON_AIR',
      description: 'Isi ulang 2 galon air minum dapur',
      receiptImageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400&q=80',
      status: 'MENUNGGU_VERIFIKASI',
      createdAt: nowIso(-30),
    },
  ];

  const factoryInvoices: FactoryInvoice[] = [
    {
      id: 'fi-1',
      invoiceNumber: 'PO-PABRIK-2026-089',
      supplierName: 'Sentral Produksi Dimsum Pusat',
      outletId: 'du',
      outletName: 'Cabang Pusat Dago',
      issueDate: nowIso(-60 * 24 * 3),
      dueDate: nowIso(60 * 24 * 4),
      totalAmount: 2450000,
      status: 'BELUM_LUNAS',
      bankAccount: 'BCA 123-456-7890 a.n. PT Sentral Dimsum',
      items: [
        { itemName: 'Siomay Ayam Udang (Pack 50 pcs)', quantity: 20, unit: 'pack', unitCost: 75000, total: 1500000 },
        { itemName: 'Hakau Udang Kristal (Pack 40 pcs)', quantity: 10, unit: 'pack', unitCost: 95000, total: 950000 },
      ],
    },
    {
      id: 'fi-2',
      invoiceNumber: 'PO-PABRIK-2026-084',
      supplierName: 'Sentral Produksi Dimsum Pusat',
      outletId: 'riau',
      outletName: 'Cabang Riau Junction',
      issueDate: nowIso(-60 * 24 * 10),
      dueDate: nowIso(-60 * 24 * 3),
      totalAmount: 1650000,
      status: 'LUNAS',
      paidAt: nowIso(-60 * 24 * 4),
      bankAccount: 'BCA 123-456-7890 a.n. PT Sentral Dimsum',
      items: [
        { itemName: 'Lumpia Kulit Tahu (Pack 40 pcs)', quantity: 15, unit: 'pack', unitCost: 60000, total: 900000 },
        { itemName: 'Saus Mentai & Chili Oil (Jerigen 2L)', quantity: 5, unit: 'jerigen', unitCost: 150000, total: 750000 },
      ],
    },
  ];

  const fixedExpenses: FixedExpense[] = [
    {
      id: 'fe-1',
      code: 'OPEX-SEWA-01',
      title: 'Sewa Ruko Cabang Pusat Dago',
      category: 'SEWA_TEMPAT',
      outletId: 'du',
      outletName: 'Cabang Pusat Dago',
      amount: 4500000,
      period: 'November 2026',
      status: 'LUNAS',
      dueDate: nowIso(-60 * 24 * 5),
      autoDebet: true,
    },
    {
      id: 'fe-2',
      code: 'OPEX-LISTRIK-01',
      title: 'Tagihan Listrik & Air PDAM',
      category: 'UTILITAS',
      outletId: 'du',
      outletName: 'Cabang Pusat Dago',
      amount: 850000,
      period: 'November 2026',
      status: 'TERJADWAL',
      dueDate: nowIso(60 * 24 * 6),
      autoDebet: false,
    },
    {
      id: 'fe-3',
      code: 'OPEX-GAJI-01',
      title: 'Gaji Tim Kasir & Dapur (3 Staff)',
      category: 'GAJI_KARYAWAN',
      outletId: 'du',
      outletName: 'Cabang Pusat Dago',
      amount: 7500000,
      period: 'November 2026',
      status: 'TERJADWAL',
      dueDate: nowIso(60 * 24 * 10),
      autoDebet: false,
    },
  ];

  const billingStatus: BillingStatus = {
    tenantId: tenant.id,
    tenantName: tenant.name,
    plan: 'PRO',
    status: 'ACTIVE',
    licenseKey: 'PRO-DEMO-2026-VIMTK',
    pricePerOutlet: 150000,
    currentOutletsCount: outlets.length,
    maxOutlets: 5,
    canAddOutlet: true,
    dailyTxLimitPerOutlet: 500,
    monthlyTxLimitPerOutlet: 15000,
    extraDailyTxLimit: 0,
    effectiveDailyTxLimit: 500,
    effectiveMonthlyTxLimit: 15000,
    todayOrdersCount: orders.length,
    monthOrdersCount: 895,
    remainingMonthOrders: 'Unlimited',
    isUnlimited: true,
    isSubscriptionActive: true,
    subscriptionExpiresAt: nowIso(60 * 24 * 30),
    daysRemaining: 30,
    outlets: outlets.map((o) => ({
      id: o.id,
      code: o.code,
      name: o.name,
      plan: 'PRO',
      planName: 'Pro Business',
      planPrice: 150000,
      todayOrders: orders.filter((ord) => ord.outletId === o.id).length,
      monthOrders: o.currentMonthTxCount || 0,
      dailyLimit: 500,
      monthlyLimit: 15000,
      isUnlimited: true,
      remaining: 'Unlimited',
      remainingMonth: 'Unlimited',
    })),
    availablePlans: [
      { code: 'STARTER', name: 'Starter UMKM', price: 49000, dailyTxLimit: 100, monthlyTxLimit: 3000, description: 'Cocok untuk kedai baru (maks 100 tx/hari)' },
      { code: 'PRO', name: 'Pro Business', price: 150000, dailyTxLimit: 500, monthlyTxLimit: 15000, description: 'Multi-outlet, BOM HPP & Laporan Laba Rugi' },
      { code: 'ENTERPRISE', name: 'Enterprise Unlimited', price: 350000, dailyTxLimit: 99999, monthlyTxLimit: 999999, description: 'Transaksi tanpa batas + prioritas support' },
    ],
  };

  const billingInvoices: SubscriptionInvoice[] = [
    {
      id: 'sub-inv-1',
      tenantId: tenant.id,
      invoiceNumber: 'SUB-202611-001',
      type: 'RENEWAL',
      description: 'Langganan Paket Pro Business (3 Outlet)',
      amount: 450000,
      status: 'PAID',
      paymentMethod: 'QRIS',
      paidAt: nowIso(-60 * 24 * 2),
      expiresAt: nowIso(60 * 24 * 28),
      createdAt: nowIso(-60 * 24 * 2),
    },
  ];

  const walletSummary: WalletSummary = {
    walletBalance: 2450000,
    totalCredited: 3950000,
    totalDebited: 1500000,
    pendingWithdrawalAmount: 0,
    pendingWithdrawalCount: 0,
    bankInfo: {
      bankName: 'BCA',
      bankAccountNumber: '7770881234',
      bankAccountName: 'Hendra Pratama',
    },
    recentTransactions: [
      {
        id: 'wt-1',
        tenantId: tenant.id,
        outletId: 'du',
        outlet: { id: 'du', name: 'Cabang Pusat Dago', code: 'DGO-01' },
        type: 'CREDIT',
        category: 'POS_SALES',
        amount: 142000,
        balanceBefore: 2308000,
        balanceAfter: 2450000,
        referenceId: 'INV-DGO-261119-002',
        description: 'Pembayaran QRIS Order INV-DGO-261119-002',
        createdAt: nowIso(-120),
      },
      {
        id: 'wt-2',
        tenantId: tenant.id,
        type: 'DEBIT',
        category: 'WITHDRAWAL',
        amount: 1500000,
        balanceBefore: 3808000,
        balanceAfter: 2308000,
        referenceId: 'WD-202611-001',
        description: 'Penarikan dana ke BCA 7770881234',
        createdAt: nowIso(-60 * 24 * 1),
      },
    ],
    recentWithdrawals: [
      {
        id: 'wd-1',
        tenantId: tenant.id,
        withdrawalNumber: 'WD-202611-001',
        amount: 1500000,
        fee: 5000,
        netAmount: 1495000,
        bankName: 'BCA',
        bankAccountNumber: '7770881234',
        bankAccountName: 'Hendra Pratama',
        status: 'PROCESSED',
        processedAt: nowIso(-60 * 24 * 1),
        createdAt: nowIso(-60 * 24 * 1),
      },
    ],
  };

  return {
    tenant,
    users,
    outlets,
    menus,
    rawMaterials,
    recipes,
    orders,
    currentShift,
    shiftHistory,
    opnameAudits,
    pettyCash,
    factoryInvoices,
    fixedExpenses,
    billingStatus,
    billingInvoices,
    walletSummary,
    paymentGatewayConfig: {
      provider: 'DUITKU',
      merchantCode: 'D12345-DEMO',
      hasApiKey: true,
      isProduction: false,
      isActive: true,
    },
    currentUserId: null,
  };
}

export function loadDemoState(): DemoState {
  if (typeof localStorage === 'undefined') {
    return createInitialDemoState();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const init = createInitialDemoState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
      return init;
    }
    return JSON.parse(raw) as DemoState;
  } catch {
    return createInitialDemoState();
  }
}

export function saveDemoState(state: DemoState): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage quota errors in demo
  }
}

export function resetDemoState(): DemoState {
  const init = createInitialDemoState();
  saveDemoState(init);
  return init;
}

const stripUserSecrets = (u: DemoState['users'][number]): User => {
  const { password: _p, pin: _pin, ...rest } = u;
  return rest;
};

export async function handleDemoRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const [path, queryString] = endpoint.split('?');
  const params = new URLSearchParams(queryString || '');

  let body: any = {};
  if (typeof options.body === 'string' && options.body.trim()) {
    try {
      body = JSON.parse(options.body);
    } catch {
      body = {};
    }
  } else if (typeof FormData !== 'undefined' && options.body instanceof FormData) {
    options.body.forEach((value, key) => {
      if (typeof value === 'string') body[key] = value;
    });
  }

  const state = loadDemoState();
  const genId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const ok = <R>(data: R) => data as unknown as T;

  // --- AUTH ---
  if (path === '/auth/login' && method === 'POST') {
    const uname = String(body.username || '').trim().toLowerCase();
    const pwd = String(body.password || '');
    const found = state.users.find(
      (u) => (u.username || '').toLowerCase() === uname || u.role.toLowerCase() === uname
    );
    if (!found || (found.password !== pwd && pwd !== 'demo123' && pwd !== '123')) {
      throw new Error('Username atau password demo salah. Gunakan: owner / supervisor / kasir (password: 123)');
    }
    state.currentUserId = found.id;
    saveDemoState(state);
    return ok({
      success: true,
      token: `demo-jwt-${found.id}`,
      user: stripUserSecrets(found),
      tenant: state.tenant,
    });
  }

  if (path === '/auth/me' && method === 'GET') {
    const user = state.users.find((u) => u.id === state.currentUserId) || state.users[0];
    return ok({ success: true, user: stripUserSecrets(user) });
  }

  if (path === '/auth/me' && method === 'PUT') {
    const user = state.users.find((u) => u.id === state.currentUserId) || state.users[0];
    if (body.name) user.name = body.name;
    if (body.avatar) user.avatar = body.avatar;
    saveDemoState(state);
    return ok({ success: true, message: 'Profil berhasil diperbarui', data: stripUserSecrets(user) });
  }

  if (path === '/auth/pin' && method === 'PUT') {
    const user = state.users.find((u) => u.id === state.currentUserId) || state.users[0];
    user.pin = String(body.newPin || '123456');
    saveDemoState(state);
    return ok({ success: true, message: 'PIN otorisasi berhasil diperbarui (Demo)' });
  }

  if (path === '/auth/verify-pin' && method === 'POST') {
    const pin = String(body.pin || '');
    const valid = pin === '123456' || state.users.some((u) => u.pin === pin);
    if (!valid) throw new Error('PIN salah. PIN Demo default adalah 123456');
    return ok({ success: true, message: 'PIN terverifikasi' });
  }

  // --- TENANT PUBLIC ---
  if (path.startsWith('/public/tenant/') && method === 'GET') {
    return ok({ success: true, tenant: state.tenant });
  }

  // --- OUTLETS ---
  if (path === '/outlets' && method === 'GET') {
    return ok({ success: true, data: state.outlets });
  }
  if (path === '/outlets' && method === 'POST') {
    const newOutlet: Outlet = {
      id: genId('out'),
      code: body.code || `CAB-${state.outlets.length + 1}`,
      name: body.name || 'Cabang Baru',
      city: body.city || 'Bandung',
      address: body.address || '-',
      manager: body.manager || 'Supervisor',
      phone: body.phone || '-',
      targetDailySales: Number(body.targetDailySales || 3000000),
      plan: 'PRO',
      planName: 'Pro Business',
      isUnlimited: true,
    };
    state.outlets.push(newOutlet);
    state.billingStatus.currentOutletsCount = state.outlets.length;
    saveDemoState(state);
    return ok({ success: true, message: 'Outlet demo berhasil ditambahkan', data: newOutlet });
  }
  if (path.startsWith('/outlets/') && method === 'PUT') {
    const id = path.split('/')[2];
    const idx = state.outlets.findIndex((o) => o.id === id);
    if (idx >= 0) {
      state.outlets[idx] = { ...state.outlets[idx], ...body };
      saveDemoState(state);
      return ok({ success: true, message: 'Outlet diperbarui', data: state.outlets[idx] });
    }
    throw new Error('Outlet tidak ditemukan');
  }
  if (path.startsWith('/outlets/') && method === 'DELETE') {
    const id = path.split('/')[2];
    state.outlets = state.outlets.filter((o) => o.id !== id);
    state.billingStatus.currentOutletsCount = state.outlets.length;
    saveDemoState(state);
    return ok({ success: true, message: 'Outlet dihapus' });
  }

  // --- USERS ---
  if (path === '/users' && method === 'GET') {
    return ok({ success: true, data: state.users.map(stripUserSecrets) });
  }
  if (path === '/users' && method === 'POST') {
    const outlet = state.outlets.find((o) => o.id === body.outletId);
    const created: DemoState['users'][number] = {
      id: genId('usr'),
      name: body.name,
      username: body.username,
      password: body.password || '123',
      pin: '123456',
      role: body.role || 'KASIR',
      outletId: body.outletId,
      outletName: outlet?.name,
      tenantId: state.tenant.id,
      tenant: state.tenant,
      createdAt: nowIso(),
    };
    state.users.push(created);
    saveDemoState(state);
    return ok({ success: true, message: 'Staff demo berhasil ditambahkan', data: stripUserSecrets(created) });
  }
  if (path.startsWith('/users/') && method === 'PUT') {
    const id = path.split('/')[2];
    const idx = state.users.findIndex((u) => u.id === id);
    if (idx >= 0) {
      const outlet = state.outlets.find((o) => o.id === (body.outletId ?? state.users[idx].outletId));
      state.users[idx] = {
        ...state.users[idx],
        ...body,
        outletName: outlet?.name ?? state.users[idx].outletName,
      };
      saveDemoState(state);
      return ok({ success: true, message: 'Staff diperbarui', data: stripUserSecrets(state.users[idx]) });
    }
    throw new Error('Staff tidak ditemukan');
  }
  if (path.startsWith('/users/') && method === 'DELETE') {
    const id = path.split('/')[2];
    state.users = state.users.filter((u) => u.id !== id);
    saveDemoState(state);
    return ok({ success: true, message: 'Staff dihapus' });
  }

  // --- MENUS ---
  if (path === '/menus' && method === 'GET') {
    return ok({ success: true, data: state.menus });
  }
  if (path === '/menus' && method === 'POST') {
    const item: MenuItem = {
      id: genId('m'),
      code: body.code || `MNU-${state.menus.length + 1}`,
      name: body.name,
      category: body.category || 'Lainnya',
      price: Number(body.price || 0),
      costPrice: Number(body.costPrice || 0),
      stock: Number(body.stock ?? 50),
      description: body.description || '',
      image: body.image || 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80',
      isAvailable: body.isAvailable ?? true,
      isBestSeller: Boolean(body.isBestSeller),
    };
    state.menus.unshift(item);
    saveDemoState(state);
    return ok({ success: true, message: 'Menu baru ditambahkan', data: item });
  }
  if (path.startsWith('/menus/') && path.endsWith('/availability') && method === 'PATCH') {
    const id = path.split('/')[2];
    const m = state.menus.find((x) => x.id === id);
    if (m) {
      m.isAvailable = body.isAvailable !== undefined ? Boolean(body.isAvailable) : !m.isAvailable;
      saveDemoState(state);
      return ok({ success: true, message: 'Status menu diperbarui', data: m });
    }
    throw new Error('Menu tidak ditemukan');
  }
  if (path.startsWith('/menus/') && method === 'PUT') {
    const id = path.split('/')[2];
    const idx = state.menus.findIndex((x) => x.id === id);
    if (idx >= 0) {
      state.menus[idx] = { ...state.menus[idx], ...body };
      saveDemoState(state);
      return ok({ success: true, message: 'Menu diperbarui', data: state.menus[idx] });
    }
    throw new Error('Menu tidak ditemukan');
  }
  if (path.startsWith('/menus/') && method === 'DELETE') {
    const id = path.split('/')[2];
    state.menus = state.menus.filter((x) => x.id !== id);
    saveDemoState(state);
    return ok({ success: true, message: 'Menu dihapus' });
  }

  // --- RAW MATERIALS & RECIPES ---
  if (path === '/materials' && method === 'GET') {
    const outletId = params.get('outletId');
    const data = outletId
      ? state.rawMaterials.filter((rm) => !rm.outletId || rm.outletId === outletId)
      : state.rawMaterials;
    return ok({ success: true, data });
  }
  if (path === '/materials' && method === 'POST') {
    const rm: RawMaterial = {
      id: genId('rm'),
      outletId: body.outletId || null,
      name: body.name,
      unit: body.unit || 'gram',
      costPerUnit: Number(body.costPerUnit || 0),
      currentStock: Number(body.currentStock || 0),
      minStock: Number(body.minStock || 0),
      isLowStock: Number(body.currentStock || 0) <= Number(body.minStock || 0),
    };
    state.rawMaterials.push(rm);
    saveDemoState(state);
    return ok({ success: true, message: 'Bahan baku ditambahkan', data: rm });
  }
  if (path.startsWith('/materials/') && method === 'PUT') {
    const id = path.split('/')[2];
    const idx = state.rawMaterials.findIndex((r) => r.id === id);
    if (idx >= 0) {
      const updated = { ...state.rawMaterials[idx], ...body };
      updated.isLowStock = updated.currentStock <= updated.minStock;
      state.rawMaterials[idx] = updated;
      saveDemoState(state);
      return ok({ success: true, message: 'Bahan baku diperbarui' });
    }
    throw new Error('Bahan baku tidak ditemukan');
  }
  if (path.startsWith('/materials/') && method === 'DELETE') {
    const id = path.split('/')[2];
    state.rawMaterials = state.rawMaterials.filter((r) => r.id !== id);
    state.recipes = state.recipes.filter((rec) => rec.rawMaterialId !== id);
    saveDemoState(state);
    return ok({ success: true, message: 'Bahan baku dihapus' });
  }
  if (path === '/recipes' && method === 'GET') {
    return ok({ success: true, data: state.recipes });
  }
  if (path.startsWith('/recipes/') && method === 'PUT') {
    const menuId = path.split('/')[2];
    const menu = state.menus.find((m) => m.id === menuId);
    state.recipes = state.recipes.filter((r) => r.menuId !== menuId);
    const items: Array<{ rawMaterialId: string; quantityUsed: number }> = body.items || [];
    for (const item of items) {
      const rm = state.rawMaterials.find((r) => r.id === item.rawMaterialId);
      if (rm) {
        state.recipes.push({
          id: genId('rec'),
          menuId,
          menuName: menu?.name,
          rawMaterialId: rm.id,
          rawMaterialName: rm.name,
          unit: rm.unit,
          costPerUnit: rm.costPerUnit,
          quantityUsed: Number(item.quantityUsed || 0),
        });
      }
    }
    saveDemoState(state);
    return ok({ success: true, message: 'Resep BOM berhasil disimpan' });
  }

  // --- POS ORDERS ---
  if (path === '/pos/orders' && method === 'GET') {
    return ok({ success: true, data: state.orders });
  }
  if (path === '/pos/orders' && method === 'POST') {
    const outlet = state.outlets.find((o) => o.id === body.outletId) || state.outlets[0];
    const items = (body.items || []).map((it: any) => {
      const m = state.menus.find((x) => x.id === it.menuId);
      const qty = Number(it.quantity || 1);
      if (m) m.stock = Math.max(0, m.stock - qty);
      return {
        menuId: it.menuId,
        name: it.name || m?.name || 'Item',
        price: Number(it.price ?? m?.price ?? 0),
        costPrice: Number(it.costPrice ?? m?.costPrice ?? 0),
        quantity: qty,
        notes: it.notes,
      };
    });
    const subtotal = items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
    const discount = Number(body.discount || 0);
    const total = Math.max(0, subtotal - discount);
    const hppTotal = items.reduce((s: number, i: any) => s + i.costPrice * i.quantity, 0);
    const paymentMethod = body.paymentMethod || 'CASH';
    const order: Order = {
      id: genId('ord'),
      invoiceNumber: body.invoiceNumber || `INV-${outlet.code}-${Date.now().toString().slice(-6)}`,
      outletId: outlet.id,
      outletName: outlet.name,
      orderType: body.orderType || 'dine-in',
      tableNumber: body.tableNumber,
      customerName: body.customerName,
      items,
      subtotal,
      discount,
      total,
      hppTotal,
      paymentMethod,
      cashReceived: body.cashReceived ? Number(body.cashReceived) : total,
      changeAmount: body.cashReceived ? Math.max(0, Number(body.cashReceived) - total) : 0,
      cashierName: body.cashierName || 'Kasir Demo',
      status: 'PAID',
      createdAt: nowIso(),
    };
    state.orders.unshift(order);
    if (state.currentShift && state.currentShift.status === 'ACTIVE') {
      if (paymentMethod === 'CASH') {
        state.currentShift.cashSales += total;
      } else {
        state.currentShift.qrisSales += total;
      }
      state.currentShift.expectedCash =
        state.currentShift.startingCash +
        state.currentShift.cashSales -
        state.currentShift.pettyCashOut;
    }
    if (paymentMethod !== 'CASH') {
      const before = state.walletSummary.walletBalance;
      state.walletSummary.walletBalance += total;
      state.walletSummary.totalCredited += total;
      state.walletSummary.recentTransactions.unshift({
        id: genId('wt'),
        tenantId: state.tenant.id,
        outletId: outlet.id,
        outlet: { id: outlet.id, name: outlet.name, code: outlet.code },
        type: 'CREDIT',
        category: 'POS_SALES',
        amount: total,
        balanceBefore: before,
        balanceAfter: state.walletSummary.walletBalance,
        referenceId: order.invoiceNumber,
        description: `Penjualan ${paymentMethod} ${order.invoiceNumber}`,
        createdAt: nowIso(),
      });
    }
    saveDemoState(state);
    return ok({ success: true, message: 'Transaksi berhasil', data: order });
  }
  if (path.startsWith('/pos/orders/') && path.endsWith('/void') && method === 'POST') {
    const id = path.split('/')[3];
    const ord = state.orders.find((o) => o.id === id);
    if (ord) {
      ord.status = 'VOIDED';
      ord.voidReason = body.reason || 'Dibatalkan';
      ord.voidAuthorizedBy = body.authorizedBy || 'Supervisor';
      saveDemoState(state);
      return ok({ success: true, message: 'Transaksi berhasil di-void' });
    }
    throw new Error('Order tidak ditemukan');
  }

  // --- SHIFTS ---
  if (path === '/shifts/current' && method === 'GET') {
    return ok({ success: true, data: state.currentShift });
  }
  if (path === '/shifts/history' && method === 'GET') {
    return ok({ success: true, data: state.shiftHistory });
  }
  if (path === '/shifts/opname-audit' && method === 'GET') {
    return ok({ success: true, data: state.opnameAudits });
  }
  if (path === '/shifts/open' && method === 'POST') {
    const outlet = state.outlets.find((o) => o.id === body.outletId) || state.outlets[0];
    const user = state.users.find((u) => u.id === state.currentUserId) || state.users[2];
    const shift: ShiftSession = {
      id: genId('shift'),
      shiftName: body.shiftName || 'Shift Baru',
      outletId: outlet.id,
      outletName: outlet.name,
      cashierId: user.id,
      cashierName: user.name,
      terminalId: `POS-${outlet.code}`,
      startTime: nowIso(),
      startingCash: Number(body.startingCash || 0),
      cashSales: 0,
      qrisSales: 0,
      pettyCashOut: 0,
      expectedCash: Number(body.startingCash || 0),
      status: 'ACTIVE',
    };
    state.currentShift = shift;
    saveDemoState(state);
    return ok({ success: true, message: 'Shift dibuka', data: shift });
  }
  if (path.startsWith('/shifts/') && path.endsWith('/close') && method === 'POST') {
    const shift = state.currentShift;
    if (!shift) throw new Error('Tidak ada shift aktif');
    const actual = Number(body.actualEndingCash ?? shift.expectedCash);
    const closed: ShiftSession = {
      ...shift,
      endTime: nowIso(),
      actualEndingCash: actual,
      difference: actual - shift.expectedCash,
      notes: body.notes || '',
      status: 'CLOSED',
    };
    if (Array.isArray(body.materialOpnames)) {
      for (const op of body.materialOpnames) {
        const rm = state.rawMaterials.find((r) => r.id === op.rawMaterialId);
        if (rm) {
          const restock = Number(op.restockIn || 0);
          const expected = rm.currentStock + restock;
          const actualMat = Number(op.actualClosing ?? expected);
          const variance = actualMat - expected;
          state.opnameAudits.unshift({
            id: genId('op'),
            shiftId: closed.id,
            shiftName: closed.shiftName,
            outletName: closed.outletName,
            cashierName: closed.cashierName,
            shiftEndTime: closed.endTime!,
            rawMaterialId: rm.id,
            materialName: rm.name,
            unit: rm.unit,
            openingStock: rm.currentStock,
            restockIn: restock,
            theoreticalUsed: 0,
            expectedClosing: expected,
            actualClosing: actualMat,
            variance,
            varianceValue: variance * rm.costPerUnit,
            status: variance < 0 ? 'LEAKAGE' : variance > 0 ? 'SURPLUS' : 'NORMAL',
            notes: op.notes,
          });
          rm.currentStock = actualMat;
        }
      }
    }
    state.shiftHistory.unshift(closed);
    state.currentShift = null;
    saveDemoState(state);
    return ok({ success: true, message: 'Shift berhasil ditutup', data: closed });
  }

  // --- PETTY CASH ---
  if (path === '/petty-cash' && method === 'GET') {
    return ok({ success: true, data: state.pettyCash });
  }
  if (path === '/petty-cash' && method === 'POST') {
    const outlet = state.outlets.find((o) => o.id === body.outletId) || state.outlets[0];
    const user = state.users.find((u) => u.id === state.currentUserId) || state.users[2];
    const pc: PettyCashExpense = {
      id: genId('pc'),
      expenseNumber: `PC-${Date.now().toString().slice(-6)}`,
      outletId: outlet.id,
      outletName: outlet.name,
      cashierName: body.cashierName || user.name,
      amount: Number(body.amount || 0),
      category: body.category || 'LAINNYA',
      description: body.description || '',
      receiptImageUrl: body.receiptImageUrl || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400&q=80',
      status: 'MENUNGGU_VERIFIKASI',
      createdAt: nowIso(),
    };
    state.pettyCash.unshift(pc);
    saveDemoState(state);
    return ok({ success: true, message: 'Pengeluaran kas kecil diajukan', data: pc });
  }
  if (path.startsWith('/petty-cash/') && path.endsWith('/verify') && method === 'PATCH') {
    const id = path.split('/')[2];
    const pc = state.pettyCash.find((p) => p.id === id);
    if (pc) {
      pc.status = body.status || 'DISETUJUI';
      pc.verifiedBy = body.verifiedBy || 'Owner';
      pc.verifiedAt = nowIso();
      if (pc.status === 'DISETUJUI' && state.currentShift && state.currentShift.status === 'ACTIVE') {
        state.currentShift.pettyCashOut += pc.amount;
        state.currentShift.expectedCash =
          state.currentShift.startingCash +
          state.currentShift.cashSales -
          state.currentShift.pettyCashOut;
      }
      saveDemoState(state);
      return ok({ success: true, message: 'Status kas kecil diperbarui', data: pc });
    }
    throw new Error('Data kas kecil tidak ditemukan');
  }
  if (path.startsWith('/petty-cash/') && method === 'PUT') {
    const id = path.split('/')[2];
    const idx = state.pettyCash.findIndex((p) => p.id === id);
    if (idx >= 0) {
      state.pettyCash[idx] = { ...state.pettyCash[idx], ...body };
      saveDemoState(state);
      return ok({ success: true, message: 'Kas kecil diperbarui', data: state.pettyCash[idx] });
    }
    throw new Error('Data kas kecil tidak ditemukan');
  }
  if (path.startsWith('/petty-cash/') && method === 'DELETE') {
    const id = path.split('/')[2];
    state.pettyCash = state.pettyCash.filter((p) => p.id !== id);
    saveDemoState(state);
    return ok({ success: true, message: 'Kas kecil dihapus' });
  }

  // --- FACTORY INVOICES ---
  if (path === '/factory-invoices' && method === 'GET') {
    return ok({ success: true, data: state.factoryInvoices });
  }
  if (path === '/factory-invoices' && method === 'POST') {
    const outlet = state.outlets.find((o) => o.id === body.outletId) || state.outlets[0];
    const inv: FactoryInvoice = {
      id: genId('fi'),
      invoiceNumber: body.invoiceNumber || `PO-PABRIK-${Date.now().toString().slice(-5)}`,
      supplierName: body.supplierName || 'Sentral Produksi Pusat',
      outletId: outlet.id,
      outletName: outlet.name,
      issueDate: body.issueDate || nowIso(),
      dueDate: body.dueDate || nowIso(60 * 24 * 7),
      totalAmount: Number(body.totalAmount || 0),
      status: body.status || 'BELUM_LUNAS',
      items: body.items || [],
      bankAccount: body.bankAccount || 'BCA 123-456-7890',
    };
    state.factoryInvoices.unshift(inv);
    saveDemoState(state);
    return ok({ success: true, message: 'Tagihan pabrik dicatat', data: inv });
  }
  if (path.startsWith('/factory-invoices/') && path.endsWith('/pay') && method === 'PATCH') {
    const id = path.split('/')[2];
    const inv = state.factoryInvoices.find((f) => f.id === id);
    if (inv) {
      inv.status = 'LUNAS';
      inv.paidAt = nowIso();
      if (body.proofImageUrl) inv.proofImageUrl = body.proofImageUrl;
      saveDemoState(state);
      return ok({ success: true, message: 'Tagihan pabrik dilunasi', data: inv });
    }
    throw new Error('Tagihan tidak ditemukan');
  }
  if (path.startsWith('/factory-invoices/') && method === 'PUT') {
    const id = path.split('/')[2];
    const idx = state.factoryInvoices.findIndex((f) => f.id === id);
    if (idx >= 0) {
      state.factoryInvoices[idx] = { ...state.factoryInvoices[idx], ...body };
      saveDemoState(state);
      return ok({ success: true, message: 'Tagihan diperbarui', data: state.factoryInvoices[idx] });
    }
    throw new Error('Tagihan tidak ditemukan');
  }
  if (path.startsWith('/factory-invoices/') && method === 'DELETE') {
    const id = path.split('/')[2];
    state.factoryInvoices = state.factoryInvoices.filter((f) => f.id !== id);
    saveDemoState(state);
    return ok({ success: true, message: 'Tagihan dihapus' });
  }

  // --- FIXED EXPENSES ---
  if (path === '/fixed-expenses' && method === 'GET') {
    return ok({ success: true, data: state.fixedExpenses });
  }
  if (path === '/fixed-expenses' && method === 'POST') {
    const outlet = state.outlets.find((o) => o.id === body.outletId) || state.outlets[0];
    const fe: FixedExpense = {
      id: genId('fe'),
      code: body.code || `OPEX-${Date.now().toString().slice(-4)}`,
      title: body.title,
      category: body.category || 'LAINNYA',
      outletId: outlet.id,
      outletName: outlet.name,
      amount: Number(body.amount || 0),
      period: body.period || 'November 2026',
      status: body.status || 'TERJADWAL',
      dueDate: body.dueDate || nowIso(60 * 24 * 7),
      autoDebet: Boolean(body.autoDebet),
    };
    state.fixedExpenses.unshift(fe);
    saveDemoState(state);
    return ok({ success: true, message: 'Beban tetap ditambahkan', data: fe });
  }
  if (path.startsWith('/fixed-expenses/') && path.endsWith('/pay') && method === 'PATCH') {
    const id = path.split('/')[2];
    const fe = state.fixedExpenses.find((f) => f.id === id);
    if (fe) {
      fe.status = 'LUNAS';
      saveDemoState(state);
      return ok({ success: true, message: 'Beban tetap dilunasi', data: fe });
    }
    throw new Error('Data beban tidak ditemukan');
  }
  if (path.startsWith('/fixed-expenses/') && method === 'PUT') {
    const id = path.split('/')[2];
    const idx = state.fixedExpenses.findIndex((f) => f.id === id);
    if (idx >= 0) {
      state.fixedExpenses[idx] = { ...state.fixedExpenses[idx], ...body };
      saveDemoState(state);
      return ok({ success: true, message: 'Beban tetap diperbarui', data: state.fixedExpenses[idx] });
    }
    throw new Error('Data beban tidak ditemukan');
  }
  if (path.startsWith('/fixed-expenses/') && method === 'DELETE') {
    const id = path.split('/')[2];
    state.fixedExpenses = state.fixedExpenses.filter((f) => f.id !== id);
    saveDemoState(state);
    return ok({ success: true, message: 'Beban tetap dihapus' });
  }

  // --- PROFIT LOSS REPORT ---
  if (path === '/reports/profit-loss' && method === 'GET') {
    const outletId = params.get('outletId');
    const paidOrders = state.orders.filter(
      (o) => o.status === 'PAID' && (!outletId || outletId === 'all' || o.outletId === outletId)
    );
    const revenue = paidOrders.reduce((s, o) => s + o.total, 0);
    const hpp = paidOrders.reduce((s, o) => s + o.hppTotal, 0);
    const pettyCashTotal = state.pettyCash
      .filter((p) => p.status === 'DISETUJUI' && (!outletId || outletId === 'all' || p.outletId === outletId))
      .reduce((s, p) => s + p.amount, 0);
    const fixedTotal = state.fixedExpenses
      .filter((f) => f.status === 'LUNAS' && (!outletId || outletId === 'all' || f.outletId === outletId))
      .reduce((s, f) => s + f.amount, 0);
    const grossProfit = revenue - hpp;
    const netProfit = grossProfit - pettyCashTotal - fixedTotal;
    return ok({
      success: true,
      data: {
        revenue,
        hpp,
        grossProfit,
        pettyCashTotal,
        fixedTotal,
        netProfit,
        orderCount: paidOrders.length,
      },
    });
  }

  // --- BILLING & SUBSCRIPTION ---
  if (path === '/billing/status' && method === 'GET') {
    return ok({ success: true, data: state.billingStatus });
  }
  if (path === '/billing/invoices' && method === 'GET') {
    return ok({ success: true, data: state.billingInvoices });
  }
  if ((path === '/billing/checkout' || path === '/billing/upgrade-outlet') && method === 'POST') {
    const inv: SubscriptionInvoice = {
      id: genId('sub'),
      tenantId: state.tenant.id,
      invoiceNumber: `SUB-${Date.now().toString().slice(-6)}`,
      type: body.type || 'RENEWAL',
      description: body.description || `Paket ${body.plan || 'PRO'} (Demo)`,
      amount: Number(body.amount || 150000),
      status: 'PAID',
      paymentMethod: body.paymentMethod || 'QRIS',
      paidAt: nowIso(),
      expiresAt: nowIso(60 * 24 * 30),
      createdAt: nowIso(),
    };
    state.billingInvoices.unshift(inv);
    saveDemoState(state);
    return ok({ success: true, message: 'Simulasi pembayaran tagihan berhasil (Demo)', data: inv });
  }

  // --- WALLET & PAYMENT GATEWAY ---
  if (path === '/wallet/summary' && method === 'GET') {
    return ok({ success: true, data: state.walletSummary });
  }
  if (path === '/wallet/bank-account' && method === 'PUT') {
    state.walletSummary.bankInfo = {
      bankName: body.bankName || state.walletSummary.bankInfo.bankName,
      bankAccountNumber: body.bankAccountNumber || state.walletSummary.bankInfo.bankAccountNumber,
      bankAccountName: body.bankAccountName || state.walletSummary.bankInfo.bankAccountName,
    };
    saveDemoState(state);
    return ok({ success: true, message: 'Rekening bank demo diperbarui' });
  }
  if (path === '/wallet/withdraw' && method === 'POST') {
    const amt = Number(body.amount || 0);
    if (amt <= 0 || amt > state.walletSummary.walletBalance) {
      throw new Error('Saldo dompet tidak mencukupi');
    }
    const fee = 5000;
    const before = state.walletSummary.walletBalance;
    state.walletSummary.walletBalance -= amt;
    state.walletSummary.totalDebited += amt;
    const wd = {
      id: genId('wd'),
      tenantId: state.tenant.id,
      withdrawalNumber: `WD-${Date.now().toString().slice(-6)}`,
      amount: amt,
      fee,
      netAmount: Math.max(0, amt - fee),
      bankName: state.walletSummary.bankInfo.bankName,
      bankAccountNumber: state.walletSummary.bankInfo.bankAccountNumber,
      bankAccountName: state.walletSummary.bankInfo.bankAccountName,
      status: 'PROCESSED' as const,
      processedAt: nowIso(),
      createdAt: nowIso(),
    };
    state.walletSummary.recentWithdrawals.unshift(wd);
    state.walletSummary.recentTransactions.unshift({
      id: genId('wt'),
      tenantId: state.tenant.id,
      type: 'DEBIT',
      category: 'WITHDRAWAL',
      amount: amt,
      balanceBefore: before,
      balanceAfter: state.walletSummary.walletBalance,
      referenceId: wd.withdrawalNumber,
      description: `Penarikan dana demo ke ${wd.bankName} ${wd.bankAccountNumber}`,
      createdAt: nowIso(),
    });
    saveDemoState(state);
    return ok({ success: true, message: 'Penarikan dana demo diproses', data: wd });
  }
  if (path === '/payment/gateway/config' && method === 'GET') {
    return ok({ success: true, data: state.paymentGatewayConfig });
  }
  if (path === '/payment/gateway/config' && method === 'PUT') {
    state.paymentGatewayConfig = { ...state.paymentGatewayConfig, ...body, hasApiKey: true };
    saveDemoState(state);
    return ok({
      success: true,
      message: 'Konfigurasi Payment Gateway demo disimpan',
      provider: state.paymentGatewayConfig.provider,
    });
  }
  if (path === '/payment/gateway/test' && method === 'POST') {
    return ok({ success: true, message: 'Koneksi Payment Gateway (Mode Sandbox Demo) berhasil terhubung!' });
  }
  if (path.startsWith('/payment/') && method === 'POST') {
    return ok({
      success: true,
      message: 'QRIS Demo siap dipindai',
      data: {
        reference: `QR-DEMO-${Date.now().toString().slice(-6)}`,
        qrString: '00020101021226620014ID.CO.QRIS.WWW01189360091430000000000210DEMO0000010303UME5204581253033605802ID5915PRO POS DEMO6007BANDUNG6304ABCD',
        amount: Number(body.amount || 0),
        status: 'PENDING',
      },
    });
  }
  if (path.startsWith('/payment/') && method === 'GET') {
    return ok({ success: true, isPaid: true, status: 'PAID' });
  }

  return ok({ success: true, data: null });
}
