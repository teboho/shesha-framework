const withLess = require('next-with-less');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 15 specific configurations
  typescript: {
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
    optimizePackageImports: ['antd', '@ant-design/icons', 'axios'],
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
    '@shesha-io/reactjs': {
      transform: '@shesha-io/reactjs/dist/{{member}}',
    },
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

  // Optimize redirects and rewrites
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = withBundleAnalyzer(
  withLess({
    ...nextConfig,
    lessLoaderOptions: {
      lessOptions: {
        modifyVars: {},
        javascriptEnabled: true,
      },
    },
  })
);