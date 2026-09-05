/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@jobos/ui', '@jobos/shared', '@jobos/types', '@jobos/utils'],
  async rewrites() {
    const target = process.env.API_PROXY_TARGET || 'http://2.25.76.201:3011';
    return [
      {
        source: '/jobos-api/:path*',
        destination: `${target.replace(/\/$/, '')}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
