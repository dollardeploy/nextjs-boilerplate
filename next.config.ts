import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  experimental: {
    webVitalsAttribution: ["CLS", "LCP"],
    serverSourceMaps: true,
    isolatedDevBuild: false
  },
  devIndicators: false,
  // https://nextjs.org/docs/app/api-reference/config/next-config-js/logging
  logging: {
    incomingRequests: false,
    fetches: {
      fullUrl: true
    }
  }
};

export default nextConfig;
