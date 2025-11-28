/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['framer-motion'],
  // Enable standalone output for Docker
  output: 'standalone',
};

module.exports = nextConfig;

