/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ActiveTab, CartItem, Product, Review, User, Order, SubscriberLead } from './types';
import { supabase } from './lib/supabase';
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
import { FaqSection } from './components/FaqSection';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AdminModal } from './components/AdminModal';

// Specific screen pages
import { ProductsPage } from './pages/ProductsPage';
import { IngredientsPage } from './pages/IngredientsPage';
import { StoryPage } from './pages/StoryPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { ContactPage } from './pages/ContactPage';
import { KvkkPage } from './pages/KvkkPage';
import { ProductPage } from './pages/ProductPage';
import { GuidesPage } from './pages/GuidesPage';
import { GuidePage } from './pages/GuidePage';
import { GUIDES } from './data/guides';
import {
  GUIDE_INDEX_PATH,
  SITE_URL,
  guideUrl,
  jsonLdForGuide,
  jsonLdForGuideIndex,
  jsonLdForRoute,
  productSeoDescription,
  productUrl,
  routePaths,
  routeSeo,
  type SiteRoute,
} from './lib/site';

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

type SessionUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
};

function buildUserFromSession(user: SessionUser): User {
  let cached: User | null = null;
  try {
    const raw = localStorage.getItem('tt_current_user');
    const parsed = raw ? (JSON.parse(raw) as User) : null;
    if (parsed?.email?.toLowerCase() === user.email?.toLowerCase()) cached = parsed;
  } catch {
    // Yerel önbellek yoksa devam et.
  }

  const isAdmin =
    user.email?.toLowerCase() === 'layeredstudio78@gmail.com' ||
    user.email?.toLowerCase() === 'admin@tarhanaterapi.com';
  const storedPoints = Number(user.user_metadata?.points ?? cached?.points);
  const points = isAdmin
    ? 999
    : Number.isFinite(storedPoints) && storedPoints > 0
      ? storedPoints
      : 100;

  return {
    id: user.id,
    fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Kullanıcı',
    email: user.email || '',
    phone: user.user_metadata?.phone || cached?.phone,
    city: user.user_metadata?.city || cached?.city,
    district: user.user_metadata?.district || cached?.district,
    address: user.user_metadata?.address || cached?.address,
    points,
    isAdmin,
    createdAt: cached?.createdAt || new Date().toLocaleDateString('tr-TR'),
  };
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
  '/kvkk': 'legal',
};

const tabToPath: Record<ActiveTab, string> = {
  home: '/',
  products: '/urunler',
  ingredients: '/icerik',
  story: '/hikaye',
  reviews: '/yorumlar',
  contact: '/iletisim',
  legal: '/kvkk',
};

const normalizedPath = location.pathname.replace(/\/+$/, '') || '/';
const productMatch = normalizedPath.match(/^\/urunler\/([^/]+)$/);
const currentProduct = productMatch
  ? PRODUCTS.find((product) => product.id === decodeURIComponent(productMatch[1])) ?? null
  : null;
const guideMatch = normalizedPath.match(/^\/rehber\/([^/]+)$/);
const currentGuide = guideMatch
  ? GUIDES.find((guide) => guide.slug === decodeURIComponent(guideMatch[1])) ?? null
  : null;
const isGuideIndex = normalizedPath === GUIDE_INDEX_PATH;
const activeTab: ActiveTab =
  currentProduct ? 'products' : currentGuide || isGuideIndex ? 'home' : pathToTab[normalizedPath] ?? 'home';

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

  // Cart State (Initialized with the single featured product)
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: PRODUCTS[0],
      quantity: 1,
      selectedWeight: PRODUCTS[0].weight,
    },
  ]);

  // Orders State (DB'de saklanır; yerel cache yok)
  const [orders, setOrders] = useState<Order[]>(() => []);

  // Collected Email Leads (Newsletter & E-book)
  const [subscribers, setSubscribers] = useState<SubscriberLead[]>(() => {
    try {
      const saved = localStorage.getItem('tt_subscribers');
      return saved ? JSON.parse(saved) : [];
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

  // Orders State DB'de; localStorage'a yazılmaz.

  useEffect(() => {
    try {
      localStorage.setItem('tt_subscribers', JSON.stringify(subscribers));
    } catch {
      // Ignore
    }
  }, [subscribers]);

  useEffect(() => {
    const isAdmin = Boolean(
      currentUser?.isAdmin ||
        currentUser?.email === 'layeredstudio78@gmail.com' ||
        currentUser?.email === 'admin@tarhanaterapi.com'
    );
    if (!isAdmin) return;

    let active = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) return;
        const res = await fetch('/api/list-subscribers', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const payload = await res.json();
        if (active && Array.isArray(payload.subscribers)) {
          setSubscribers(payload.subscribers);
        }
      } catch {
        // Yerel önbellek yeterli.
      }
    })();

    return () => {
      active = false;
    };
  }, [currentUser?.email, currentUser?.isAdmin]);

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
    supabase.auth.signOut();
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
      const updatedUser = {
        ...currentUser,
        points: currentUser.points + 25,
        phone: newOrder.customerPhone || currentUser.phone,
        city: newOrder.customerCity || currentUser.city,
        district: newOrder.customerDistrict || currentUser.district,
        address: newOrder.customerAddress || currentUser.address,
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('tt_current_user', JSON.stringify(updatedUser));

      const storedUsers: User[] = JSON.parse(localStorage.getItem('tt_users') || '[]');
      const idx = storedUsers.findIndex((u) => u.email.toLowerCase() === currentUser.email.toLowerCase());
      if (idx >= 0) {
        storedUsers[idx] = { ...storedUsers[idx], ...updatedUser };
        localStorage.setItem('tt_users', JSON.stringify(storedUsers));
      }

      // Supabase Auth metadata (if logged in via Supabase)
      supabase.auth.updateUser({
        data: {
          phone: updatedUser.phone,
          city: updatedUser.city,
          district: updatedUser.district,
          address: updatedUser.address,
          points: updatedUser.points,
        },
      }).catch(() => {});
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    const target = orders.find((o) => o.id === orderId);
    const previousStatus = target?.status;
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const res = await fetch('/api/update-order-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (!res.ok) throw new Error('update failed');
      showToast(`Sipariş durumu güncellendi: ${newStatus}`);
    } catch {
      if (previousStatus) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: previousStatus } : o))
        );
      }
      showToast('Sipariş durumu güncellenemedi. Lütfen tekrar deneyin.');
    }
  };

  // Simulate incoming order for instant testing (local only, does not touch the DB)
  const handleSimulateIncomingOrder = () => {
    const randomNum = 48210 + Math.floor(Math.random() * 90);
    const mockOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `TT-${randomNum}`,
      customerName: 'Zeynep Akın',
      customerEmail: 'zeynep.akin@ornek.com',
      customerPhone: '0544 987 65 43',
      customerAddress: 'Bağdat Cad. No: 142/6',
      customerCity: 'İstanbul',
      customerDistrict: 'Kadıköy',
      paymentMethod: 'bank_transfer',
      items: [
        {
          productId: PRODUCTS[0].id,
          name: PRODUCTS[0].name,
          price: PRODUCTS[0].price,
          quantity: 1,
          weight: PRODUCTS[0].weight,
          image: PRODUCTS[0].image,
        },
      ],
      subtotal: PRODUCTS[0].price,
      shippingFee: 150,
      discount: 0,
      total: PRODUCTS[0].price + 150,
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
    const cleanEmail = email.trim().toLowerCase();

    setSubscribers((prev) => {
      if (prev.some((s) => s.email.toLowerCase() === cleanEmail)) return prev;
      return [
        {
          id: `sub-${Date.now()}`,
          email: cleanEmail,
          source,
          createdAt: new Date().toLocaleDateString('tr-TR'),
        },
        ...prev,
      ];
    });

    fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, source }),
    }).catch(() => {
      // Yerel kayıt korunur; sunucu hatası kullanıcı akışını bozmaz.
    });
  };

  // Ebook trigger
  const handleDownloadEbook = (email: string) => {
    setEbookEmail(email);
    handleCollectEmail(email, 'ebook');
    setIsEbookModalOpen(true);
    showToast('Reçete e-kitabınız hazırlandı! E-posta listenize kaydedildi.');
  };

  // Add review — yönetici onayına gönderilir, doğrudan yayınlanmaz.
  const handleAddReview = async (newReview: Omit<Review, 'id' | 'date'>) => {
    try {
      const res = await fetch('/api/submit-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: newReview.author,
          location: newReview.location,
          rating: newReview.rating,
          content: newReview.content,
          productName: newReview.productName,
        }),
      });

      if (!res.ok) {
        showToast('Yorumunuz gönderilemedi. Lütfen tekrar deneyin.');
        return;
      }

      showToast('Yorumunuz onay için alındı. Yönetici onayından sonra yayınlanacak.');
    } catch {
      showToast('Yorumunuz gönderilemedi. Lütfen tekrar deneyin.');
    }
  };

  useEffect(() => {
    let active = true;

    fetch('/api/list-reviews?status=approved')
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!active || !Array.isArray(payload?.reviews)) return;
        const colors: Review['avatarColor'][] = ['primary', 'secondary', 'tertiary'];
        const mapped: Review[] = payload.reviews.map((row: any, index: number) => ({
          id: String(row.id),
          author: row.author,
          initials:
            String(row.author || '')
              .split(' ')
              .map((part: string) => part[0])
              .join('')
              .toUpperCase()
              .slice(0, 2) || 'TT',
          location: row.location || 'Türkiye',
          rating: Number(row.rating) || 5,
          date: row.createdAt
            ? new Date(row.createdAt).toLocaleDateString('tr-TR')
            : 'Az önce',
          content: row.content,
          verified: true,
          productName: row.productName || 'TarhanaTerapi',
          avatarColor: colors[index % colors.length],
        }));

        setReviewsList((prev) => {
          const existing = new Set(prev.map((item) => item.id));
          return [...mapped.filter((item) => !existing.has(item.id)), ...prev];
        });
      })
      .catch(() => {
        // Statik yorumlar yeterli.
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const user = data.session?.user;
      if (user) {
        setCurrentUser(buildUserFromSession(user));
      }
    });

    const { data: authSub } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (!user) return;
      setCurrentUser(buildUserFromSession(user));
    });

    return () => {
      active = false;
      authSub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!currentUser?.isAdmin) return;
    let active = true;
    supabase.auth.getSession().then(({ data: sessionData }) => {
      if (!active) return;
      const token = sessionData.session?.access_token;
      fetch('/api/list-orders', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!active || !data?.orders) return;
          setOrders(data.orders);
        })
        .catch(() => {});
    });
    return () => {
      active = false;
    };
  }, [currentUser?.isAdmin]);

  useEffect(() => {
    if (!currentUser?.email || currentUser.isAdmin) return;
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token;
      if (!token) return;

      fetch('/api/my-orders', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((payload) => {
          if (!active || !Array.isArray(payload?.orders)) return;
          const fetched = payload.orders as Order[];
          setOrders((prev) => {
            const existing = new Set(fetched.map((order) => order.id));
            return [...prev.filter((order) => !existing.has(order.id)), ...fetched];
          });

          const latest = fetched[0];
          const shouldFillAddress =
            Boolean(latest?.customerAddress) && !currentUser.address;
          const earnedPoints = 100 + fetched.length * 25;
          const nextPoints = Math.max(currentUser.points, earnedPoints);

          if (nextPoints !== currentUser.points || shouldFillAddress) {
            const updatedUser = {
              ...currentUser,
              points: nextPoints,
              phone: currentUser.phone || latest?.customerPhone,
              city: currentUser.city || latest?.customerCity,
              district: currentUser.district || latest?.customerDistrict,
              address: currentUser.address || latest?.customerAddress,
            };
            setCurrentUser(updatedUser);
            localStorage.setItem('tt_current_user', JSON.stringify(updatedUser));
            if (nextPoints !== currentUser.points) {
              supabase.auth.updateUser({ data: { points: nextPoints } }).catch(() => {});
            }
          }
        })
        .catch(() => {});
    });

    return () => {
      active = false;
    };
  }, [currentUser?.email, currentUser?.isAdmin, isProfileModalOpen]);

  useEffect(() => {
    if (!currentUser?.email) return;
    const channel = supabase
      .channel(`customer-orders-${currentUser.email}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `customer_email=eq.${currentUser.email}`,
        },
        (payload: any) => {
          const status = payload?.new?.status;
          if (status) showToast(`Siparişiniz güncellendi: ${status}`);
          setOrders((prev) =>
            prev.map((o) =>
              o.id === payload?.new?.id ? { ...o, status: status || o.status } : o
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.email]);

  const seo = useMemo(() => {
    if (currentGuide) {
      return {
        title: `${currentGuide.title} | TarhanaTerapi`,
        description: currentGuide.description,
        canonical: guideUrl(currentGuide),
        jsonLd: jsonLdForGuide(currentGuide),
      };
    }

    if (isGuideIndex) {
      return {
        title: 'Tarhana Rehberi: Kurutma, Saklama ve Bebek Beslenmesi | TarhanaTerapi',
        description:
          'Tarhana nasıl kurutulur, neden ekşir, bebeklere ne zaman verilir ve katkısız tarhana nasıl anlaşılır? Uygulamalı tarhana rehberleri.',
        canonical: `${SITE_URL}${GUIDE_INDEX_PATH}`,
        jsonLd: jsonLdForGuideIndex(),
      };
    }

    if (currentProduct) {
      return {
        title: `${currentProduct.name} — ${currentProduct.price} TL | TarhanaTerapi`,
        description: productSeoDescription(currentProduct),
        canonical: productUrl(currentProduct),
        jsonLd: jsonLdForRoute('products', currentProduct),
      };
    }

    const route: SiteRoute =
      (Object.keys(routePaths) as SiteRoute[]).find(
        (key) => routePaths[key] === normalizedPath
      ) ?? 'home';

    return {
      ...routeSeo[route],
      canonical: `${SITE_URL}${routePaths[route]}`,
      jsonLd: jsonLdForRoute(route),
    };
  }, [currentProduct, currentGuide, isGuideIndex, normalizedPath]);

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      <SeoHead
        title={seo.title}
        description={seo.description}
        canonical={seo.canonical}
        jsonLd={seo.jsonLd}
      />
      {/* Admin Real-Time Alert Notification Bar (Only visible to logged-in administrator) */}
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
        <style>{`@keyframes pageFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } } .page-fade-in { animation: pageFadeIn .45s ease both; }`}</style>
        <div key={activeTab} className="page-fade-in flex flex-col w-full min-h-[60vh]">
          {currentGuide && <GuidePage guide={currentGuide} />}
          {isGuideIndex && <GuidesPage />}

          {!currentGuide && !isGuideIndex && activeTab === 'home' && (
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
            <FaqSection />
            <NewsletterSection onDownloadEbook={handleDownloadEbook} />
          </div>
        )}

        {activeTab === 'products' &&
          (currentProduct ? (
            <ProductPage
              product={currentProduct}
              onAddToCart={(p) => handleAddToCart(p, 1)}
            />
          ) : (
            <ProductsPage
              onAddToCart={(p) => handleAddToCart(p, 1)}
              onSelectProduct={(p) => setSelectedProduct(p)}
            />
          ))}

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

        {activeTab === 'legal' && <KvkkPage />}
        </div>
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
        onSubscribe={(email) => handleCollectEmail(email, 'newsletter')}
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
