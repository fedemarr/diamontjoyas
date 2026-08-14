# PROMPT MAESTRO — E-COMMERCE DIAMONDVA.Co

> Pegá este archivo completo en Claude Code como primer mensaje del proyecto.
> Activá primero los skills: `elite-fullstack-team` + `ux-ui-designer-supreme`.

---

## 0. CONTEXTO DEL PROYECTO

Vas a construir un e-commerce completo, real y listo para producción para **DIAMONDVA.Co**, una joyería de Argentina (zona San Miguel, Provincia de Buenos Aires) que vende **joyas enchapadas, oro bajo y oro 18k**, con envíos a todo el país.

- Instagram: `@diamondva.co`
- Contacto comercial: `@_alealbornoz`
- Ubicación: San Miguel, Buenos Aires, Argentina
- Moneda: **ARS** (pesos argentinos)
- Idioma: **español rioplatense** (voseo en microcopy: "Comprá", "Elegí", "Consultanos")

El dueño no es técnico. **Todo el contenido del sitio tiene que ser editable desde el panel admin sin tocar código**: productos, precios, categorías, banners, textos del home, medios de pago, costos de envío, datos de contacto, promos. Yo voy a dejar datos precargados de ejemplo, pero después él maneja todo solo.

### Rol que asumís
Actuás como el equipo completo: Software Architect, Senior Full-Stack Dev, Database Architect, Security Engineer y UX/UI Designer senior. Escribís código de producción, tipado, con manejo de errores, sin `any`, sin placeholders, sin "acá va la lógica".

---

## 1. STACK OBLIGATORIO

```
Framework      Next.js 15 (App Router) + React 19
Lenguaje       TypeScript (strict: true)
Estilos        Tailwind CSS + shadcn/ui
Animaciones    Framer Motion (sutiles, con propósito)
Estado UI      Zustand (carrito, con persist en localStorage)
Estado server  TanStack Query en el panel admin
Forms          React Hook Form + Zod (schema = tipo, nunca duplicar)
Iconos         Lucide React
ORM            Prisma
Base de datos  PostgreSQL (Neon serverless — connection pooling)
Auth           NextAuth v5 / Auth.js — Credentials provider, bcrypt cost 12
Imágenes       Cloudinary (upload firmado desde el server, nunca API key en cliente)
Pagos          Mercado Pago Checkout Pro (SDK oficial `mercadopago` v2)
Emails         Resend + React Email
Rate limiting  Upstash Redis (o in-memory fallback en dev)
Deploy         Vercel
```

**No uses Stripe.** En Argentina el medio de pago es Mercado Pago.

### Estructura de carpetas

```
src/
├── app/
│   ├── (shop)/              # storefront público
│   │   ├── page.tsx                    # home
│   │   ├── tienda/page.tsx             # catálogo con filtros
│   │   ├── producto/[slug]/page.tsx
│   │   ├── categoria/[slug]/page.tsx
│   │   ├── carrito/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── checkout/exito/page.tsx
│   │   ├── checkout/pendiente/page.tsx
│   │   ├── checkout/error/page.tsx
│   │   ├── seguimiento/[code]/page.tsx # tracking de pedido sin login
│   │   ├── contacto/page.tsx
│   │   └── legales/[slug]/page.tsx
│   ├── (admin)/admin/       # panel privado
│   ├── login/
│   └── api/
│       ├── webhooks/mercadopago/route.ts
│       ├── checkout/route.ts
│       └── admin/[...]/route.ts
├── components/{ui,shop,admin,layouts}/
├── lib/{db.ts,auth.ts,mercadopago.ts,cloudinary.ts,email.ts,pricing.ts,rate-limit.ts,validations/}
├── hooks/  ├── stores/  ├── types/  └── emails/
```

---

## 2. IDENTIDAD VISUAL — "DARK LUXURY JEWELRY"

El logo es negro con un diamante blanco, ornamentos dorados y tipografía serif metálica plata/oro. La estética del sitio debe ser **dark premium tipo joyería de alta gama** — pensá Cartier / Bvlgari / Tiffany, no tienda genérica de Tiendanube.

### Paleta (definila como CSS variables + tokens de Tailwind)

```css
--ink:        #0B0B0C   /* fondo principal — negro suave, NO #000 puro */
--ink-soft:   #141416   /* superficies / cards */
--ink-border: #232326   /* bordes sutiles */
--gold:       #C9A227   /* dorado base — CTA principal */
--gold-light: #E8C87A   /* highlight de gradiente */
--gold-deep:  #8C6D1F   /* sombra de gradiente */
--silver:     #C8CCD0   /* texto secundario / detalles */
--bone:       #F5F3EF   /* texto principal — blanco cálido, NO #fff puro */
--success:    #3FA66A
--danger:     #D9534F
```

Gradiente dorado firma para CTAs y detalles:
`linear-gradient(135deg, var(--gold-deep) 0%, var(--gold) 45%, var(--gold-light) 100%)`

### Tipografía
- **Display / títulos:** `Cormorant Garamond` (600/700) — serif elegante, hace juego con el logo
- **UI / body:** `Inter` (400/500/600)
- Cargar con `next/font` (sin layout shift). Tracking amplio en títulos de sección (`letter-spacing: 0.08em`, uppercase en labels).

### Reglas de diseño
- Fondo oscuro, **la foto del producto es la protagonista**. Cards con fondo `--ink-soft`, borde 1px `--ink-border`, hover: borde dorado + `translateY(-4px)` en 250ms.
- Espaciado sistema 8px, generoso. Radios: 6/12/16px.
- Sin gradientes chillones, sin sombras coloreadas. El lujo es contraste y aire.
- Microinteracciones: fade-in + slide-up al entrar secciones (Framer Motion, `viewport once`), skeleton loaders con shimmer dorado tenue, badge del carrito animado al agregar.
- **Mobile-first.** Breakpoints 375 / 768 / 1280 / 1440. Touch targets ≥44px. Barra inferior sticky en mobile con "Agregar al carrito" en la ficha de producto.
- Accesibilidad: contraste WCAG AA mínimo, focus rings visibles, alt text en todas las imágenes.

### IMPORTANTE sobre la referencia
El cliente mostró `atenasjoyas.com.ar` como referencia. **Tomá de ahí solo la ESTRUCTURA y las funcionalidades** (barra de anuncios superior, buscador en header, home con carrusel de últimos lanzamientos + accesos por categoría + grillas por categoría, catálogo con filtros laterales, ficha de producto con galería + relacionados, checkout en pasos, página de contacto con form + datos).
**NO copies su estética**: es un WooCommerce claro y genérico. DIAMONDVA es oscuro, sobrio y premium. Identidad visual 100% original.

---

## 3. MODELO DE DATOS (Prisma)

Convenciones: `id` UUID, `createdAt`/`updatedAt` en todo, **soft delete con `deletedAt`** (nunca borrar datos reales), índices en FKs y campos de búsqueda, enums para estados.

```
User          id, email(unique), passwordHash, name, role(ADMIN|STAFF), lastLoginAt
Category      id, name, slug(unique), description, imageUrl, icon, order, isActive, parentId?
Product       id, name, slug(unique), description, sku(unique), categoryId,
              material(ORO_18K|ORO_BAJO|ENCHAPADO|PLATA_925|ACERO_QUIRURGICO),
              pricingMode(FIXED|BY_WEIGHT),
              price(Decimal)?,          // si FIXED
              weightGrams(Decimal)?,    // si BY_WEIGHT
              laborCost(Decimal)?,      // adicional por hechura, si BY_WEIGHT
              compareAtPrice(Decimal)?, // tachado, solo liquidación
              cost(Decimal)?,           // costo interno → margen en finanzas, NUNCA expuesto al público
              stock(Int), lowStockAlert(Int), trackStock(Bool),
              isActive, isFeatured, order, views(Int),
              metaTitle?, metaDescription?
ProductImage  id, productId, url, alt, order, isPrimary
ProductVariant id, productId, name (ej "45cm"), sku, priceDelta, weightGrams?, stock
Order         id, orderNumber(unique, formato DVA-000123), publicCode(unique, para /seguimiento),
              customerName, customerEmail, customerPhone, customerDni?,
              shippingMethod(ENVIO_DOMICILIO|SUCURSAL_CORREO|RETIRO_LOCAL),
              shippingAddress(Json)?, shippingCost(Decimal),
              subtotal, discount, total,
              paymentMethod(MERCADO_PAGO|TRANSFERENCIA|EFECTIVO),
              paymentStatus(PENDING|APPROVED|IN_PROCESS|REJECTED|REFUNDED|CANCELLED),
              orderStatus(NUEVO|CONFIRMADO|PREPARANDO|ENVIADO|ENTREGADO|CANCELADO),
              mpPaymentId?, mpPreferenceId?, mpMerchantOrderId?,
              trackingCode?, internalNotes?, customerNotes?
OrderItem     id, orderId, productId?, variantId?,
              productName, productSku, unitPrice, quantity, subtotal, unitCost?  // snapshot histórico
Coupon        id, code(unique), type(PERCENT|FIXED), value, minPurchase?,
              maxUses?, usedCount, validFrom, validUntil, isActive
Banner        id, title, subtitle?, imageUrl, mobileImageUrl?, linkUrl?, order, isActive,
              startsAt?, endsAt?
Announcement  id, text, linkUrl?, order, isActive          // barra superior rotativa
Setting       key(unique), value(Json)                      // config global editable
ContactMessage id, name, email, phone?, message, isRead, createdAt
AuditLog      id, userId, action, entity, entityId, changes(Json), ip, createdAt
```

### Settings (todo editable desde el admin, sin deploy)
`goldPricePerGram18k`, `goldPricePerGramLow`, `storeName`, `logoUrl`, `whatsapp`, `email`, `address`, `instagram`, `facebook`, `businessHours`, `shippingRates` (AMBA / Interior / retiro), `freeShippingThreshold`, `transferDiscountPercent`, `installmentsEnabled`, `installmentsCount`, `heroTitle`, `heroSubtitle`, `aboutText`, `whatsappOrderTemplate`, `maintenanceMode`.

### Lógica de precio por peso (`lib/pricing.ts`) — DIFERENCIAL CLAVE
```ts
// El precio del oro se mueve todo el tiempo. El admin actualiza UN valor
// (goldPricePerGram18k) y se recalculan todos los productos BY_WEIGHT.
precioFinal = pricingMode === 'FIXED'
  ? price
  : (weightGrams * goldPricePerGram(material)) + (laborCost ?? 0)
```
Redondeo a centena de pesos hacia arriba. Un único helper `getProductPrice()` usado en TODO el sistema (grilla, ficha, carrito, checkout, admin) — que no haya dos fuentes de verdad. En el admin, al cambiar el precio del gramo, mostrar preview de cuántos productos se afectan y con qué precios nuevos antes de confirmar.

---

## 4. STOREFRONT — PÁGINAS

**Home**
1. Barra superior con anuncios rotativos (desde `Announcement`)
2. Header: logo, buscador con autocomplete, carrito con badge animado, menú
3. Hero: banner/carrusel editable + título y CTA desde Settings
4. Franja de confianza: 3 íconos (Envíos a todo el país · Mercado Pago en cuotas · Garantía y calidad)
5. Grilla de categorías con imagen (cadenas, anillos/sellos, dijes, pulseras/esclavas, aros, conjuntos, alianzas)
6. "Últimos ingresos" (carrusel horizontal, `isFeatured`)
7. Sección "Oro 18k" destacada — la línea premium, con tratamiento visual diferenciado
8. Feed / prueba social de Instagram (grilla estática editable, links a `@diamondva.co`)
9. Newsletter + footer completo (navegación, contacto, redes, legales, medios de pago)

**Catálogo `/tienda`** — filtros laterales (categoría, material, rango de precio, disponibilidad), orden (novedades / precio ↑ / precio ↓ / más vendidos), paginación server-side, filtros en URL (`?material=ORO_18K&min=50000`) para compartir/SEO, drawer de filtros en mobile, skeletons.

**Ficha `/producto/[slug]`** — galería con zoom y miniaturas, nombre + precio grande, precio con transferencia si hay descuento configurado, cuotas si están habilitadas, material y peso en gramos (clave para oro), selector de variante (largo/talle), selector de cantidad, "Agregar al carrito" + "Consultar por WhatsApp" (mensaje prellenado con nombre y link del producto), acordeón (descripción / envíos / garantía y cuidados), badge de stock bajo, relacionados de la misma categoría, JSON-LD `Product` para SEO.

**Carrito** — drawer lateral + página completa, editar cantidades, subtotal en vivo, campo de cupón, aviso de envío gratis faltante ("Te faltan $X para envío gratis"), persistencia en localStorage.

**Checkout** — una sola página con 3 bloques (datos → envío → pago), validación con Zod en vivo, cálculo de envío por provincia/CP según `shippingRates`, opción retiro en local San Miguel (envío $0), resumen sticky. Sin obligar a crear cuenta (guest checkout — el registro obligatorio mata conversión).
Métodos: **Mercado Pago** (redirect a Checkout Pro), **Transferencia** (muestra CBU/alias desde Settings + descuento configurado), **Efectivo en local**.
Al confirmar: crea `Order` con estado `PENDING` → redirect según método.

**Post-compra** — páginas de éxito / pendiente / error con `publicCode` visible, y `/seguimiento/[code]` para ver el estado del pedido sin login.

**Otras** — Contacto (form → `ContactMessage` + mail al dueño, datos, WhatsApp, mapa de San Miguel), Legales (Términos, Privacidad, Cambios y devoluciones, **Botón de arrepentimiento** — obligatorio por ley en Argentina), 404 diseñada.

---

## 5. PANEL ADMIN `/admin`

Layout: sidebar oscura con íconos + topbar con buscador global. Protegido por middleware — cualquier ruta `/admin/*` sin sesión válida redirige a `/login`.

**Dashboard** — cards de ventas del día/semana/mes, ticket promedio, pedidos por estado, gráfico de ventas (Recharts), top 5 productos, alertas de stock bajo, últimos pedidos.

**Productos** — tabla con búsqueda, filtros y bulk actions; alta/edición con uploader drag & drop multi-imagen (reordenables, marcar principal), selector `FIXED` vs `BY_WEIGHT` con preview del precio calculado en vivo, variantes, SEO, duplicar producto, activar/desactivar. **Importar/exportar CSV** (para cargar catálogo masivo sin sufrir).

**Categorías** — CRUD con orden drag & drop e imagen.

**Pedidos** — tabla filtrable por estado/fecha/método; detalle con datos del cliente, ítems, totales, estado de pago MP; cambiar estado (dispara email automático al cliente); cargar código de seguimiento; notas internas; botón "Contactar por WhatsApp" con mensaje prellenado; imprimir remito.

**Finanzas** — ingresos por período, **margen bruto** (usando `cost` y `unitCost` histórico de cada ítem), ventas por categoría y por material, comparativa contra período anterior, exportar a CSV/Excel. Es lo que el cliente pidió explícitamente: que maneje sus finanzas solo.

**Precio del oro** — pantalla dedicada, grande y clara: input del valor del gramo 18k y del oro bajo, preview de productos afectados con precio viejo → precio nuevo, botón "Actualizar precios". Historial de cambios.

**Cupones · Banners y anuncios · Mensajes de contacto · Configuración** (todos los Settings agrupados por pestañas: Tienda / Contacto / Envíos / Pagos / Textos del home / Redes) **· Usuarios** (crear staff con rol limitado).

Todo el admin en español, con confirmaciones antes de acciones destructivas, toasts de feedback, estados de loading/error/empty diseñados, y **guía inline** en los campos técnicos (el dueño no es técnico: al lado de "SKU" poné "Código interno del producto").

---

## 6. MERCADO PAGO — INTEGRACIÓN

1. `POST /api/checkout` valida el carrito **recalculando precios en el servidor** (nunca confiar en el precio que manda el cliente — riesgo de manipulación), verifica stock, crea la `Order` y la preferencia con `back_urls`, `external_reference = order.id`, `notification_url`, `statement_descriptor: "DIAMONDVA"`.
2. Webhook `POST /api/webhooks/mercadopago`:
   - **Verificar la firma `x-signature`** con `MP_WEBHOOK_SECRET` (HMAC) → si no valida, 401.
   - **Idempotencia**: si el `mpPaymentId` ya fue procesado, devolver 200 y salir.
   - Consultar el pago a la API de MP (no confiar en el body del webhook).
   - Mapear estado → `paymentStatus`. Si `approved`: descontar stock en transacción, `orderStatus = CONFIRMADO`, disparar emails.
   - Responder 200 rápido; el trabajo pesado no debe bloquear la respuesta.
3. Sandbox primero con credenciales de test, y flag `MP_ENVIRONMENT` para alternar.

---

## 7. MENSAJES AUTOMÁTICOS

**Emails (Resend + React Email, plantillas dark con el branding):**
- Al cliente: pedido recibido (con `publicCode` y link de seguimiento) · pago aprobado · pago rechazado con instrucciones · pedido enviado con tracking · pedido entregado
- Al dueño: nuevo pedido · nuevo mensaje de contacto · alerta de stock bajo

**WhatsApp:**
- Botón "Consultar por WhatsApp" en cada producto, con mensaje prellenado (`wa.me` con texto URL-encoded).
- En la confirmación de compra, botón "Enviar comprobante por WhatsApp" con el número de pedido prellenado (clave para el método transferencia).
- En el admin, botón para contactar al cliente por WhatsApp desde el detalle del pedido.
- Plantillas de mensaje editables desde Settings.

**Extensible:** dejá un `emitEvent(event, payload)` en `lib/events.ts` que además dispare un POST a `N8N_WEBHOOK_URL` si está seteada. Así después se automatiza lo que haga falta sin tocar el core.

---

## 8. SEGURIDAD (no negociable)

- Zod en **todos** los endpoints (body, params, query).
- Precios, totales, descuentos y stock **siempre recalculados en el servidor**.
- Rate limiting: `/api/checkout`, `/login`, form de contacto, y global por IP.
- Passwords con bcrypt cost 12. Sesiones JWT httpOnly + secure + sameSite. CSRF cubierto por NextAuth.
- Security headers en `next.config` (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
- Sanitización de inputs de texto libre (descripciones del admin) antes de renderizar.
- Uploads: validar mimetype y tamaño real, no la extensión. Firmar desde el server.
- Secrets solo en `.env` — nunca en el código, nunca en `NEXT_PUBLIC_*` salvo lo que es realmente público.
- `AuditLog` en toda acción de admin (quién cambió qué y cuándo).
- Soft delete en productos y categorías; los pedidos nunca se borran.
- Logs estructurados sin datos sensibles (nada de tokens, passwords ni datos de tarjeta).
- Honeypot + rate limit en el form de contacto (spam).

---

## 9. SEED — DATOS PRECARGADOS

`prisma/seed.ts` que cree:
- 1 usuario ADMIN (credenciales por env var, y el README avisa de cambiarlas en el primer login)
- 7 categorías: Cadenas, Anillos y Sellos, Dijes, Pulseras y Esclavas, Aros, Conjuntos, Alianzas
- ~20 productos de ejemplo mezclando los 5 materiales, con al menos 4 en modo `BY_WEIGHT` (oro 18k) para demostrar el cálculo por gramo
- 3 anuncios para la barra superior, 2 banners de home, 1 cupón de ejemplo
- Todos los `Setting` con valores por defecto realistas de Argentina (envío AMBA, interior, retiro en San Miguel, 6 cuotas, alias de transferencia placeholder)

Usá imágenes placeholder de Cloudinary/Unsplash con `alt` descriptivo; después las reemplazo por las fotos reales del cliente.

---

## 10. ENTREGABLES

- `.env.example` con **todas** las variables comentadas y explicadas
- `README.md`: setup paso a paso, cómo obtener credenciales de Mercado Pago, cómo deployar en Vercel, cómo correr el seed
- `MANUAL-CLIENTE.md`: **manual en español simple, sin jerga técnica**, para que el dueño aprenda a cargar productos, cambiar el precio del oro, gestionar pedidos y ver sus finanzas. Con pasos numerados.
- Lighthouse objetivo: >90 en Performance y Accessibility en mobile
- `sitemap.xml` + `robots.txt` + Open Graph por producto

---

## 11. ORDEN DE TRABAJO — TRABAJÁ POR FASES

No generes todo de una. Ejecutá fase por fase y **frená al final de cada una para que yo revise y confirme** antes de seguir.

| Fase | Contenido |
|------|-----------|
| **1** | Setup: proyecto, Tailwind + tokens de diseño, shadcn, Prisma schema completo, `.env.example`, layout base con header/footer |
| **2** | Base de datos + seed + `lib/pricing.ts` con tests del cálculo por gramo |
| **3** | Auth + middleware de protección + login + layout del admin |
| **4** | Admin: CRUD de productos, categorías, imágenes, pantalla de precio del oro |
| **5** | Storefront: home, catálogo con filtros, ficha de producto |
| **6** | Carrito + checkout + integración Mercado Pago + webhook |
| **7** | Admin: pedidos, finanzas, cupones, banners, settings, mensajes |
| **8** | Emails, WhatsApp, SEO, seguridad final, performance, README + manual del cliente |

**Antes de empezar la Fase 1**, devolveme:
1. El plan de arquitectura resumido y las decisiones que tomaste
2. El `schema.prisma` completo para que lo apruebe
3. Cualquier duda o supuesto que estés asumiendo

Después de cada fase, listá qué quedó hecho, qué falta y qué necesitás de mí.
