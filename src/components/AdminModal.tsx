import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Order, SubscriberLead, User } from '../types';
import { PRODUCTS } from '../data/mockData';
import {
  buildNewsletterHtml,
  DEFAULT_NEWSLETTER,
  type NewsletterFields,
} from '../lib/newsletterTemplate';

type AdminReview = {
  id: string;
  author: string;
  location: string;
  rating: number;
  content: string;
  productName?: string;
  createdAt: string;
  verified: boolean;
};

type NewsletterContact = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  unsubscribed: boolean;
  createdAt?: string;
};

type MfaFactorRow = {
  id: string;
  status: string;
  friendlyName?: string | null;
};

type MfaEnrollState = {
  factorId: string;
  qrCode: string;
  secret: string;
};

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  subscribers: SubscriberLead[];
  currentUser?: User | null;
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  onSimulateIncomingOrder: () => void;
  onClearNewOrderAlert: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  orders,
  subscribers,
  currentUser,
  onUpdateOrderStatus,
  onSimulateIncomingOrder,
  onClearNewOrderAlert,
}) => {
  const [activeTab, setActiveTab] = useState<
    'orders' | 'reviews' | 'subscribers' | 'newsletter' | 'database' | 'security'
  >('orders');
  const [pendingReviews, setPendingReviews] = useState<AdminReview[]>([]);
  const [approvedReviews, setApprovedReviews] = useState<AdminReview[]>([]);
  const [reviewBusy, setReviewBusy] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [newsletterContacts, setNewsletterContacts] = useState<NewsletterContact[]>([]);
  const [newsletterSelected, setNewsletterSelected] = useState<string[]>([]);
  const [newsletterContactsBusy, setNewsletterContactsBusy] = useState(false);
  const [newsletterContactsError, setNewsletterContactsError] = useState('');
  const [newsletterHasMore, setNewsletterHasMore] = useState(false);
  const [newsletterFields, setNewsletterFields] = useState<NewsletterFields>({
    ...DEFAULT_NEWSLETTER,
  });
  const [newsletterBusy, setNewsletterBusy] = useState(false);
  const [newsletterResult, setNewsletterResult] = useState('');
  const [newsletterError, setNewsletterError] = useState('');
  const [mfaFactors, setMfaFactors] = useState<MfaFactorRow[]>([]);
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaError, setMfaError] = useState('');
  const [mfaSuccess, setMfaSuccess] = useState('');
  const [mfaEnrollData, setMfaEnrollData] = useState<MfaEnrollState | null>(null);
  const [mfaCode, setMfaCode] = useState('');

  const loadReviews = async () => {
    setReviewError('');
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const [pendingRes, approvedRes] = await Promise.all([
        token
          ? fetch('/api/list-reviews?status=pending', {
              headers: { Authorization: `Bearer ${token}` },
              cache: 'no-store',
            })
          : Promise.resolve(null),
        fetch('/api/list-reviews?status=approved', { cache: 'no-store' }),
      ]);

      if (pendingRes?.ok) {
        const payload = await pendingRes.json();
        if (Array.isArray(payload.reviews)) {
          setPendingReviews(
            payload.reviews.map((review: AdminReview) => ({ ...review, verified: false }))
          );
        }
      }

      if (approvedRes.ok) {
        const payload = await approvedRes.json();
        if (Array.isArray(payload.reviews)) {
          setApprovedReviews(
            payload.reviews.map((review: AdminReview) => ({ ...review, verified: true }))
          );
        }
      }
    } catch {
      setReviewError('Yorumlar yüklenemedi. Lütfen tekrar deneyin.');
    }
  };

  useEffect(() => {
    if (isOpen) loadReviews();
  }, [isOpen]);

  const loadMfa = async () => {
    setMfaLoading(true);
    setMfaError('');
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      const rows: MfaFactorRow[] = (data?.totp || []).map((factor) => ({
        id: factor.id,
        status: String(factor.status || 'unverified'),
        friendlyName: factor.friendly_name || null,
      }));
      setMfaFactors(rows);
    } catch {
      setMfaError('İki adımlı doğrulama durumu alınamadı.');
    } finally {
      setMfaLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'security') loadMfa();
  }, [isOpen, activeTab]);

  const startMfaEnrollment = async () => {
    setMfaError('');
    setMfaSuccess('');
    setMfaCode('');
    setMfaLoading(true);
    try {
      // Önceki yarım kalmış doğrulanmamış kurulumları temizle.
      for (const factor of mfaFactors) {
        if (factor.status !== 'verified') {
          await supabase.auth.mfa.unenroll({ factorId: factor.id }).catch(() => {});
        }
      }
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: `TarhanaTerapi Admin ${Date.now()}`,
      });
      if (error || !data) {
        throw error || new Error('MFA kurulumu başlatılamadı.');
      }
      setMfaEnrollData({
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setMfaError(
        message.includes('already exists')
          ? 'Bu hesapta zaten bir MFA kurulumu var. Önce mevcut kurulumu doğrulayın.'
          : 'MFA kurulumu başlatılamadı. Supabase panelinde TOTP açık mı kontrol edin.'
      );
    } finally {
      setMfaLoading(false);
    }
  };

  const verifyMfaEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError('');
    setMfaSuccess('');
    if (!mfaEnrollData || mfaCode.trim().length !== 6) {
      setMfaError('Authenticator uygulamasındaki 6 haneli kodu girin.');
      return;
    }
    setMfaLoading(true);
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: mfaEnrollData.factorId,
        code: mfaCode.trim(),
      });
      if (error) {
        setMfaError('Kod geçersiz veya süresi dolmuş. Yeni kodu deneyin.');
        return;
      }
      await supabase.auth.refreshSession();
      setMfaEnrollData(null);
      setMfaCode('');
      setMfaSuccess('İki adımlı doğrulama etkinleştirildi.');
      await loadMfa();
    } catch {
      setMfaError('Doğrulama sırasında bir hata oluştu.');
    } finally {
      setMfaLoading(false);
    }
  };

  const cancelMfaEnrollment = async () => {
    if (mfaEnrollData) {
      try {
        await supabase.auth.mfa.unenroll({ factorId: mfaEnrollData.factorId });
      } catch {
        // Kurulum zaten iptal edilmiş olabilir.
      }
    }
    setMfaEnrollData(null);
    setMfaCode('');
    setMfaError('');
    await loadMfa();
  };

  const handleReviewAction = async (id: string, action: 'approve' | 'delete') => {
    setReviewBusy(id);
    setReviewError('');
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setReviewError('Yönetici oturumu bulunamadı. Lütfen tekrar giriş yapın.');
        return;
      }
      const res = await fetch('/api/moderate-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, action }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setReviewError(payload.error || 'İşlem tamamlanamadı. Lütfen tekrar deneyin.');
        return;
      }
      await loadReviews();
    } finally {
      setReviewBusy(null);
    }
  };

  const newsletterHtml = useMemo(
    () => buildNewsletterHtml(newsletterFields),
    [newsletterFields]
  );

  const loadNewsletterContacts = async () => {
    setNewsletterContactsBusy(true);
    setNewsletterContactsError('');
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error('Yönetici oturumu bulunamadı.');

      const res = await fetch('/api/list-newsletter-contacts', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || 'Alıcı listesi alınamadı.');

      const contacts: NewsletterContact[] = Array.isArray(payload.contacts)
        ? payload.contacts
        : [];
      setNewsletterContacts(contacts);
      setNewsletterHasMore(Boolean(payload.hasMore));
      setNewsletterSelected((previous) =>
        previous.filter((email) =>
          contacts.some((contact) => contact.email === email && !contact.unsubscribed)
        )
      );
    } catch (error) {
      setNewsletterContactsError(
        error instanceof Error ? error.message : 'Alıcı listesi alınamadı.'
      );
    } finally {
      setNewsletterContactsBusy(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'newsletter') loadNewsletterContacts();
  }, [isOpen, activeTab]);

  const updateNewsletterField = (field: keyof NewsletterFields, value: string) => {
    setNewsletterFields((previous) => ({ ...previous, [field]: value }));
  };

  const toggleNewsletterContact = (email: string) => {
    setNewsletterSelected((previous) => {
      if (previous.includes(email)) return previous.filter((item) => item !== email);
      if (previous.length >= 25) return previous;
      return [...previous, email];
    });
  };

  const selectAllNewsletterContacts = () => {
    const eligible = newsletterContacts
      .filter((contact) => !contact.unsubscribed)
      .map((contact) => contact.email);
    setNewsletterSelected((previous) =>
      previous.length === eligible.length ? [] : eligible.slice(0, 25)
    );
  };

  const handleSendNewsletter = async () => {
    setNewsletterError('');
    setNewsletterResult('');

    if (!newsletterFields.subject.trim()) {
      setNewsletterError('Bülten konusu boş olamaz.');
      return;
    }
    if (newsletterSelected.length === 0) {
      setNewsletterError('Göndermek için en az bir alıcı seçin.');
      return;
    }
    if (newsletterSelected.length > 25) {
      setNewsletterError('Tek seferde en fazla 25 alıcıya gönderilebilir.');
      return;
    }

    const confirmed = window.confirm(
      `${newsletterSelected.length} kişiye “${newsletterFields.subject}” konulu bülten gönderilsin mi?`
    );
    if (!confirmed) return;

    setNewsletterBusy(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error('Yönetici oturumu bulunamadı.');

      const res = await fetch('/api/send-newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: newsletterFields.subject.trim(),
          html: newsletterHtml,
          recipients: newsletterSelected,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || 'Bülten gönderilemedi.');

      setNewsletterResult(
        `${payload.sent || 0} kişiye gönderildi${
          payload.failed ? `, ${payload.failed} kişide hata oluştu.` : '.'
        }`
      );
    } catch (error) {
      setNewsletterError(
        error instanceof Error ? error.message : 'Bülten gönderilemedi.'
      );
    } finally {
      setNewsletterBusy(false);
    }
  };

  const parseOrderDate = (value: string) => {
    const match = value?.match(/(\\d{2})\\.(\\d{2})\\.(\\d{4})/);
    if (!match) return '';
    return `${match[3]}-${match[2]}-${match[1]}`;
  };

  const filteredOrders = orders.filter((order) => {
    const orderDate = parseOrderDate(order.createdAt);
    if (!orderDate) return true;
    if (dateFrom && orderDate < dateFrom) return false;
    if (dateTo && orderDate > dateTo) return false;
    return true;
  });

  const isAuthorized = Boolean(currentUser?.isAdmin);
  const hasVerifiedMfa = mfaFactors.some((factor) => factor.status === 'verified');

  if (!isOpen) return null;

  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-inverse-surface/80 backdrop-blur-xs" onClick={onClose} />
        <div className="relative z-10 w-full max-w-md bg-background rounded-xl shadow-xl p-6 text-center">
          <p className="text-sm font-medium mb-4">Yönetici yetkisi gerekli. Lütfen yöneticileri atanan SUPABASE hesabınızla giriş yapın.</p>
          <button onClick={onClose} className="px-4 py-2 rounded bg-primary text-on-primary text-sm font-medium">Kapat</button>
        </div>
      </div>
    );
  }

  // Get stored users from localStorage
  const getStoredUsers = (): User[] => {
    try {
      return JSON.parse(localStorage.getItem('tt_users') || '[]');
    } catch {
      return [];
    }
  };

  const storedUsers = getStoredUsers();

  // Export Subscribers to CSV (UTF-8 BOM for Excel support)
  const safeCsv = (value: string) => /^[=+\-@]/.test((value || '').trim()) ? `'${value}` : String(value || '').replace(/"/g, '""');

  const exportSubscribersCSV = () => {
    const BOM = '\uFEFF';
    const header = 'ID,E-posta,Kaynak,Kayit_Tarihi\n';
    const rows = subscribers
      .map(
        (s) =>
          `${s.id},"${safeCsv(s.email)}","${s.source === 'ebook' ? 'E-Kitap Indirme' : 'Sifa Bulteni'}","${safeCsv(s.createdAt)}"`
      )
      .join('\n');
    const blob = new Blob([BOM + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tarhanaterapi_eposta_listesi_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export Orders to CSV (UTF-8 BOM for Excel support)
  const exportOrdersCSV = () => {
    const BOM = '\uFEFF';
    const header =
      'Siparis_No,Musteri_Adi,Eposta,Telefon,Il,Ilce,Adres,Odeme_Yontemi,Urunler,Toplam_Tutar,Durum,Tarih\n';
    const rows = filteredOrders
      .map((o) => {
        const itemsSummary = o.items
          .map((it) => `${it.quantity}x ${it.name} (${it.weight})`)
          .join('; ');
        const payment =
          o.paymentMethod === 'bank_transfer'
            ? 'Havale/EFT'
            : o.paymentMethod === 'credit_card'
              ? 'Kredi Karti'
              : 'Kapida Odeme';
        const safe = (v: string) => (/^[=+\-@]/.test((v || '').trim()) ? "'" + v : String(v || '').replace(/"/g, '""'));
        return `"${safe(o.orderNumber)}","${safe(o.customerName)}","${safe(o.customerEmail)}","${safe(o.customerPhone)}","${safe(o.customerCity)}","${safe(o.customerDistrict)}","${safe(o.customerAddress)}","${safe(payment)}","${safe(itemsSummary)}",${o.total},"${safe(o.status)}","${safe(o.createdAt)}"`;

      })
      .join('\n');
    const blob = new Blob([BOM + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tarhanaterapi_siparisler_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export application data as JSON. This is not a byte-for-byte Supabase backup.
  const exportFullDatabaseJSON = () => {
    const exportReviews = [...approvedReviews, ...pendingReviews];
    const fullDatabase = {
      exportMetadata: {
        appName: 'TarhanaTerapi E-Ticaret',
        exportedAt: new Date().toISOString(),
        version: '1.1.0',
        note: 'Bu dosya uygulama verisi dışa aktarımıdır. Supabase auth kullanıcıları, şifre hashleri, oturumlar, storage ve şema bu dosyada yer almaz. Tam yedek için Supabase Dashboard > Database > Backups veya pg_dump kullanın.',
        counts: {
          orders: orders.length,
          subscribers: subscribers.length,
          reviews: exportReviews.length,
          localUsers: storedUsers.length,
          products: PRODUCTS.length,
        },
        localStorageKeys: ['tt_subscribers', 'tt_users', 'tt_current_user'],
      },
      tables: {
        orders: orders,
        subscribers: subscribers,
        reviews: exportReviews,
        products: PRODUCTS,
        localUsers: storedUsers,
      },
    };

    const jsonString = JSON.stringify(fullDatabase, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tarhanaterapi_veri_export_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const sqlSchemaCode = `-- TarhanaTerapi E-Ticaret Veritabanı Şeması (PostgreSQL / Supabase / MySQL)

CREATE TABLE products (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  weight VARCHAR(100),
  in_stock BOOLEAN DEFAULT TRUE,
  rating NUMERIC(3, 2),
  reviews_count INT DEFAULT 0
);

CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  city VARCHAR(100),
  district VARCHAR(100),
  address TEXT,
  points INT DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id VARCHAR(64) PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_city VARCHAR(100) NOT NULL,
  customer_district VARCHAR(100) NOT NULL,
  customer_address TEXT NOT NULL,
  delivery_note TEXT,
  payment_method VARCHAR(50) NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  shipping_fee NUMERIC(10, 2) NOT NULL,
  discount NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Yeni Sipariş',
  created_at VARCHAR(100) NOT NULL
);

CREATE TABLE subscribers (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  source VARCHAR(50) NOT NULL, -- 'ebook' veya 'newsletter'
  created_at VARCHAR(100) NOT NULL
);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchemaCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-inverse-surface/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl bg-surface rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden my-8 z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-surface-container-low p-6 border-b border-surface-container-high flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">
                admin_panel_settings
              </span>
            </div>
            <div>
              <h3 className="font-headline-sm text-on-surface text-xl font-bold">
                TarhanaTerapi Yönetici Paneli
              </h3>
              <p className="text-xs text-on-surface-variant">
                Canlı Sipariş Takibi, E-Posta Listesi, Bülten &amp; Veritabanı Yönetimi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center justify-between border-b border-surface-container px-6 bg-surface-container-lowest shrink-0 overflow-x-auto">
          <div className="flex gap-1">
            <button
              onClick={() => {
                setActiveTab('orders');
                onClearNewOrderAlert();
              }}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
              <span>Siparişler ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">rate_review</span>
              <span>Yorumlar ({pendingReviews.length + approvedReviews.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('subscribers')}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'subscribers'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">mail</span>
              <span>E-Posta ({subscribers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('newsletter')}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'newsletter'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">campaign</span>
              <span>Bülten Gönder</span>
            </button>

            <button
              onClick={() => setActiveTab('database')}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'database'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">database</span>
              <span>Veritabanı</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'security'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">security</span>
              <span>Güvenlik</span>
            </button>
          </div>

          <button
            onClick={onSimulateIncomingOrder}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary-fixed text-on-secondary-fixed rounded-lg text-xs font-semibold hover:bg-secondary-container transition-colors cursor-pointer shrink-0"
            title="Sipariş bildirimini test et"
          >
            <span className="material-symbols-outlined text-[16px]">notifications_active</span>
            <span>+ Test Siparişi</span>
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div className="p-6 overflow-y-auto grow">
            {orders.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center">
                <span className="material-symbols-outlined text-[48px] text-outline mb-2">
                  inbox
                </span>
                <p className="font-title-md text-sm text-on-surface font-semibold">
                  Henüz gelen bir sipariş yok
                </p>
                <p className="text-xs text-outline mt-1 max-w-sm">
                  Müşteriler siteden sipariş verdiğinde anlık bildirim bu ekrana düşer.
                </p>
                <button
                  onClick={onSimulateIncomingOrder}
                  className="mt-4 px-4 py-2 bg-primary-container text-on-primary-container text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Örnek Sipariş Oluştur ve Test Et
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-outline">Tarih:</span>
                    <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="text-xs border border-outline-variant/40 rounded px-2 py-1" />
                    <span className="text-xs text-outline">-</span>
                    <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="text-xs border border-outline-variant/40 rounded px-2 py-1" />
                  </div>
                  <span className="text-xs text-outline font-medium">
                    Toplam {filteredOrders.length} sipariş kayıtlı (filtre uygulandı: {orders.length})
                  </span>
                  <button
                    onClick={exportOrdersCSV}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-container text-on-primary-container rounded-lg text-xs font-semibold hover:bg-primary hover:text-on-primary transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Siparişleri Excel (CSV) İndir</span>
                  </button>
                </div>

                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col gap-3"
                  >
                    {/* Top Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/20 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-headline-sm text-sm font-bold text-primary">
                          #{order.orderNumber}
                        </span>
                        <span className="text-xs text-outline">({order.createdAt})</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-container font-semibold">
                          {order.paymentMethod === 'bank_transfer'
                            ? 'Havale/EFT'
                            : order.paymentMethod === 'credit_card'
                              ? 'Kredi Kartı'
                              : 'Kapıda Ödeme'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-outline">Durum:</span>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            onUpdateOrderStatus(order.id, e.target.value as Order['status'])
                          }
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-surface border border-outline-variant/40 focus:outline-none cursor-pointer"
                        >
                          <option value="Yeni Sipariş">Yeni Sipariş</option>
                          <option value="Hazırlanıyor">Hazırlanıyor</option>
                          <option value="Kargoya Verildi">Kargoya Verildi</option>
                          <option value="Tamamlandı">Tamamlandı</option>
                        </select>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-outline">Müşteri:</span>{' '}
                        <strong className="text-on-surface">{order.customerName}</strong>
                        <p className="text-outline">
                          {order.customerPhone} • {order.customerEmail}
                        </p>
                      </div>
                      <div>
                        <span className="text-outline">Teslimat Adresi:</span>{' '}
                        <p className="text-on-surface truncate">{order.customerAddress}</p>
                        <p className="text-outline">
                          {order.customerDistrict} / {order.customerCity}
                        </p>
                      </div>
                    </div>

                    {/* Order Items & Total */}
                    <div className="pt-2 border-t border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-2 text-xs">
                        {order.items.map((item, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container-low text-on-surface text-xs"
                          >
                            <strong>{item.quantity}x</strong> {item.name} ({item.weight}) - ₺
                            {item.price * item.quantity}
                          </span>
                        ))}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs text-outline mr-2">Toplam Tutar:</span>
                        <span className="font-headline-sm text-base font-bold text-primary">
                          ₺{order.total}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Review Moderation */}
        {activeTab === 'reviews' && (
          <div className="p-6 overflow-y-auto grow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-title-md text-sm font-bold text-on-surface">
                  Yorum Yönetimi
                </h3>
                <p className="text-xs text-outline">
                  Onay bekleyenleri onaylayın; yayındaki yorumları silebilirsiniz.
                </p>
              </div>
              <button
                onClick={loadReviews}
                className="px-3.5 py-1.5 bg-surface-container-high text-on-surface text-xs font-semibold rounded-lg hover:bg-surface-container-highest transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span>Yenile</span>
              </button>
            </div>

            {reviewError && (
              <div className="mb-4 rounded-lg border border-error/30 bg-error-container px-3 py-2 text-xs text-on-error-container">
                {reviewError}
              </div>
            )}

            {pendingReviews.length === 0 && approvedReviews.length === 0 ? (
              <div className="text-center py-12 text-xs text-outline">
                Henüz yorum yok.
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {pendingReviews.length > 0 && (
                  <section>
                    <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-outline">
                      Onay Bekleyenler ({pendingReviews.length})
                    </h5>
                    <div className="flex flex-col gap-3">
                      {pendingReviews.map((review) => (
                        <div
                          key={review.id}
                          className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest flex flex-col gap-3"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <strong className="text-sm text-on-surface">{review.author}</strong>
                                <span className="text-xs text-outline">{review.location}</span>
                                <span className="text-xs font-bold text-secondary">
                                  {review.rating}/5
                                </span>
                              </div>
                              <p className="text-[11px] text-outline mt-0.5">
                                {review.productName || 'Ürün belirtilmedi'} ·{' '}
                                {review.createdAt
                                  ? new Date(review.createdAt).toLocaleDateString('tr-TR')
                                  : ''}
                              </p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => handleReviewAction(review.id, 'approve')}
                                disabled={reviewBusy === review.id}
                                className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold hover:bg-emerald-200 transition-colors disabled:opacity-50 cursor-pointer"
                              >
                                Onayla
                              </button>
                              <button
                                onClick={() => handleReviewAction(review.id, 'delete')}
                                disabled={reviewBusy === review.id}
                                className="px-3 py-1.5 rounded-lg bg-error-container text-on-error-container text-[11px] font-bold hover:bg-error/20 transition-colors disabled:opacity-50 cursor-pointer"
                              >
                                Sil
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-on-surface-variant leading-relaxed">
                            {review.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {approvedReviews.length > 0 && (
                  <section>
                    <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-outline">
                      Yayındaki Yorumlar ({approvedReviews.length})
                    </h5>
                    <div className="flex flex-col gap-3">
                      {approvedReviews.map((review) => (
                        <div
                          key={review.id}
                          className="p-4 rounded-xl border border-emerald-200/70 bg-surface-container-lowest flex flex-col gap-3"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <strong className="text-sm text-on-surface">{review.author}</strong>
                                <span className="text-xs text-outline">{review.location}</span>
                                <span className="text-xs font-bold text-secondary">
                                  {review.rating}/5
                                </span>
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                  Yayında
                                </span>
                              </div>
                              <p className="text-[11px] text-outline mt-0.5">
                                {review.productName || 'Ürün belirtilmedi'} ·{' '}
                                {review.createdAt
                                  ? new Date(review.createdAt).toLocaleDateString('tr-TR')
                                  : ''}
                              </p>
                            </div>
                            <button
                              onClick={() => handleReviewAction(review.id, 'delete')}
                              disabled={reviewBusy === review.id}
                              className="px-3 py-1.5 rounded-lg bg-error-container text-on-error-container text-[11px] font-bold hover:bg-error/20 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                            >
                              Sil
                            </button>
                          </div>
                          <p className="text-xs text-on-surface-variant leading-relaxed">
                            {review.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Subscribers / Email Leads */}
        {activeTab === 'subscribers' && (
          <div className="p-6 overflow-y-auto grow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-title-md text-sm font-bold text-on-surface">
                  E-Kitap ve Bülten Üzerinden Toplanan E-Postalar
                </h3>
                <p className="text-xs text-outline">
                  Ziyaretçilerin indirme ve kayıt formlarına girdiği gerçek e-postalar
                </p>
              </div>

              {subscribers.length > 0 && (
                <button
                  onClick={exportSubscribersCSV}
                  className="px-3.5 py-1.5 bg-primary-container text-on-primary-container text-xs font-semibold rounded-lg hover:bg-primary hover:text-on-primary transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>CSV Olarak Dışa Aktar</span>
                </button>
              )}
            </div>

            {subscribers.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-xs text-outline">Henüz toplanmış bir e-posta adresi yok.</p>
              </div>
            ) : (
              <div className="border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container-lowest">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-low text-outline font-semibold border-b border-outline-variant/30">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">E-Posta Adresi</th>
                      <th className="p-3">Kaynak</th>
                      <th className="p-3 text-right">Kayıt Tarihi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {subscribers.map((sub, idx) => (
                      <tr key={sub.id} className="hover:bg-surface-container-low/50">
                        <td className="p-3 text-outline">{idx + 1}</td>
                        <td className="p-3 font-semibold text-on-surface">{sub.email}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              sub.source === 'ebook'
                                ? 'bg-secondary-fixed text-secondary'
                                : 'bg-primary-fixed text-primary'
                            }`}
                          >
                            {sub.source === 'ebook' ? 'E-Kitap İndirme' : 'Şifa Bülteni'}
                          </span>
                        </td>
                        <td className="p-3 text-right text-outline">{sub.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Newsletter Composer */}
        {activeTab === 'newsletter' && (
          <div className="p-6 overflow-y-auto grow">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="font-title-md text-sm font-bold text-on-surface">
                  Şifa Bülteni Gönderimi
                </h3>
                <p className="text-xs text-outline">
                  Resend kontaktlarını seçin, taslağı düzenleyin ve gönderin.
                </p>
              </div>
              <button
                onClick={loadNewsletterContacts}
                disabled={newsletterContactsBusy}
                className="px-3.5 py-1.5 bg-surface-container-high text-on-surface text-xs font-semibold rounded-lg hover:bg-surface-container-highest transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span>{newsletterContactsBusy ? 'Yükleniyor…' : 'Alıcıları Yenile'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              {/* Recipients */}
              <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wide text-outline">
                      Alıcılar
                    </h5>
                    <p className="mt-0.5 text-[11px] text-outline">
                      {newsletterContacts.length} Resend kontaktı
                    </p>
                  </div>
                  <button
                    onClick={selectAllNewsletterContacts}
                    disabled={newsletterContacts.length === 0}
                    className="rounded-lg bg-primary-fixed px-2.5 py-1 text-[11px] font-bold text-primary transition-colors hover:bg-primary-container disabled:opacity-50 cursor-pointer"
                  >
                    {newsletterContacts.filter((contact) => !contact.unsubscribed).length > 25
                      ? 'İlk 25’i seç'
                      : 'Tümünü seç'}
                  </button>
                </div>

                {newsletterContactsError && (
                  <div className="mb-3 rounded-lg border border-error/30 bg-error-container px-3 py-2 text-[11px] text-on-error-container">
                    {newsletterContactsError}
                  </div>
                )}

                {newsletterContactsBusy ? (
                  <div className="py-10 text-center text-xs text-outline">Alıcılar yükleniyor…</div>
                ) : newsletterContacts.length === 0 ? (
                  <div className="py-10 text-center text-xs text-outline">
                    Resend kontaktı bulunamadı. Yeni aboneler kaydedildikçe burada görünür.
                  </div>
                ) : (
                  <div className="max-h-[330px] divide-y divide-outline-variant/20 overflow-y-auto rounded-lg border border-outline-variant/20">
                    {newsletterContacts.map((contact) => (
                      <label
                        key={contact.id}
                        className={`flex items-start gap-2.5 p-2.5 ${
                          contact.unsubscribed
                            ? 'cursor-not-allowed opacity-55'
                            : 'cursor-pointer hover:bg-surface-container-low/60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={newsletterSelected.includes(contact.email)}
                          disabled={contact.unsubscribed}
                          onChange={() => toggleNewsletterContact(contact.email)}
                          className="mt-0.5 h-4 w-4 accent-primary"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold text-on-surface">
                            {contact.email}
                          </span>
                          <span className="mt-0.5 block text-[10px] text-outline">
                            {[contact.firstName, contact.lastName].filter(Boolean).join(' ') ||
                              'İsimsiz'}
                            {contact.createdAt
                              ? ` · ${new Date(contact.createdAt).toLocaleDateString('tr-TR')}`
                              : ''}
                          </span>
                        </span>
                        {contact.unsubscribed && (
                          <span className="shrink-0 rounded bg-surface-container-high px-1.5 py-0.5 text-[9px] font-bold text-outline">
                            çıkmış
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-semibold text-primary">
                    {newsletterSelected.length} kişi seçili
                  </span>
                  {newsletterContacts.length > 0 && newsletterSelected.length > 0 && (
                    <button
                      onClick={() => setNewsletterSelected([])}
                      className="text-outline underline underline-offset-2 hover:text-on-surface cursor-pointer"
                    >
                      Seçimi temizle
                    </button>
                  )}
                </div>
                {newsletterHasMore && (
                  <p className="mt-2 text-[10px] leading-relaxed text-outline">
                    Resend’de 100’den fazla kontakt var; bu ekranda ilk 100 gösteriliyor.
                  </p>
                )}
              </section>

              {/* Composer */}
              <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h5 className="text-xs font-bold uppercase tracking-wide text-outline">
                    Bülten Taslağı
                  </h5>
                  <button
                    onClick={() => setNewsletterFields({ ...DEFAULT_NEWSLETTER })}
                    className="text-[11px] font-semibold text-primary underline underline-offset-2 hover:text-on-surface cursor-pointer"
                  >
                    Varsayılanı yükle
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-on-surface-variant">Konu</span>
                    <input
                      value={newsletterFields.subject}
                      onChange={(event) => updateNewsletterField('subject', event.target.value)}
                      className="w-full rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 text-xs text-on-surface outline-none focus:border-primary"
                    />
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-on-surface-variant">
                      Ön yazı (preheader)
                    </span>
                    <input
                      value={newsletterFields.preheader}
                      onChange={(event) => updateNewsletterField('preheader', event.target.value)}
                      className="w-full rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 text-xs text-on-surface outline-none focus:border-primary"
                    />
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-on-surface-variant">Başlık</span>
                    <input
                      value={newsletterFields.heading}
                      onChange={(event) => updateNewsletterField('heading', event.target.value)}
                      className="w-full rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 text-xs text-on-surface outline-none focus:border-primary"
                    />
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-on-surface-variant">Gövde</span>
                    <textarea
                      rows={6}
                      value={newsletterFields.body}
                      onChange={(event) => updateNewsletterField('body', event.target.value)}
                      className="w-full resize-y rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 text-xs leading-relaxed text-on-surface outline-none focus:border-primary"
                    />
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-on-surface-variant">
                      Öne çıkanlar (her satır bir madde)
                    </span>
                    <textarea
                      rows={3}
                      value={newsletterFields.highlights}
                      onChange={(event) => updateNewsletterField('highlights', event.target.value)}
                      className="w-full resize-y rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 text-xs leading-relaxed text-on-surface outline-none focus:border-primary"
                    />
                  </label>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-on-surface-variant">
                        Buton yazısı
                      </span>
                      <input
                        value={newsletterFields.ctaLabel}
                        onChange={(event) => updateNewsletterField('ctaLabel', event.target.value)}
                        className="w-full rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 text-xs text-on-surface outline-none focus:border-primary"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-on-surface-variant">
                        Buton linki
                      </span>
                      <input
                        value={newsletterFields.ctaUrl}
                        onChange={(event) => updateNewsletterField('ctaUrl', event.target.value)}
                        className="w-full rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 text-xs text-on-surface outline-none focus:border-primary"
                      />
                    </label>
                  </div>

                  <label className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-on-surface-variant">Alt not</span>
                    <textarea
                      rows={2}
                      value={newsletterFields.footerNote}
                      onChange={(event) => updateNewsletterField('footerNote', event.target.value)}
                      className="w-full resize-y rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 text-xs leading-relaxed text-on-surface outline-none focus:border-primary"
                    />
                  </label>

                  <details className="rounded-lg border border-outline-variant/30 bg-surface-container-low/40">
                    <summary className="cursor-pointer px-3 py-2 text-[11px] font-semibold text-on-surface-variant">
                      E-posta önizlemesini aç
                    </summary>
                    <div className="p-2 pt-0">
                      <iframe
                        title="Bülten e-posta önizlemesi"
                        srcDoc={newsletterHtml}
                        sandbox=""
                        className="h-[320px] w-full rounded-md border border-outline-variant/30 bg-white"
                      />
                    </div>
                  </details>

                  {newsletterError && (
                    <div className="rounded-lg border border-error/30 bg-error-container px-3 py-2 text-[11px] text-on-error-container">
                      {newsletterError}
                    </div>
                  )}
                  {newsletterResult && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-800">
                      {newsletterResult}
                    </div>
                  )}

                  <button
                    onClick={handleSendNewsletter}
                    disabled={newsletterBusy || newsletterSelected.length === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    <span>
                      {newsletterBusy
                        ? 'Gönderiliyor…'
                        : `Seçilen ${newsletterSelected.length} kişiye gönder`}
                    </span>
                  </button>
                  <p className="text-[10px] leading-relaxed text-outline">
                    Mesajlar Resend üzerinden ayrı ayrı gönderilir. Tek seferde en fazla 25
                    alıcı seçilebilir; abonelikten çıkan kontaktlara gönderim yapılamaz.
                  </p>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Tab 3: Database & Export Hub */}
        {activeTab === 'database' && (
          <div className="p-6 overflow-y-auto grow flex flex-col gap-6">
            {/* Quick Export Cards */}
            <div>
              <h3 className="font-title-md text-sm font-bold text-on-surface mb-1">
                Veritabanı Yedekleme ve Dışa Aktarma (Export)
              </h3>
              <p className="text-xs text-outline mb-4">
                Siparişleri, e-posta listelerini ve yorumları Excel veya JSON olarak indirebilirsiniz. JSON dosyası uygulama verisi dışa aktarımıdır; Supabase auth kullanıcıları, şifreler ve şema dahil değildir.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={exportFullDatabaseJSON}
                  className="p-4 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-all text-left flex flex-col justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-primary font-bold text-xs mb-2">
                    <span className="material-symbols-outlined text-[20px]">file_download</span>
                    <span>Veri Dışa Aktarma (JSON)</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mb-3">
                    Siparişler, e-postalar, yorumlar, ürünler ve bu cihazdaki kullanıcı önbelleği.
                  </p>
                  <span className="text-xs font-semibold text-primary underline">
                    JSON Olarak İndir →
                  </span>
                </button>

                <button
                  onClick={exportOrdersCSV}
                  className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 hover:bg-secondary/15 transition-all text-left flex flex-col justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-secondary font-bold text-xs mb-2">
                    <span className="material-symbols-outlined text-[20px]">table_view</span>
                    <span>Siparişler (Excel CSV)</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mb-3">
                    Müşteri bilgileri, kargo adresleri, ürünler ve tutarlar (Türkçe Excel uyumlu).
                  </p>
                  <span className="text-xs font-semibold text-secondary underline">
                    CSV Olarak İndir →
                  </span>
                </button>

                <button
                  onClick={exportSubscribersCSV}
                  className="p-4 rounded-xl bg-tertiary/10 border border-tertiary/20 hover:bg-tertiary/15 transition-all text-left flex flex-col justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-tertiary font-bold text-xs mb-2">
                    <span className="material-symbols-outlined text-[20px]">contact_mail</span>
                    <span>E-Posta Listesi (Excel CSV)</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mb-3">
                    E-kitap indirenler ve bülten aboneleri listesi (Pazarlama/Toplu E-posta için).
                  </p>
                  <span className="text-xs font-semibold text-tertiary underline">
                    CSV Olarak İndir →
                  </span>
                </button>
              </div>
            </div>

            {/* Current Storage Architecture Details */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-title-sm text-xs font-bold text-on-surface">
                  Canlı Veri Durumu &amp; Kalıcı Saklama Modeli
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Aktif &amp; Kalıcı
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-surface border border-outline-variant/20">
                  <span className="text-outline text-[10px] block">Sipariş Kayıtları</span>
                  <strong className="text-base text-primary font-bold">{orders.length}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-surface border border-outline-variant/20">
                  <span className="text-outline text-[10px] block">Toplanan E-Postalar</span>
                  <strong className="text-base text-secondary font-bold">{subscribers.length}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-surface border border-outline-variant/20">
                  <span className="text-outline text-[10px] block">Bu Cihazdaki Üye Önbelleği</span>
                  <strong className="text-base text-tertiary font-bold">{storedUsers.length}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-surface border border-outline-variant/20">
                  <span className="text-outline text-[10px] block">Katalog Ürünleri</span>
                  <strong className="text-base text-on-surface font-bold">{PRODUCTS.length}</strong>
                </div>
              </div>

              <p className="text-[11px] text-outline leading-relaxed">
                <strong>Nasıl Saklanıyor?</strong> Siparişler, yorumlar ve bülten/e-kitap e-postaları <strong>Supabase</strong> veritabanında kalıcı olarak saklanır; bülten kayıtları ayrıca Resend audience'a eklenir. Paneldeki JSON/CSV dışa aktarma taşınabilir bir kopyadır; tam veritabanı yedeği değildir. Supabase auth kullanıcıları ve şifre hashleri bu dosyada yer almaz. Üyelere ait yerel oturum bilgileri tarayıcıda (<code className="bg-surface-container px-1 py-0.5 rounded text-[10px]">localStorage</code>) tutulur.
              </p>
            </div>

            {/* SQL Schema Definition */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-title-sm text-xs font-bold text-on-surface">
                    PostgreSQL / Supabase / MySQL Uyumlu SQL Şeması
                  </h5>
                  <p className="text-[11px] text-outline">
                    İleride harici bir veritabanına taşımak isterseniz kullanabileceğiniz hazır DDL şeması:
                  </p>
                </div>
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1 bg-surface-container hover:bg-surface-container-high rounded text-xs font-semibold text-on-surface transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copiedSql ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedSql ? 'Kopyalandı!' : 'SQL Kopyala'}</span>
                </button>
              </div>

              <pre className="p-3 bg-inverse-surface text-inverse-on-surface text-[11px] font-mono rounded-xl overflow-x-auto max-h-48 leading-relaxed">
                {sqlSchemaCode}
              </pre>
            </div>
          </div>
        )}

        {/* Tab: Security / MFA */}
        {activeTab === 'security' && (
          <div className="p-6 overflow-y-auto grow">
            <div className="max-w-2xl flex flex-col gap-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">verified_user</span>
                </div>
                <div>
                  <h3 className="font-title-md text-sm font-bold text-on-surface">
                    İki Adımlı Doğrulama (MFA)
                  </h3>
                  <p className="text-xs text-outline leading-relaxed">
                    Yönetici hesabına girişte şifreye ek olarak Google Authenticator, Authy veya
                    benzeri bir uygulamadan 6 haneli kod istenir. Bu, hesap şifresi çalınsa bile
                    panelin ele geçirilmesini engeller.
                  </p>
                </div>
              </div>

              {mfaError && (
                <div className="p-3 rounded-lg bg-red-100 text-error text-xs font-medium">
                  {mfaError}
                </div>
              )}
              {mfaSuccess && (
                <div className="p-3 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-medium">
                  {mfaSuccess}
                </div>
              )}

              {mfaLoading && !mfaEnrollData ? (
                <div className="p-6 rounded-xl bg-surface-container-low border border-outline-variant/30 text-center text-xs text-outline">
                  MFA durumu yükleniyor...
                </div>
              ) : mfaEnrollData ? (
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-4">
                  <ol className="text-xs text-on-surface-variant leading-relaxed list-decimal pl-4 flex flex-col gap-1">
                    <li>Telefonunuza Google Authenticator veya Authy uygulamasını kurun.</li>
                    <li>Aşağıdaki QR kodu uygulamadan okutun.</li>
                    <li>Uygulamanın gösterdiği 6 haneli kodu girip doğrulayın.</li>
                  </ol>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {mfaEnrollData.qrCode ? (
                      <img
                        src={mfaEnrollData.qrCode}
                        alt="MFA QR kodu"
                        className="w-44 h-44 bg-white p-2 rounded-lg border border-outline-variant/30"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-[64px] text-outline">
                        qr_code
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-outline mb-1">
                        QR okutamıyorsanız bu kodu elle girin:
                      </p>
                      <code className="block break-all text-xs font-mono bg-surface p-2 rounded border border-outline-variant/30">
                        {mfaEnrollData.secret}
                      </code>
                    </div>
                  </div>

                  <form onSubmit={verifyMfaEnrollment} className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      required
                      value={mfaCode}
                      onChange={(e) =>
                        setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                      }
                      placeholder="000000"
                      className="flex-1 px-3.5 py-2.5 text-center text-base font-bold tracking-[0.4em] rounded-lg bg-surface border border-outline-variant/40"
                    />
                    <button
                      type="submit"
                      disabled={mfaLoading || mfaCode.length !== 6}
                      className="px-4 py-2.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary-container transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {mfaLoading ? 'Doğrulanıyor...' : 'Doğrula ve Etkinleştir'}
                    </button>
                  </form>

                  <button
                    type="button"
                    onClick={cancelMfaEnrollment}
                    className="self-start text-xs text-outline hover:text-on-surface underline cursor-pointer"
                  >
                    Vazgeç
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-on-surface">MFA durumu</p>
                      <p className="text-[11px] text-outline">
                        {hasVerifiedMfa
                          ? 'Aktif — yönetici girişleri iki adımlı doğrulanıyor.'
                          : 'Henüz kurulmadı. Yönetici hesabını korumak için kurun.'}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                        hasVerifiedMfa
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {hasVerifiedMfa ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>

                  {mfaFactors.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      {mfaFactors.map((factor) => (
                        <div
                          key={factor.id}
                          className="flex items-center justify-between gap-3 p-2 rounded-lg bg-surface border border-outline-variant/20 text-[11px]"
                        >
                          <span className="font-medium text-on-surface">
                            {factor.friendlyName || 'Authenticator'}
                          </span>
                          <span className="text-outline">
                            {factor.status === 'verified' ? 'Doğrulandı' : 'Doğrulanmadı'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {!hasVerifiedMfa && (
                    <button
                      onClick={startMfaEnrollment}
                      disabled={mfaLoading}
                      className="self-start px-4 py-2.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary-container transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {mfaLoading ? 'Hazırlanıyor...' : 'MFA Kur'}
                    </button>
                  )}

                  {hasVerifiedMfa && (
                    <p className="text-[11px] text-outline leading-relaxed">
                      Yedek olarak authenticator uygulamanızın bulut yedeğini açık tutun. Telefon
                      erişiminizi kaybederseniz panel girişi için yeni bir cihazdan kod
                      üretmeniz gerekir.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-surface-container-low border-t border-surface-container-high flex justify-between items-center text-xs text-outline shrink-0">
          <span>Yönetici Bildirim Hattı: satis@tarhanaterapi.com</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary-container transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
