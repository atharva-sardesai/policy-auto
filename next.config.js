/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static exports to ensure server-side rendering
  output: 'standalone',
  
  // Necessary for running on Netlify
  trailingSlash: true,
  reactStrictMode: true,
  
  // Use standard Next.js directory
  distDir: '.next',
  
  // Enable source maps in production for better error reporting
  productionBrowserSourceMaps: true,

  images: {
    unoptimized: true,
  },

  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig; 