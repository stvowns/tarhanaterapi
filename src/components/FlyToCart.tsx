import React from 'react';
import { createPortal } from 'react-dom';

export interface Flyer {
  id: number;
  image: string;
  start: { left: number; top: number; width: number; height: number };
  dx: number;
  dy: number;
}

let flyerId = 0;

/**
 * Ürün kartındaki görselden üstteki sepet / sipariş butonuna uçan küçük çuval
 * animasyonu için başlangıç ve hedef koordinatlarını hesaplar.
 */
export function makeFlyer(image: string, source: HTMLElement | null): Flyer {
  const rect = source?.getBoundingClientRect();
  const width = Math.min(rect?.width || 96, 140);
  const height = Math.min(rect?.height || 96, 140);
  const left = rect ? rect.left + rect.width / 2 - width / 2 : window.innerWidth / 2;
  const top = rect ? rect.top + rect.height / 2 - height / 2 : window.innerHeight / 2;

  const cartButton =
    document.getElementById('header-cart-button') ||
    document.querySelector<HTMLElement>('[data-fly-target="cart"]');
  const cartRect = cartButton?.getBoundingClientRect();
  const targetX = cartRect ? cartRect.left + cartRect.width / 2 : window.innerWidth - 64;
  const targetY = cartRect ? cartRect.top + cartRect.height / 2 : 58;

  return {
    id: ++flyerId,
    image,
    start: { left, top, width, height },
    dx: targetX - (left + width / 2),
    dy: targetY - (top + height / 2),
  };
}

export const FlyToCartLayer: React.FC<{ flyers: Flyer[] }> = ({ flyers }) => {
  if (flyers.length === 0 || typeof document === 'undefined') return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden" aria-hidden="true">
      <style>{`
        @keyframes tt-fly-to-cart {
          0% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); opacity: 1; }
          55% { transform: translate3d(calc(var(--dx) * 0.7), calc(var(--dy) * 0.35 - 40px), 0) scale(0.62) rotate(-10deg); opacity: 1; }
          100% { transform: translate3d(var(--dx), var(--dy), 0) scale(0.12) rotate(-16deg); opacity: 0; }
        }
      `}</style>
      {flyers.map((flyer) => (
        <img
          key={flyer.id}
          src={flyer.image}
          alt=""
          className="absolute rounded-xl object-cover shadow-2xl"
          style={
            {
              left: flyer.start.left,
              top: flyer.start.top,
              width: flyer.start.width,
              height: flyer.start.height,
              '--dx': `${flyer.dx}px`,
              '--dy': `${flyer.dy}px`,
              animation: 'tt-fly-to-cart 850ms cubic-bezier(0.22, 0.7, 0.3, 1) forwards',
              willChange: 'transform, opacity',
            } as React.CSSProperties
          }
        />
      ))}
    </div>,
    document.body
  );
};
