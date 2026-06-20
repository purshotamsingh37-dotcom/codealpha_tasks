import React, { useState, useEffect } from 'react';
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Eye,
  Heart,
  Star,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Product, Order } from '../../types/database';

export function DashboardView() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'listings' | 'orders' | 'analytics'>('listings');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ views: 0, messages: 0, completed: 0, earnings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);

    const { data: myProducts } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('seller_id', user?.id)
      .order('created_at', { ascending: false });

    const { data: buyerOrders } = await supabase
      .from('orders')
      .select('*, product:products(*, category:categories(*)), buyer:profiles(*), seller:profiles(*)')
      .eq('buyer_id', user?.id)
      .order('created_at', { ascending: false });

    const { data: sellerOrders } = await supabase
      .from('orders')
      .select('*, product:products(*, category:categories(*)), buyer:profiles(*), seller:profiles(*)')
      .eq('seller_id', user?.id);

    const allOrders = [...(buyerOrders || []), ...(sellerOrders || [])].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setProducts(myProducts || []);
    setOrders(allOrders);

    const totalViews = myProducts?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;
    const completedOrders = allOrders.filter((o) => o.status === 'completed');
    const totalEarnings = completedOrders.reduce((sum, o) => sum + (o.agreed_price || 0), 0);

    setStats({
      views: totalViews,
      messages: 0,
      completed: completedOrders.length,
      earnings: totalEarnings,
    });

    setLoading(false);
  };

  const toggleAvailability = async (productId: string, currentStatus: boolean) => {
    await supabase
      .from('products')
      .update({ is_available: !currentStatus })
      .eq('id', productId);
    loadData();
  };

  const deleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      await supabase.from('products').delete().eq('id', productId);
      loadData();
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    loadData();
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-500',
    accepted: 'bg-green-500/20 text-green-500',
    rejected: 'bg-red-500/20 text-red-500',
    completed: 'bg-blue-500/20 text-blue-500',
    cancelled: 'bg-gray-500/20 text-gray-500',
  };

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your listings and orders</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <Eye className="w-5 h-5" />, label: 'Total Views', value: stats.views, color: 'cyan' },
            { icon: <MessageSquare className="w-5 h-5" />, label: 'Messages', value: stats.messages, color: 'violet' },
            { icon: <Check className="w-5 h-5" />, label: 'Completed', value: stats.completed, color: 'green' },
            { icon: <DollarSign className="w-5 h-5" />, label: 'Earnings', value: `₹${stats.earnings.toLocaleString()}`, color: 'emerald' },
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/20 text-${stat.color}-500 flex items-center justify-center`}>
                  {stat.icon}
                </div>
                <span className="text-xs text-gray-500">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="flex border-b border-white/10">
            {(['listings', 'orders', 'analytics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-4 font-medium transition-all ${
                  activeTab === tab
                    ? 'gradient-primary text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 glass rounded-xl animate-pulse" />
                ))}
              </div>
            ) : activeTab === 'listings' ? (
              products.length > 0 ? (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="glass rounded-xl p-4 flex items-center gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={product.images?.[0] || 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=200'}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{product.title}</h3>
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              product.is_available
                                ? 'bg-green-500/20 text-green-500'
                                : 'bg-red-500/20 text-red-500'
                            }`}
                          >
                            {product.is_available ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{product.category?.name}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {product.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" /> {product.interested_count}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <p className="font-semibold">
                          {product.price ? `₹${product.price.toLocaleString()}` : product.listing_type}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleAvailability(product.id, product.is_available)}
                            className="p-2 rounded-lg glass glass-hover"
                            title={product.is_available ? 'Deactivate' : 'Activate'}
                          >
                            {product.is_available ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="p-2 rounded-lg glass text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">No Listings Yet</h3>
                  <p className="text-gray-500">Create your first listing to start selling</p>
                </div>
              )
            ) : activeTab === 'orders' ? (
              orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="glass rounded-xl p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{order.product?.title}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs ${statusColors[order.status]}`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {order.buyer_id === user?.id ? `Seller: ${order.seller?.full_name}` : `Buyer: ${order.buyer?.full_name}`}
                          </p>
                        </div>
                        <p className="font-semibold">
                          {order.agreed_price ? `₹${order.agreed_price.toLocaleString()}` : 'N/A'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>

                        {order.seller_id === user?.id && order.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateOrderStatus(order.id, 'accepted')}
                              className="px-3 py-1 rounded-lg bg-green-500/20 text-green-500 text-sm hover:bg-green-500/30"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'rejected')}
                              className="px-3 py-1 rounded-lg bg-red-500/20 text-red-500 text-sm hover:bg-red-500/30"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {order.status === 'accepted' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            className="px-3 py-1 rounded-lg gradient-primary text-white text-sm"
                          >
                            Mark Completed
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
                  <p className="text-gray-500">Your order history will appear here</p>
                </div>
              )
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass rounded-xl p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-violet-500" />
                    Listing Performance
                  </h3>
                  <div className="space-y-3">
                    {products.slice(0, 5).map((p) => (
                      <div key={p.id} className="flex justify-between items-center">
                        <span className="text-sm truncate max-w-[200px]">{p.title}</span>
                        <span className="text-sm text-gray-500">{p.views} views</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-xl p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Seller Rating
                  </h3>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-gradient">
                      {profile?.rating?.toFixed(1) || '0.0'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Based on {profile?.total_reviews || 0} reviews
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
