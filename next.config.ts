import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  serverExternalPackages: ["@libsql/client", "@libsql/core", "@prisma/adapter-libsql"],
};

export default nextConfig;
