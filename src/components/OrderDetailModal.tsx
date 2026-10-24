import React, { useEffect } from 'react';
import { Order } from '../types';
import { OrderStatusTimeline } from './OrderStatusTimeline';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const formatMoney = (value: number) =>
  `₺${new Intl.NumberFormat('tr-TR').format(Number(value) || 0)}`;

const formatDate = (value: string) => {
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
    case 'Teslim Edildi':
      return 'bg-emerald-100 text-emerald-800';
    case 'İptal':
    case 'İptal Edildi':
      return 'bg-error-container text-on-error-container';
    default:
      return 'bg-surface-container text-on-surface-variant';
  }
};

const paymentLabel = (method: Order['paymentMethod']) => {
  switch (method) {
    case 'bank_transfer':
      return 'Havale / EFT';
    case 'cod':
      return 'Kapıda Ödeme';
    default:
      return 'Kredi Kartı';
  }
};

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Sipariş detayı ${order.orderNumber}`}
    >
      <div
        className="fixed inset-0 bg-inverse-surface/75 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="relative z-10 my-8 w-full max-w-xl overflow-hidden rounded-2xl border border-surface-container-high bg-surface shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-surface-container-high bg-surface-container-low p-4 sm:p-5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-outline">
              Sipariş Detayı
            </p>
            <h3 className="truncate text-lg font-bold text-on-surface sm:text-xl">
              {order.orderNumber}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface cursor-pointer"
            aria-label="Sipariş detayını kapat"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        <div className="flex max-h-[75vh] flex-col gap-5 overflow-y-auto p-4 sm:p-6">
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(
                  order.status
                )}`}
              >
                {order.status}
              </span>
              <span className="text-xs text-outline">{formatDate(order.createdAt)}</span>
            </div>
            <OrderStatusTimeline status={order.status} />
          </div>

          <div>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-on-surface">
              Sipariş İçeriği
            </h4>
            {items.length === 0 ? (
              <p className="rounded-lg border border-dashed border-outline-variant/40 p-3 text-[11px] italic text-outline">
                Sipariş içeriği görüntülenemiyor.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {items.map((item, index) => (
                  <div
                    key={`${order.id}-${index}`}
                    className="flex items-center gap-3 rounded-lg bg-surface-container-low p-2"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-10 w-10 shrink-0 rounded-md object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span
                        className="material-symbols-outlined shrink-0 text-[20px] text-primary"
                        aria-hidden="true"
                      >
                        inventory_2
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-on-surface">
                        {item.name}
                      </p>
                      {item.weight && (
                        <p className="text-[10px] text-outline">{item.weight}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="whitespace-nowrap text-[10px] text-outline">
                        {item.quantity} x {formatMoney(item.price)}
                      </p>
                      <p className="whitespace-nowrap text-xs font-bold text-on-surface">
                        {formatMoney(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 border-t border-outline-variant/20 pt-3 text-[11px] text-on-surface-variant">
              <span>Ara toplam</span>
              <span className="text-right">{formatMoney(order.subtotal)}</span>
              <span>Kargo</span>
              <span className="text-right">
                {order.shippingFee > 0 ? formatMoney(order.shippingFee) : 'Ücretsiz'}
              </span>
              {order.discount > 0 && (
                <>
                  <span>İndirim</span>
                  <span className="text-right">-{formatMoney(order.discount)}</span>
                </>
              )}
              <span className="font-bold text-on-surface">Toplam</span>
              <span className="text-right font-bold text-primary">
                {formatMoney(order.total)}
              </span>
            </div>
          )}

          <div>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-on-surface">
              Teslimat Bilgileri
            </h4>
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 text-xs leading-relaxed text-on-surface-variant">
              <p className="font-semibold text-on-surface">{order.customerName}</p>
              <p>{order.customerAddress}</p>
              <p>
                {order.customerDistrict} / {order.customerCity}
              </p>
              <p className="mt-1 text-[11px] text-outline">{order.customerPhone}</p>
              {order.deliveryNote && (
                <p className="mt-2 border-t border-outline-variant/20 pt-2 text-[11px] text-outline">
                  <span className="font-semibold text-on-surface-variant">Not:</span>{' '}
                  {order.deliveryNote}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 py-2 text-[11px]">
            <span className="text-outline">Ödeme yöntemi</span>
            <span className="font-semibold text-on-surface">
              {paymentLabel(order.paymentMethod)}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-primary-container px-5 py-2.5 text-xs font-semibold text-on-primary-container transition-colors hover:bg-primary hover:text-on-primary cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
