import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use Webpack instead of Turbopack for production builds
  // Turbopack can hang during "Creating an optimized production build"
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
