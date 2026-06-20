import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  ShoppingBag,
  Search,
  Lightbulb,
  TrendingUp,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Product } from '../../types/database';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: Product[];
}

interface AIAssistantViewProps {
  openProductDetail: (product: Product) => void;
}

const quickActions = [
  { label: 'Find textbooks under Rs. 500', icon: <Search className="w-4 h-4" /> },
  { label: 'Electronics for my hostel', icon: <ShoppingBag className="w-4 h-4" /> },
  { label: 'Best deals on cycles', icon: <TrendingUp className="w-4 h-4" /> },
  { label: 'What can I exchange?', icon: <Lightbulb className="w-4 h-4" /> },
];

export function AIAssistantView({ openProductDetail }: AIAssistantViewProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadChatHistory();
    } else {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: "Hi! I'm your CampusMart AI Assistant. I can help you find products, recommend items based on your budget, and answer questions about the marketplace. How can I help you today?",
        },
      ]);
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatHistory = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('ai_chat_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(20);

    if (data && data.length > 0) {
      const hist: Message[] = data.map((d) => ({
        id: d.id,
        role: d.is_user ? 'user' : 'assistant',
        content: d.message,
      }));
      setMessages([
        {
          id: 'intro',
          role: 'assistant',
          content: "Hi! I'm your CampusMart AI Assistant. I can help you find products, recommend items based on your budget, and answer questions about the marketplace. How can I help you today?",
        },
        ...hist,
      ]);
    } else {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: "Hi! I'm your CampusMart AI Assistant. I can help you find products, recommend items based on your budget, and answer questions about the marketplace. How can I help you today?",
        },
      ]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: userMessage };
    setMessages((prev) => [...prev, userMsg]);

    if (user) {
      await supabase.from('ai_chat_history').insert({
        user_id: user.id,
        message: userMessage,
        is_user: true,
      });
    }

    const response = await processQuery(userMessage);

    await supabase.from('ai_chat_history').insert({
      user_id: user.id,
      message: response.content,
      is_user: false,
    });

    setMessages((prev) => [...prev, response]);
    setLoading(false);
  };

  const processQuery = async (query: string): Promise<Message> => {
    const lowerQuery = query.toLowerCase();

    const priceMatch = lowerQuery.match(/(?:under|below|less than|cheaper than|rs\.?\s*|₹)\s*(\d+)/);
    const maxPrice = priceMatch ? parseInt(priceMatch[1]) : null;

    let categoryHint: string | null = null;
    if (lowerQuery.includes('book') || lowerQuery.includes('textbook')) categoryHint = 'books';
    if (lowerQuery.includes('electronic') || lowerQuery.includes('laptop') || lowerQuery.includes('phone'))
      categoryHint = 'electronics';
    if (lowerQuery.includes('cycle') || lowerQuery.includes('bike') || lowerQuery.includes('bicycle'))
      categoryHint = 'cycles';
    if (lowerQuery.includes('hostel') || lowerQuery.includes('room')) categoryHint = 'hostel';
    if (lowerQuery.includes('note') || lowerQuery.includes('study material')) categoryHint = 'notes';

    let needDonation = lowerQuery.includes('free') || lowerQuery.includes('donate');
    let needExchange = lowerQuery.includes('exchange') || lowerQuery.includes('swap') || lowerQuery.includes('trade');

    let searchQuery = supabase
      .from('products')
      .select('*, category:categories(*), seller:profiles(*)')
      .eq('is_available', true);

    if (maxPrice) {
      searchQuery = searchQuery.or(`price.lte.${maxPrice},price.is.null`);
    }

    if (needDonation) {
      searchQuery = searchQuery.eq('listing_type', 'donate');
    } else if (needExchange) {
      searchQuery = searchQuery.eq('listing_type', 'exchange');
    }

    if (categoryHint) {
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .ilike('slug', `%${categoryHint}%`);
      if (catData && catData.length > 0) {
        searchQuery = searchQuery.in('category_id', catData.map((c) => c.id));
      }
    }

    if (!maxPrice && !needDonation && !needExchange && !categoryHint) {
      const keywords = query.split(/[\s,]+/).filter((w) => w.length > 2);
      if (keywords.length > 0) {
        searchQuery = searchQuery.or(
          keywords
            .map((k) => `title.ilike.%${k}%,description.ilike.%${k}%`)
            .join(',')
        );
      }
    }

    const { data: products } = await searchQuery.order('created_at').limit(6);

    if (products && products.length > 0) {
      let responseText = `I found ${products.length} item${products.length > 1 ? 's' : ''} that match your request`;

      if (maxPrice) {
        responseText += ` under ₹${maxPrice}`;
      }
      responseText += '. Here are some options:\n\n';

      products.forEach((p, i) => {
        responseText += `${i + 1}. **${p.title}** - `;
        if (p.price) {
          responseText += `₹${p.price} (${p.condition.replace('_', ' ')})`;
        } else {
          responseText += `${p.listing_type === 'donate' ? 'Free' : 'Exchange'}`;
        }
        responseText += '\n';
      });

      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: responseText,
        products,
      };
    }

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: generateFriendlyResponse(query),
    };
  };

  const clearHistory = async () => {
    if (!user) return;
    await supabase.from('ai_chat_history').delete().eq('user_id', user.id);
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: "Hi! I'm your CampusMart AI Assistant. I can help you find products, recommend items based on your budget, and answer questions about the marketplace. How can I help you today?",
      },
    ]);
  };

  const handleQuickAction = (text: string) => {
    setInput(text);
  };

  return (
    <div className="min-h-screen py-24 px-4 flex flex-col max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-accent flex items-center justify-center">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
            <p className="text-sm text-gray-500">Powered by CampusMart Intelligence</p>
          </div>
        </div>
        {user && messages.length > 1 && (
          <button
            onClick={clearHistory}
            className="p-2 rounded-lg glass glass-hover text-gray-500"
            title="Clear chat history"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4 space-y-4 min-h-[400px] max-h-[60vh]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.role === 'user'
                    ? 'gradient-primary text-white rounded-br-sm'
                    : 'glass rounded-bl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {msg.products && msg.products.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {msg.products.map((product) => (
                      <div
                        key={product.id}
                        className="glass rounded-xl p-3 cursor-pointer hover:scale-[1.02] transition-transform"
                        onClick={() => openProductDetail(product)}
                      >
                        <div className="aspect-video rounded-lg overflow-hidden mb-2">
                          <img
                            src={product.images?.[0] || 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=300'}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="font-medium text-sm truncate">{product.title}</p>
                        <p className="text-xs text-gray-500">
                          {product.price ? `₹${product.price}` : product.listing_type === 'donate' ? 'Free' : 'Exchange'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="glass rounded-2xl rounded-bl-sm p-4">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div className="px-4 pb-4">
            <div className="glass rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-2">Quick actions</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickAction(action.label)}
                    className="px-3 py-2 rounded-lg glass-hover text-sm flex items-center gap-2"
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="p-4 border-t border-white/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about products, prices, or recommendations..."
              className="flex-1 px-4 py-3 rounded-xl glass border border-white/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 rounded-xl gradient-accent text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function generateFriendlyResponse(query: string): string {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
    return "Hello! How can I help you today? I can help you find products, recommend items within your budget, or answer questions about using CampusMart.";
  }

  if (lowerQuery.includes('thank')) {
    return "You're welcome! Is there anything else I can help you with? Feel free to ask about any products or categories.";
  }

  if (lowerQuery.includes('how') && (lowerQuery.includes('sell') || lowerQuery.includes('list'))) {
    return "To list an item for sale, you'll need to create an account and then click the 'Sell' button. You can choose whether you want to sell, exchange, or donate your item. Make sure to add clear photos and a detailed description to attract buyers!";
  }

  if (lowerQuery.includes('safe') || lowerQuery.includes('trust') || lowerQuery.includes('scam')) {
    return "CampusMart is designed to be safe for college students. All users must sign up with a verified .edu college email address. We also have a rating system for sellers, so check reviews before making a purchase. Always meet in public places on campus for exchanges.";
  }

  return "I couldn't find any products matching your query. Try being more specific about what you're looking for - mention the product category (books, electronics, cycles), your budget, or specific features. You can also try searching directly in the Marketplace!";
}
