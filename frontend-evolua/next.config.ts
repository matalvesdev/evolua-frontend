import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "static.arasaac.org",
        pathname: "/pictograms/**",
      },
      {
        protocol: "https",
        hostname: "api.arasaac.org",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days for ARASAAC pictograms
  },
  experimental: {
    optimizePackageImports: [
      "@tabler/icons-react",
      "lucide-react",
      "@supabase/supabase-js",
      "recharts",
      "date-fns",
      "jspdf",
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  poweredByHeader: false,
  compress: true,
  // Optimize bundle — deduplicate packages
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle heavy server-only packages on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
