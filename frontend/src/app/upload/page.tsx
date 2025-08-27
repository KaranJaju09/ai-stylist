'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

interface UploadedItem {
  id: string;
  category: string;
  color: string;
  filename: string;
}

export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedItems, setUploadedItems] = useState<UploadedItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    setError(null);

    for (const file of acceptedFiles) {
      try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          const newItem: UploadedItem = {
            id: response.data.data.item_id,
            category: response.data.data.category,
            color: response.data.data.color,
            filename: file.name,
          };
          setUploadedItems(prev => [...prev, newItem]);
        }
      } catch (err: any) {
        console.error('Upload error:', err);
        setError(`Failed to upload ${file.name}: ${err.response?.data?.error || err.message}`);
      }
    }

    setIsUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true
  });

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

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Title and Instructions */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Upload Your Wardrobe</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Drag and drop clothing images here or click to select files.
            </p>
          </div>

          {/* Tips Section */}
          {uploadedItems.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">📝 Tips for Best Results</h3>
              <ul className="text-blue-800 space-y-2 text-sm">
                <li>• Upload clear photos of individual clothing items</li>
                <li>• Include tops, bottoms, shoes, and accessories</li>
                <li>• Our AI will automatically detect categories and colors</li>
                <li>• Supported formats: JPEG, PNG, WebP</li>
              </ul>
            </div>
          )}

          {/* Upload Area */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className={`w-16 h-16 mx-auto mb-4 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
              <h3 className={`text-xl font-semibold mb-2 ${isDragActive ? 'text-blue-700' : 'text-gray-700'}`}>
                {isDragActive ? 'Drop the images here' : 'Drop clothing images here'}
              </h3>
              <p className="text-gray-500">
                or click to select files • Supports JPEG, PNG, WebP
              </p>
            </div>

            {isUploading && (
              <div className="text-center mt-6">
                <div className="inline-flex items-center text-blue-600">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                  Uploading and processing images...
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center text-red-700">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {error}
                </div>
              </div>
            )}
          </div>

          {/* Uploaded Items */}
          {uploadedItems.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Uploaded Items ({uploadedItems.length})</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {uploadedItems.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                    {/* Image Thumbnail Placeholder */}
                    <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mb-4 flex items-center justify-center">
                      <div className="text-4xl">
                        {item.category === 'top' && '👕'}
                        {item.category === 'bottom' && '👖'}
                        {item.category === 'shoes' && '👟'}
                        {item.category === 'dress' && '👗'}
                        {!['top', 'bottom', 'shoes', 'dress'].includes(item.category) && '👔'}
                      </div>
                    </div>
                    
                    {/* Success Indicator */}
                    <div className="flex items-center text-green-600 mb-2">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Uploaded</span>
                    </div>
                    
                    {/* Filename */}
                    <h3 className="text-gray-900 font-medium text-sm mb-3 truncate" title={item.filename}>
                      {item.filename}
                    </h3>
                    
                    {/* Category and Color Tags */}
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {item.category}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {item.color}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <Link
                  href="/chat"
                  className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors inline-block shadow-md mr-4"
                >
                  Start Getting Style Suggestions
                </Link>
                <Link
                  href="/wardrobe"
                  className="bg-gray-100 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors inline-block border border-gray-300"
                >
                  View Full Wardrobe
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
