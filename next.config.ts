import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["better-sqlite3"],
  images: {
    localPatterns: [
      { pathname: "/images/**" },
      { pathname: "/media/public/**" },
    ],
  },
};

export default nextConfig;
