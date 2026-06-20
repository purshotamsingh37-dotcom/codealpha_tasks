export interface Profile {
  id: string;
  full_name: string;
  college_name: string;
  college_email: string;
  avatar_url?: string;
  phone?: string;
  bio?: string;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price?: number;
  original_price?: number;
  category_id: string;
  seller_id: string;
  listing_type: 'sell' | 'exchange' | 'donate';
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  images: string[];
  location?: string;
  is_available: boolean;
  is_featured: boolean;
  views: number;
  interested_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  category?: Category;
  seller?: Profile;
}

export interface Order {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  agreed_price?: number;
  meeting_location?: string;
  meeting_time?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  product?: Product;
  buyer?: Profile;
  seller?: Profile;
}

export interface Review {
  id: string;
  order_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer?: Profile;
  reviewee?: Profile;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Conversation {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  product?: Product;
  buyer?: Profile;
  seller?: Profile;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
}

export interface AIChatMessage {
  id: string;
  user_id: string;
  message: string;
  is_user: boolean;
  created_at: string;
}

export type ListingType = 'sell' | 'exchange' | 'donate';
export type ProductCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';
export type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
