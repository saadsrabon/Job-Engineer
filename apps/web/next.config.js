/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@jobos/ui', '@jobos/shared', '@jobos/types', '@jobos/utils'],
};

module.exports = nextConfig;
