import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    // Check stored users
    const storedUsers: User[] = JSON.parse(localStorage.getItem('tt_users') || '[]');
    const existing = storedUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

    const isAdminEmail =
      email.toLowerCase() === 'layeredstudio78@gmail.com' ||
      email.toLowerCase() === 'admin@tarhanaterapi.com' ||
      email.toLowerCase() === 'admin';

    if (existing) {
      if (isAdminEmail) existing.isAdmin = true;
      onLoginSuccess(existing);
      onClose();
    } else {
      // Create user session if first time or default
      const newUser: User = {
        id: `user-${Date.now()}`,
        fullName: isAdminEmail ? 'Mağaza Yöneticisi' : email.split('@')[0],
        email: email,
        points: 50,
        isAdmin: isAdminEmail,
        createdAt: new Date().toLocaleDateString('tr-TR'),
      };
      storedUsers.push(newUser);
      localStorage.setItem('tt_users', JSON.stringify(storedUsers));
      onLoginSuccess(newUser);
      onClose();
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName || !email || !password) {
      setError('Lütfen gerekli alanları doldurun.');
      return;
    }

    const storedUsers: User[] = JSON.parse(localStorage.getItem('tt_users') || '[]');
    const existing = storedUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (existing) {
      setError('Bu e-posta adresiyle kayıtlı bir hesap zaten var.');
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      fullName,
      email,
      phone,
      points: 100, // Hoş geldin 100 puanı
      createdAt: new Date().toLocaleDateString('tr-TR'),
    };

    storedUsers.push(newUser);
    localStorage.setItem('tt_users', JSON.stringify(storedUsers));
    onLoginSuccess(newUser);
    onClose();
  };

  const handleFastDemoLogin = () => {
    const demoUser: User = {
      id: 'demo-user-1',
      fullName: 'Ayşe Yılmaz',
      email: 'ayse.yilmaz@tarhanaterapi.com',
      phone: '0532 123 45 67',
      city: 'İstanbul',
      district: 'Kadıköy',
      address: 'Caferağa Mah. Şifa Sok. No: 12 D: 4',
      points: 150,
      isAdmin: false,
      createdAt: '12.01.2025',
    };
    onLoginSuccess(demoUser);
    onClose();
  };

  const handleFastAdminLogin = () => {
    const adminUser: User = {
      id: 'admin-user-1',
      fullName: 'Mağaza Yöneticisi',
      email: 'layeredstudio78@gmail.com',
      phone: '0850 302 82 74',
      city: 'Bursa',
      district: 'Orhangazi',
      address: 'Gedelek Köyü No: 28, Orhangazi',
      points: 999,
      isAdmin: true,
      createdAt: '01.01.2025',
    };
    onLoginSuccess(adminUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-inverse-surface/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-surface rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden my-8 z-10">
        {/* Header */}
        <div className="bg-surface-container-low p-6 border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">
              account_circle
            </span>
            <div>
              <h3 className="font-headline-sm text-on-surface text-xl">
                {mode === 'login' ? 'Üye Girişi' : 'Yeni Üyelik Oluştur'}
              </h3>
              <p className="text-xs text-on-surface-variant">
                TarhanaTerapi Şifa Kulübü &amp; Sipariş Takibi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Mode switcher tabs */}
        <div className="flex border-b border-surface-container">
          <button
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              mode === 'login'
                ? 'border-primary text-primary bg-primary-fixed/20'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            Giriş Yap
          </button>
          <button
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              mode === 'register'
                ? 'border-primary text-primary bg-primary-fixed/20'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            Üye Ol (+100 Şifa Puanı)
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="p-3 mb-4 rounded-lg bg-red-100 text-error text-xs font-medium">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={async () => {
              try {
                await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: { redirectTo: window.location.origin },
                });
              } catch {
                setError('Google ile giriş başlatılamadı.');
              }
            }}
            className="w-full mb-4 py-2.5 rounded-lg border border-outline-variant/40 bg-white text-on-surface text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            Google ile devam et
          </button>

          <div className="text-center text-[10px] text-outline mb-4">
            veya e-posta ile
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  E-Posta Adresi
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@posta.com"
                  className="w-full px-3.5 py-2 text-xs rounded-lg bg-surface-container-low border border-outline-variant/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Şifre
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-xs rounded-lg bg-surface-container-low border border-outline-variant/40"
                />
              </div>

              <button
                type="submit"
                className="mt-2 py-3 bg-primary text-on-primary hover:bg-primary-container rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs active:scale-98"
              >
                Giriş Yap
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Adınız Soyadınız *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ad Soyad"
                  className="w-full px-3.5 py-2 text-xs rounded-lg bg-surface-container-low border border-outline-variant/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  E-Posta Adresi *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@posta.com"
                  className="w-full px-3.5 py-2 text-xs rounded-lg bg-surface-container-low border border-outline-variant/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Telefon Numarası
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className="w-full px-3.5 py-2 text-xs rounded-lg bg-surface-container-low border border-outline-variant/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Şifre *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  className="w-full px-3.5 py-2 text-xs rounded-lg bg-surface-container-low border border-outline-variant/40"
                />
              </div>

              <button
                type="submit"
                className="mt-2 py-3 bg-primary text-on-primary hover:bg-primary-container rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs active:scale-98"
              >
                Üye Ol ve 100 Şifa Puanı Kazan
              </button>
            </form>
          )}

          {/* Quick Demo Login Option */}
          <div className="mt-4 pt-4 border-t border-outline-variant/20 flex flex-col gap-2 text-center">
            <button
              type="button"
              onClick={handleFastDemoLogin}
              className="text-xs text-primary font-semibold hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              <span>Hızlı Müşteri Girişi (Ayşe Yılmaz)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
