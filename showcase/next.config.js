/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@natcore/design-system-react'],
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
