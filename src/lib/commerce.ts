/**
 * Ticari sabitler tek yerde tutulur; sepet, ödeme ve schema aynı değerleri kullanır.
 */
export const FREE_SHIPPING_THRESHOLD = 2000;
export const STANDARD_SHIPPING_FEE = 150;

/**
 * Havale/EFT, yeni checkout'ta tek aktif ödeme yöntemidir.
 * Kapıda ödeme kartı görünür ancak "Yakında!" etiketiyle devre dışıdır.
 * Bilgiler tanımlıysa sipariş onay ekranında gösterilir; tanımlı değilse
 * banka bilgileri sipariş e-postasıyla iletilir.
 */
const viteEnv = (() => {
  try {
    return (import.meta as unknown as { env?: Record<string, string> }).env || {};
  } catch {
    return {};
  }
})();

export const BANK_TRANSFER_DETAILS = {
  bankName: (viteEnv.VITE_BANK_TRANSFER_BANK || '').trim(),
  accountName: (viteEnv.VITE_BANK_TRANSFER_ACCOUNT_NAME || '').trim(),
  iban: (viteEnv.VITE_BANK_TRANSFER_IBAN || '').trim(),
};

export const HAS_BANK_TRANSFER_DETAILS = Boolean(
  BANK_TRANSFER_DETAILS.bankName &&
    BANK_TRANSFER_DETAILS.accountName &&
    BANK_TRANSFER_DETAILS.iban
);
