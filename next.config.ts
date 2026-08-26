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
  // Security headers (sección 8 del prompt maestro): CSP, HSTS y cabeceras
  // anti-ataques. El CSP es lo suficientemente permisivo para Mercado Pago
  // (iframe + SDK) sin dejar de restringir fuentes.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.mercadopago.com https://js.mercadopago.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://res.cloudinary.com https://placehold.co",
              "font-src 'self' data:",
              "frame-src https://www.mercadopago.com https://www.mercadopago.com.ar https://*.mercadopago.com",
              "connect-src 'self' https://api.mercadopago.com https://*.mercadopago.com https://api.cloudinary.com",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(self)",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
