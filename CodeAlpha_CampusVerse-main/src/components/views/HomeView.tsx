import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  BookOpen,
  Laptop,
  Home,
  Bike,
  Lightbulb,
  FileText,
  ShoppingCart,
  TrendingUp,
  Users,
  Star,
} from 'lucide-react';
import { Product, Category } from '../../types/database';
import { supabase } from '../../lib/supabase';
import { ProductCard } from '../ProductCard';

interface HomeViewProps {
  setCurrentView: (view: string) => void;
  openAuth: () => void;
  openProductDetail: (product: Product) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  Books: <BookOpen className="w-6 h-6" />,
  Notes: <FileText className="w-6 h-6" />,
  Electronics: <Laptop className="w-6 h-6" />,
  'Hostel Essentials': <Home className="w-6 h-6" />,
  Cycles: <Bike className="w-6 h-6" />,
  Projects: <Lightbulb className="w-6 h-6" />,
};

export function HomeView({ setCurrentView, openAuth, openProductDetail }: HomeViewProps) {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState({ products: 0, users: 0, colleges: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    const { data: productsData } = await supabase
      .from('products')
      .select('*, category:categories(*), seller:profiles(*)')
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .limit(8);

    const { data: categoriesData } = await supabase.from('categories').select('*');

    setFeaturedProducts(productsData || []);
    setCategories(categoriesData || []);
    setStats({
      products: (productsData?.length || 0) * 100,
      users: 50,
      colleges: 12,
    });

    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-cyan-500/20 animate-pulse-slow" />
          <div className="absolute top-20 left-20 w-72 h-72 bg-violet-500/30 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl">
          <div className="inline-flex items-center px-4 py-2 rounded-full glass mb-6 animate-fadeIn">
            <span className="text-sm font-medium text-gradient">Exclusively for College Students</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="block">Buy, Sell & Exchange</span>
            <span className="text-gradient bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Campus Essentials
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            The AI-powered marketplace connecting students across colleges. Trade books, electronics,
            hostel items, and more with verified campus members.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setCurrentView('marketplace')}
              className="px-8 py-4 rounded-xl gradient-primary text-white font-semibold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 group"
            >
              Explore Marketplace
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setCurrentView('assistant')}
              className="px-8 py-4 rounded-xl glass border border-white/20 font-semibold text-lg glass-hover flex items-center justify-center gap-2"
            >
              <span className="text-lg font-bold text-gradient">AI</span>
              Try AI Assistant
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg mx-auto">
            {[
              { value: `${stats.products}+`, label: 'Products' },
              { value: `${stats.users}+`, label: 'Students' },
              { value: `${stats.colleges}+`, label: 'Colleges' },
            ].map((stat, i) => (
              <div key={i} className="glass rounded-xl p-4">
                <p className="text-2xl font-bold text-gradient">{stat.value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Browse by Category
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Find exactly what you need across our curated categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, i) => (
              <button
                key={category.id}
                onClick={() => setCurrentView(`category-${category.slug}`)}
                className="glass-card rounded-2xl p-6 flex flex-col items-center gap-3 hover:scale-105 transition-all group animate-fadeIn"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  {categoryIcons[category.name] || <ShoppingCart className="w-6 h-6" />}
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
                Featured Listings
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Discover top items from verified sellers
              </p>
            </div>
            <button
              onClick={() => setCurrentView('marketplace')}
              className="hidden md:flex items-center gap-2 text-violet-500 hover:text-violet-400 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl h-80 animate-pulse">
                  <div className="h-full bg-white/5 rounded-2xl" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, i) => (
                <div
                  key={product.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <ProductCard
                    product={product}
                    onView={() => openProductDetail(product)}
                    showWishlistBadge
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No Products Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Be the first to list an item on CampusMart!
              </p>
              <button
                onClick={openAuth}
                className="px-6 py-3 rounded-xl gradient-primary text-white font-medium"
              >
                Get Started
              </button>
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <button
              onClick={() => setCurrentView('marketplace')}
              className="text-violet-500 hover:text-violet-400 transition-colors flex items-center gap-2 mx-auto"
            >
              View All Products <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 relative bg-gradient-to-br from-violet-600/10 via-indigo-600/5 to-cyan-500/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                Smart Features for <span className="text-gradient">Smart Students</span>
              </h2>

              <div className="space-y-6">
                {[
                  {
                    icon: <TrendingUp className="w-6 h-6" />,
                    title: 'AI-Powered Recommendations',
                    desc: 'Get personalized product suggestions based on your preferences and budget',
                  },
                  {
                    icon: <Users className="w-6 h-6" />,
                    title: 'Verified Campus Network',
                    desc: 'Trade with confidence knowing all users are verified college students',
                  },
                  {
                    icon: <Star className="w-6 h-6" />,
                    title: 'Seller Ratings & Reviews',
                    desc: 'Make informed decisions with our transparent review system',
                  },
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="flex gap-4 items-start glass rounded-xl p-4 glass-hover"
                  >
                    <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center text-white flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/20 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-500/20 rounded-full blur-2xl" />

              <div className="relative space-y-6">
                <h3 className="text-xl font-semibold">Try Natural Language Search</h3>
                <div className="glass rounded-xl p-4">
                  <p className="text-sm text-gray-500 italic">
                    "I need a second-hand mechanical engineering book under Rs. 500"
                  </p>
                </div>
                <button
                  onClick={() => setCurrentView('assistant')}
                  className="w-full py-4 rounded-xl gradient-accent text-white font-semibold hover:opacity-90 transition-all"
                >
                  Ask AI Assistant
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
