import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'export',
    eslint: {
        ignoreDuringBuilds: true, // Ignore ESLint errors during build
    },
    basePath: '/nucleares_dashboard'
  /* config options here */
};

export default nextConfig;
