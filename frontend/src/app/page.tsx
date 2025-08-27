import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Navigation Bar */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              AI Stylist
            </Link>
            
            <nav className="hidden md:flex space-x-8">
              <Link href="/upload" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Upload
              </Link>
              <Link href="/wardrobe" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Wardrobe
              </Link>
              <Link href="/chat" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Chat
              </Link>
              <Link href="/try-on" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Try-On
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI Stylist
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your Personal AI-Powered Fashion Assistant
          </p>
        </div>
        
        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mb-16">
          {/* Upload Wardrobe */}
          <Link href="/upload" className="group bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-blue-300">
            <div className="text-4xl mb-4 text-blue-600">�</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Upload Wardrobe</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Add your clothing items to build your digital wardrobe. 
              Our AI automatically categorizes and analyzes your fashion pieces.
            </p>
          </Link>
          
          {/* Chat with Stylist */}
          <Link href="/chat" className="group bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-green-300">
            <div className="text-4xl mb-4 text-green-600">💬</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Chat with Stylist</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Get personalized fashion advice and outfit suggestions. 
              Ask questions about style, colors, and outfit combinations.
            </p>
          </Link>
          
          {/* Virtual Try-On */}
          <Link href="/try-on" className="group bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-purple-300">
            <div className="text-4xl mb-4 text-purple-600">🪞</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Virtual Try-On</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Visualize outfits on a virtual mannequin. 
              Mix and match your wardrobe items to create perfect looks.
            </p>
          </Link>
          
          {/* Explore Wardrobe */}
          <Link href="/wardrobe" className="group bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-orange-300">
            <div className="text-4xl mb-4 text-orange-600">👔</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Explore Wardrobe</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Browse and manage your clothing collection. 
              Filter by category, color, and style to find the perfect pieces.
            </p>
          </Link>
        </div>
        
        {/* Call to Action */}
        <div className="text-center">
          <Link href="/upload" className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition-colors inline-block shadow-md mr-4">
            Get Started
          </Link>
          <Link href="/chat" className="bg-gray-100 text-gray-900 font-semibold py-3 px-8 rounded-lg text-lg hover:bg-gray-200 transition-colors inline-block border border-gray-300">
            Try AI Chat
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>Powered by AI • CLIP Vision Model • Vector Search Technology</p>
        </div>
      </footer>
    </div>
  );
}
