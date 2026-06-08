import withBundleAnalyzerInit from '@next/bundle-analyzer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import "./src/env.mjs";
import { withSentryConfig } from '@sentry/nextjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const emptyModulePath = path.resolve(__dirname, 'src/lib/empty-module.ts');
const emptyModuleAlias = './src/lib/empty-module.ts';

const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  // standalone is only needed for production Docker images, skip in dev
  ...(isProd && { output: 'standalone' }),
  transpilePackages: ['@pec/shared', '@pec/database', '@pec/ui'],
  typescript: {
    ignoreBuildErrors: true,
  },

  // ─── Experimental ────────────────────────────────────────────────────────────
  experimental: {
    workerThreads: true,
    // Tree-shake barrel-heavy packages at import time — massive dev speedup
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'recharts',
      'framer-motion',
      '@radix-ui/react-icons',
      'react-day-picker',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-dialog',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      'class-variance-authority',
    ],
  },

  // ─── Images ──────────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    unoptimized: false,
  },

  // ─── Turbopack alias (dev) ────────────────────────────────────────────────────
  // Removed turbopack block to avoid illegal path errors.

  // ─── Webpack alias (build / test) ────────────────────────────────────────────
  webpack(config) {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      canvas: emptyModulePath,
      fs: emptyModulePath,
      net: emptyModulePath,
      tls: emptyModulePath,
    };
    config.resolve.fallback = {
      ...(config.resolve.fallback ?? {}),
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },

  // ─── Keep native packages server-side only ───────────────────────────────────
  serverExternalPackages: ['canvas'],

  // ─── Page extensions ─────────────────────────────────────────────────────────
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // ─── API Proxy ───────────────────────────────────────────────────────────────
  // All client-side calls to /api/* are forwarded to the NestJS backend.
  // SSR calls use INTERNAL_API_URL (localhost:8000) directly for speed.
  async rewrites() {
    const isProd = process.env.NODE_ENV === 'production';
    // The destination must be the backend server, never the frontend proxy itself.
    const backendTarget = process.env.INTERNAL_API_URL || 
      (isProd ? 'http://backend:4000/api' : 'http://localhost:4000/api');
      
    const normalizedTarget = backendTarget.replace(/\/$/, '');
    const apiTarget = normalizedTarget.endsWith('/api')
      ? normalizedTarget
      : `${normalizedTarget}/api`;

    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiTarget}/v1/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${apiTarget}/v1/:path*`,
      },
    ];
  },
};

const withBundleAnalyzer = withBundleAnalyzerInit({ enabled: process.env.ANALYZE === 'true' });

export default withSentryConfig(
  withBundleAnalyzer(nextConfig),
  {
    silent: true,
    org: "pec",
    project: "pec-frontend",
  },
  {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    hideSourceMaps: true,
    disableLogger: true,
  }
);
