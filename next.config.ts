import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  experimental: {
    serverActions: { bodySizeLimit: "41mb" },
    proxyClientMaxBodySize: "41mb",
  },
  output: "standalone",
  serverExternalPackages: ["better-sqlite3", "nodemailer"],
  images: {
    localPatterns: [
      { pathname: "/images/**" },
    ],
  },
};

export default nextConfig;
