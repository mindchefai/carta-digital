import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// null cuando aún no se han configurado las env vars — permite que el build
// y el arranque local funcionen antes de tener un proyecto Supabase real.
//
// fetch personalizado con cache:"no-store": sin esto, la caché de datos de
// Vercel puede quedarse con la primera respuesta que vio para un slug (p.ej.
// de antes de un cambio de diseño) y no la refresca aunque la fila cambie en
// Supabase — "force-dynamic" en la página solo controla el propio render de
// Next, no las peticiones fetch que hace supabase-js por debajo.
export const supabase = url && anonKey
  ? createClient(url, anonKey, {
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    })
  : null;
