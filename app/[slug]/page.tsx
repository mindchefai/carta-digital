import { supabase } from "@/lib/supabase";
import type { DigitalMenu } from "@/lib/types";
import { DigitalMenuView } from "@/components/DigitalMenuView";

// Siempre pide datos frescos a Supabase: "Generar carta digital" en la app de
// MindChef escribe en esta misma tabla, y la página debe reflejarlo al
// instante, sin necesidad de un nuevo deploy en Vercel.
export const dynamic = "force-dynamic";

// Una cuenta puede tener hasta 6 documentos publicados bajo el mismo slug
// (Carta, Sugerencias, Menú del día...) — se traen todos de una vez y el
// desplegable de DigitalMenuView cambia entre ellos sin recargar la página.
async function getMenus(slug: string): Promise<DigitalMenu[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("digital_menus")
    .select("*")
    .eq("slug", slug);
  if (error || !data) return [];
  return data as DigitalMenu[];
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

  const menus = await getMenus(params.slug);

  if (menus.length === 0) {
    return (
      <Message
        title="Carta no encontrada"
        body={`No existe ninguna carta publicada con el enlace "${params.slug}".`}
      />
    );
  }

  return <DigitalMenuView menus={menus} />;
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
