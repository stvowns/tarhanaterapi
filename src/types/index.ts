export interface Product {
  id: string;
  name: string;
  tag?: string;
  tagColor?: 'primary' | 'secondary' | 'tertiary' | 'primary-container';
  description: string;
  details: string;
  price: number;
  originalPrice?: number;
  weight: string;
  image: string;
  category: 'classic' | 'spicy' | 'baby' | 'sets' | 'pantry';
  ingredients: string[];
  nutrition: {
    calories: number; // kcal / 100g
    protein: string;
    fiber: string;
    carbs: string;
    fat: string;
  };
  inStock: boolean;
  isPopular?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedWeight: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  district?: string;
  address?: string;
  points: number; // Şifa Puanı
  isAdmin?: boolean;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  weight: string;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerDistrict: string;
  deliveryNote?: string;
  /** cod/credit_card yalnızca eski sipariş kayıtları için korunur; yeni ödeme akışı bank_transfer gönderir. */
  paymentMethod: 'cod' | 'bank_transfer' | 'credit_card';
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: 'Yeni Sipariş' | 'Hazırlanıyor' | 'Kargoya Verildi' | 'Tamamlandı';
  createdAt: string;
}

export interface SubscriberLead {
  id: string;
  email: string;
  source: 'ebook' | 'newsletter';
  createdAt: string;
}

export interface Review {
  id: string;
  author: string;
  initials: string;
  location: string;
  rating: number;
  date: string;
  content: string;
  productName: string;
  avatarColor: 'primary' | 'secondary' | 'tertiary';
}

export interface Ingredient {
  id: number;
  number: number;
  name: string;
  description: string;
  source: string;
  benefits: string[];
  iconName: string;
  badgeBg: string;
}

export interface CookingStep {
  number: string;
  title: string;
  description: string;
  durationMinutes?: number;
  tip?: string;
  badgeBg: string;
}

export interface Recipe {
  id: string;
  title: string;
  subtitle: string;
  prepTime: string;
  servings: string;
  difficulty: string;
  ingredients: string[];
  steps: string[];
  chefNote: string;
  servingIdea?: string;
}

export type ActiveTab = 'home' | 'products' | 'ingredients' | 'story' | 'reviews' | 'contact' | 'legal';
