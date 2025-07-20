const { withPlugins } = require('next-compose-plugins');
const path = require('path');

const withLess = require('next-with-less');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 15 specific configurations
  typescript: {
    // Enable faster TypeScript checking
    tsconfigPath: './tsconfig.json',
  },
  
  // Enhanced Turbo configuration for Next.js 15
  turbo: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Experimental features for Next.js 15
  experimental: {
    // Enable React Compiler (React 19)
    reactCompiler: true,
    
    // Enable Turbopack in development for faster builds
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    
    // Enable Partial Prerendering (PPR)
    ppr: true,
    
    // Enable Server Components improvements
    serverComponentsExternalPackages: ['@shesha-io/reactjs'],
    
    // Enable instrumentation for better performance monitoring
    instrumentationHook: true,
    
    // Optimize bundle splitting
    optimizePackageImports: ['antd', 'lodash', '@ant-design/icons'],
  },

  // Enhanced performance configurations
  compress: true,
  poweredByHeader: false,
  
  // Improved image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Enhanced build output optimization
  output: 'standalone',
  
  // Improved bundling
  modularizeImports: {
    'antd': {
      transform: 'antd/lib/{{member}}',
      skipDefaultConversion: true,
    },
    '@ant-design/icons': {
      transform: '@ant-design/icons/lib/icons/{{member}}',
    },
    'lodash': {
      transform: 'lodash/{{member}}',
    },
  },

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add support for importing SVGs as React components
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    // Optimize chunk splitting for better caching
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          antd: {
            test: /[\\/]node_modules[\\/]antd[\\/]/,
            name: 'antd',
            chunks: 'all',
            priority: 20,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
        },
      };
    }

    // Add alias for better import resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };

    return config;
  },
  
  // Development improvements
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  
  // Enhanced error handling
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  reactStrictMode: true,
  swcMinify: true,

  // Environment variables configuration
  env: {
    NEXTJS_VERSION: '15',
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = withPlugins([
  [withLess, {
    lessLoaderOptions: {
      lessOptions: {
        modifyVars: {},
        javascriptEnabled: true,
      },
    },
  }],
], nextConfig);