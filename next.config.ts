// next.config.ts
type ResolveConfig = { fallback?: Record<string, false | string> };
type WebpackLikeConfig = { resolve?: ResolveConfig };

const nextConfig = {
  env: {
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
    THIRDWEB_SECRET_KEY: process.env.THIRDWEB_SECRET_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ipfs.thirdwebcdn.com',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'ipfscdn.io',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'nftstorage.link',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'cloudflare-ipfs.com',
        pathname: '/ipfs/**',
      },
    ],
  },
  webpack: (config: WebpackLikeConfig, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      // Asegurar que resolve y fallback existen antes de mutarlos
      config.resolve = config.resolve ?? {};
      config.resolve.fallback = {
        ...(config.resolve.fallback ?? {}),
        ws: false,
      };
    }
    return config;
  },
};

export default nextConfig;
