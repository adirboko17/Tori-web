import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["xlsx"],
  // the dev overlay badge defaults to bottom-left, on top of the chat FAB
  devIndicators: false,
  allowedDevOrigins: ["*.trycloudflare.com"],
  turbopack: { root: process.cwd() },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_PROJECT_ID: process.env.VITE_SUPABASE_PROJECT_ID,
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    VITE_SUPABASE_PROJECT_ID: process.env.VITE_SUPABASE_PROJECT_ID,
  },
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
