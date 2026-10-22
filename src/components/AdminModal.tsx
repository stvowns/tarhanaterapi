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
    'orders' | 'reviews' | 'subscribers' | 'newsletter' | 'database'
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

  const isAuthorized = Boolean(
    currentUser?.isAdmin || currentUser?.email === 'layeredstudio78@gmail.com'
  );

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

  // Export Complete Database JSON
  const exportFullDatabaseJSON = () => {
    const fullDatabase = {
      exportMetadata: {
        appName: 'TarhanaTerapi E-Ticaret',
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        counts: {
          orders: orders.length,
          subscribers: subscribers.length,
          registeredUsers: storedUsers.length,
          products: PRODUCTS.length,
        },
        storageKeys: ['tt_orders', 'tt_subscribers', 'tt_users', 'tt_current_user'],
      },
      tables: {
        orders: orders,
        subscribers: subscribers,
        users: storedUsers,
        products: PRODUCTS,
      },
    };

    const jsonString = JSON.stringify(fullDatabase, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tarhanaterapi_tam_veritabani_${Date.now()}.json`;
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
                <h4 className="font-title-md text-sm font-bold text-on-surface">
                  Yorum Yönetimi
                </h4>
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
                <h4 className="font-title-md text-sm font-bold text-on-surface">
                  E-Kitap ve Bülten Üzerinden Toplanan E-Postalar
                </h4>
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
                <h4 className="font-title-md text-sm font-bold text-on-surface">
                  Şifa Bülteni Gönderimi
                </h4>
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
              <h4 className="font-title-md text-sm font-bold text-on-surface mb-1">
                Veritabanı Yedekleme ve Dışa Aktarma (Export)
              </h4>
              <p className="text-xs text-outline mb-4">
                Tüm siparişleri, e-posta listelerini ve müşteri verilerini tek tıkla Excel veya JSON formatında bilgisayarınıza indirebilirsiniz.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={exportFullDatabaseJSON}
                  className="p-4 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-all text-left flex flex-col justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-primary font-bold text-xs mb-2">
                    <span className="material-symbols-outlined text-[20px]">file_download</span>
                    <span>Tam Veritabanı Yedeği</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mb-3">
                    Siparişler, e-postalar, kullanıcılar ve ürünleri içeren tek bir .json dosyası.
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
                  <span className="text-outline text-[10px] block">Kayıtlı Üyeler</span>
                  <strong className="text-base text-tertiary font-bold">{storedUsers.length}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-surface border border-outline-variant/20">
                  <span className="text-outline text-[10px] block">Katalog Ürünleri</span>
                  <strong className="text-base text-on-surface font-bold">{PRODUCTS.length}</strong>
                </div>
              </div>

              <p className="text-[11px] text-outline leading-relaxed">
                <strong>Nasıl Saklanıyor?</strong> Siparişler ve bülten/e-kitap e-postaları <strong>Supabase</strong> veritabanında kalıcı olarak saklanır; bülten kayıtları ayrıca Resend audience'a eklenir. Yönetici panelindeki CSV dışa aktarma ile Excel'e alabilirsiniz. Üyelere ait yerel oturum bilgileri tarayıcıda (<code className="bg-surface-container px-1 py-0.5 rounded text-[10px]">localStorage</code>) tutulur.
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
