//@ts-check

// URL del backend para el proxy de desarrollo (/api/backend/*).
// En producción el frontend llama DIRECTAMENTE a NEXT_PUBLIC_API_URL (axios),
// por lo que este rewrite solo se usa en desarrollo local.
const API_BACKEND_URL = process.env.API_BACKEND_URL || 'http://localhost:3000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use Turbopack
  turbopack: {},
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${API_BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;