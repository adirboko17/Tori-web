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
      ...[
        ["/admin/apps", "/admin/businesses"],
        ["/admin/apps/new", "/admin/businesses/new"],
        ["/admin/apps/:id", "/admin/businesses/:id"],
        ["/admin/customers", "/admin/businesses"],
        ["/admin/customers/:id", "/admin/businesses/:id?tab=billing"],
        ["/admin/cancellations", "/admin/requests"],
        ["/admin/account-deletions", "/admin/requests/deletions"],
        ["/admin/purchases", "/admin/billing"],
        ["/admin/pricing", "/admin/billing/pricing"],
        ["/admin/packages", "/admin/billing/pricing"],
        ["/admin/operational-messages", "/admin/content"],
        ["/admin/videos", "/admin/content/videos"],
        ["/admin/privacy-apps", "/admin/content/privacy"],
      ].map(([source, destination]) => ({ source, destination, permanent: false })),
    ];
  },
};

export default nextConfig;
