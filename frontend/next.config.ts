import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost'],
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/api/wardrobe/image/**',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
        pathname: '/api/wardrobe/image/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? '/api/:path*'  // In production, use Vercel serverless functions
          : 'http://localhost:3001/api/:path*',  // In development, use local backend
      },
    ];
  },
  output: 'standalone',
  typescript: {
    // Temporarily ignore type errors during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Temporarily ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
