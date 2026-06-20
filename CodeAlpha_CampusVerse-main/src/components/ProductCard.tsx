import React from 'react';
import {
  Heart,
  MapPin,
  Clock,
  User,
  Repeat,
  Gift,
  DollarSign,
  Eye,
} from 'lucide-react';
import { Product } from '../types/database';

interface ProductCardProps {
  product: Product;
  onWishlist?: () => void;
  onView?: () => void;
  isWishlisted?: boolean;
}

const defaultImages = [
  'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/278935/pexels-photo-278935.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1337382/pexels-photo-1337382.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/4488776/pexels-photo-4488776.jpeg?auto=compress&cs=tinysrgb&w=400',
];

export function ProductCard({ product, onWishlist, onView, isWishlisted }: ProductCardProps) {
  const listingTypeIcons = {
    sell: { icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10', label: 'For Sale' },
    exchange: { icon: Repeat, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Exchange' },
    donate: { icon: Gift, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Free' },
  };

  const typeInfo = listingTypeIcons[product.listing_type];
  const TypeIcon = typeInfo.icon;

  const conditionLabels: Record<string, string> = {
    new: 'New',
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
  };

  const conditionColors: Record<string, string> = {
    new: 'bg-emerald-500',
    like_new: 'bg-green-400',
    good: 'bg-blue-400',
    fair: 'bg-yellow-400',
    poor: 'bg-orange-400',
  };

  const mainImage = product.images?.[0] || defaultImages[Math.floor(Math.random() * defaultImages.length)];
  const categoryName = product.category?.name || 'General';
  const timeAgo = getTimeAgo(new Date(product.created_at));

  return (
    <div
      onClick={onView}
      className="glass-card rounded-2xl overflow-hidden cursor-pointer group hover:scale-[1.02] transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={mainImage}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-3 py-1 rounded-full ${typeInfo.bg} ${typeInfo.color} text-xs font-medium flex items-center gap-1`}>
            <TypeIcon className="w-3 h-3" />
            {typeInfo.label}
          </span>
          <span className={`px-2 py-1 rounded-full ${conditionColors[product.condition]} text-white text-xs font-medium`}>
            {conditionLabels[product.condition]}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onWishlist?.();
          }}
          className="absolute top-3 right-3 p-2 rounded-full glass group/btn hover:scale-110 transition-all"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isWishlisted ? 'fill-red-500 text-red-500' : 'text-white group-hover/btn:text-red-400'
            }`}
          />
        </button>

        <div className="absolute bottom-3 left-3 right-3">
          <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs">
            {categoryName}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-black dark:text-white truncate">{product.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{product.description}</p>

        {product.price && (
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-xl font-bold text-gradient">₹{product.price.toLocaleString()}</span>
            {product.original_price && (
              <span className="text-sm text-gray-500 line-through">₹{product.original_price.toLocaleString()}</span>
            )}
          </div>
        )}

        {product.listing_type === 'exchange' && (
          <p className="text-sm text-blue-500 mt-2">Open for exchange</p>
        )}

        {product.listing_type === 'donate' && (
          <p className="text-sm text-orange-500 mt-2">Free donation</p>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            {product.seller?.avatar_url ? (
              <img
                src={product.seller.avatar_url}
                alt={product.seller.full_name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-white text-xs">
                {product.seller?.full_name?.charAt(0) || 'S'}
              </div>
            )}
            <span className="truncate max-w-[100px]">{product.seller?.full_name || 'Seller'}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {product.views}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) return `${Math.floor(days / 7)}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}
