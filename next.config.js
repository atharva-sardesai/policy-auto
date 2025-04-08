/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static exports to ensure server-side rendering
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  
  // Necessary for running on Netlify
  trailingSlash: true,
  reactStrictMode: true,
  
  // Use standard Next.js directory
  distDir: '.next',
  
  // Enable source maps in production for better error reporting
  productionBrowserSourceMaps: true,
};

module.exports = nextConfig; 