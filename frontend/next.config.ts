import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeScript is checked explicitly by `npm run typecheck` in local development and CI.
  // This avoids running Next's duplicated type-check step during the production build.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
