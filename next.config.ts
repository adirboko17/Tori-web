import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: process.cwd() },
  async redirects() {
    return [
      { source: "/Tori.html", destination: "/", permanent: true },
      {
        source: "/Onboarding.html",
        destination: "/onboarding",
        permanent: true,
      },
      {
        source: "/ui_kits/tori-app/index.html",
        destination: "/demo",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
