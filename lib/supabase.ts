import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// null cuando aún no se han configurado las env vars — permite que el build
// y el arranque local funcionen antes de tener un proyecto Supabase real.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
