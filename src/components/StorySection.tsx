import React from 'react';
import { ASSETS } from '../data/mockData';

interface StorySectionProps {
  onReadMoreStory: () => void;
}

export const StorySection: React.FC<StorySectionProps> = ({ onReadMoreStory }) => {
  return (
    <section className="py-16 lg:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Visual: Tasting Woman */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_40px_-6px_rgba(45,36,36,0.12)] aspect-[4/4.5] bg-surface-container">
              <img
                alt="Sıcak ve şifalı çorbadan ilk kaşığı alan huzurlu an"
                className="w-full h-full object-cover"
                src={ASSETS.womanTasting}
                loading="lazy"
              />
            </div>

            {/* Decorative Stamp */}
            <div className="hidden sm:flex absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-secondary-container text-on-secondary-container items-center justify-center flex-col text-center p-3 shadow-lg transform rotate-6 border border-amber-300">
              <span className="material-symbols-outlined text-[28px] text-secondary">
                verified
              </span>
              <span className="font-label-sm uppercase font-bold tracking-tight text-[11px] mt-1 text-on-secondary-container">
                Köy Mutfağı Orijinali
              </span>
            </div>
          </div>

          {/* Editorial Copy & Pillars */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-8 bg-primary"></span>
              <span className="font-label-lg uppercase tracking-wider text-primary font-bold">
                Duyusal Bir Yolculuk
              </span>
            </div>

            <h2 className="font-headline-lg text-on-surface">
              İlk Kaşıkta Gözlerinizi Kapatın...
            </h2>

            <p className="font-body-lg text-on-surface-variant leading-relaxed">
              TarhanaTerapi, Orhangazi'nin serin köylerinde alelade bir hazır çorba değil;
              unutulmaya yüz tutmuş sabır ve sevgi ritüelidir. Çömlek küplerde fermantasyonunu
              tamamlayan canlı mayalar ve aromatik sebzeler, lokum kıvamında pişmiş nohutlarla
              kasede buluştuğunda sadece midenizi değil, ruhunuzu da teskin eder.
            </p>

            {/* 3 Pillars Grid */}
            <div className="flex flex-col gap-4 mt-2">
              <div className="p-5 rounded-xl bg-surface-container-low shadow-xs flex items-start gap-4 hover:shadow-sm transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary-fixed flex items-center justify-center text-primary shrink-0 shadow-2xs">
                  <span className="material-symbols-outlined text-[24px]">hourglass_top</span>
                </div>
                <div>
                  <h3 className="font-title-lg text-on-surface">21 Gün Doğal Fermantasyon</h3>
                  <p className="font-body-md text-on-surface-variant mt-0.5">
                    Zamanla demlenen canlı probiyotikler, bağırsak florasını güçlendirir, sindirimi
                    son derece hafif ve şifalı hale getirir.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-surface-container-low shadow-xs flex items-start gap-4 hover:shadow-sm transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary shrink-0 shadow-2xs">
                  <span className="material-symbols-outlined text-[24px]">agriculture</span>
                </div>
                <div>
                  <h3 className="font-title-lg text-on-surface">Haşlanmış Koçbaşı Nohut</h3>
                  <p className="font-body-md text-on-surface-variant mt-0.5">
                    Yerli ata tohumu koçbaşı nohutlar ayrı kazanlarda haşlanır; tereyağı ve kuru
                    nane ile sotelenip çorbaya zengin bir doku katar.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-surface-container-low shadow-xs flex items-start gap-4 hover:shadow-sm transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center text-tertiary shrink-0 shadow-2xs">
                  <span className="material-symbols-outlined text-[24px]">wb_sunny</span>
                </div>
                <div>
                  <h3 className="font-title-lg text-on-surface">Güneşte Doğal Kurutulan Şifa</h3>
                  <p className="font-body-md text-on-surface-variant mt-0.5">
                    Asla endüstriyel fırın kullanılmaz. Temiz yayla havasında, keten bezler üzerinde
                    ağır ağır kurutularak vitaminleri hapsedilir.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onReadMoreStory}
                className="inline-flex items-center gap-2 text-primary font-title-md hover:underline cursor-pointer group"
              >
                <span>Bursa Orhangazi köylerindeki kadim mayalama hikayemizi keşfedin</span>
                <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
