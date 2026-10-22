import React from 'react';
import { KVKK_AYDINLATMA } from '../data/legal';

type Block =
  | { type: 'h2'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'meta'; text: string };

const buildBlocks = (): Block[] => {
  const blocks: Block[] = [];
  let list: string[] | null = null;

  for (const raw of KVKK_AYDINLATMA.split('\n')) {
    const line = raw.trim();

    if (!line || line === 'KVKK AYDINLATMA METNİ') {
      list = null;
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      list = null;
      blocks.push({ type: 'h2', text: line });
      continue;
    }

    if (line.startsWith('- ')) {
      if (!list) {
        list = [];
        blocks.push({ type: 'ul', items: list });
      }
      list.push(line.slice(2));
      continue;
    }

    list = null;
    blocks.push(
      line.startsWith('Son güncelleme')
        ? { type: 'meta', text: line }
        : { type: 'p', text: line }
    );
  }

  return blocks;
};

const blocks = buildBlocks();

export const KvkkPage: React.FC = () => {
  return (
    <div className="py-12 bg-surface min-h-screen">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <div className="mb-10">
          <span className="font-label-lg uppercase tracking-wider text-primary font-bold">
            Yasal Bilgilendirme
          </span>
          <h1 className="font-headline-lg text-on-surface mt-2 text-3xl sm:text-4xl">
            KVKK Aydınlatma Metni
          </h1>
          <p className="font-body-lg text-on-surface-variant mt-3 leading-relaxed">
            6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında kişisel verilerinizin
            nasıl işlendiğini, kimlere aktarıldığını ve haklarınızı bu sayfada açıklıyoruz.
          </p>
        </div>

        <article className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 sm:p-10">
          <div className="flex flex-col gap-4 text-sm sm:text-base text-on-surface-variant leading-relaxed">
            {blocks.map((block, index) => {
              if (block.type === 'h2') {
                return (
                  <h2
                    key={index}
                    className="font-headline-sm text-on-surface text-lg sm:text-xl font-bold mt-4 first:mt-0"
                  >
                    {block.text}
                  </h2>
                );
              }

              if (block.type === 'ul') {
                return (
                  <ul key={index} className="list-disc pl-5 flex flex-col gap-1.5">
                    {block.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                );
              }

              if (block.type === 'meta') {
                return (
                  <p key={index} className="text-xs text-outline pt-4 border-t border-outline-variant/20">
                    {block.text}
                  </p>
                );
              }

              return <p key={index}>{block.text}</p>;
            })}
          </div>
        </article>

        <div className="mt-8 p-6 rounded-2xl bg-primary-fixed/40 border border-primary/15 text-sm text-on-surface-variant leading-relaxed">
          <strong className="text-on-surface">Başvuru ve sorularınız için:</strong>{' '}
          <a className="text-primary font-semibold hover:underline" href="mailto:satis@tarhanaterapi.com">
            satis@tarhanaterapi.com
          </a>{' '}
          · 0850 302 82 74 · Muradiye Mh., Orhangazi / Bursa
        </div>
      </div>
    </div>
  );
};
