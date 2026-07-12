import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  serverExternalPackages: ["@libsql/client", "@libsql/core", "@prisma/adapter-libsql"],
  images: {
    // Formatos otimizados que o Next/Image vai gerar automaticamente
    formats: ['image/avif', 'image/webp'],
    // Tamanhos de dispositivo para geração responsiva
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Permite imagens de domínios externos se necessário no futuro
    remotePatterns: [],
  },
};

export default nextConfig;
