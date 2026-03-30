import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const emptyModulePath = path.resolve(__dirname, 'src/lib/empty-module.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@tabler/icons-react',
      'date-fns',
      'recharts',
      'framer-motion',
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    unoptimized: false,
  },
  // Turbopack compatibility for packages that assume Node/canvas in browser context
  turbopack: {
    root: __dirname,
    resolveAlias: {
      canvas: './src/lib/empty-module.ts',
      fs: './src/lib/empty-module.ts',
      net: './src/lib/empty-module.ts',
      tls: './src/lib/empty-module.ts',
    },
  },
  // Keep server-side canvas as external to avoid bundling native deps
  serverExternalPackages: ['canvas'],
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      canvas: emptyModulePath,
      fs: emptyModulePath,
      net: emptyModulePath,
      tls: emptyModulePath,
    };
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  // Support for markdown and other extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

export default nextConfig;
