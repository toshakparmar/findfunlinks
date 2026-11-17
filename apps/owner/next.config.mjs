/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  transpilePackages: ['@findfunlinks/ui', '@findfunlinks/contracts', '@findfunlinks/api-client'],
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;
