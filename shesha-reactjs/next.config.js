const path = require('path');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const moment = require('moment');
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = (phase) => {
  const env = {
    NEXT_APP_ENV: process.env.NEXT_APP_ENV ?? 'dev',
    //NEXT_APP_API_HOST: process.env.NEXT_APP_API_HOST,
  };
  /** @type {import('next').NextConfig} */
  const config = {
    output: 'standalone',
    reactStrictMode: false,
    transpilePackages: [
      'antd',
      '@ant-design',
      'ant-design',
      'rc-align',
      'rc-cascader',
      'rc-checkbox',
      'rc-collapse',
      'rc-dialog',
      'rc-drawer',
      'rc-dropdown',
      'rc-field-form',
      'rc-image',
      'rc-input',
      'rc-input-number',
      'rc-mentions',
      'rc-menu',
      'rc-motion',
      'rc-notification',
      'rc-overflow',
      'rc-pagination',
      'rc-picker',
      'rc-progress',
      'rc-rate',
      'rc-resize-observer',
      'rc-segmented',
      'rc-select',
      'rc-slider',
      'rc-steps',
      'rc-switch',
      'rc-table',
      'rc-tabs',
      'rc-textarea',
      'rc-tooltip',
      'rc-tree',
      'rc-tree-select',
      'rc-trigger',
      'rc-upload',
      'rc-util',
      'rc-virtual-list'],
    poweredByHeader: false,
    productionBrowserSourceMaps: false, // Disable source maps in production for smaller bundle
    env,
    publicRuntimeConfig: env,
    typescript: {
      tsconfigPath: './tsconfig.next.json',
    },
    compiler: {
      // Remove `console.*` output except `console.error`
      removeConsole: isProd
        ? {
          exclude: ['error'],
        }
        : false,
      styledComponents: true, // Enable styled-components optimization
    },
    // Enable experimental features for better performance
    experimental: {
      optimizeCss: isProd, // Optimize CSS in production
      swcMinify: true, // Use SWC for minification (faster than Terser)
    },
    // Configure compression
    compress: true,
    webpack: (
      config,
      { buildId, dev, isServer, defaultLoaders, webpack }
    ) => {
      
      const extendResourceQuery = (rule, index) => {
        const { resourceQuery: initialQuery } = rule;
        const notRawQuery = { not: [/\?raw/] };
        
        const newQuery = initialQuery
          ? { and: [(Array.isArray(initialQuery) ? { or: initialQuery } : initialQuery), notRawQuery] }
          : notRawQuery
        
        return { ...rule, resourceQuery: newQuery };
      };

      const modifyConditions = (rules) => {
        return rules.map((rule, index) => extendResourceQuery(rule, index));
      };
      const existingRules = config.module.rules
        ? modifyConditions(config.module.rules)
        : [];

      const newRules = [
        {
          resourceQuery: /\?raw/,
          type: 'asset/source',
        },
        ...existingRules,
      ];

      // Optimize chunks for better caching and loading
      if (!dev && !isServer) {
        config.optimization = {
          ...config.optimization,
          splitChunks: {
            ...config.optimization.splitChunks,
            chunks: 'all',
            cacheGroups: {
              ...config.optimization.splitChunks.cacheGroups,
              // Separate vendor chunks for better caching
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
                priority: 10,
              },
              // Separate antd components
              antd: {
                test: /[\\/]node_modules[\\/](antd|@ant-design)[\\/]/,
                name: 'antd',
                chunks: 'all',
                priority: 20,
              },
              // Separate react libraries
              react: {
                test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                name: 'react',
                chunks: 'all',
                priority: 20,
              },
              // Common components
              common: {
                name: 'common',
                minChunks: 2,
                chunks: 'all',
                enforce: true,
                priority: 5,
              },
            },
          },
        };
      }

      return {
        ...config,
        module: {
          ...config.module,
          rules: newRules,
        }
      }
    },
  };
  return withBundleAnalyzer(
    config, {
    debug: !isProd,
    environment: process.env.NODE_ENV,
    release: `${process.env.NODE_ENV}@${moment().format('YYYY-MM-DD HH:mm')}`,
  }
  );
};

module.exports = nextConfig;