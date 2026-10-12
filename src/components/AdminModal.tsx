import React, { useState } from 'react';
import { Order, SubscriberLead, User } from '../types';
import { PRODUCTS } from '../data/mockData';

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
  const [activeTab, setActiveTab] = useState<'orders' | 'subscribers' | 'database'>('orders');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

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

  const isAuthorized =
    Boolean(
      currentUser?.isAdmin ||
        currentUser?.email === 'layeredstudio78@gmail.com' ||
        currentUser?.email === 'admin@tarhanaterapi.com'
    );

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput.trim() === '1954' || adminPasswordInput.trim().toLowerCase() === 'admin') {
      setIsUnlocked(true);
      setAuthError('');
    } else {
      setAuthError('Geçersiz yönetici şifresi. Lütfen tekrar deneyin.');
    }
  };

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
        const payment = o.paymentMethod === 'credit_card' ? 'Kredi Karti' : 'Kapida Odeme';
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
                Canlı Sipariş Takibi, E-Posta Listesi &amp; Veritabanı Yönetimi
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
              className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
              <span>Gelen Siparişler ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('subscribers')}
              className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'subscribers'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">mail</span>
              <span>E-Posta Listesi ({subscribers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('database')}
              className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'database'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">database</span>
              <span>Veritabanı &amp; Dışa Aktarma</span>
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
                          {order.paymentMethod === 'credit_card' ? 'Kredi Kartı' : 'Kapıda Ödeme'}
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
                <strong>Nasıl Saklanıyor?</strong> Veriler tarayıcı seviyesinde kalıcı <code className="bg-surface-container px-1 py-0.5 rounded text-[10px]">localStorage</code> anahtarları (<code className="bg-surface-container px-1 py-0.5 rounded text-[10px]">tt_orders</code>, <code className="bg-surface-container px-1 py-0.5 rounded text-[10px]">tt_subscribers</code>, <code className="bg-surface-container px-1 py-0.5 rounded text-[10px]">tt_users</code>) üzerinde saklanır. Sayfa yenilense de silinmez. Dilediğiniz zaman yukarıdaki butonlarla export edip harici SQL veya Excel ortamına aktarabilirsiniz.
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
          <span>Yönetici Bildirim Hattı: admin@tarhanaterapi.com</span>
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
