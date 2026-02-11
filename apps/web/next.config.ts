import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for Tauri desktop app
  output: process.env.TAURI_ENV ? "export" : undefined,
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
