/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.docs.tsx": {
        loaders: ["./loaders/preview-jsx-pragma.cjs"],
        as: "*.tsx",
      },
    },
  },
};

export default nextConfig;
