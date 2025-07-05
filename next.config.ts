import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'export',
    images: {
        unoptimized: true, // Disable image optimization
    },
    eslint: {
        ignoreDuringBuilds: true, // Ignore ESLint errors during build
    },
    basePath: '',
    assetPrefix: '',
};

export default nextConfig;
