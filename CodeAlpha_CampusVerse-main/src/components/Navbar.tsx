import React, { useState } from 'react';
import {
  ShoppingCart,
  Menu,
  X,
  Sun,
  Moon,
  User,
  LogOut,
  LayoutDashboard,
  Heart,
  MessageSquare,
  Settings,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  openAuth: () => void;
}

export function Navbar({ currentView, setCurrentView, openAuth }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'categories', label: 'Categories' },
  ];

  const handleSignOut = async () => {
    await signOut();
    setProfileOpen(false);
    setCurrentView('home');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-2 text-xl font-bold"
            >
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <span className="text-gradient hidden sm:block">CampusMart</span>
            </button>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    currentView === item.id
                      ? 'gradient-primary text-white'
                      : 'glass-hover text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg glass glass-hover"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setCurrentView('wishlist')}
              className="p-2 rounded-lg glass glass-hover relative"
            >
              <Heart className="w-5 h-5" />
            </button>

            <button
              onClick={() => setCurrentView('chat')}
              className="p-2 rounded-lg glass glass-hover relative"
            >
              <MessageSquare className="w-5 h-5" />
            </button>

            <button
              onClick={() => setCurrentView('assistant')}
              className="px-4 py-2 rounded-lg gradient-accent text-white font-medium hover:opacity-90 transition-all flex items-center gap-2"
            >
              <span className="text-lg font-bold">AI</span>
              Assistant
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg glass glass-hover"
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                      <span className="text-white font-medium">
                        {profile?.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <span className="hidden lg:block text-sm font-medium">
                    {profile?.full_name?.split(' ')[0] || 'User'}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass-card rounded-xl p-2 animate-fadeIn">
                    <button
                      onClick={() => {
                        setCurrentView('dashboard');
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg glass-hover text-left"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView('wishlist');
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg glass-hover text-left"
                    >
                      <Heart className="w-4 h-4" />
                      Wishlist
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView('orders');
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg glass-hover text-left"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Orders
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView('settings');
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg glass-hover text-left"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <hr className="my-2 border-white/10" />
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-all text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuth}
                className="px-4 py-2 rounded-lg gradient-primary text-white font-medium hover:opacity-90 transition-all"
              >
                Sign In
              </button>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg glass"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-4 space-y-2 glass border-t border-white/10">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                currentView === item.id
                  ? 'gradient-primary text-white'
                  : 'glass-hover text-gray-700 dark:text-gray-300'
              }`}
            >
              {item.label}
            </button>
          ))}

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={toggleTheme}
              className="p-3 rounded-lg glass glass-hover flex-1 flex items-center justify-center gap-2"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button
              onClick={() => setCurrentView('assistant')}
              className="p-3 rounded-lg gradient-accent text-white flex-1 flex items-center justify-center gap-2"
            >
              <span className="font-bold">AI</span>
              Assistant
            </button>
          </div>

          {user ? (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  setCurrentView('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg glass-hover text-left"
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </button>
              <button
                onClick={() => {
                  setCurrentView('wishlist');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg glass-hover text-left"
              >
                <Heart className="w-5 h-5" />
                Wishlist
              </button>
              <button
                onClick={() => {
                  handleSignOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10 transition-all text-left"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                openAuth();
                setMobileMenuOpen(false);
              }}
              className="w-full px-4 py-3 rounded-lg gradient-primary text-white font-medium hover:opacity-90 transition-all mt-2"
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
