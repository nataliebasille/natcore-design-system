/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@natcore/design-system-react"],
  webpack: (config) => {
    config.module.rules.push({
      test: /examples\/(?:native\.html)/,
      use: "raw-loader",
    });
    return config;
  },
};

module.exports = nextConfig;
