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

  const userOrders = orders
    .filter((o) => o.customerEmail.toLowerCase() === user.email.toLowerCase())
    .sort((a, b) => {
      const aNo = Number(a.orderNumber.replace(/\D/g, '')) || 0;
      const bNo = Number(b.orderNumber.replace(/\D/g, '')) || 0;
      return bNo - aNo;
    });
  const completedStatuses = ['Tamamlandı', 'Teslim Edildi', 'İptal Edildi', 'İptal'];
  const activeOrders = userOrders.filter((order) => !completedStatuses.includes(order.status));
  const lastOrder = userOrders[0];

  const formatOrderDate = (value: string) => {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    const parts = /^(\d{2})\.(\d{2})\.(\d{4})/.exec(value);
    return parts ? `${parts[1]}.${parts[2]}.${parts[3]}` : value;
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
                    {lastOrder.status} · {formatOrderDate(lastOrder.createdAt)}
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
                {userOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col gap-2"
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

                    <div className="pt-2 border-t border-outline-variant/20 flex flex-wrap gap-2 text-[11px] text-on-surface-variant">
                      {ord.items.map((it, idx) => (
                        <span key={idx} className="bg-surface-container px-2 py-0.5 rounded">
                          {it.quantity}x {it.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
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
