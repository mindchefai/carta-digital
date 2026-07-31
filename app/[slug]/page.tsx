import { supabase } from "@/lib/supabase";
import type { DigitalMenu } from "@/lib/types";
import { DigitalMenuView } from "@/components/DigitalMenuView";

// Siempre pide datos frescos a Supabase: "Generar carta digital" en la app de
// MindChef escribe en esta misma tabla, y la página debe reflejarlo al
// instante, sin necesidad de un nuevo deploy en Vercel.
export const dynamic = "force-dynamic";

async function getMenu(slug: string): Promise<DigitalMenu | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("digital_menus")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return data as DigitalMenu;
}

export default async function MenuPage({ params }: { params: { slug: string } }) {
  if (!supabase) {
    return (
      <Message
        title="Falta configurar Supabase"
        body="Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local (ver .env.example) y reinicia el servidor."
      />
    );
  }

  const menu = await getMenu(params.slug);

  if (!menu) {
    return (
      <Message
        title="Carta no encontrada"
        body={`No existe ninguna carta publicada con el enlace "${params.slug}".`}
      />
    );
  }

  return <DigitalMenuView menu={menu} />;
}

function Message({ title, body }: { title: string; body: string }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 24,
        textAlign: "center",
        fontFamily: "Helvetica, Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 18, color: "#203C42", margin: 0 }}>{title}</h1>
      <p style={{ color: "#6b7280", maxWidth: 420, fontSize: 14 }}>{body}</p>
    </main>
  );
}
