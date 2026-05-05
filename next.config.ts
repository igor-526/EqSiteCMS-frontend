import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Убираем output: "export" для нормальной работы клиентского роутинга
  // trailingSlash: true, // Можно оставить, если нужно
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
