import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const emptyModulePath = path.resolve(__dirname, 'src/lib/empty-module.ts');
const emptyModuleAlias = './src/lib/empty-module.ts';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  transpilePackages: ['@shared'],
  typescript: {
    ignoreBuildErrors: true,
  },

  // ─── Experimental ────────────────────────────────────────────────────────────
  experimental: {
    workerThreads: true,
    // Tree-shake large icon libraries at import time
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'recharts',
      'framer-motion',
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
  turbopack: {
    root: __dirname,
    resolveAlias: {
      canvas: emptyModuleAlias,
      fs: emptyModuleAlias,
      net: emptyModuleAlias,
      tls: emptyModuleAlias,
    },
  },

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
    const configuredTarget =
      process.env.INTERNAL_API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      'http://localhost:8000/api';
    const normalizedTarget = configuredTarget.replace(/\/$/, '');
    const apiTarget = normalizedTarget.endsWith('/api')
      ? normalizedTarget
      : `${normalizedTarget}/api`;

    return [
      {
        source: '/api/:path*',
        destination: `${apiTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
