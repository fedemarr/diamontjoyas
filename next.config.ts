import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Fotos de producto reales (Fase 4 en adelante).
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Placeholders del seed (sección 9) — se van reemplazando por fotos
      // reales en Cloudinary, pero mientras tanto tienen que poder renderizarse.
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
};

export default nextConfig;
