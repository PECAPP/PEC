import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const emptyModulePath = path.resolve(__dirname, 'src/lib/empty-module.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  typescript: {
    ignoreBuildErrors: true,
  },

  // ─── Experimental ────────────────────────────────────────────────────────────
  experimental: {
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
      canvas: './src/lib/empty-module.ts',
      fs: './src/lib/empty-module.ts',
      net: './src/lib/empty-module.ts',
      tls: './src/lib/empty-module.ts',
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
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_API_URL ?? 'http://localhost:4000'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
