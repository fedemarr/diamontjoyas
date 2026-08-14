import { Cormorant_Garamond, Inter } from "next/font/google";

/**
 * Tipografía de marca (sección 2 del prompt maestro).
 * - Cormorant Garamond: display / títulos, hace juego con el logo.
 * - Inter: UI / body.
 * Cargadas con next/font para evitar layout shift (self-hosted, sin FOUT).
 */

export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});
