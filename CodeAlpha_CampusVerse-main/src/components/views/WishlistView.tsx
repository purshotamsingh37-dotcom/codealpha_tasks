import React, { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Product } from '../../types/database';
import { ProductCard } from '../ProductCard';

interface WishlistViewProps {
  openProductDetail: (product: Product) => void;
}

export function WishlistView({ openProductDetail }: WishlistViewProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<(Product & { wishlistId: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadWishlist = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('wishlists')
      .select('id, product:products(*, category:categories(*), seller:profiles(*))')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) {
      setItems(
        data.map((item: any) => ({
          ...item.product,
          wishlistId: item.id,
        }))
      );
    }
    setLoading(false);
  };

  const removeFromWishlist = async (wishlistId: string) => {
    await supabase.from('wishlists').delete().eq('id', wishlistId);
    setItems(items.filter((i) => i.wishlistId !== wishlistId));
  };

  if (!user) {
    return (
      <div className="min-h-screen py-24 px-4">
        <div className="max-w-4xl mx-auto text-center glass-card rounded-2xl p-12">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">Sign in to view your wishlist</h2>
          <p className="text-gray-500">
            Save items you like and access them later from any device
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Wishlist</h1>
          <p className="text-gray-500 mt-1">{items.length} saved items</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl h-80 animate-pulse">
                <div className="h-full bg-white/5 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((product) => (
              <div key={product.id} className="relative group">
                <ProductCard
                  product={product}
                  onView={() => openProductDetail(product)}
                  isWishlisted
                />
                <button
                  onClick={() => removeFromWishlist(product.wishlistId)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500">
              Save items you like by clicking the heart icon
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
