import React from 'react';
import { ASSETS } from '../data/mockData';

interface StoryPageProps {
  onGoToShop: () => void;
}

export const StoryPage: React.FC<StoryPageProps> = ({ onGoToShop }) => {
  return (
    <div className="py-12 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-label-lg uppercase tracking-wider text-primary font-bold">
            Kadim Anadolu Mirası
          </span>
          <h1 className="font-headline-lg text-on-surface mt-2 text-3xl sm:text-4xl">
            Hikayemiz: Bir Ocak Başında Başlayan Şifa
          </h1>
          <p className="font-body-lg text-on-surface-variant mt-2 leading-relaxed">
            Hızlı yaşamın unutturduğu sabrı, anne elinin sevgisini ve köy fırınlarının kokusunu
            şehir sofralarına yeniden armağan ediyoruz.
          </p>
        </div>

        {/* Narrative Split 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-6 relative">
            <div className="rounded-3xl overflow-hidden shadow-xl aspect-[4/3] bg-surface-container">
              <img
                src={ASSETS.womanTasting}
                alt="Tarhana çorbasını tadarken huzur bulan kadın"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-surface p-4 rounded-2xl shadow-lg border border-outline-variant/30 hidden sm:flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[28px]">
                family_restroom
              </span>
              <div>
                <p className="text-xs font-bold text-on-surface">3 Nesillik Aile Tarifi</p>
                <p className="text-[11px] text-outline">1954'ten beri süren aile mutfağı</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col gap-5">
            <span className="font-label-lg uppercase text-secondary font-bold">
              Köklerimiz
            </span>
            <h2 className="font-headline-md text-2xl sm:text-3xl text-on-surface">
              "Bir Kase Çorba Sadece Karnı Değil, Kalbi Doyurur"
            </h2>
            <p className="font-body-md text-on-surface-variant leading-relaxed">
              TarhanaTerapi, Orhangazi'nin serin köylerinde, ninelerimizin yaz sonunda kurduğu o
              büyük imece sofralarında doğdu. Ağustos sıcağında köy meydanında toplanan kadınlar;
              bahçeden yeni koparılmış kokulu domatesleri, odun ateşinde közlenmiş kapyaları ve
              yayık yoğurdunu dev kazanlarda harmanlardı.
            </p>
            <p className="font-body-md text-on-surface-variant leading-relaxed">
              Bizler o çorbanın buharıyla büyüdük; hastalandığımızda şifasını, üşüdüğümüzde sıcaklığını
              arayan nesiller olarak, market raflarındaki bulyonlu, yapay aromalı ve katkı dolu
              "hazır çorbalara" razı olamazdık.
            </p>
          </div>
        </div>

        {/* 3 Core Philosophy Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-fixed text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">hourglass_bottom</span>
            </div>
            <h3 className="font-title-lg text-on-surface font-bold">Güneşte Kurutma</h3>
            <p className="font-body-sm text-on-surface-variant leading-relaxed">
              Hamurumuzu temiz hava akımı olan bir ortamda, güneşin doğal ısısıyla kurutuyoruz.
              Bu yöntem tarhananın kendine özgü aromasını ve dokusunu korur.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary-fixed text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]" aria-hidden="true">diversity_1</span>
            </div>
            <h3 className="font-title-lg text-on-surface font-bold">Kadın Kooperatifleri İmecesi</h3>
            <p className="font-body-sm text-on-surface-variant leading-relaxed">
              Bursa Orhangazi ve Güney Marmara köylerindeki yerel üretici kadınlarla doğrudan çalışıyoruz. Aracısız,
              adil ticaret ilkesiyle her paket kırsal kalkınmaya doğrudan can suyu oluyor.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-tertiary-fixed text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">energy_savings_leaf</span>
            </div>
            <h3 className="font-title-lg text-on-surface font-bold">Katkısız ve Şeffaf</h3>
            <p className="font-body-sm text-on-surface-variant leading-relaxed">
              Koruyucu, renklendirici, aroma verici veya bulyon kullanmıyoruz. İçindekiler
              listemiz kısa ve açık; ne yediğinizi bilerek için.
            </p>
          </div>
        </div>

        {/* Callout Action */}
        <div className="bg-primary-container text-on-primary-container p-8 sm:p-12 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <h3 className="font-headline-md text-2xl sm:text-3xl font-bold">
              Bu Şifayı Kendi Sofranıza Taşıyın
            </h3>
            <p className="font-body-md opacity-90 mt-2">
              Köy ocaklarının dumanını ve anne elinin samimiyetini özlediyseniz, bugün ilk paketinizle
              tanışın.
            </p>
          </div>
          <button
            onClick={onGoToShop}
            className="px-8 py-4 bg-surface text-on-surface hover:bg-surface-container rounded-xl font-title-md font-bold shadow-md cursor-pointer transition-all active:scale-95 shrink-0"
          >
            Çorbaları Keşfet
          </button>
        </div>
      </div>
    </div>
  );
};
