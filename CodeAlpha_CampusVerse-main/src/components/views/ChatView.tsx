import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Conversation, Message } from '../../types/database';

export function ChatView() {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<(Conversation & { lastMessage?: string })[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    const { data } = await supabase
      .from('conversations')
      .select('*, product:products(*), buyer:profiles(*), seller:profiles(*)')
      .or(`buyer_id.eq.${user?.id},seller_id.eq.${user?.id}`)
      .order('created_at', { ascending: false });

    if (data) {
      const convsWithMessages = await Promise.all(
        data.map(async (conv) => {
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('content')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          return { ...conv, lastMessage: lastMsg?.content };
        })
      );
      setConversations(convsWithMessages);
    }
    setLoading(false);
  };

  const loadMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*, sender:profiles(*)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    setMessages(data || []);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    await supabase.from('messages').insert({
      conversation_id: selectedConversation,
      sender_id: user.id,
      content: newMessage.trim(),
    });

    setNewMessage('');
    loadMessages(selectedConversation);
  };

  if (!user) {
    return (
      <div className="min-h-screen py-24 px-4">
        <div className="max-w-4xl mx-auto text-center glass-card rounded-2xl p-12">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">Sign in to view messages</h2>
          <p className="text-gray-500">
            Connect with other students to buy, sell, or exchange items
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
          <p className="text-gray-500 mt-1">{conversations.length} conversations</p>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden flex" style={{ height: 'calc(100vh - 180px)' }}>
          <div
            className={`${
              selectedConversation ? 'hidden md:block' : 'block'
            } w-full md:w-1/3 border-r border-white/10 overflow-auto`}
          >
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 glass rounded-xl animate-pulse" />
                ))}
              </div>
            ) : conversations.length > 0 ? (
              conversations.map((conv) => {
                const otherPerson = conv.buyer_id === user?.id ? conv.seller : conv.buyer;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`w-full p-4 border-b border-white/10 hover:bg-white/5 transition-colors text-left ${
                      selectedConversation === conv.id ? 'bg-violet-500/10' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-semibold">
                        {otherPerson?.full_name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{otherPerson?.full_name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Package className="w-3 h-3" /> {conv.product?.title}
                        </p>
                        {conv.lastMessage && (
                          <p className="text-xs text-gray-400 truncate mt-1">{conv.lastMessage}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No conversations yet</p>
                <p className="text-xs text-gray-400 mt-1">Start by messaging a seller</p>
              </div>
            )}
          </div>

          <div
            className={`${
              selectedConversation ? 'block' : 'hidden md:block'
            } flex-1 flex flex-col`}
          >
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-white/10 flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden p-2 rounded-lg glass"
                  >
                    ← Back
                  </button>
                  <div className="flex-1">
                    <p className="font-medium">
                      {conversations.find((c) => c.id === selectedConversation)?.product?.title}
                    </p>
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-4 space-y-4">
                  {messages.map((msg) => {
                    const isOwn = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[80%] rounded-xl p-3 ${
                            isOwn
                              ? 'gradient-primary text-white rounded-br-none'
                              : 'glass rounded-bl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-500'}`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-white/10">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                    className="flex gap-3"
                  >
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 rounded-xl glass border border-white/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-4 py-3 rounded-xl gradient-primary text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
