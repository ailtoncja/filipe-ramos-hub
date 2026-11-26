import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  outputFileTracingIncludes: {
    '/*': ['./public/data/videos.json'],
  },
};

export default nextConfig;
