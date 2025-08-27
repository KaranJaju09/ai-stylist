'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Shirt, User } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

interface WardrobeItem {
  id: string;
  category: string;
  color: string;
  style: string;
  filename: string;
}

interface OutfitSlot {
  category: 'top' | 'bottom' | 'shoes';
  item: WardrobeItem | null;
}

export default function TryOnPage() {
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [outfit, setOutfit] = useState<OutfitSlot[]>([
    { category: 'top', item: null },
    { category: 'bottom', item: null },
    { category: 'shoes', item: null },
  ]);
  const [currentIndices, setCurrentIndices] = useState<{[key: string]: number}>({
    top: 0,
    bottom: 0,
    shoes: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWardrobe();
  }, []);

  const fetchWardrobe = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/wardrobe');
      if (response.data.success) {
        setWardrobeItems(response.data.data.items);
      }
    } catch (err: any) {
      console.error('Error fetching wardrobe:', err);
      setError('Failed to load wardrobe items');
    } finally {
      setIsLoading(false);
    }
  };

  const addToOutfit = (item: WardrobeItem) => {
    setOutfit(prev => prev.map(slot => 
      slot.category === item.category 
        ? { ...slot, item }
        : slot
    ));
  };

  const removeFromOutfit = (category: string) => {
    setOutfit(prev => prev.map(slot => 
      slot.category === category 
        ? { ...slot, item: null }
        : slot
    ));
  };

  const generateRandomOutfit = () => {
    const categories = ['top', 'bottom', 'shoes'];
    const newOutfit = categories.map(category => {
      const categoryItems = wardrobeItems.filter(item => item.category === category);
      const randomItem = categoryItems.length > 0 
        ? categoryItems[Math.floor(Math.random() * categoryItems.length)]
        : null;
      return { category: category as 'top' | 'bottom' | 'shoes', item: randomItem };
    });
    setOutfit(newOutfit);
  };

  const getItemsByCategory = (category: string) => {
    return wardrobeItems.filter(item => item.category === category);
  };

  const cycleItem = (category: 'top' | 'bottom' | 'shoes', direction: 'prev' | 'next') => {
    const categoryItems = getItemsByCategory(category);
    if (categoryItems.length === 0) return;

    const currentIndex = currentIndices[category];
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % categoryItems.length;
    } else {
      newIndex = currentIndex === 0 ? categoryItems.length - 1 : currentIndex - 1;
    }
    
    setCurrentIndices(prev => ({ ...prev, [category]: newIndex }));
    setOutfit(prev => prev.map(slot => 
      slot.category === category 
        ? { ...slot, item: categoryItems[newIndex] }
        : slot
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl">Loading wardrobe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="text-center text-gray-900 mb-8">
          <h1 className="text-5xl font-bold mb-4">Virtual Try-On</h1>
          <p className="text-xl text-gray-600">
            Mix and match your wardrobe items to create perfect outfits
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 max-w-4xl mx-auto">
            <div className="flex items-center text-red-800">
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Virtual Mannequin */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Outfit</h2>
              <button
                onClick={generateRandomOutfit}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                disabled={wardrobeItems.length === 0}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Random</span>
              </button>
            </div>

            <div className="relative">
              {/* Mannequin Display */}
              <div className="bg-gray-100 rounded-2xl h-[600px] flex items-center justify-center relative overflow-hidden">
                {/* Base Mannequin */}
                <div className="relative">
                  <img 
                    src="/images/mannequin.svg" 
                    alt="Mannequin" 
                    className="w-48 h-auto"
                  />
                  
                  {/* Top Clothing Overlay */}
                  {outfit.find(slot => slot.category === 'top')?.item && (
                    <div className="absolute top-[72px] left-[67px] w-[57px] h-[105px] bg-blue-500 rounded-lg flex items-center justify-center opacity-80 hover:opacity-90 transition-opacity">
                      <img 
                        src={`/api/wardrobe/image/${outfit.find(slot => slot.category === 'top')?.item?.filename}`}
                        alt="Top"
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="text-white text-xs text-center hidden">
                        <div className="font-bold">{outfit.find(slot => slot.category === 'top')?.item?.color}</div>
                        <div className="opacity-75">{outfit.find(slot => slot.category === 'top')?.item?.style}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Bottom Clothing Overlay */}
                  {outfit.find(slot => slot.category === 'bottom')?.item && (
                    <div className="absolute top-[176px] left-[62px] w-[67px] h-[133px] bg-green-500 rounded-lg flex items-center justify-center opacity-80 hover:opacity-90 transition-opacity">
                      <img 
                        src={`/api/wardrobe/image/${outfit.find(slot => slot.category === 'bottom')?.item?.filename}`}
                        alt="Bottom"
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="text-white text-xs text-center hidden">
                        <div className="font-bold">{outfit.find(slot => slot.category === 'bottom')?.item?.color}</div>
                        <div className="opacity-75">{outfit.find(slot => slot.category === 'bottom')?.item?.style}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Shoes Overlay */}
                  {outfit.find(slot => slot.category === 'shoes')?.item && (
                    <div className="absolute top-[367px] left-[66px] w-[59px] h-[24px] bg-purple-500 rounded-lg flex items-center justify-center opacity-80 hover:opacity-90 transition-opacity">
                      <img 
                        src={`/api/wardrobe/image/${outfit.find(slot => slot.category === 'shoes')?.item?.filename}`}
                        alt="Shoes"
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="text-white text-xs text-center hidden">
                        <div className="font-bold">{outfit.find(slot => slot.category === 'shoes')?.item?.color}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cycling Controls */}
              <div className="mt-6 space-y-4">
                {['top', 'bottom', 'shoes'].map((category) => {
                  const categoryItems = getItemsByCategory(category);
                  const currentItem = outfit.find(slot => slot.category === category)?.item;
                  
                  return (
                    <div key={category} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                      <span className="font-medium text-gray-900 capitalize w-20">{category}:</span>
                      
                      <div className="flex items-center space-x-3 flex-1">
                        <button
                          onClick={() => cycleItem(category as 'top' | 'bottom' | 'shoes', 'prev')}
                          disabled={categoryItems.length <= 1}
                          className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          ←
                        </button>
                        
                        <div className="flex-1 text-center">
                          {currentItem ? (
                            <div className="text-sm">
                              <div className="font-medium">{currentItem.color} {currentItem.style}</div>
                              <div className="text-gray-500 text-xs">{currentItem.filename}</div>
                            </div>
                          ) : (
                            <div className="text-gray-500 text-sm">No {category} selected</div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => cycleItem(category as 'top' | 'bottom' | 'shoes', 'next')}
                          disabled={categoryItems.length <= 1}
                          className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          →
                        </button>
                      </div>
                      
                      <div className="text-xs text-gray-500 w-16 text-right">
                        {categoryItems.length > 0 ? `${currentIndices[category] + 1}/${categoryItems.length}` : '0/0'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Outfit Summary */}
              {outfit.some(slot => slot.item) && (
                <div className="mt-6 bg-blue-50 rounded-lg p-4">
                  <h3 className="text-gray-900 font-semibold mb-2">Current Outfit:</h3>
                  <div className="space-y-1">
                    {outfit.filter(slot => slot.item).map((slot) => (
                      <div key={slot.category} className="text-gray-700 text-sm">
                        <span className="capitalize font-medium">{slot.category}:</span> {slot.item?.color} {slot.item?.style}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Wardrobe Items */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Wardrobe</h2>
            
            {wardrobeItems.length === 0 ? (
              <div className="text-center text-gray-600 py-12">
                <Shirt className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg mb-4">No wardrobe items found</p>
                <Link 
                  href="/upload"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                >
                  Upload Clothing Items
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {['top', 'bottom', 'shoes'].map((category) => {
                  const categoryItems = getItemsByCategory(category);
                  return (
                    <div key={category}>
                      <h3 className="text-gray-900 font-semibold mb-3 capitalize">{category}s ({categoryItems.length})</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {categoryItems.length > 0 ? (
                          categoryItems.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => addToOutfit(item)}
                              className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-3 text-gray-900 transition-all transform hover:scale-105 hover:shadow-md"
                            >
                              <div className="w-full h-16 bg-gray-200 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                                <img 
                                  src={`/api/wardrobe/image/${item.filename}`}
                                  alt={item.filename}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                                <Shirt className="w-8 h-8 text-gray-400 hidden" />
                              </div>
                              <div className="text-sm font-medium truncate">{item.filename}</div>
                              <div className="text-xs text-gray-500">{item.color}</div>
                            </button>
                          ))
                        ) : (
                          <div className="col-span-full text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-lg">
                            No {category} items
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/chat"
            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all inline-block"
          >
            Get Style Suggestions
          </Link>
        </div>
      </div>
    </div>
  );
}
