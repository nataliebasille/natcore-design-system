/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@natcore/design-system-react'],
  experimental: {
    appDir: true,
  },

  webpack(config, { dev }) {
    if(dev)
      config.cache = false;
    return config;
  }
};

module.exports = nextConfig;
