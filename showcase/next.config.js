/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@natcore/design-system-react'],
  experimental: {
    appDir: true,
  },

  webpack(config, { dev }) {
    // uncomment this when working with icons
    // if(dev)
    //   config.cache = false;
    return config;
  }
};

module.exports = nextConfig;
