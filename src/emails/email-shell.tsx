import type { ReactNode } from "react";
import { Body, Container, Head, Hr, Html, Preview, Section, Text } from "react-email";

const brand = {
  ink: "#0c0c0f",
  inkSoft: "#16161a",
  inkBorder: "#26262d",
  gold: "#d4af37",
  goldLight: "#e8c874",
  bone: "#f3efe6",
  silver: "#a3a1ab",
};

export const emailColors = brand;

export function EmailShell({
  preview,
  title,
  children,
}: {
  preview: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: brand.ink, fontFamily: "Georgia, 'Times New Roman', serif", margin: 0, padding: "24px 0" }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: "0 16px" }}>
          <Section style={{ textAlign: "center", padding: "24px 0 16px" }}>
            <Text style={{ color: brand.goldLight, fontSize: 22, letterSpacing: "0.2em", fontWeight: 700, margin: 0 }}>
              DIAMONDVA.Co
            </Text>
            <Text style={{ color: brand.silver, fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase", margin: "6px 0 0" }}>
              {title}
            </Text>
          </Section>
          <Section style={{ backgroundColor: brand.inkSoft, border: `1px solid ${brand.inkBorder}`, borderRadius: 12, padding: "24px 24px 28px" }}>
            {children}
          </Section>
          <Hr style={{ borderColor: brand.inkBorder, margin: "20px 0" }} />
          <Section>
            <Text style={{ color: brand.silver, fontSize: 12, textAlign: "center", lineHeight: 1.6, margin: 0 }}>
              DIAMONDVA.Co — piezas que se notan, brillo que perdura.
              <br />
              San Miguel, Buenos Aires · Envíos a todo el país
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function EmailHeading({ children }: { children: ReactNode }) {
  return (
    <Text style={{ color: brand.bone, fontSize: 20, fontWeight: 700, margin: "0 0 12px" }}>
      {children}
    </Text>
  );
}

export function EmailText({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return (
    <Text style={{ color: muted ? brand.silver : brand.bone, fontSize: 14, lineHeight: 1.7, margin: "6px 0" }}>
      {children}
    </Text>
  );
}

export function EmailButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Section style={{ textAlign: "center", margin: "22px 0 6px" }}>
      <a
        href={href}
        style={{
          backgroundColor: brand.gold,
          color: brand.ink,
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 14,
          padding: "12px 28px",
          textDecoration: "none",
          display: "inline-block",
        }}
      >
        {children}
      </a>
    </Section>
  );
}

export function EmailHr() {
  return <Hr style={{ borderColor: brand.inkBorder, margin: "20px 0" }} />;
}

export function EmailCode({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        color: brand.goldLight,
        fontSize: 18,
        letterSpacing: "0.14em",
        fontWeight: 700,
        textAlign: "center",
        margin: "16px 0",
      }}
    >
      {children}
    </Text>
  );
}

export function formatARS(amount: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(amount);
}
