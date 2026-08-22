import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    serverActions: {
      // matches the 5MB client-side image size cap, plus multipart overhead
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
