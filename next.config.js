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

  // Netlify specific configuration
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },

  // Ensure proper handling of API routes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 