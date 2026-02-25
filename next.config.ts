import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack - use Webpack for production builds
  // Turbopack can hang during "Creating an optimized production build"
  // Note: Vercel may still force Turbopack, so set TURBOPACK=0 in Vercel env vars
  experimental: {
    // Disable React Compiler which can conflict with Turbopack
    reactCompiler: false,
  },

  // Use SWC for minification (faster and more reliable than Terser)
  swcMinify: true,

  // Optimize bundle analysis
  productionBrowserSourceMaps: false,

  // Reduce bundle size by removing unused code
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Prevent large barrel imports from causing issues
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: true,
    };

    // Reduce duplicate exports issues
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
        },
      };
    }

    return config;
  },
};

export default nextConfig;
