//@ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use Turbopack
  turbopack: {},
  // Run on port 3001 to avoid conflict with backend on 3000
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;