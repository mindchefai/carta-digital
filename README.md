# Carta digital — POC (Next.js + Supabase + Vercel)

Prueba de concepto para validar si tiene sentido ofrecer una **carta digital
accesible por enlace** (además del PDF que ya genera MindChef Colectividades).
Pensada para tirarse o reescribirse en AWS más adelante si el cliente valida
la idea.

## Cómo encaja con la app de MindChef

Ya está conectado de verdad, no es solo una maqueta:

- La app de MindChef (`amplify-template`) tiene un botón **"Generar carta
  digital"** (en el paso de diseño de "Mi Menú", solo para Carta) que llama a
  `useDigitalMenu.ts` y guarda directamente en Supabase.
- Usa un proyecto Supabase **dedicado a esta POC** (`uwcigrwoemdrcrsugqdm`),
  independiente del que la app usa para los proxies de Holded/Quipu.
- El `slug` de cada carta es el **cognito_id** de la cuenta (el mismo campo
  `cognito_id` de `UserPlans.json`, y el mismo patrón que ya se usa para
  `/BackgroundPictureMenu/{cognito_id}_1.png`) — así cada cuenta tiene siempre
  la misma URL pública, y volver a pulsar "Generar carta digital" simplemente
  la actualiza.
- Esta página Next.js lee esa tabla **en cada visita** (`dynamic =
  "force-dynamic"`), así que no hace falta volver a desplegar en Vercel cada
  vez que alguien publica o actualiza su carta — solo el primer deploy.

## 1. Preparar la tabla en Supabase (una sola vez)

En el proyecto `uwcigrwoemdrcrsugqdm`, abre el **SQL Editor** y ejecuta
[`amplify-template/supabase/digital_menus.sql`](../amplify-template/supabase/digital_menus.sql)
(hay una copia idéntica en [`supabase/schema.sql`](supabase/schema.sql) por si
solo tienes acceso a este repo). Crea la tabla `digital_menus` y dos
políticas: lectura pública total, y escritura pública total (ver el propio
SQL para el porqué de esa segunda decisión — es el trade-off aceptado para
esta POC).

Opcional: ejecuta también [`supabase/seed.sql`](supabase/seed.sql) para tener
una carta de ejemplo en `/demo` antes de probar con una cuenta real.

## 2. Configurar y probar en local

```bash
cp .env.example .env.local   # ya trae la URL y la clave del proyecto real
npm install
npm run dev
```

Abre `http://localhost:3000/demo` (si ejecutaste el seed) — deberías ver la
carta de ejemplo.

## 3. Desplegar en Vercel

1. Sube esta carpeta a un repo de GitHub (puede ser uno nuevo, separado del
   repo de Amplify).
2. En [vercel.com](https://vercel.com) → **New Project** → importa ese repo.
3. En **Environment Variables**, añade `NEXT_PUBLIC_SUPABASE_URL` y
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (los mismos valores de `.env.local`).
4. Deploy.

## 4. Conectar el botón de la app con esta URL

Una vez desplegado, copia la URL de Vercel (p. ej.
`https://mindchef-cartas.vercel.app`) y ponla como
`VITE_DIGITAL_MENU_BASE_URL` en `amplify-template/.env.development` y
`.env.production` (ya están los placeholders vacíos ahí). A partir de ese
momento, el botón "Generar carta digital" mostrará el enlace real y
funcional.

## Qué NO cubre esta POC todavía

- Solo **Carta** — Menú del día y Degustación tienen otra forma de datos y no
  están conectados aún.
- El logo no se incluye (`logoUrl` siempre `null` de momento).
- La escritura en Supabase es públicamente accesible por diseño (ver el SQL):
  suficiente para validar el concepto, no para producción tal cual — si esto
  sigue adelante, habría que verificar el JWT de Cognito en una función
  (mismo patrón que `holded-proxy`/`quipu-proxy`) antes de aceptar cualquier
  guardado.

## Qué falta si esto se queda (más allá de la POC)

- Reutilizar el layout real de `MenuPreview.tsx` en vez de esta versión
  simplificada, para que la carta digital sea visualmente idéntica al PDF.
- Soporte para Menú del día y Degustación.
- Decidir si esto vive permanentemente en Vercel/Supabase o se reconstruye
  dentro de AWS (p. ej. S3 + CloudFront + una tabla en DynamoDB/Aurora) para
  no duplicar proveedores.
- Analítica básica (visitas por carta) si al cliente le interesa medir uso.
