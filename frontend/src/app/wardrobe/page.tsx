'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Shirt, Eye, Trash2, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';

interface WardrobeItem {
  id: string;
  filename: string;
  category: string;
  color: string;
  path: string;
  description: string;
}

export default function WardrobePage() {
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WardrobeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWardrobe();
  }, []);

  useEffect(() => {
    filterItems();
  }, [wardrobeItems, selectedCategory, selectedColor, searchTerm]);

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

  const filterItems = () => {
    let filtered = wardrobeItems;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (selectedColor !== 'all') {
      filtered = filtered.filter(item => item.color === selectedColor);
    }

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.color.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const getUniqueCategories = () => {
    return Array.from(new Set(wardrobeItems.map(item => item.category)));
  };

  const getUniqueColors = () => {
    return Array.from(new Set(wardrobeItems.map(item => item.color)));
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'shirt': return '�';
      case 'tshirt': return '�👕';
      case 'jeans': return '👖';
      case 'trousers': return '👖';
      case 'shoes': return '👟';
      case 'suit': return '🤵';
      case 'top': return '👕';
      case 'bottom': return '👖';
      case 'dress': return '👗';
      case 'accessory': return '👜';
      default: return '👔';
    }
  };

  const getColorBadge = (color: string) => {
    const colorMap: { [key: string]: string } = {
      'red': 'bg-red-500',
      'blue': 'bg-blue-500',
      'green': 'bg-green-500',
      'yellow': 'bg-yellow-500',
      'purple': 'bg-purple-500',
      'pink': 'bg-pink-500',
      'orange': 'bg-orange-500',
      'black': 'bg-gray-900',
      'white': 'bg-white border border-gray-300',
      'gray': 'bg-gray-500',
      'light gray': 'bg-gray-300',
      'dark gray': 'bg-gray-700',
      'brown': 'bg-amber-700',
      'khaki': 'bg-yellow-600',
    };

    return colorMap[color.toLowerCase()] || 'bg-gray-400';
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
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          
          <div className="text-center text-gray-900">
            <h1 className="text-5xl font-bold mb-4">Your Wardrobe</h1>
            <p className="text-xl text-gray-600">
              Manage and explore your digital fashion collection
            </p>
            <div className="mt-4 text-lg">
              <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                {wardrobeItems.length} items in total
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 max-w-4xl mx-auto">
            <div className="flex items-center text-red-800">
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl p-6 mb-8 max-w-6xl mx-auto shadow-sm">
          <div className="grid md:grid-cols-4 gap-4 items-end">
            {/* Search */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search items..."
                  className="w-full bg-gray-50 text-gray-900 placeholder-gray-500 border border-gray-200 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {getUniqueCategories().map(category => (
                  <option key={category} value={category} className="capitalize">
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Filter */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Color</label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Colors</option>
                {getUniqueColors().map(color => (
                  <option key={color} value={color} className="capitalize">
                    {color}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedColor('all');
                setSearchTerm('');
              }}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Wardrobe Grid */}
        <div className="max-w-6xl mx-auto">
          {filteredItems.length === 0 ? (
            <div className="text-center text-gray-600 py-16">
              <Shirt className="w-24 h-24 mx-auto mb-6 text-gray-400" />
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">
                {wardrobeItems.length === 0 ? 'No wardrobe items found' : 'No items match your filters'}
              </h3>
              <p className="text-lg mb-8">
                {wardrobeItems.length === 0 
                  ? 'Start building your digital wardrobe by uploading clothing images'
                  : 'Try adjusting your search or filters to find items'
                }
              </p>
              {wardrobeItems.length === 0 && (
                <Link 
                  href="/upload"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                >
                  Upload Clothing Items
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Results Summary */}
              <div className="text-gray-700 text-center mb-6">
                <p className="text-lg">
                  Showing {filteredItems.length} of {wardrobeItems.length} items
                </p>
              </div>

              {/* Items Grid */}
              <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all transform hover:scale-105">
                    {/* Item Image */}
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      <Image 
                        src={`/api/wardrobe/image/${item.filename}`}
                        alt={item.description || item.filename}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                          if (fallback) {
                            fallback.classList.remove('hidden');
                          }
                        }}
                        unoptimized={true}
                      />
                      
                      {/* Fallback icon if image fails to load */}
                      <div className="fallback-icon absolute inset-0 bg-gray-200 flex items-center justify-center text-4xl text-gray-400 hidden">
                        {getCategoryIcon(item.category)}
                      </div>
                      
                      {/* Category Badge */}
                      <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs font-medium z-10">
                        {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                      </div>
                    </div>
                    
                    {/* Item Details */}
                    <div className="p-4">
                      <h3 className="text-gray-900 font-semibold text-sm mb-2 line-clamp-2">
                        {item.description || item.filename.replace('.png', '')}
                      </h3>
                      
                      {/* Color and Style Info */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded-full border border-gray-300 ${getColorBadge(item.color)}`}></div>
                          <span className="text-xs text-gray-600 capitalize font-medium">{item.color}</span>
                        </div>
                          <span className="text-xs text-gray-500 capitalize">{item.color}</span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                        <button className="bg-gray-100 text-gray-600 py-2 px-3 rounded-lg text-xs hover:bg-gray-200 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-12 text-center space-x-4">
          <Link
            href="/upload"
            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all inline-block"
          >
            Add More Items
          </Link>
          <Link
            href="/chat"
            className="bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 transition-all inline-block"
          >
            Get Style Suggestions
          </Link>
        </div>
      </div>
    </div>
  );
}
