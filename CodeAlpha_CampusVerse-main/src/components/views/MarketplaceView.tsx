import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Sliders,
  X,
  DollarSign,
  Gift,
  Repeat,
  Package,
  MapPin,
  ChevronDown,
  Grid,
  List,
} from 'lucide-react';
import { Product, Category } from '../../types/database';
import { supabase } from '../../lib/supabase';
import { ProductCard } from '../ProductCard';
import { useAuth } from '../../contexts/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';

interface MarketplaceViewProps {
  openProductDetail: (product: Product) => void;
}

export function MarketplaceView({ openProductDetail }: MarketplaceViewProps) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [listingType, setListingType] = useState<string>('');
  const [condition, setCondition] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [sortBy, setSortBy] = useState('newest');

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, [debouncedSearch, selectedCategory, listingType, condition, sortBy]);

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const loadProducts = async () => {
    setLoading(true);

    let query = supabase
      .from('products')
      .select('*, category:categories(*), seller:profiles(*)')
      .eq('is_available', true);

    if (debouncedSearch) {
      query = query.or(`title.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%,tags.cs.{${debouncedSearch}}`);
    }

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory);
    }

    if (listingType) {
      query = query.eq('listing_type', listingType);
    }

    if (condition) {
      query = query.eq('condition', condition);
    }

    switch (sortBy) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'price_low':
        query = query.order('price', { ascending: true });
        break;
      case 'price_high':
        query = query.order('price', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data } = await query.limit(50);
    setProducts(data || []);
    setLoading(false);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setListingType('');
    setCondition('');
    setPriceRange([0, 50000]);
    setSortBy('newest');
  };

  const activeFilterCount = [
    selectedCategory,
    listingType,
    condition,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            Marketplace
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse {products.length} items from verified sellers
          </p>
        </div>

        <div className="glass-card rounded-2xl p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, books, electronics..."
                className="w-full pl-12 pr-4 py-3 rounded-xl glass border border-white/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-xl flex items-center gap-2 transition-all ${
                  showFilters ? 'gradient-primary text-white' : 'glass glass-hover'
                }`}
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-white text-violet-600 text-xs font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="relative hidden lg:block">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none px-4 py-3 rounded-xl glass border border-white/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500 pr-10"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" />
              </div>

              <div className="hidden md:flex rounded-xl overflow-hidden glass">
                <button
                  onClick={() => setView('grid')}
                  className={`p-3 ${view === 'grid' ? 'gradient-primary text-white' : 'glass-hover'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-3 ${view === 'list' ? 'gradient-primary text-white' : 'glass-hover'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-white/10 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass border border-white/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Listing Type</label>
                  <select
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass border border-white/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none"
                  >
                    <option value="">All Types</option>
                    <option value="sell">For Sale</option>
                    <option value="exchange">Exchange</option>
                    <option value="donate">Donation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass border border-white/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none"
                  >
                    <option value="">Any Condition</option>
                    <option value="new">Brand New</option>
                    <option value="like_new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-3 rounded-xl glass border border-red-500/30 text-red-500 glass-hover flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className={`grid ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6`}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl h-80 animate-pulse">
                <div className="h-full bg-white/5 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className={`grid ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6`}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onView={() => openProductDetail(product)}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
