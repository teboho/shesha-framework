import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import postCss from 'rollup-plugin-postcss';
import multi from '@rollup/plugin-multi-entry';
import svgr from '@svgr/rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import localResolve from 'rollup-plugin-local-resolve';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import pkg from './package.json' with { type: 'json' };
import eslint from '@rollup/plugin-eslint';
import { codeAsText } from "./src/rollup-plugins/codeAsText.js";

export default {
  input: ['src/index.tsx', 'src/providers/index.ts'],
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      inlineDynamicImports: true,
      sourcemap: true, // Enable sourcemaps for better debugging
    },
    {
      file: pkg.module,
      format: 'es',
      exports: 'named',
      inlineDynamicImports: true,
      sourcemap: true, // Enable sourcemaps for better debugging
    },
  ],
  external: [
    // React 19 and Next.js 15 dependencies
    '@ant-design/icons',
    '@microsoft/signalr',
    'antd',
    'antd-style',
    'assert',
    'axios',
    'camelcase',
    'classnames',
    'component-classes',
    'crypto',
    'https',
    'invert-color',
    'moment',
    'nanoid',
    'next',
    'next-nprogress-bar',
    'os',
    'react',
    'react-beautiful-dnd',
    'react-dom',
    'react-dom/client', // React 19 client APIs
    'react-dom/server', // React 19 server APIs
    'react-markdown',
    'react-sortablejs',
    'redux-undo',
    'sortablejs',
    'stream',
    'tty',
    'url',
    'use-debounce',
    'util',
    'zlib',
    // React 19 specific externals
    'scheduler/tracing',
    'scheduler',
  ],
  plugins: [
    codeAsText(),
    eslint({ 
      throwOnError: false, // Don't break build on linting errors
      include: 'src/**/*.ts{,x}',
      // Use default ESLint configuration
    }),
    multi(),
    peerDepsExternal({
      includeDependencies: true,
    }),
    postCss({
      plugins: [],
      extensions: ['.css'],
      use: [
        'sass',
      ],
      // Extract CSS to separate file for better performance
      extract: true,
      minimize: true,
    }),
    svgr({
      // Optimize SVG handling for React 19
      svgo: true,
      svgoConfig: {
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false,
              },
            },
          },
        ],
      },
    }),
    nodeResolve({
      browser: false, // Server-side compatible
      modulesOnly: true,
      preferBuiltins: true, // Use Node.js built-ins when available
    }),
    typescript({
      noEmitOnError: false, // Don't break build on TS errors
      tsconfig: './tsconfig.rollup.json',
      sourceMap: true, // Enable source maps
      // React 19 and Next.js 15 compatibility
      compilerOptions: {
        jsx: 'react-jsx', // Use new JSX transform
        target: 'ES2020', // Modern target for better performance
        module: 'ESNext',
        moduleResolution: 'bundler',
      }
    }),
    commonjs({
      include: 'node_modules/**',
      defaultIsModuleExports: true,
      // Handle React 19 specific modules
      transformMixedEsModules: true,
    }),
    json(),
    localResolve(),
    // Only use terser in production
    process.env.NODE_ENV === 'production' && terser({
      compress: {
        // Optimize for React 19
        passes: 2,
        drop_console: false, // Keep console for debugging
        drop_debugger: true,
        pure_funcs: ['console.log'], // Remove console.log in production
      },
      mangle: {
        reserved: ['React', 'ReactDOM'], // Preserve React names
      },
      format: {
        comments: false,
      },
    }),
  ].filter(Boolean), // Remove falsy plugins
  
  // Optimize tree shaking for React 19
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    unknownGlobalSideEffects: false,
  },
  
  // Handle circular dependencies gracefully
  onwarn: (warning, warn) => {
    // Skip certain warnings for React 19 compatibility
    if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
    if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return; // React 19 "use client" directives
    if (warning.code === 'CIRCULAR_DEPENDENCY') {
      // Log circular dependencies but don't fail
      console.warn('Circular dependency:', warning.message);
      return;
    }
    
    // Use default for everything else
    warn(warning);
  },
};
