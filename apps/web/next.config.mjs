/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@findfunlinks/ui', '@findfunlinks/contracts', '@findfunlinks/api-client'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;
