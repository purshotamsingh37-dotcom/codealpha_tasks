import React, { useState, useEffect } from 'react';
import { BookOpen, Laptop, Home, Bike, Lightbulb, FileText, Package, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Category, Product } from '../../types/database';
import { ProductCard } from '../ProductCard';

interface CategoriesViewProps {
  openProductDetail: (product: Product) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  Books: <BookOpen className="w-8 h-8" />,
  Notes: <FileText className="w-8 h-8" />,
  Electronics: <Laptop className="w-8 h-8" />,
  'Hostel Essentials': <Home className="w-8 h-8" />,
  Cycles: <Bike className="w-8 h-8" />,
  Projects: <Lightbulb className="w-8 h-8" />,
};

export function CategoriesView({ openProductDetail }: CategoriesViewProps) {
  const [categories, setCategories] = useState<(Category & { productCount: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data: cats } = await supabase.from('categories').select('*').order('name');

    if (cats) {
      const withCounts = await Promise.all(
        cats.map(async (cat) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', cat.id)
            .eq('is_available', true);
          return { ...cat, productCount: count || 0 };
        })
      );
      setCategories(withCounts);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse products by category
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl h-40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, i) => (
              <button
                key={category.id}
                onClick={() => window.location.hash = `category-${category.slug}`}
                className="glass-card rounded-2xl p-6 flex flex-col items-center text-center hover:scale-105 transition-all group animate-fadeIn"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  {categoryIcons[category.name] || <Package className="w-8 h-8" />}
                </div>
                <h3 className="text-xl font-semibold mb-1">{category.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{category.description}</p>
                <div className="flex items-center gap-2 text-violet-500">
                  <span className="text-sm font-medium">{category.productCount} items</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
