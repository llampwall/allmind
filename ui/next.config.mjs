/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {}, // Empty config to silence webpack warning with Turbopack
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:7780/api/:path*",
      },
    ];
  },
};

export default nextConfig;
