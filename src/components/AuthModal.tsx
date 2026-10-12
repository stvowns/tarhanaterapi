import React, { useEffect, useRef, useState } from 'react';
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
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '70592447972-72sr6a876b6493t9klok0drdamk16bam.apps.googleusercontent.com';
    const render = () => {
      const g = (window as any).google;
      if (!g?.accounts?.id || !googleBtnRef.current) return;
      g.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential?: string }) => {
          if (!response?.credential) return;
          const { data, error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: response.credential });
          if (error || !data?.user) {
            setError('Google ile giriş başarısız.');
            return;
          }
          const u = data.user;
          const user: User = {
            id: u.id,
            fullName: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Kullanıcı',
            email: u.email || '',
            points: 0,
            isAdmin:
              u.email?.toLowerCase() === 'layeredstudio78@gmail.com' ||
              u.email?.toLowerCase() === 'admin@tarhanaterapi.com',
            createdAt: new Date().toLocaleDateString('tr-TR'),
          };
          onLoginSuccess(user);
          onClose();
        },
        ux_mode: 'popup',
      });
      googleBtnRef.current.innerHTML = '';
      g.accounts.id.renderButton(googleBtnRef.current, { theme: 'outline', size: 'large', width: 320, text: 'continue_with', shape: 'rectangular' });
      setGoogleReady(true);
    };

    if ((window as any).google?.accounts?.id) {
      render();
      return;
    }
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener('load', render);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = render;
    document.head.appendChild(script);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (loginError || !data.user) {
        setError('E-posta veya şifre hatalı.');
        return;
      }
      const u = data.user;
      const user: User = {
        id: u.id,
        fullName: (u.user_metadata?.full_name as string) || u.email?.split('@')[0] || 'Kullanıcı',
        email: u.email || '',
        phone: (u.user_metadata?.phone as string) || '',
        points: 0,
        isAdmin:
          u.email?.toLowerCase() === 'layeredstudio78@gmail.com' ||
          u.email?.toLowerCase() === 'admin@tarhanaterapi.com',
        createdAt: new Date().toLocaleDateString('tr-TR'),
      };
      onLoginSuccess(user);
      onClose();
    } catch {
      setError('Giriş sırasında bir hata oluştu.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName || !email || !password) {
      setError('Lütfen gerekli alanları doldurun.');
      return;
    }
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone },
        },
      });
      if (signUpError || !data.user) {
        setError(signUpError?.message || 'Kayıt başarısız.');
        return;
      }
      const u = data.user;
      const user: User = {
        id: u.id,
        fullName:
          (u.user_metadata?.full_name as string) ||
          fullName ||
          u.email?.split('@')[0] ||
          'Kullanıcı',
        email: u.email || email,
        phone: phone || (u.user_metadata?.phone as string) || '',
        points: 100,
        createdAt: new Date().toLocaleDateString('tr-TR'),
      };
      onLoginSuccess(user);
      onClose();
    } catch {
      setError('Kayıt sırasında bir hata oluştu.');
    }
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
                ? 'border-primary text-on-primary bg-primary'
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
                ? 'border-secondary text-on-secondary bg-secondary'
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

          <div className="w-full flex justify-center mb-3" ref={googleBtnRef} />

          {!googleReady && (
            <button
              type="button"
              disabled
              className="w-full mb-4 py-2.5 rounded-lg border border-outline-variant/40 bg-surface-container-low text-outline text-xs font-semibold flex items-center justify-center gap-2"
            >
              Google yükleniyor...
            </button>
          )}

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
