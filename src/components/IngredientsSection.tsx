import React from 'react';
import { ASSETS } from '../data/mockData';

interface IngredientsSectionProps {
  onOpenIngredientsModal: () => void;
}

export const IngredientsSection: React.FC<IngredientsSectionProps> = ({
  onOpenIngredientsModal,
}) => {
  return (
    <section className="py-16 lg:py-28 bg-surface-container-low" id="icindekiler">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-10 lg:gap-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-0.5 w-8 bg-secondary"></span>
              <span className="font-label-lg uppercase tracking-wider text-secondary font-bold">
                Tam Şeffaflık
              </span>
            </div>
            <h2 className="font-headline-lg text-on-surface">
              Topraktan Kaseye: Saf, Katkısız ve Şeffaf
            </h2>
            <p className="font-body-lg text-on-surface-variant mt-3 leading-relaxed">
              Neyi içtiğinizi tam olarak biliyorsunuz. Çorbamızda koruyucu, bulyon,
              renklendirici veya yapay kıvam artırıcılar asla yer almaz.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenIngredientsModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container-highest hover:bg-surface-container-high rounded-lg font-title-md text-on-surface transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-98"
            >
              <span className="material-symbols-outlined text-primary text-[20px]">
                fact_check
              </span>
              <span>12 Doğal Bileşen (Tümünü İncele)</span>
            </button>
          </div>
        </div>

        {/* Grid: Flatlay Image + Interactive Ingredient List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Flatlay Image */}
          <div className="lg:col-span-7 rounded-2xl overflow-hidden shadow-[0_16px_32px_-4px_rgba(45,36,36,0.1)] aspect-[16/11] bg-surface-container group">
            <img
              alt="Ahşap masa üzerinde köy yoğurdu, domates, nohut, un ve taze otların yer aldığı zengin tarhana malzemeleri flatlay düzeni"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
              src={ASSETS.flatlayIngredients}
              loading="lazy"
            />
          </div>

          {/* Ingredients List */}
          <div className="lg:col-span-5 flex flex-col gap-3.5">
            {/* Card 1 */}
            <div
              onClick={onOpenIngredientsModal}
              className="p-4 rounded-xl bg-surface shadow-xs hover:shadow-md transition-all flex items-start gap-4 cursor-pointer border border-transparent hover:border-outline-variant/30"
            >
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold shrink-0">
                1
              </div>
              <div>
                <h4 className="font-title-md text-on-surface">Köy Tipi Süzme Yoğurt</h4>
                <p className="font-body-sm text-on-surface-variant mt-0.5">
                  Otlayan ineklerin sütünden geleneksel usulle mayalanmış canlı, ekşimsi ve koyu
                  kıvamlı yoğurt.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div
              onClick={onOpenIngredientsModal}
              className="p-4 rounded-xl bg-surface shadow-xs hover:shadow-md transition-all flex items-start gap-4 cursor-pointer border border-transparent hover:border-outline-variant/30"
            >
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold shrink-0">
                2
              </div>
              <div>
                <h4 className="font-title-md text-on-surface">Tarla Domatesi &amp; Közlenmiş Kapya</h4>
                <p className="font-body-sm text-on-surface-variant mt-0.5">
                  Ağustos güneşinde kızarmış mis kokulu tarla domatesleri ve köz ateşiyle
                  tatlanan tatlı etli kapya biberler.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div
              onClick={onOpenIngredientsModal}
              className="p-4 rounded-xl bg-surface shadow-xs hover:shadow-md transition-all flex items-start gap-4 cursor-pointer border border-transparent hover:border-outline-variant/30"
            >
              <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary font-bold shrink-0">
                3
              </div>
              <div>
                <h4 className="font-title-md text-on-surface">Yerli Koçbaşı Nohut</h4>
                <p className="font-body-sm text-on-surface-variant mt-0.5">
                  İç Anadolu ovalarından toplanmış, suda kabaran, protein ve lif deposu dolgun
                  nohut taneleri.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div
              onClick={onOpenIngredientsModal}
              className="p-4 rounded-xl bg-surface shadow-xs hover:shadow-md transition-all flex items-start gap-4 cursor-pointer border border-transparent hover:border-outline-variant/30"
            >
              <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary font-bold shrink-0">
                4
              </div>
              <div>
                <h4 className="font-title-md text-on-surface">Taş Değirmen Ata Buğday Unu</h4>
                <p className="font-body-sm text-on-surface-variant mt-0.5">
                  Karakılçık ve siyez buğdaylarının rüşeymi ve kepeği ayrılmadan öğütülmüş
                  besleyici unu.
                </p>
              </div>
            </div>

            {/* Card 5 */}
            <div
              onClick={onOpenIngredientsModal}
              className="p-4 rounded-xl bg-surface shadow-xs hover:shadow-md transition-all flex items-start gap-4 cursor-pointer border border-transparent hover:border-outline-variant/30"
            >
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant font-bold shrink-0">
                5
              </div>
              <div>
                <h4 className="font-title-md text-on-surface">Taze Dağ Kekiği &amp; Nane</h4>
                <p className="font-body-sm text-on-surface-variant mt-0.5">
                  Yüksek rakımlı yaylalardan toplanan uçucu yağları zengin şifalı aromatik
                  kurutulmuş otlar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
