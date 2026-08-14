# DIAMONDVA.Co

E-commerce de joyería de alta gama — Next.js + Prisma + Mercado Pago, con admin completo para gestionar productos, pedidos, finanzas y contenido sin tocar código.

## Stack

- **Next.js 15** (App Router, React 19, TypeScript estricto)
- **Tailwind CSS 4** + shadcn/ui — tema "dark luxury" (ink / gold / bone)
- **Prisma + PostgreSQL** (pensado para Supabase con pooling)
- **NextAuth v5** (Credentials, sesiones JWT)
- **Mercado Pago** Checkout Pro + webhook (stock se descuenta al aprobarse el pago)
- **Resend + React Email** (mails transaccionales con branding dark)
- **Zustand** (carrito) + **TanStack Query** (admin) + **React Hook Form + Zod**
- **Vitest** para los tests de lógica pura (pricing, envíos, mercadopago, carrito)

## Funcionalidades

**Storefront**
- Home con hero, banners, anuncios rotativos y categorías
- Catálogo con filtros (categoría, material, precio, stock, búsqueda, orden)
- Ficha de producto con galería, variantes, cálculo por gramo (oro 18k), precios por transferencia y cuotas
- Carrito (drawer + página) y checkout con Mercado Pago, transferencia o efectivo
- Seguimiento de pedido por código público, página de contacto (con honeypot anti-spam)
- URLs SEO: `/categoria/[slug]`, `/producto/[slug]`, sitemap.xml, robots.txt, Open Graph y JSON-LD

**Admin (`/admin`)**
- Dashboard: ventas del día/semana/mes, ticket promedio, top productos, stock bajo, últimos pedidos
- Productos: CRUD completo, variantes, imágenes (Cloudinary), import/export CSV, precio del oro con historial
- Categorías con orden por arrastre
- Pedidos: listado con filtros, detalle, cambios de estado, tracking, notas, remito imprimible, contacto por WhatsApp
- Finanzas: ingresos, márgenes, comparativo con período anterior, top productos y export CSV
- Cupones, banners y anuncios, mensajes de contacto
- Configuración: todos los textos, costos de envío, pagos, redes y plantilla de WhatsApp

**Automático**
- Emails al cliente: pedido recibido, pago aprobado/rechazado, enviado (con tracking), entregado
- Emails al dueño: nuevo pedido, nuevo mensaje de contacto, alerta de stock bajo
- Botón de WhatsApp en productos, en la confirmación (comprobante) y en el detalle del pedido (admin)
- `emitEvent()` extensible: también dispara un POST a `N8N_WEBHOOK_URL` si está seteada

## Puesta en marcha

```bash
# 1) Instalar dependencias
npm install

# 2) Variables de entorno — copiá y completá
cp .env.example .env

# 3) Migraciones + seed (crea el admin, categorías, productos y settings)
npm run db:seed

# 4) Desarrollo
npm run dev
```

### Credenciales de Mercado Pago

1. Entrá a [Mercado Pago para desarrolladores](https://www.mercadopago.com.ar/developers) → *Tus integraciones*.
2. Usá primero las credenciales **de prueba** (modo sandbox): copiá `Access Token` en `MP_ACCESS_TOKEN` y la `Public Key` en `NEXT_PUBLIC_MP_PUBLIC_KEY`.
3. Configurá el **Webhook** apuntando a `https://tu-dominio.com/api/webhooks/mercadopago` y pegá el *secret* en `MP_WEBHOOK_SECRET`.
4. Para cobrar de verdad, activá el modo producción y repetí con las credenciales de producción (`MP_ENVIRONMENT=production`).
5. En el admin: **Precio del oro** → *actualizar* recalcula los precios por gramo (para pruebas podés cargar precios chicos y ajustar stock).

> En modo sandbox la app no cobra dinero real; usá las tarjetas de prueba que te da Mercado Pago.

### Variables de entorno

Todas están documentadas en [.env.example](.env.example). Las clave:

| Variable | Para qué |
|---|---|
| `DATABASE_URL` / `DIRECT_URL` | Postgres (pool / migrate) |
| `AUTH_SECRET` | Firma de sesiones JWT |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Usuario admin inicial (seed) — cambiarlo en el primer login |
| `NEXT_PUBLIC_SITE_URL` | URLs absolutas (emails, sitemap, OG) |
| `CLOUDINARY_*` | Imágenes de productos |
| `MP_*` | Mercado Pago |
| `RESEND_API_KEY` / `EMAIL_FROM` / `OWNER_EMAIL` | Emails transaccionales |
| `UPSTASH_REDIS_*` | Rate limiting distribuido (opcional — sin esto se usa el fallback en memoria) |
| `N8N_WEBHOOK_URL` | Automatización opcional con n8n |

## Deploy en Vercel

1. Subí el proyecto a GitHub (Vercel importa desde el repo).
2. En [vercel.com](https://vercel.com) → *Add New → Project* → importá el repo.
3. En **Settings → Environment Variables** cargá las mismas del `.env` (¡incluida `DATABASE_URL` y `AUTH_SECRET`!).
4. Deploy. Al terminar, `AUTH_URL`/`NEXT_PUBLIC_SITE_URL` ya apuntan a tu dominio.
5. Configurá el webhook de Mercado Pago con el dominio de producción y el cron de Prisma Migrate si querés migraciones automáticas.

## Tests

```bash
npm test          # vitest run
npm run lint      # ESLint
npx tsc --noEmit  # typecheck
npm run build     # build de producción
```

## Seguridad

- Zod en todos los endpoints (body, params y query) y precios/totales/stock siempre recalculados en el servidor
- Rate limiting por IP en checkout, login, cupón y contacto, más un límite global sobre `/api/*`
- Passwords con bcrypt (costo 12), sesiones JWT httpOnly, CSRF cubierto por NextAuth
- Security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Texto libre sanitizado antes de renderizar; JSON-LD escapado contra `</script>`
- Uploads firmados desde el servidor (Cloudinary), secrets solo en `.env`
- `AuditLog` en toda acción de admin; soft delete en productos/categorías; los pedidos nunca se borran

## Estructura

```
src/
├── app/
│   ├── (admin)/admin/        # Panel admin (rutas protegidas)
│   ├── (shop)/               # Storefront: home, tienda, producto, carrito, checkout...
│   ├── api/                  # Route handlers (admin, checkout, webhook, contacto...)
│   └── login/
├── components/
│   ├── shop/                 # UI del storefront
│   ├── admin/                # Gráfico, uploads, variantes...
│   ├── layouts/              # Header, footer, sidebar del admin
│   └── ui/                   # shadcn/ui
├── emails/                   # Templates de React Email (dark)
├── lib/
│   ├── validations/          # Schemas Zod
│   ├── queries/              # Consultas del storefront
│   ├── pricing.ts, shipping.ts, stock.ts, finanzas.ts, email.ts, events.ts...
│   └── admin-api.ts          # Cliente fetch tipado para el admin
├── stores/                   # Zustand (carrito)
├── types/                    # Tipos compartidos
└── middleware.ts             # Protección /admin + rate limit global
```

## Manual para el dueño

El día a día del negocio está explicado sin jerga técnica en **[MANUAL-CLIENTE.md](MANUAL-CLIENTE.md)**.
