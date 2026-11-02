import React, { useState } from 'react';

export interface UserAccount {
  name: string;
  email: string;
  role: 'KASIR' | 'OWNER' | 'MANAGER';
  avatarInitials: string;
}

interface LoginPageProps {
  onLogin: (user: UserAccount) => void;
}

export const DEMO_ACCOUNTS: Array<UserAccount & { pass: string; title: string; desc: string }> = [
  {
    name: 'Siti Rahma',
    email: 'kasir@protek.pos',
    pass: 'kasir123',
    role: 'KASIR',
    avatarInitials: 'SR',
    title: 'Kasir Toko (Shift 1)',
    desc: 'Langsung masuk Terminal Transaksi Kasir POS',
  },
  {
    name: 'Hendra Pratama',
    email: 'owner@protek.pos',
    pass: 'owner123',
    role: 'OWNER',
    avatarInitials: 'HP',
    title: 'Owner / Pemilik Usaha',
    desc: 'Akses Executive Dashboard omset & laporan',
  },
  {
    name: 'Denny Wahyudi',
    email: 'manager@protek.pos',
    pass: 'manager123',
    role: 'MANAGER',
    avatarInitials: 'DW',
    title: 'Manager Outlet',
    desc: 'Akses stok, rekap kasir & analisis shift',
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('kasir@protek.pos');
  const [password, setPassword] = useState('kasir123');
  const [selectedRole, setSelectedRole] = useState<'KASIR' | 'OWNER' | 'MANAGER'>('KASIR');
  const [showPassword, setShowPassword] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const handleSelectQuickAccount = (account: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(account.email);
    setPassword(account.pass);
    setSelectedRole(account.role);
    setErrorNotice(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);

    // Cari akun yang sesuai atau gunakan fallback
    const matched = DEMO_ACCOUNTS.find(
      (acc) => acc.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (matched) {
      if (password === matched.pass) {
        onLogin({
          name: matched.name,
          email: matched.email,
          role: matched.role,
          avatarInitials: matched.avatarInitials,
        });
        return;
      } else {
        setErrorNotice('Kata sandi salah. Gunakan password uji coba: kasir123 / owner123 / manager123');
        return;
      }
    }

    // Generic fallback login jika menginput kredensial bebas
    if (email && password) {
      const initials = email.slice(0, 2).toUpperCase();
      onLogin({
        name: email.split('@')[0],
        email: email,
        role: selectedRole,
        avatarInitials: initials,
      });
    } else {
      setErrorNotice('Harap lengkapi email dan kata sandi.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00142B] via-[#002045] to-[#0A3366] flex flex-col justify-center items-center p-4 sm:p-6 text-slate-800">
      <div className="w-full max-w-md space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Branding Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
            <img
              src="/logo.png"
              alt="PT Pro Teknologi"
              className="h-9 w-auto object-contain rounded bg-white p-1"
            />
            <div className="text-left">
              <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider block font-display">
                PT PRO TEKNOLOGI
              </span>
              <span className="text-sm font-bold text-white font-display">
                Pro POS Enterprise Cloud
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">
            Login Terminal POS Kasir
          </h1>
          <p className="text-xs text-sky-200">
            Sistem Kasir Pintar & Manajemen Outlet Multi-Role
          </p>
        </div>

        {/* Card Login */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-100">
          {/* Quick 1-Click Fast Login Buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>⚡ Akun Uji Coba (1-Click Fill):</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = email === acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectQuickAccount(acc)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-[#002045] text-white border-[#002045] shadow-sm'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {acc.avatarInitials}
                      </div>
                      <div>
                        <div className="font-bold text-xs flex items-center gap-1.5">
                          <span>{acc.title}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                              isSelected ? 'bg-white/20 text-sky-200' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {acc.role}
                          </span>
                        </div>
                        <div
                          className={`text-[10px] mt-0.5 truncate ${
                            isSelected ? 'text-sky-100' : 'text-slate-500'
                          }`}
                        >
                          {acc.email} &bull; pass: {acc.pass}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`material-symbols-outlined text-base ${
                        isSelected ? 'text-sky-300' : 'text-slate-400'
                      }`}
                    >
                      {isSelected ? 'check_circle' : 'touch_app'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {errorNotice && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-base shrink-0 text-rose-600">error</span>
              <span>{errorNotice}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Username / Email Akun
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 material-symbols-outlined text-base text-slate-400">
                  person
                </span>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kasir@protek.pos"
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Kata Sandi
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 material-symbols-outlined text-base text-slate-400">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined text-base">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#002045] hover:bg-[#0284c7] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
            >
              <span className="material-symbols-outlined text-lg">login</span>
              <span>Masuk ke Sistem POS</span>
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-slate-400 border-t border-slate-100">
            Demo POS Kasir &bull; PT Pro Teknologi Indonesia &bull; Versi Cloud 2026
          </div>
        </div>
      </div>
    </div>
  );
};
