import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // Убираем output: "export" для нормальной работы клиентского роутинга
  // trailingSlash: true, // Можно оставить, если нужно
};

export default nextConfig;
