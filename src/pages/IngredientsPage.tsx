import React, { useState } from 'react';
import { INGREDIENTS, ASSETS } from '../data/mockData';

interface IngredientsPageProps {
  onGoToShop: () => void;
}

export const IngredientsPage: React.FC<IngredientsPageProps> = ({ onGoToShop }) => {
  const [activeIngredientTab, setActiveIngredientTab] = useState<number>(1);
  const selected = INGREDIENTS.find((i) => i.id === activeIngredientTab) || INGREDIENTS[0];

  const fermentationPhases = [
    {
      days: 'Gün 1 - 7',
      phase: 'Canlanma & Hamur Yoğurma',
      desc: 'Köy tipi canlı süzme yoğurt, ata buğday unu, tatlı köz biber ve domates püreleri toprak küpte bir araya gelir. Her sabah ve akşam tahta tokmakla sevgiyle yoğrulur. Canlı laktobasiller uyanır.',
      badge: 'bg-primary-fixed text-primary',
    },
    {
      days: 'Gün 8 - 14',
      phase: 'Derin Laktik Asit Fermantasyonu',
      desc: 'Hamur kabarır, gözenekler açılır. Fitik asit parçalanır; böylece buğdaydaki mineraller ve vitaminler vücut tarafından %100 emilebilir hale gelir. Kendine has o büyüleyici ekşimsi anne aroması oluşur.',
      badge: 'bg-secondary-fixed text-secondary',
    },
    {
      days: 'Gün 15 - 21',
      phase: 'Güneşte Doğal Kurutma & Kalburlama',
      desc: 'Temiz yayla havasında, dut ağacı gölgesi ve güneşin dengeli sıcağında keten bezlere serilir. Ufak lokmalar halinde ufalanıp geleneksel tel kalburlardan ovularak geçirilir.',
      badge: 'bg-tertiary-fixed text-tertiary',
    },
  ];

  return (
    <div className="py-12 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-label-lg uppercase tracking-wider text-secondary font-bold">
            Kadim Şifa Kimyası
          </span>
          <h1 className="font-headline-lg text-on-surface mt-2 text-3xl sm:text-4xl">
            İçindekiler &amp; Nohut Terapi Sırrı
          </h1>
          <p className="font-body-lg text-on-surface-variant mt-2 leading-relaxed">
            Anadolu'nun bereketli topraklarından el değmemiş saf malzemeler, 21 günlük canlı
            fermantasyon ve nohutun protein dolu şifasıyla birleşti.
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
              Neden Nohutlu Tarhana?
            </span>
            <h2 className="font-headline-md text-2xl sm:text-3xl text-on-surface">
              Nohutun Kadim Tokluğu ve Prebiyotik Mucizesi
            </h2>
            <p className="font-body-md text-on-surface-variant leading-relaxed">
              Geleneksel tarhana çoğunlukla yoğurt ve un tabanlıdır. TarhanaTerapi ise bu kadim
              reçeteyi, Anadolu'nun protein devi <strong>yerli koçbaşı nohut</strong> ile zenginleştirdi.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="p-3 bg-surface rounded-xl border border-outline-variant/20">
                <strong className="text-primary text-sm block font-bold">%40 Daha Fazla Protein</strong>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Bitkisel protein desteğiyle uzun süre acıkmayı önler, glisemik dalgalanmayı dengeler.
                </p>
              </div>
              <div className="p-3 bg-surface rounded-xl border border-outline-variant/20">
                <strong className="text-secondary text-sm block font-bold">Kadife Dokulu Kıvam</strong>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Haşlanmış nohutun doğal nişastası, yapay bulyon ve un eklemelerine gerek kalmadan kadife pürüzsüzlüğü sunar.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 21-Day Fermentation Timeline */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="font-label-lg uppercase text-primary font-bold">
              Sabır ve Zamanın Eseri
            </span>
            <h2 className="font-headline-lg text-2xl sm:text-3xl text-on-surface mt-1">
              21 Günlük Toprak Küpte Mayalanma Takvimi
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {fermentationPhases.map((phase, idx) => (
              <div
                key={idx}
                className="p-6 bg-surface-container-lowest rounded-2xl shadow-xs border border-outline-variant/30 flex flex-col justify-between"
              >
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${phase.badge}`}>
                    {phase.days}
                  </span>
                  <h3 className="font-title-lg text-on-surface mb-2 font-bold">{phase.phase}</h3>
                  <p className="font-body-sm text-on-surface-variant leading-relaxed">
                    {phase.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-outline-variant/20 text-xs text-outline flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">
                    check_circle
                  </span>
                  <span>Canlı probiyotik florası korunur</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive 12 Natural Ingredients Selector */}
        <div className="bg-surface-container-low p-6 sm:p-10 rounded-3xl border border-outline-variant/30 mb-16">
          <div className="max-w-2xl mb-8">
            <span className="font-label-lg uppercase text-secondary font-bold">
              Ata Mirası İçerik
            </span>
            <h2 className="font-headline-lg text-2xl sm:text-3xl text-on-surface mt-1">
              Topraktan Gelen 12 Doğal Bileşen
            </h2>
            <p className="font-body-md text-on-surface-variant mt-1 text-sm">
              Malzemelerin üzerine tıklayarak nereden temin edildiğini ve sağlığınıza katkısını inceleyebilirsiniz.
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

                <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">
                    health_and_safety
                  </span>
                  Sağlığa &amp; Sindirime Faydaları
                </h4>

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
                <span className="text-xs text-outline">Sıfır katkı, sıfır koruyucu garantisi</span>
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
