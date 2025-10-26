/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force Turbopack to resolve to compiled output (not TS sources)
  turbopack: {
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /examples\/(?:native\.html)/,
      use: "raw-loader",
    });
    return config;
  },
};

module.exports = nextConfig;
