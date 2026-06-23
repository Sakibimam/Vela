import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {
    resolveAlias: {
      '@vela/lib': '../lib/dist/index.mjs',
      '@stellar/stellar-sdk': '@stellar/stellar-sdk/lib/index.js',
    },
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    }

    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '@vela/lib': path.resolve(__dirname, '../lib/dist/index.mjs'),
      },
    }

    return config
  },
}

export default nextConfig
