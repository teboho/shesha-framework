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

  // Check if we're building for GitHub Pages
  const isGitHubPages = process.env.GITHUB_ACTIONS === 'true' || process.env.NODE_ENV === 'pages';

  /** @type {import('next').NextConfig} */
  const config = {
    // Use 'export' for GitHub Pages, 'standalone' for regular builds
    output: isGitHubPages ? 'export' : 'standalone',
    
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
      'rc-virtual-list'
    ],
    
    poweredByHeader: false,
    productionBrowserSourceMaps: true,
    
    // Add trailing slash to URLs for GitHub Pages
    trailingSlash: isGitHubPages,
    
    // Configure paths for GitHub Pages
    basePath: isGitHubPages ? '/shesha-framework' : '',
    assetPrefix: isGitHubPages ? '/shesha-framework' : '',
    
    // Disable image optimization for static export
    images: {
      unoptimized: isGitHubPages
    },
    
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
    },
    webpack: (config) => {
      const extendResourceQuery = (rule, index) => {
        const { resourceQuery: initialQuery } = rule;
        const notRawQuery = { not: [/\?raw/] };
       
        const newQuery = initialQuery
          ? { and: [(Array.isArray(initialQuery) ? { or: initialQuery } : initialQuery), notRawQuery] }
          : notRawQuery;
       
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
      
      return {
        ...config,
        module: {
          ...config.module,
          rules: newRules,
        }
      };
    },
  };

  return withBundleAnalyzer(config);
};

module.exports = nextConfig;