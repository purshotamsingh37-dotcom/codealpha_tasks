import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  MapPin,
  Clock,
  User,
  MessageSquare,
  Tag,
  Package,
  ChevronLeft,
  ChevronRight,
  Share2,
  ShoppingCart,
  Star,
  Phone,
  Mail,
} from 'lucide-react';
import { Product } from '../types/database';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated?: () => void;
}

export function ProductDetailModal({ product, isOpen, onClose, onOrderCreated }: ProductDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { user } = useAuth();

  const defaultImages = [
    'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/278935/pexels-photo-278935.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=600',
  ];

  const images = product.images?.length > 0 ? product.images : defaultImages;

  useEffect(() => {
    if (user && isOpen) {
      checkWishlist();
    }
  }, [user, isOpen]);

  const checkWishlist = async () => {
    const { data } = await supabase
      .from('wishlists')
      .select()
      .eq('user_id', user?.id)
      .eq('product_id', product.id)
      .single();
    setIsWishlisted(!!data);
  };

  const toggleWishlist = async () => {
    if (!user) return;

    if (isWishlisted) {
      await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', product.id);
    } else {
      await supabase
        .from('wishlists')
        .insert({ user_id: user.id, product_id: product.id });
    }
    setIsWishlisted(!isWishlisted);
  };

  const handleContact = async () => {
    if (!user || !message.trim()) return;
    setSending(true);

    try {
      const { data: existing } = await supabase
        .from('conversations')
        .select()
        .eq('product_id', product.id)
        .eq('buyer_id', user.id)
        .eq('seller_id', product.seller_id)
        .single();

      let conversationId = existing?.id;

      if (!conversationId) {
        const { data: newConv } = await supabase
          .from('conversations')
          .insert({
            product_id: product.id,
            buyer_id: user.id,
            seller_id: product.seller_id,
          })
          .select()
          .single();
        conversationId = newConv?.id;
      }

      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: message,
      });

      setMessage('');
      onClose();
    } catch (e) {
      console.error('Error sending message:', e);
    }

    setSending(false);
  };

  const handleInitiateOrder = async () => {
    if (!user || user.id === product.seller_id) return;
    setSending(true);

    try {
      const { error } = await supabase.from('orders').insert({
        product_id: product.id,
        buyer_id: user.id,
        seller_id: product.seller_id,
        status: 'pending',
        agreed_price: product.price,
      });

      if (!error) {
        onOrderCreated?.();
        onClose();
      }
    } catch (e) {
      console.error('Error creating order:', e);
    }

    setSending(false);
  };

  if (!isOpen) return null;

  const conditionLabels: Record<string, string> = {
    new: 'Brand New',
    like_new: 'Like New',
    good: 'Good Condition',
    fair: 'Fair Condition',
    poor: 'Used - Wear Visible',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-4xl max-h-[90vh] glass-card rounded-2xl overflow-hidden animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full glass glass-hover"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row h-full max-h-[90vh] overflow-auto">
          <div className="md:w-1/2 relative bg-black/20">
            <div className="aspect-square relative">
              <img
                src={images[currentImageIndex]}
                alt={product.title}
                className="w-full h-full object-cover"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full glass glass-hover"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full glass glass-hover"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {product.listing_type === 'donate' && (
                <div className="absolute top-4 left-4 px-4 py-2 rounded-full bg-orange-500 text-white font-medium">
                  Free Donation
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex justify-center gap-2 p-4">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentImageIndex ? 'w-6 gradient-primary' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="md:w-1/2 p-6 overflow-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">
                  {product.category?.name}
                </span>
                <h2 className="text-2xl font-bold mt-1">{product.title}</h2>
              </div>
              <button
                onClick={toggleWishlist}
                className="p-2 rounded-lg glass glass-hover"
              >
                <Heart
                  className={`w-6 h-6 transition-colors ${
                    isWishlisted ? 'fill-red-500 text-red-500' : ''
                  }`}
                />
              </button>
            </div>

            {product.price && (
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-bold text-gradient">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.original_price && (
                  <span className="text-lg text-gray-500 line-through">
                    ₹{product.original_price.toLocaleString()}
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 rounded-full text-sm glass">
                <Package className="w-3 h-3 inline mr-1" />
                {conditionLabels[product.condition]}
              </span>
              <span className="px-3 py-1 rounded-full text-sm glass">
                <MapPin className="w-3 h-3 inline mr-1" />
                {product.location || 'Campus Location'}
              </span>
              <span className="px-3 py-1 rounded-full text-sm glass">
                <Clock className="w-3 h-3 inline mr-1" />
                {new Date(product.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

            {product.tags?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs bg-violet-500/10 text-violet-500"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="glass rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                {product.seller?.avatar_url ? (
                  <img
                    src={product.seller.avatar_url}
                    alt={product.seller.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white text-xl">
                    {product.seller?.full_name?.charAt(0) || 'S'}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold">{product.seller?.full_name}</p>
                  <p className="text-sm text-gray-500">
                    {product.seller?.college_name}
                  </p>
                  {product.seller?.rating !== undefined && product.seller.rating > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(product.seller!.rating)
                              ? 'fill-yellow-500 text-yellow-500'
                              : 'text-gray-400'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">
                        ({product.seller.total_reviews})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {user?.id !== product.seller_id && (
              <>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a message to the seller..."
                  rows={3}
                  className="w-full p-3 rounded-xl glass border border-white/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none mb-4"
                />

                <div className="flex gap-3">
                  <button
                    onClick={handleContact}
                    disabled={sending || !message.trim()}
                    className="flex-1 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-5 h-5" />
                    {sending ? 'Sending...' : 'Send Message'}
                  </button>

                  {product.listing_type !== 'donate' && product.price && (
                    <button
                      onClick={handleInitiateOrder}
                      disabled={sending}
                      className="py-3 px-6 rounded-xl glass border border-violet-500 text-violet-500 font-semibold hover:bg-violet-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Buy Now
                    </button>
                  )}

                  {product.listing_type === 'donate' && (
                    <button
                      onClick={handleInitiateOrder}
                      disabled={sending}
                      className="py-3 px-6 rounded-xl gradient-secondary text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Gift className="w-5 h-5" />
                      Request Item
                    </button>
                  )}
                </div>
              </>
            )}

            {user?.id === product.seller_id && (
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-gray-500">This is your listing</p>
                <p className="text-sm text-violet-500 mt-1">
                  Use the dashboard to manage this product
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
