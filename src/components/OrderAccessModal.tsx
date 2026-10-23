import React from 'react';
import { Order } from '../types';

interface OrderAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  loading: boolean;
  error: string;
}

const formatMoney = (value: number) =>
  `${new Intl.NumberFormat('tr-TR').format(Number(value) || 0)} TL`;

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Istanbul',
  }).format(date);
};

const statusClass = (status: Order['status']) => {
  switch (status) {
    case 'Kargoya Verildi':
      return 'bg-blue-100 text-blue-800';
    case 'Tamamlandı':
      return 'bg-emerald-100 text-emerald-800';
    case 'Hazırlanıyor':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-surface-container-high text-on-surface';
  }
};

export const OrderAccessModal: React.FC<OrderAccessModalProps> = ({
  isOpen,
  onClose,
  order,
  loading,
  error,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-inverse-surface/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-surface rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden my-8 z-10">
        <div className="bg-surface-container-low p-5 border-b border-surface-container-high flex items-center justify-between">
          <div>
            <h3 className="font-headline-sm text-on-surface text-xl font-bold">
              Sipariş Detayı
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Bu bağlantı yalnızca tek bir siparişi gösterir.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {loading && (
            <p className="text-sm text-on-surface-variant text-center py-8">
              Sipariş bilgileri yükleniyor...
            </p>
          )}

          {!loading && error && (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-[40px] text-outline">
                link_off
              </span>
              <p className="text-sm text-on-surface mt-2">{error}</p>
              <p className="text-xs text-on-surface-variant mt-1">
                Bağlantı eksik, süresi dolmuş veya sipariş bulunamadı.
              </p>
            </div>
          )}

          {!loading && !error && order && (
            <div className="space-y-5">
              <div className="rounded-xl bg-surface-container-low border border-outline-variant/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-outline">
                      Sipariş No
                    </p>
                    <p className="font-title-md text-on-surface font-bold">
                      {order.orderNumber}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${statusClass(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-2">
                  {formatDate(order.createdAt)}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                  Ürünler
                </h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div
                      key={`${item.productId}-${index}`}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <div>
                        <p className="text-on-surface font-semibold">{item.name}</p>
                        <p className="text-xs text-on-surface-variant">
                          {item.weight ? `${item.weight} · ` : ''}
                          {item.quantity} adet
                        </p>
                      </div>
                      <p className="text-on-surface whitespace-nowrap">
                        {formatMoney(Number(item.price) * Number(item.quantity))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-outline-variant/30 pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Ara toplam</span>
                  <span>{formatMoney(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Kargo</span>
                  <span>
                    {order.shippingFee > 0 ? formatMoney(order.shippingFee) : 'Ücretsiz'}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-on-surface-variant">
                    <span>İndirim</span>
                    <span>-{formatMoney(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-on-surface font-bold pt-1">
                  <span>Toplam</span>
                  <span>{formatMoney(order.total)}</span>
                </div>
              </div>

              <div className="rounded-xl bg-surface-container-low p-4 text-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                  Teslimat
                </h4>
                <p className="text-on-surface font-semibold">{order.customerName}</p>
                <p className="text-on-surface-variant text-xs mt-1 leading-relaxed">
                  {order.customerPhone}
                  <br />
                  {order.customerAddress}
                  <br />
                  {order.customerDistrict} / {order.customerCity}
                </p>
                {order.deliveryNote && (
                  <p className="text-xs text-on-surface-variant mt-2">
                    <strong>Not:</strong> {order.deliveryNote}
                  </p>
                )}
              </div>

              <p className="text-[11px] text-outline leading-relaxed">
                Bu sayfa yalnızca e-posta ile gönderilen özel bağlantı üzerinden açılır.
                Bağlantıyı başkalarıyla paylaşmayın.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
