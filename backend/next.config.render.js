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
  
  // Environment variables
  env: {
    NODE_ENV: 'production',
  },
  
  // Headers for CORS
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

module.exports = nextConfig 