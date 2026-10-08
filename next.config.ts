import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  serverExternalPackages: ["better-sqlite3", "nodemailer"],
  images: {
    localPatterns: [
      { pathname: "/images/**" },
      { pathname: "/media/public/**" },
    ],
  },
};

export default nextConfig;
