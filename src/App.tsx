/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ActiveTab, CartItem, Product, Review, User, Order, SubscriberLead } from './types';
import { PRODUCTS, REVIEWS } from './data/mockData';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { StorySection } from './components/StorySection';
import { IngredientsSection } from './components/IngredientsSection';
import { ProductsSection } from './components/ProductsSection';
import { CookingRitualSection } from './components/CookingRitualSection';
import { ReviewsSection } from './components/ReviewsSection';
import { NewsletterSection } from './components/NewsletterSection';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CookingAssistantModal } from './components/CookingAssistantModal';
import { EbookModal } from './components/EbookModal';
import { IngredientsModal } from './components/IngredientsModal';
import { LegalModal } from './components/LegalModal';
import { Toast } from './components/Toast';
import { SeoHead } from './components/SeoHead';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AdminModal } from './components/AdminModal';

// Specific screen pages
import { ProductsPage } from './pages/ProductsPage';
import { IngredientsPage } from './pages/IngredientsPage';
import { StoryPage } from './pages/StoryPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { ContactPage } from './pages/ContactPage';

function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.15); // A5
    gain2.gain.setValueAtTime(0.2, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.6);
  } catch {
    // Ignore audio permission constraint
  }
}

export default function App() {
  const location = useLocation();
const navigate = useNavigate();

const pathToTab: Record<string, ActiveTab> = {
  '/': 'home',
  '/urunler': 'products',
  '/icerik': 'ingredients',
  '/hikaye': 'story',
  '/yorumlar': 'reviews',
  '/iletisim': 'contact',
  '/sss': 'contact',
};

const tabToPath: Record<ActiveTab, string> = {
  home: '/',
  products: '/urunler',
  ingredients: '/icerik',
  story: '/hikaye',
  reviews: '/yorumlar',
  contact: '/iletisim',
};

const normalizedPath = location.pathname.replace(/\/+$/, '') || '/';
const activeTab: ActiveTab = pathToTab[normalizedPath] ?? 'home';

const setActiveTab = useCallback(
  (tab: ActiveTab) => {
    navigate(tabToPath[tab]);
  },
  [navigate]
);

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('tt_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Cart State (Initialized with 1 featured item at updated price 450 TL)
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: PRODUCTS[0],
      quantity: 1,
      selectedWeight: '500g Cam Kavanoz',
    },
  ]);

  // Orders State (Persisted in localStorage)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('tt_orders');
      if (saved) return JSON.parse(saved);
      // Default initial demo order
      return [
        {
          id: 'ord-demo-1',
          orderNumber: 'TT-742918',
          customerName: 'Ayşe Yılmaz',
          customerEmail: 'ayse.yilmaz@tarhanaterapi.com',
          customerPhone: '0532 123 45 67',
          customerAddress: 'Caferağa Mah. Şifa Sok. No: 12 D: 4',
          customerCity: 'İstanbul',
          customerDistrict: 'Kadıköy',
          deliveryNote: 'Zili çalmayınız lütfen',
          paymentMethod: 'credit_card',
          items: [
            {
              productId: PRODUCTS[0].id,
              name: PRODUCTS[0].name,
              price: PRODUCTS[0].price,
              quantity: 1,
              weight: '500g Cam Kavanoz',
              image: PRODUCTS[0].image,
            },
          ],
          subtotal: 450,
          shippingFee: 0,
          discount: 0,
          total: 450,
          status: 'Kargoya Verildi',
          createdAt: '11.02.2025 14:30',
        },
      ];
    } catch {
      return [];
    }
  });

  // Collected Email Leads (Newsletter & E-book)
  const [subscribers, setSubscribers] = useState<SubscriberLead[]>(() => {
    try {
      const saved = localStorage.getItem('tt_subscribers');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'sub-1',
              email: 'misafir.lezzet@gmail.com',
              source: 'ebook',
              createdAt: '10.02.2025',
            },
          ];
    } catch {
      return [];
    }
  });

  // Admin New Order Alert Counter & Banner
  const [newOrdersCount, setNewOrdersCount] = useState<number>(0);
  const [adminAlertBanner, setAdminAlertBanner] = useState<string | null>(null);

  // Reviews State
  const [reviewsList, setReviewsList] = useState<Review[]>(REVIEWS);

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCookingAssistantOpen, setIsCookingAssistantOpen] = useState(false);
  const [isEbookModalOpen, setIsEbookModalOpen] = useState(false);
  const [ebookEmail, setEbookEmail] = useState('');
  const [isIngredientsModalOpen, setIsIngredientsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const [legalModal, setLegalModal] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
  }>({
    isOpen: false,
    title: '',
    content: '',
  });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tt_orders', JSON.stringify(orders));
    } catch {
      // Ignore
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('tt_subscribers', JSON.stringify(subscribers));
    } catch {
      // Ignore
    }
  }, [subscribers]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Auth Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('tt_current_user', JSON.stringify(user));
    } catch {
      // Ignore
    }
    showToast(`Hoş geldiniz, ${user.fullName}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('tt_current_user');
    } catch {
      // Ignore
    }
    showToast('Oturum kapatıldı.');
  };

  // Cart Handlers
  const handleAddToCart = (product: Product, quantity = 1, weight?: string) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity,
          selectedWeight: weight || product.weight,
        },
      ];
    });
    showToast(`${product.name} sepetinize eklendi.`);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Ürün sepetten kaldırıldı.');
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Order Creation & Real Admin Notification
  const handleCreateOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    setNewOrdersCount((prev) => prev + 1);

    // Audio chime
    playNotificationChime();

    // Trigger Admin Notification
    const alertMsg = `🔔 YENİ SİPARİŞ ALINDI! #${newOrder.orderNumber} - ${newOrder.customerName} (₺${newOrder.total}) • Yönetici Paneline İletildi!`;
    setAdminAlertBanner(alertMsg);

    // Show customer confirmation toast
    showToast(`Siparişiniz başarıyla alındı (#${newOrder.orderNumber}). Teşekkür ederiz!`);

    // If user is logged in, award loyalty points (+25 points)
    if (currentUser) {
      const updatedUser = { ...currentUser, points: currentUser.points + 25 };
      setCurrentUser(updatedUser);
      localStorage.setItem('tt_current_user', JSON.stringify(updatedUser));
    }
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    showToast(`Sipariş durumu güncellendi: ${newStatus}`);
  };

  // Simulate incoming order for instant testing
  const handleSimulateIncomingOrder = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const mockOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `TT-${randomNum}`,
      customerName: 'Zeynep Akın',
      customerEmail: 'zeynep.akin@ornek.com',
      customerPhone: '0544 987 65 43',
      customerAddress: 'Bağdat Cad. No: 142/6',
      customerCity: 'İstanbul',
      customerDistrict: 'Kadıköy',
      paymentMethod: 'credit_card',
      items: [
        {
          productId: PRODUCTS[1].id,
          name: PRODUCTS[1].name,
          price: PRODUCTS[1].price,
          quantity: 1,
          weight: '500g Cam Kavanoz',
          image: PRODUCTS[1].image,
        },
      ],
      subtotal: PRODUCTS[1].price,
      shippingFee: 0,
      discount: 0,
      total: PRODUCTS[1].price,
      status: 'Yeni Sipariş',
      createdAt: new Date().toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    handleCreateOrder(mockOrder);
  };

  // Email collection handler for lead generation
  const handleCollectEmail = (email: string, source: 'ebook' | 'newsletter' = 'ebook') => {
    if (!email || !email.includes('@')) return;
    setSubscribers((prev) => {
      if (prev.some((s) => s.email.toLowerCase() === email.toLowerCase())) return prev;
      return [
        {
          id: `sub-${Date.now()}`,
          email,
          source,
          createdAt: new Date().toLocaleDateString('tr-TR'),
        },
        ...prev,
      ];
    });
  };

  // Ebook trigger
  const handleDownloadEbook = (email: string) => {
    setEbookEmail(email);
    handleCollectEmail(email, 'ebook');
    setIsEbookModalOpen(true);
    showToast('Reçete e-kitabınız hazırlandı! E-posta listenize kaydedildi.');
  };

  // Add review
  const handleAddReview = (newReview: Omit<Review, 'id' | 'date'>) => {
    const fullReview: Review = {
      ...newReview,
      id: `rev-${Date.now()}`,
      date: 'Az önce',
    };
    setReviewsList((prev) => [fullReview, ...prev]);
    showToast('Değerli yorumunuz yayınlandı. Teşekkür ederiz!');
  };

  const seoByTab = {
    home: {
      title: 'TarhanaTerapi — Nohutlu Hakiki Anne Tarhanası',
      description:
        'Ata tohumu koçbaşı nohutlu, 21 gün toprak küpte fermente, katkısız anne tarhanası. Klasik, acılı, bebek ve aile paketi; Türkiye geneli kargo.',
      canonical: 'https://tarhanaterapi.com/',
    },
    products: {
      title: 'Tarhana Ürünleri | TarhanaTerapi',
      description:
        'Klasik, acılı, bebek dostu ve aile paketi tarhana seçenekleri. Katkısız anne tarhanası cam kavanozda.',
      canonical: 'https://tarhanaterapi.com/urunler',
    },
    ingredients: {
      title: 'İçindekiler ve Fermantasyon | TarhanaTerapi',
      description:
        'TarhanaTerapi içindekiler: ata tohumu nohut, köy yoğurdu, taş değirmen unu, 21 gün toprak küp fermantasyonu.',
      canonical: 'https://tarhanaterapi.com/icerik',
    },
    story: {
      title: 'Üretim Hikayesi | TarhanaTerapi',
      description:
        'Üç nesilden gelen maya ile 21 gün fermente edilen anne tarhanasının Orhangazi kökenli üretim hikayesi.',
      canonical: 'https://tarhanaterapi.com/hikaye',
    },
    reviews: {
      title: 'Müşteri Yorumları | TarhanaTerapi',
      description: 'TarhanaTerapi müşterilerinden gerçek ve doğrulanmış ürün yorumları.',
      canonical: 'https://tarhanaterapi.com/yorumlar',
    },
    contact: {
      title: 'SSS ve İletişim | TarhanaTerapi',
      description: 'TarhanaTerapi sık sorulan sorular, kargo, teslimat ve iletişim bilgileri.',
      canonical: 'https://tarhanaterapi.com/iletisim',
    },
  };
  const seo = seoByTab[activeTab] ?? seoByTab.home;

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      <SeoHead title={seo.title} description={seo.description} canonical={seo.canonical} />      {/* Admin Real-Time Alert Notification Bar (Only visible to logged-in administrator) */}
      {adminAlertBanner &&
        Boolean(
          currentUser?.isAdmin ||
            currentUser?.email === 'layeredstudio78@gmail.com' ||
            currentUser?.email === 'admin@tarhanaterapi.com'
        ) && (
          <div className="bg-primary text-on-primary px-4 py-2.5 text-xs font-semibold text-center flex items-center justify-between sticky top-0 z-60 shadow-md">
            <div className="flex items-center justify-center gap-2 mx-auto">
              <span className="material-symbols-outlined text-[18px] animate-pulse">
                notifications_active
              </span>
              <span>{adminAlertBanner}</span>
              <button
                onClick={() => {
                  setAdminAlertBanner(null);
                  setIsAdminModalOpen(true);
                }}
                className="ml-2 underline font-bold hover:text-secondary-fixed cursor-pointer"
              >
                Paneli Aç ve İncele →
              </button>
            </div>
            <button
              onClick={() => setAdminAlertBanner(null)}
              className="text-on-primary/80 hover:text-on-primary p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

      {/* 1. Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartItems={cartItems}
        onOpenCart={() => setIsCartOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        newOrdersCount={newOrdersCount}
      />

      {/* 2. Main Content Screens */}
      <main className="w-full pt-20 flex-1">
        {activeTab === 'home' && (
          <div className="flex flex-col w-full">
            <Hero
              onExploreProducts={() => {
                const el = document.getElementById('urunler');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  setActiveTab('products');
                }
              }}
              onExploreIngredients={() => setIsIngredientsModalOpen(true)}
              setActiveTab={setActiveTab}
            />
            <StorySection onReadMoreStory={() => setActiveTab('story')} />
            <IngredientsSection
              onOpenIngredientsModal={() => setIsIngredientsModalOpen(true)}
            />
            <ProductsSection
              onAddToCart={(p) => handleAddToCart(p, 1)}
              onSelectProduct={(p) => setSelectedProduct(p)}
            />
            <CookingRitualSection
              onOpenCookingAssistant={() => setIsCookingAssistantOpen(true)}
            />
            <ReviewsSection onViewAllReviews={() => setActiveTab('reviews')} />
            <NewsletterSection onDownloadEbook={handleDownloadEbook} />
          </div>
        )}

        {activeTab === 'products' && (
          <ProductsPage
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onSelectProduct={(p) => setSelectedProduct(p)}
          />
        )}

        {activeTab === 'ingredients' && (
          <IngredientsPage onGoToShop={() => setActiveTab('products')} />
        )}

        {activeTab === 'story' && (
          <StoryPage onGoToShop={() => setActiveTab('products')} />
        )}

        {activeTab === 'reviews' && (
          <ReviewsPage reviews={reviewsList} onAddReview={handleAddReview} />
        )}

        {activeTab === 'contact' && <ContactPage onShowToast={showToast} />}
      </main>

      {/* 3. Footer */}
      <Footer
        setActiveTab={setActiveTab}
        onShowToast={(msg) => {
          showToast(msg);
        }}
        onOpenLegalModal={(title, content) =>
          setLegalModal({ isOpen: true, title, content })
        }
      />

      {/* 4. Interactive Modals & Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        currentUser={currentUser}
        onCreateOrder={handleCreateOrder}
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, qty, w) => handleAddToCart(p, qty, w)}
      />

      <CookingAssistantModal
        isOpen={isCookingAssistantOpen}
        onClose={() => setIsCookingAssistantOpen(false)}
      />

      <EbookModal
        isOpen={isEbookModalOpen}
        onClose={() => setIsEbookModalOpen(false)}
        userEmail={ebookEmail}
        onCollectEmail={(email) => handleCollectEmail(email, 'ebook')}
      />

      <IngredientsModal
        isOpen={isIngredientsModalOpen}
        onClose={() => setIsIngredientsModalOpen(false)}
      />

      {/* User Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* User Profile & Past Orders Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={currentUser}
        orders={orders}
        onLogout={handleLogout}
      />

      {/* Store Admin & Email Leads Modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        orders={orders}
        subscribers={subscribers}
        currentUser={currentUser}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onSimulateIncomingOrder={handleSimulateIncomingOrder}
        onClearNewOrderAlert={() => setNewOrdersCount(0)}
      />

      <LegalModal
        isOpen={legalModal.isOpen}
        title={legalModal.title}
        content={legalModal.content}
        onClose={() => setLegalModal({ ...legalModal, isOpen: false })}
      />

      {/* 5. Notification Toast */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
