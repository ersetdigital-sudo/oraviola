import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // project ini berada di dalam home directory, jadi root Turbopack dipatok agar
  // tidak ikut memindai package-lock milik folder home
  turbopack: {
    root: path.resolve("."),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
