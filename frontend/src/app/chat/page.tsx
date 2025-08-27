'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, User, Shirt } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestion?: {
    outfit_suggestion?: {
      items: Array<{
        id: string;
        filename: string;
        category: string;
        color: string;
        path: string;
        description: string;
      }>;
      description: string;
    };
    items?: Array<{
      id: string;
      filename: string;
      category: string;
      color: string;
      path: string;
      description: string;
    }>;
  };
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI stylist. Ask me anything about fashion, outfit suggestions, or styling advice!',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/ask', {
        query: input
      });

      if (response.data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.data.response,
          suggestion: {
            outfit_suggestion: response.data.data.outfit_suggestion,
            items: response.data.data.items
          },
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure you have uploaded some clothing items first, or try again later.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestQuestions = [
    "What should I wear for a casual date?",
    "Help me put together a business casual outfit",
    "What colors go well together?",
    "Show me my wardrobe items",
    "Suggest an outfit for a summer party"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href="/" className="inline-flex items-center text-gray-700 hover:text-blue-600 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Chat with Your AI Stylist</h1>
          <p className="text-lg text-gray-600">
            Get personalized fashion advice and outfit suggestions
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 mr-2" />
                    ) : (
                      <Bot className="w-4 h-4 mr-2" />
                    )}
                    <span className="font-medium text-sm">
                      {message.role === 'user' ? 'You' : 'AI Stylist'}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  
                  {message.suggestion && (
                    message.suggestion.outfit_suggestion?.items || message.suggestion.items
                  ) && (
                    message.suggestion.outfit_suggestion?.items || message.suggestion.items
                  )!.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                      <div className="text-xs font-medium text-gray-700 mb-3">Outfit Suggestion:</div>
                      <div className="grid grid-cols-2 gap-3">
                        {(message.suggestion.outfit_suggestion?.items || message.suggestion.items)!.map((item, index) => (
                          <div key={item.id} className="bg-white rounded-lg p-3 border border-gray-200">
                            {/* Item Image Thumbnail */}
                            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                              {item.filename ? (
                                <div className="w-full h-full relative">
                                  <Image
                                    src={`/api/wardrobe/image/${item.filename}`}
                                    alt={item.description}
                                    fill
                                    className="object-cover"
                                    onError={(e) => {
                                      // Fallback to emoji if image fails to load
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const parent = target.parentElement;
                                      if (parent) {
                                        parent.innerHTML = `
                                          <div class="text-2xl">
                                            ${item.category === 'shirt' || item.category === 'tshirt' ? '👕' : 
                                              item.category === 'jeans' || item.category === 'trousers' ? '👖' :
                                              item.category === 'shoes' ? '👟' :
                                              item.category === 'suit' ? '🤵' : '�'}
                                          </div>
                                        `;
                                      }
                                    }}
                                  />
                                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                    {item.filename.split('.')[0].slice(0, 8)}...
                                  </div>
                                </div>
                              ) : (
                                <div className="text-2xl">
                                  {item.category === 'shirt' || item.category === 'tshirt' ? '�' : 
                                   item.category === 'jeans' || item.category === 'trousers' ? '�' :
                                   item.category === 'shoes' ? '�' :
                                   item.category === 'suit' ? '🤵' : '👔'}
                                </div>
                              )}
                            </div>
                            <div className="text-xs">
                              <div className="font-medium text-gray-900 capitalize">{item.category}</div>
                              <div className="text-gray-600 capitalize">{item.color}</div>
                              <div className="text-gray-500 capitalize text-xs">{item.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {message.suggestion.outfit_suggestion?.description && (
                        <div className="text-xs text-gray-600 mt-3 italic">
                          {message.suggestion.outfit_suggestion.description}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-200 shadow-sm">
                  <div className="flex items-center mb-2">
                    <Bot className="w-4 h-4 mr-2" />
                    <span className="font-medium text-sm">AI Stylist</span>
                  </div>
                  <div className="flex items-center">
                    <div className="animate-pulse text-sm">Thinking...</div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-white">
              <div className="text-gray-700 text-sm mb-3 font-medium">Try asking:</div>
              <div className="flex flex-wrap gap-2">
                {suggestQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(question)}
                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-full transition-colors border border-blue-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-6 border-t border-gray-200 bg-white">
            <div className="flex space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask your stylist anything..."
                className="flex-1 bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/try-on"
            className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors inline-block shadow-md mr-4"
          >
            Try Virtual Try-On
          </Link>
          <Link
            href="/wardrobe"
            className="bg-gray-100 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors inline-block border border-gray-300"
          >
            View Wardrobe
          </Link>
        </div>
      </div>
    </div>
  );
}
