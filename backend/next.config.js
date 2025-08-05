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
  
  // CORS is now handled by middleware
}

module.exports = nextConfig 