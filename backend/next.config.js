/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during build for Render deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Output configuration
  output: 'standalone',
  
  // Experimental features
  experimental: {
    // Disable features that might cause issues in Render
    workerThreads: false,
    cpus: 1,
  },
  
  // Environment variables - removed NODE_ENV as it's not allowed
  
  // Headers for CORS - Updated for hybrid deployment
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.CORS_ORIGIN || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
    ]
  },
}

module.exports = nextConfig 