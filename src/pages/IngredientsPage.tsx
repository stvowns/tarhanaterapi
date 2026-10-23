import React, { useState } from 'react';
import { INGREDIENTS, ASSETS } from '../data/mockData';

interface IngredientsPageProps {
  onGoToShop: () => void;
}

export const IngredientsPage: React.FC<IngredientsPageProps> = ({ onGoToShop }) => {
  const [activeIngredientTab, setActiveIngredientTab] = useState<number>(1);
  const selected = INGREDIENTS.find((i) => i.id === activeIngredientTab) || INGREDIENTS[0];

  const productionSteps = [
    {
      step: '1',
      title: 'Malzemeler Hazırlanır',
      desc: 'Taş değirmen buğday unu, köy yoğurdu, tarla domatesi, közlenmiş kapya biber, az miktarda nohut unu ve baharatlar ölçülü şekilde bir araya getirilir.',
      badge: 'bg-primary-fixed text-primary',
    },
    {
      step: '2',
      title: 'Hamur Yoğrulur',
      desc: 'Malzemeler hamur kıvamına gelene kadar yoğrulur. Hamur, kurutma için ince ve eşit kalınlıkta açılır.',
      badge: 'bg-secondary-fixed text-secondary',
    },
    {
      step: '3',
      title: 'Güneşte Kurutulur',
      desc: 'İnce açılan hamur, temiz hava akımı olan bir ortamda güneşte kurutulur. Kuruyan tarhana elenir ve pamuk torbaya doldurulur.',
      badge: 'bg-tertiary-fixed text-tertiary',
    },
  ];

  return (
    <div className="py-12 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-label-lg uppercase tracking-wider text-secondary font-bold">
            Şeffaf İçerik
          </span>
          <h1 className="font-headline-lg text-on-surface mt-2 text-3xl sm:text-4xl">
            İçindekiler &amp; Üretim Adımları
          </h1>
          <p className="font-body-lg text-on-surface-variant mt-2 leading-relaxed">
            Anadolu'nun bereketli topraklarından gelen saf malzemeler, özenli hazırlık ve
            güneşte kurutma ile birleşiyor.
          </p>
        </div>

        {/* Hero Feature Flatlay with Narrative */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-20 bg-surface-container-low rounded-3xl p-6 sm:p-10 border border-outline-variant/30">
          <div className="lg:col-span-6 rounded-2xl overflow-hidden shadow-md aspect-[16/11]">
            <img
              src={ASSETS.flatlayIngredients}
              alt="Tarhana doğal malzemeleri flatlay"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-6 flex flex-col gap-4">
            <span className="font-label-lg uppercase text-primary font-bold">
              Tarhananın Dokusu
            </span>
            <h2 className="font-headline-md text-2xl sm:text-3xl text-on-surface">
              Az Miktarda Nohut Unu, Doğal Kıvam
            </h2>
            <p className="font-body-md text-on-surface-variant leading-relaxed">
              Tarhana; un, yoğurt, domates, biber ve baharatın dengeli karışımıyla hazırlanır.
              Hamura az miktarda nohut unu eklenmesi hafif bir tokluk ve kıvam katar. Paket
              içinde ayrıca nohut gönderilmez.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="p-3 bg-surface rounded-xl border border-outline-variant/20">
                <strong className="text-primary text-sm block font-bold">Kısa İçerik Listesi</strong>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Tanıdık malzemeler; koruyucu, renklendirici ve aroma verici yok.
                </p>
              </div>
              <div className="p-3 bg-surface rounded-xl border border-outline-variant/20">
                <strong className="text-secondary text-sm block font-bold">Güneşte Kurutma</strong>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Hamur ince açılır, temiz hava akımında kurutulur ve elenir.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Production Steps */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="font-label-lg uppercase text-primary font-bold">
              Mutfaktan Pakete
            </span>
            <h2 className="font-headline-lg text-2xl sm:text-3xl text-on-surface mt-1">
              Üretim Adımlarımız
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {productionSteps.map((item) => (
              <div
                key={item.step}
                className="p-6 bg-surface-container-lowest rounded-2xl shadow-xs border border-outline-variant/30 flex flex-col justify-between"
              >
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${item.badge}`}>
                    Adım {item.step}
                  </span>
                  <h3 className="font-title-lg text-on-surface mb-2 font-bold">{item.title}</h3>
                  <p className="font-body-sm text-on-surface-variant leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-outline-variant/20 text-xs text-outline flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">
                    check_circle
                  </span>
                  <span>Katkısız üretim</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Natural Ingredients Selector */}
        <div className="bg-surface-container-low p-6 sm:p-10 rounded-3xl border border-outline-variant/30 mb-16">
          <div className="max-w-2xl mb-8">
            <span className="font-label-lg uppercase text-secondary font-bold">
              Ata Mirası İçerik
            </span>
            <h2 className="font-headline-lg text-2xl sm:text-3xl text-on-surface mt-1">
              Topraktan Gelen {INGREDIENTS.length} Doğal Bileşen
            </h2>
            <p className="font-body-md text-on-surface-variant mt-1 text-sm">
              Malzemelerin üzerine tıklayarak nereden temin edildiğini ve ürüne katkısını inceleyebilirsiniz.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Buttons List */}
            <div className="lg:col-span-5 flex flex-col gap-2">
              {INGREDIENTS.map((item) => {
                const isSelected = item.id === activeIngredientTab;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveIngredientTab(item.id)}
                    className={`flex items-center justify-between p-3.5 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-surface text-primary shadow-xs border border-primary/30 font-bold'
                        : 'bg-surface/50 text-on-surface hover:bg-surface'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold">
                        {item.number}
                      </span>
                      <span className="text-sm font-semibold">{item.name}</span>
                    </div>
                    <span className="material-symbols-outlined text-[18px]">
                      {isSelected ? 'arrow_forward' : 'chevron_right'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Detailed Showcase */}
            <div className="lg:col-span-7 bg-surface p-6 sm:p-8 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs bg-primary-fixed text-primary px-3 py-1 rounded-full font-bold">
                    Bileşen #{selected.number}
                  </span>
                  <span className="text-xs text-outline flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[15px] text-secondary">
                      pin_drop
                    </span>
                    {selected.source}
                  </span>
                </div>

                <h3 className="font-headline-md text-2xl text-on-surface mb-2">
                  {selected.name}
                </h3>

                <p className="font-body-lg text-on-surface-variant leading-relaxed text-sm sm:text-base mb-6">
                  {selected.description}
                </p>

                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">
                    health_and_safety
                  </span>
                  Ürüne Katkısı
                </h3>

                <div className="space-y-2 mb-6">
                  {selected.benefits.map((b, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-surface-container-low text-xs text-on-surface flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-center">
                <span className="text-xs text-outline">Koruyucu, renklendirici ve aroma verici yok</span>
                <button
                  onClick={onGoToShop}
                  className="px-5 py-2.5 bg-primary-container hover:bg-primary text-on-primary-container text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Bu Malzemelerle Hazırlanan Çorbayı Al
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
