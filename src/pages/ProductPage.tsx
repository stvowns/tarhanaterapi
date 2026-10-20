import React, { useRef, useState } from 'react';
import { PRODUCTS } from '../data/mockData';
import { CONTENT_UPDATED_LABEL, productPath } from '../lib/site';
import { Product } from '../types';
import { FlyToCartLayer, makeFlyer, type Flyer } from '../components/FlyToCart';

interface ProductPageProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const productFaqs = [
  {
    q: 'Kargo kaç günde gelir?',
    a: 'Siparişler aynı veya ertesi iş günü kargoya verilir. Türkiye geneli teslimat 1-3 iş günüdür; 2000 TL üzeri siparişlerde kargo ücretsizdir; 2000 TL altı siparişlerde 150 TL\'dir.',
  },
  {
    q: 'Ürün nasıl saklanır, ne kadar dayanır?',
    a: 'Güneş görmeyen serin ve kuru bir yerde, pamuk torbasını kapalı tutarak 1 yıla kadar saklayabilirsiniz. Açtıktan sonra buzdolabında muhafaza edilmesi önerilir.',
  },
  {
    q: 'İçinde katkı maddesi var mı?',
    a: 'Koruyucu, renklendirici ve aroma verici kullanılmaz. Ürün; buğday unu, yoğurt, nohut, domates, biber, tuz ve baharatlardan oluşur. Buğday içerdiği için glutensiz değildir.',
  },
];

export const ProductPage: React.FC<ProductPageProps> = ({ product, onAddToCart }) => {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const related = PRODUCTS.filter((item) => item.id !== product.id).slice(0, 3);
  const nutrition = [
    { label: 'Kalori', value: `${product.nutrition.calories} kcal` },
    { label: 'Protein', value: product.nutrition.protein },
    { label: 'Lif', value: product.nutrition.fiber },
    { label: 'Karbonhidrat', value: product.nutrition.carbs },
    { label: 'Yağ', value: product.nutrition.fat },
  ];

  const handleAddToCart = (event: React.MouseEvent<HTMLButtonElement>) => {
    const imageRect = imageRef.current?.getBoundingClientRect();
    const imageIsVisible = imageRect
      ? imageRect.bottom > 48 && imageRect.top < window.innerHeight - 48
      : false;
    // Görsel ekran dışına kaydıysa animasyonu görünen butondan başlat.
    const source = imageIsVisible ? imageRef.current : event.currentTarget;
    const flyer = makeFlyer(product.image, source);
    setFlyers((previous) => [...previous, flyer]);
    window.setTimeout(() => {
      setFlyers((previous) => previous.filter((item) => item.id !== flyer.id));
    }, 900);
    onAddToCart(product);
  };

  return (
    <div className="py-10 bg-surface min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12">
        <nav aria-label="Breadcrumb" className="text-xs text-on-surface-variant mb-6 flex flex-wrap items-center gap-1.5">
          <a href="/" className="hover:text-primary">Ana Sayfa</a>
          <span aria-hidden="true">/</span>
          <a href="/urunler" className="hover:text-primary">Ürünler</a>
          <span aria-hidden="true">/</span>
          <span className="text-on-surface font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="rounded-2xl overflow-hidden bg-surface-container-low border border-outline-variant/30">
            <img
              ref={imageRef}
              src={product.image}
              alt={`${product.name} — ${product.weight}`}
              width={512}
              height={279}
              className="w-full h-auto object-cover"
            />
          </div>

          <div className="flex flex-col gap-4">
            {product.tag && (
              <span className="self-start text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed">
                {product.tag}
              </span>
            )}
            <h1 className="font-headline-lg text-on-surface text-3xl sm:text-4xl leading-tight">
              {product.name}
            </h1>
            <p className="font-body-md text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">{product.name}</strong>, TarhanaTerapi'nin
              Orhangazi'deki aile atölyesinde ürettiği {product.weight.toLowerCase()} üründür.{' '}
              {product.description}
            </p>

            <div className="flex items-end gap-3 pt-1">
              <span className="font-headline-md text-primary font-bold text-3xl">
                {product.price} TL
              </span>
              {product.originalPrice && (
                <span className="text-sm text-outline line-through pb-1">
                  {product.originalPrice} TL
                </span>
              )}
              <span className="text-xs text-on-surface-variant pb-1">{product.weight}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-secondary text-[18px]">star</span>
              <span>
                {product.rating} / 5 · {product.reviewsCount} değerlendirme
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              className="mt-2 inline-flex items-center justify-center gap-2 bg-primary-container text-on-primary-container font-title-md px-7 py-3.5 rounded-lg hover:bg-primary transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
              Sepete Ekle
            </button>

            <ul className="text-xs text-on-surface-variant flex flex-col gap-1.5 pt-3 border-t border-outline-variant/30">
              <li>✓ 2000 TL üzeri siparişlerde kargo ücretsiz</li>
              <li>✓ Türkiye geneli 1-3 iş gününde teslimat</li>
              <li>✓ Pamuk torbada, hava yastıklı koruyucu paketleme</li>
              <li>✓ Koruyucu, renklendirici ve aroma verici içermez</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          <section className="lg:col-span-2 flex flex-col gap-8">
            <div>
              <h2 className="font-headline-sm text-2xl text-on-surface mb-3">Ürün detayı</h2>
              <p className="font-body-md text-on-surface-variant leading-relaxed">
                {product.details}
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-2xl text-on-surface mb-3">İçindekiler</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.ingredients.map((ingredient) => (
                  <li
                    key={ingredient}
                    className="text-sm text-on-surface-variant bg-surface-container-low rounded-lg px-3 py-2 border border-outline-variant/20"
                  >
                    {ingredient}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-outline mt-3">
                Alerjen bilgisi: buğday (gluten), süt (yoğurt) ve nohut içerir. Glutensiz değildir.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-2xl text-on-surface mb-3">
                100 g başına besin değerleri
              </h2>
              <table className="w-full text-sm border border-outline-variant/30 rounded-lg overflow-hidden">
                <tbody>
                  {nutrition.map((row) => (
                    <tr key={row.label} className="border-b border-outline-variant/20 last:border-0">
                      <th className="text-left font-medium text-on-surface-variant px-4 py-2.5 bg-surface-container-low w-1/2">
                        {row.label}
                      </th>
                      <td className="px-4 py-2.5 text-on-surface">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h2 className="font-headline-sm text-2xl text-on-surface mb-3">
                Kargo, saklama ve iade
              </h2>
              <p className="font-body-md text-on-surface-variant leading-relaxed">
                Siparişler aynı veya ertesi iş günü kargoya verilir; Türkiye geneli teslimat
                1-3 iş günüdür. 2000 TL ve üzeri siparişlerde kargo ücretsizdir; 2000 TL altı siparişlerde 150 TL'dir. Ürün, kapalı
                pamuk torbasında güneş görmeyen serin ve kuru bir yerde 1 yıla kadar saklanır.
                Açılmış ürünlerde mesafeli satış mevzuatı gereği cayma hakkı uygulanmaz;
                hasarlı teslimat için satis@tarhanaterapi.com adresine yazabilirsiniz.
              </p>
            </div>
          </section>

          <aside className="flex flex-col gap-5">
            <div className="rounded-xl bg-surface-container-low p-5 border border-outline-variant/30">
              <h2 className="font-title-md text-base font-semibold text-on-surface mb-2">
                Sipariş ve destek
              </h2>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Telefon / WhatsApp: <a className="text-primary" href="tel:+908503028274">0850 302 82 74</a>
                <br />
                E-posta:{' '}
                <a className="text-primary" href="mailto:satis@tarhanaterapi.com">
                  satis@tarhanaterapi.com
                </a>
                <br />
                Üretim: Gedelek Köyü Mevkii No: 28, Orhangazi / Bursa
              </p>
            </div>

            <div className="rounded-xl bg-surface-container-low p-5 border border-outline-variant/30">
              <h2 className="font-title-md text-base font-semibold text-on-surface mb-3">
                Diğer tarhana çeşitleri
              </h2>
              <ul className="flex flex-col gap-2">
                {related.map((item) => (
                  <li key={item.id}>
                    <a
                      href={productPath(item)}
                      className="text-sm text-on-surface-variant hover:text-primary flex items-center justify-between gap-2"
                    >
                      <span>{item.name}</span>
                      <span className="text-primary font-semibold whitespace-nowrap">{item.price} TL</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-[11px] text-outline leading-relaxed">
              Son güncelleme: {CONTENT_UPDATED_LABEL}. Fiyat ve içerik bilgisi bu tarihte
              doğrulanmıştır.
            </p>
          </aside>
        </div>

        <section className="mt-14">
          <h2 className="font-headline-sm text-2xl text-on-surface mb-4">
            {product.name} hakkında sık sorulan sorular
          </h2>
          <div className="flex flex-col gap-3">
            {productFaqs.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl bg-surface-container-low border border-outline-variant/30 px-5 py-4"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                  <h3 className="font-title-md text-sm sm:text-base font-semibold text-on-surface">
                    {item.q}
                  </h3>
                  <span className="material-symbols-outlined text-primary text-[22px] shrink-0 transition-transform group-open:rotate-45">
                    add
                  </span>
                </summary>
                <p className="text-sm text-on-surface-variant leading-relaxed mt-3">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
      <FlyToCartLayer flyers={flyers} />
    </div>
  );
};
