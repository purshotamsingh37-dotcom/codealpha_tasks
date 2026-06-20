import React, { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { CreateListingModal } from './components/CreateListingModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { HomeView } from './components/views/HomeView';
import { MarketplaceView } from './components/views/MarketplaceView';
import { CategoriesView } from './components/views/CategoriesView';
import { CategoryView } from './components/views/CategoryView';
import { AIAssistantView } from './components/views/AIAssistantView';
import { DashboardView } from './components/views/DashboardView';
import { WishlistView } from './components/views/WishlistView';
import { ChatView } from './components/views/ChatView';
import { Product } from './types/database';

function AppContent() {
  const { loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [authOpen, setAuthOpen] = useState(false);
  const [createListingOpen, setCreateListingOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showSellButton, setShowSellButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowSellButton(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash.startsWith('category-')) {
      setCurrentView(hash);
    }
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-violet-500 mx-auto" />
          <p className="mt-4 text-gray-400">Loading CampusMart...</p>
        </div>
      </div>
    );
  }

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
  };

  const renderView = () => {
    if (currentView.startsWith('category-')) {
      const slug = currentView.replace('category-', '');
      return (
        <CategoryView
          slug={slug}
          setCurrentView={setCurrentView}
          openProductDetail={openProductDetail}
        />
      );
    }

    switch (currentView) {
      case 'marketplace':
        return <MarketplaceView openProductDetail={openProductDetail} />;
      case 'categories':
        return <CategoriesView openProductDetail={openProductDetail} />;
      case 'assistant':
        return <AIAssistantView openProductDetail={openProductDetail} />;
      case 'dashboard':
        return <DashboardView />;
      case 'wishlist':
        return <WishlistView openProductDetail={openProductDetail} />;
      case 'chat':
        return <ChatView />;
      default:
        return (
          <HomeView
            setCurrentView={setCurrentView}
            openAuth={() => setAuthOpen(true)}
            openProductDetail={openProductDetail}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 dark:bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        openAuth={() => setAuthOpen(true)}
      />

      <main className="relative z-10">{renderView()}</main>

      <button
        onClick={() => setCreateListingOpen(true)}
        className={`fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full gradient-primary text-white shadow-lg flex items-center justify-center hover:scale-110 transition-all ${
          showSellButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        title="Sell an item"
      >
        <Plus className="w-6 h-6" />
      </button>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      <CreateListingModal
        isOpen={createListingOpen}
        onClose={() => setCreateListingOpen(false)}
        onSuccess={() => setCurrentView('dashboard')}
      />

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={closeProductDetail}
        />
      )}

      <footer className="relative z-10 border-t border-white/10 glass mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-3">Categories</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><button onClick={() => setCurrentView('category-books')} className="hover:text-violet-500">Books</button></li>
                <li><button onClick={() => setCurrentView('category-electronics')} className="hover:text-violet-500">Electronics</button></li>
                <li><button onClick={() => setCurrentView('category-cycles')} className="hover:text-violet-500">Cycles</button></li>
                <li><button onClick={() => setCurrentView('category-hostel')} className="hover:text-violet-500">Hostel Essentials</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><button onClick={() => setCurrentView('marketplace')} className="hover:text-violet-500">Marketplace</button></li>
                <li><button onClick={() => setCurrentView('assistant')} className="hover:text-violet-500">AI Assistant</button></li>
                <li><button onClick={() => setCurrentView('dashboard')} className="hover:text-violet-500">Dashboard</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-violet-500">Help Center</a></li>
                <li><a href="#" className="hover:text-violet-500">Safety Tips</a></li>
                <li><a href="#" className="hover:text-violet-500">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-violet-500">Terms of Service</a></li>
                <li><a href="#" className="hover:text-violet-500">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">2024 CampusMart AI. All rights reserved.</p>
            <p className="text-sm text-gray-500">Made with love for students</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
