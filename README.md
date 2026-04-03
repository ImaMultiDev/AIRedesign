# AIRedesign · AINterior

Plataforma web **premium** para presentar rediseños de interiores asistidos por IA: galería pública tipo “antes y después”, flujo **freemium** con plan **Plus** (suscripción vía Stripe) y panel de administración para contenido, solicitudes de clientes y entregables.

---

## Visión del producto

AINterior comunica un servicio de transformación espacial de alto nivel: la visita descubre la propuesta visual en la galería; los usuarios registrados pueden pedir propuestas; el **plan Plus** desbloquea presupuestos detallados, fichas técnicas en PDF y prioridad en el flujo del estudio. El admin gestiona escaparates, solicitudes, PDFs en la nube y el vínculo con pagos.

---

## Funcionalidades principales

| Área | Descripción |
|------|-------------|
| **Landing** | Hero, galería paginada con comparador antes/después (modal a pantalla completa). |
| **Galería Plus (gancho comercial)** | Por ejemplo en BD: ficha PDF y bloque de presupuesto; botones en tarjeta con **paywall** (modal de suscripción si no es Plus). |
| **Autenticación** | Clientes: **magic link** por correo (Resend). Equipo: **/admin/login** con credenciales; rol `ADMIN` en base de datos o variables de seed. |
| **Plan gratuito** | Galería, solicitud de propuesta básica, resumen orientativo. |
| **Plan Plus** | Stripe (Checkout + Customer Portal + webhooks), presupuestos detallados, descarga de PDFs vía rutas protegidas. |
| **Área cliente** | `/cuenta`: suscripción, solicitudes, alta de nuevas peticiones. |
| **Administración** | `/admin`: CRUD de escaparates (Cloudinary), solicitudes de propuestas, PDFs técnicos, estados y envío de correos en hitos clave. |
| **Correo** | Resend: enlaces de acceso, bienvenida Plus, avisos de entrega de propuestas. |

---

## Stack tecnológico

- **Framework:** [Next.js](https://nextjs.org) 16 (App Router), React 19, TypeScript  
- **Estilos:** Tailwind CSS 4, [shadcn/ui](https://ui.shadcn.com) (Radix, Base UI), Framer Motion  
- **Datos:** [Prisma](https://www.prisma.io) 5 · PostgreSQL  
- **Auth:** [NextAuth.js](https://next-auth.js.org) v4 + adaptador Prisma (JWT)  
- **Medios:** [Cloudinary](https://cloudinary.com) (imágenes + PDF raw)  
- **Pagos:** [Stripe](https://stripe.com) (suscripciones + webhooks)  
- **Email:** [Resend](https://resend.com)  
- **Calidad:** ESLint (`eslint-config-next`)

---

## Requisitos

- Node.js **20+** (recomendado)
- Cuenta y URL de **PostgreSQL**
- Cuentas de servicio opcionales según entorno: **Cloudinary**, **Stripe**, **Resend**

---

## Configuración local

### 1. Variables de entorno

Copia `.env.example` a `.env` en la **raíz del proyecto** (junto a `package.json`) y completa los valores. Referencia rápida:

| Variable | Uso |
|----------|-----|
| `DATABASE_URL` | Cadena PostgreSQL |
| `NEXTAUTH_SECRET` | Secreto firma JWT (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Origen del sitio (`http://localhost:3000` en local; en Vercel, tu `https://…` sin barra final) |
| `CLOUDINARY_*` | Subida de imágenes y PDFs |
| `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` | Acceso inicial a `/admin` y seed de Prisma |
| `STRIPE_*` | Checkout Plus, webhooks, portal de facturación |
| `RESEND_API_KEY` / `EMAIL_FROM` | Magic link y correos transaccionales |

### 2. Instalación y base de datos

```bash
npm install
npx prisma db push   # o migrate deploy en CI
npm run dev
```

Semilla del usuario administrador (ajusta credenciales en `.env` antes):

```bash
npx prisma db seed
```

Servidor de desarrollo: [http://localhost:3000](http://localhost:3000)

---

## Scripts npm

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor tras `build` |
| `npm run lint` | ESLint |

`postinstall` ejecuta `prisma generate` automáticamente.

---

## Estructura relevante

```
src/app/           # Rutas App Router (público, /login, /cuenta, /admin, APIs)
src/components/    # UI, landing, billing, layout
src/lib/           # Auth, Prisma, Stripe, Resend, Cloudinary, datos de galería
prisma/            # schema.prisma + seed
```

Rutas API destacadas: `/api/auth/*`, `/api/showcase*`, `/api/proposals*`, `/api/stripe/*`, `/api/upload*`.

---

## Despliegue (p. ej. Vercel)

1. Define **todas** las variables de entorno en el panel del proyecto (Production / Preview según corresponda).  
2. `NEXTAUTH_URL` debe coincidir con el dominio público (`https://tu-dominio.vercel.app` o dominio propio).  
3. Configura el **webhook** de Stripe apuntando a `https://TU_DOMINIO/api/stripe/webhook` con el secreto en `STRIPE_WEBHOOK_SECRET`.  
4. En Resend, verifica el dominio o remitente usado en `EMAIL_FROM`.

---

## Licencia y privacidad

Proyecto **privado** salvo que se indique lo contrario. No subas `.env` al repositorio.

---

¿Dudas de arquitectura o de un flujo concreto? Revisa `prisma/schema.prisma` y las rutas bajo `src/app/api/`.
