import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Camera,
  Tag,
  MapPin,
  DollarSign,
  Package,
  Gift,
  Repeat,
  Image as ImageIcon,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Category, ListingType, ProductCondition } from '../types/database';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const stockImages = [
  'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/278935/pexels-photo-278935.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1337382/pexels-photo-1337382.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/5082570/pexels-photo-5082570.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/4488776/pexels-photo-4488776.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/18105/fashion-person-girl-bracelet.jpg?auto=compress&cs=tinysrgb&w=600',
];

export function CreateListingModal({ isOpen, onClose, onSuccess }: CreateListingModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [listingType, setListingType] = useState<ListingType>('sell');
  const [condition, setCondition] = useState<ProductCondition>('good');
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const listingTypes: { value: ListingType; label: string; icon: React.ReactNode }[] = [
    { value: 'sell', label: 'Sell', icon: <DollarSign className="w-4 h-4" /> },
    { value: 'exchange', label: 'Exchange', icon: <Repeat className="w-4 h-4" /> },
    { value: 'donate', label: 'Donate', icon: <Gift className="w-4 h-4" /> },
  ];

  const conditions: { value: ProductCondition; label: string }[] = [
    { value: 'new', label: 'Brand New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
  ];

  const addImage = () => {
    if (images.length < 5) {
      setImages([...images, stockImages[Math.floor(Math.random() * stockImages.length)]]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    if (images.length === 0) {
      setError('Please add at least one image');
      setLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase.from('products').insert({
        title,
        description,
        price: listingType === 'donate' ? null : parseFloat(price) || null,
        original_price: listingType === 'donate' ? null : parseFloat(originalPrice) || null,
        category_id: categoryId || null,
        seller_id: user.id,
        listing_type: listingType,
        condition,
        images,
        location,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      });

      if (insertError) {
        setError(insertError.message);
      } else {
        onSuccess();
        onClose();
        resetForm();
      }
    } catch (e) {
      setError('An unexpected error occurred');
    }

    setLoading(false);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setOriginalPrice('');
    setCategoryId('');
    setListingType('sell');
    setCondition('good');
    setImages([]);
    setLocation('');
    setTags('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto glass-card rounded-2xl p-6 animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full glass glass-hover"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gradient">Create New Listing</h2>
          <p className="text-gray-500 mt-1">List your item for sale, exchange, or donation</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Listing Type</label>
            <div className="grid grid-cols-3 gap-3">
              {listingTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setListingType(type.value)}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    listingType === type.value
                      ? 'border-violet-500 bg-violet-500/10 text-violet-500'
                      : 'border-white/20 glass-hover'
                  }`}
                >
                  {type.icon}
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="What are you listing?"
              className="w-full px-4 py-3 rounded-xl glass border border-white/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="Describe your item in detail..."
              className="w-full px-4 py-3 rounded-xl glass border border-white/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>

          {listingType !== 'donate' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price (₹) *</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required={listingType === 'sell'}
                  min="0"
                  step="1"
                  placeholder="Selling price"
                  className="w-full px-4 py-3 rounded-xl glass border border-white/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Original Price (₹)</label>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  min="0"
                  step="1"
                  placeholder="Optional"
                  className="w-full px-4 py-3 rounded-xl glass border border-white/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass border border-white/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ProductCondition)}
                className="w-full px-4 py-3 rounded-xl glass border border-white/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {conditions.map((cond) => (
                  <option key={cond.value} value={cond.value}>
                    {cond.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Images ({images.length}/5) *
            </label>
            <div className="flex flex-wrap gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Minus className="w-6 h-6 text-white" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <button
                  type="button"
                  onClick={addImage}
                  className="w-24 h-24 rounded-xl glass border border-dashed border-white/30 flex items-center justify-center glass-hover"
                >
                  <Plus className="w-6 h-6 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where can buyers find this?"
                className="w-full pl-12 pr-4 py-3 rounded-xl glass border border-white/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Separate tags with commas"
                className="w-full pl-12 pr-4 py-3 rounded-xl glass border border-white/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl glass border border-white/20 font-medium glass-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create Listing
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
