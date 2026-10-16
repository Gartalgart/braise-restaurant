import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  webpack: (config) => {
    // Les captures Playwright (.playwright-mcp) ne doivent pas déclencher de recompilation
    config.watchOptions = { ...config.watchOptions, ignored: ["**/node_modules/**", "**/.playwright-mcp/**"] };
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
