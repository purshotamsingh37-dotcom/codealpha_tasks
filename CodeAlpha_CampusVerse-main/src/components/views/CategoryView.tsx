import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Product, Category } from '../../types/database';
import { ProductCard } from '../ProductCard';

interface CategoryViewProps {
  slug: string;
  setCurrentView: (view: string) => void;
  openProductDetail: (product: Product) => void;
}

export function CategoryView({ slug, setCurrentView, openProductDetail }: CategoryViewProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [slug]);

  const loadData = async () => {
    setLoading(true);

    const { data: catData } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (catData) {
      setCategory(catData);

      const { data: productsData } = await supabase
        .from('products')
        .select('*, category:categories(*), seller:profiles(*)')
        .eq('category_id', catData.id)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      setProducts(productsData || []);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => setCurrentView('categories')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Categories
        </button>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : category ? (
          <>
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
                {category.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{category.description}</p>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                <h3 className="text-xl font-semibold mb-2">No products in this category</h3>
                <p className="text-gray-500">Check back later for new listings</p>
              </div>
            )}
          </>
        ) : (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">Category not found</h3>
          </div>
        )}
      </div>
    </div>
  );
}
