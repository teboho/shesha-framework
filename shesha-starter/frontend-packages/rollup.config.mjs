import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import postCss from 'rollup-plugin-postcss';
import url from 'rollup-plugin-url';
import svgr from '@svgr/rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import localResolve from 'rollup-plugin-local-resolve';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import pkg from './package.json' with { type: 'json' };

// Enhanced warning handler for React 19 and Next.js 15 compatibility
const onwarn = (warning, warn) => {
  // Skip certain warnings for better React 19 compatibility
  if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
  if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return; // React 19 "use client" directives
  if (warning.code === 'CIRCULAR_DEPENDENCY') {
    // Log circular dependencies but don't fail the build
    console.warn('Circular dependency detected:', warning.message);
    return;
  }

  // Throw on critical errors that could break Next.js 15
  if (warning.code === 'NON_EXISTENT_EXPORT') throw new Error(warning.message);

  // Use default for everything else
  warn(warning);
};

export default {
  input: 'src/index.ts',
  output: [
    // CommonJS output for legacy compatibility
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true, // Enable sourcemaps for better debugging
    },
    // ES modules output for modern bundlers like Next.js 15
    {
      file: pkg.module,
      format: 'es',
      exports: 'named',
      sourcemap: true, // Enable sourcemaps for better debugging
    },
  ],
  external: [
    // Core React 19 dependencies
    'react',
    'react-dom',
    'react-dom/client',
    'react-dom/server',
    
    // Next.js 15 dependencies
    'next',
    'next/image',
    'next/link',
    'next/router',
    'next/head',
    
    // Ant Design and UI libraries
    'antd',
    '@ant-design/icons',
    'antd-style',
    
    // Shesha framework
    '@shesha-io/reactjs',
    
    // Common utilities
    'axios',
    'lodash',
    'moment',
    'nanoid',
    'classnames',
    'qs',
    'styled-components',
    'react-use',
    'sortablejs',
    'buffer',
    'url-loader',
    
    // Node.js built-ins
    'assert',
    'crypto',
    'https',
    'os',
    'stream',
    'tty',
    'url',
    'util',
    'zlib',
    
    // React 19 specific externals
    'scheduler',
    'scheduler/tracing',
  ],
  plugins: [
    json(),
    
    // Enhanced PostCSS for better Next.js 15 compatibility
    postCss({
      plugins: [],
      minimize: true,
      extract: true, // Extract CSS for better performance
      autoModules: true, // Support CSS modules
      use: {
        sass: {
          data: '@import "src/styles/variables.scss";', // Import global variables if available
        },
      },
    }),
    
    // Peer dependencies handling
    peerDepsExternal({
      includeDependencies: true,
    }),
    
    // Enhanced Node resolution for Next.js 15
    nodeResolve({
      browser: false, // Server-side compatible for SSR
      modulesOnly: true,
      preferBuiltins: true,
      exportConditions: ['node', 'import', 'require'], // Support different export conditions
    }),
    
    // TypeScript with React 19 optimizations
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: true,
      declaration: true,
      declarationMap: true,
      // React 19 and Next.js 15 compatibility settings
      compilerOptions: {
        jsx: 'react-jsx', // Use new JSX transform
        target: 'ES2020',
        module: 'ESNext',
        moduleResolution: 'bundler',
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        skipLibCheck: true,
        strict: true,
      },
    }),
    
    // Enhanced CommonJS handling for React 19
    commonjs({
      include: ['node_modules/**'],
      transformMixedEsModules: true, // Handle mixed ES/CJS modules
      dynamicRequireTargets: [
        // Handle dynamic requires in React 19
        'node_modules/react/index.js',
        'node_modules/react-dom/index.js',
      ],
    }),
    
    // Enhanced URL handling
    url({
      limit: 10240, // 10KB limit for inline assets
      include: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.gif'],
      emitFiles: true,
    }),
    
    // Enhanced SVG handling for React 19
    svgr({
      svgo: true,
      svgoConfig: {
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false,
                removeDimensions: false,
              },
            },
          },
        ],
      },
      // React 19 compatibility
      jsx: {
        babelConfig: {
          plugins: [
            ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
          ],
        },
      },
    }),
    
    // Production optimizations
    process.env.NODE_ENV === 'production' && terser({
      compress: {
        passes: 2,
        drop_console: false, // Keep console for debugging in libraries
        drop_debugger: true,
        pure_funcs: ['console.debug'], // Remove debug logs
        // React 19 specific optimizations
        pure_getters: true,
        unsafe: false, // Keep safe for React
      },
      mangle: {
        reserved: ['React', 'ReactDOM', 'Component', 'PureComponent'], // Preserve React names
        properties: false, // Don't mangle properties for better compatibility
      },
      format: {
        comments: /^!/,
      },
    }),
    
    localResolve(),
  ].filter(Boolean),
  
  // Optimize tree shaking for React 19
  treeshake: {
    moduleSideEffects: (id) => {
      // Preserve side effects for CSS and certain modules
      return id.includes('.css') || id.includes('antd/es/style');
    },
    propertyReadSideEffects: false,
    unknownGlobalSideEffects: false,
  },
  
  // Enhanced warning handling
  onwarn,
  
  // Performance optimizations
  preserveEntrySignatures: 'strict',
  
  // Cache for faster rebuilds
  cache: true,
};
