import React from 'react';
import { User, Order } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  orders: Order[];
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  orders,
  onLogout,
}) => {
  if (!isOpen || !user) return null;

  const orderTime = (value: string) => {
    const iso = Date.parse(value);
    if (!Number.isNaN(iso)) return iso;
    const parts = /^(\d{2})\.(\d{2})\.(\d{4})(?:[ ,]+(\d{2}):(\d{2}))?/.exec(value);
    if (!parts) return 0;
    return new Date(
      Number(parts[3]),
      Number(parts[2]) - 1,
      Number(parts[1]),
      Number(parts[4] || 0),
      Number(parts[5] || 0)
    ).getTime();
  };

  const userOrders = orders
    .filter((o) => o.customerEmail.toLowerCase() === user.email.toLowerCase())
    .sort((a, b) => orderTime(b.createdAt) - orderTime(a.createdAt));
  const completedStatuses = ['Tamamlandı', 'Teslim Edildi', 'İptal Edildi', 'İptal'];
  const activeOrders = userOrders.filter((order) => !completedStatuses.includes(order.status));
  const lastOrder = userOrders[0];

  const formatOrderDate = (value: string) => {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      const day = date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const time = date.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${day} ${time}`;
    }
    const parts = /^(\d{2})\.(\d{2})\.(\d{4})(?:[ ,]+(\d{2}):(\d{2}))?/.exec(value);
    if (!parts) return value;
    return `${parts[1]}.${parts[2]}.${parts[3]}${parts[4] ? ` ${parts[4]}:${parts[5]}` : ''}`;
  };

  const statusClass = (status: string) => {
    switch (status) {
      case 'Yeni Sipariş':
        return 'bg-amber-100 text-amber-800';
      case 'Hazırlanıyor':
        return 'bg-blue-100 text-blue-800';
      case 'Kargoya Verildi':
        return 'bg-indigo-100 text-indigo-800';
      case 'Tamamlandı':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-surface-container text-on-surface-variant';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-inverse-surface/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-surface rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden my-8 z-10">
        {/* Header */}
        <div className="bg-surface-container-low p-4 sm:p-6 border-b border-surface-container-high flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-full bg-primary text-on-primary font-bold text-lg flex items-center justify-center shadow-xs shrink-0">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-headline-sm text-on-surface text-lg sm:text-xl font-bold truncate">
                {user.fullName}
              </h3>
              <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto flex flex-col gap-6">
          {/* Loyalty & Status Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
              <span className="text-[11px] text-outline font-semibold uppercase block">
                Şifa Puanı
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-headline-sm text-2xl text-primary font-bold">
                  {user.points}
                </span>
                <span className="text-xs text-outline">Puan</span>
              </div>
              <span className="text-[10px] text-emerald-700 mt-1 block">
                Her siparişte +25 puan
              </span>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
              <span className="text-[11px] text-outline font-semibold uppercase block">
                Son Sipariş
              </span>
              {lastOrder ? (
                <>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-headline-sm text-lg text-secondary font-bold">
                      {lastOrder.orderNumber}
                    </span>
                  </div>
                  <span className="text-[10px] text-outline mt-1 block truncate">
                    {lastOrder.status}
                  </span>
                </>
              ) : (
                <>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-headline-sm text-lg text-outline font-bold">—</span>
                  </div>
                  <span className="text-[10px] text-outline mt-1 block">
                    Henüz siparişiniz yok
                  </span>
                </>
              )}
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-outline font-semibold uppercase block">
                Aktif Teslimat
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-headline-sm text-2xl text-secondary font-bold">
                  {activeOrders.length}
                </span>
                <span className="text-xs text-outline">sipariş</span>
              </div>
              <span className="text-[10px] text-outline mt-1 block truncate">
                {activeOrders.length > 0 ? activeOrders[0].status : 'Şu an aktif sipariş yok'}
              </span>
            </div>
          </div>

          {/* Saved Address Info */}
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">
                location_on
              </span>
              Kayıtlı Teslimat Adresi
            </h4>
            <p className="text-xs text-on-surface leading-relaxed">
              {user.address ? (
                <>
                  {user.address} <br />
                  {user.district} / {user.city}
                </>
              ) : (
                <span className="text-outline italic">
                  Henüz kayıtlı bir adresiniz yok. Sipariş verirken otomatik kaydedilecektir.
                </span>
              )}
            </p>
          </div>

          {/* Orders History */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">
                receipt_long
              </span>
              Geçmiş Siparişlerim
              {userOrders.length > 0 && (
                <span className="ml-1 text-[10px] font-semibold text-outline">
                  ({userOrders.length})
                </span>
              )}
            </h4>

            {userOrders.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-outline-variant/40 rounded-xl">
                <p className="text-xs text-outline">Henüz bir siparişiniz bulunmamaktadır.</p>
                <p className="text-[10px] text-outline mt-1">
                  İlk siparişinizde +25 Şifa Puanı kazanırsınız.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {userOrders.map((ord) => {
                  const items = Array.isArray(ord.items) ? ord.items : [];
                  return (
                    <div
                      key={ord.id}
                      className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-center gap-2 text-xs">
                        <span className="font-bold text-on-surface">{ord.orderNumber}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${statusClass(
                            ord.status
                          )}`}
                        >
                          {ord.status}
                        </span>
                      </div>

                      <div className="text-xs text-outline flex items-center justify-between gap-2">
                        <span>{formatOrderDate(ord.createdAt)}</span>
                        <span className="font-bold text-primary text-sm whitespace-nowrap">
                          ₺{ord.total}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        {items.length === 0 ? (
                          <p className="text-[11px] text-outline italic">
                            Sipariş içeriği görüntülenemiyor.
                          </p>
                        ) : (
                          items.map((it, idx) => (
                            <div
                              key={`${ord.id}-${idx}`}
                              className="flex items-center gap-3 rounded-lg bg-surface-container-low p-2"
                            >
                              {it.image ? (
                                <img
                                  src={it.image}
                                  alt={it.name}
                                  className="w-10 h-10 rounded-md object-cover shrink-0"
                                  loading="lazy"
                                />
                              ) : (
                                <span className="material-symbols-outlined text-[20px] text-primary shrink-0">
                                  inventory_2
                                </span>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-on-surface truncate">
                                  {it.name}
                                </p>
                                {it.weight && (
                                  <p className="text-[10px] text-outline">{it.weight}</p>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-[10px] text-outline whitespace-nowrap">
                                  {it.quantity} x ₺{it.price}
                                </p>
                                <p className="text-xs font-bold text-on-surface whitespace-nowrap">
                                  ₺{it.price * it.quantity}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {items.length > 0 && (
                        <div className="pt-2 border-t border-outline-variant/20 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-on-surface-variant">
                          <span>Ara toplam</span>
                          <span className="text-right">₺{ord.subtotal}</span>
                          <span>Kargo</span>
                          <span className="text-right">
                            {ord.shippingFee > 0 ? `₺${ord.shippingFee}` : 'Ücretsiz'}
                          </span>
                          {ord.discount > 0 && (
                            <>
                              <span>İndirim</span>
                              <span className="text-right">-₺{ord.discount}</span>
                            </>
                          )}
                          <span className="font-bold text-on-surface">Toplam</span>
                          <span className="text-right font-bold text-primary">₺{ord.total}</span>
                        </div>
                      )}

                      {ord.deliveryNote && (
                        <p className="text-[11px] text-outline">
                          <span className="font-semibold text-on-surface-variant">Not:</span>{' '}
                          {ord.deliveryNote}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-container-low border-t border-surface-container-high flex justify-between items-center">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="text-xs text-error font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Çıkış Yap</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-primary-container text-on-primary-container text-xs font-semibold rounded-lg hover:bg-primary transition-colors cursor-pointer"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};
