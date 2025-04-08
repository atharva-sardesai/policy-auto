/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: [],
  },
  reactStrictMode: true,
};

module.exports = nextConfig; 