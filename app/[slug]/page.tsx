import { supabase } from "@/lib/supabase";
import type { DigitalMenu } from "@/lib/types";

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

function formatPrice(price?: number): string {
  if (price === undefined || price === null) return "";
  return `${price.toFixed(2)} €`;
}

// Fuentes nativas de jsPDF (usadas por el editor de diseño de MindChef) → su
// equivalente CSS. Cualquier otro valor se trata como Google Font.
const NATIVE_FONTS: Record<string, string> = {
  helvetica: "Helvetica, Arial, sans-serif",
  times: "Times New Roman, serif",
  courier: "Courier New, monospace",
};

function resolveFontFamily(family: string): { css: string; googleFontName: string | null } {
  if (!family) return { css: NATIVE_FONTS.helvetica, googleFontName: null };
  const lower = family.toLowerCase();
  if (NATIVE_FONTS[lower]) return { css: NATIVE_FONTS[lower], googleFontName: null };
  return { css: `'${family}', sans-serif`, googleFontName: family };
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

  const { design, categories } = menu;
  const bodyFont  = resolveFontFamily(design.fontFamily);
  const titleFont = resolveFontFamily(design.titleFontFamily);
  const googleFonts = Array.from(
    new Set([bodyFont.googleFontName, titleFont.googleFontName].filter(Boolean) as string[])
  );

  const backgroundStyle: React.CSSProperties = design.backgroundImageUrl
    ? {
        backgroundColor: design.backgroundColor || "#ffffff",
        backgroundImage: `url(${design.backgroundImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }
    : { background: design.backgroundColor || "#ffffff" };

  return (
    <main
      style={{
        minHeight: "100vh",
        ...backgroundStyle,
        color: design.bodyTextColor || "#374151",
        fontFamily: bodyFont.css,
        padding: "32px 16px 64px",
      }}
    >
      {/* Next.js hoista los <link> renderizados aquí hasta el <head> */}
      {googleFonts.map(font => (
        <link
          key={font}
          rel="stylesheet"
          href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;600;700&display=swap`}
        />
      ))}
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Header */}
        <header
          style={{
            textAlign: design.titleAlignment || "center",
            paddingBottom: 16,
            marginBottom: 24,
            borderBottom: `2px solid ${design.primaryColor || "#68A5A8"}`,
          }}
        >
          {design.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={design.logoUrl}
              alt={menu.business_name}
              style={{ maxHeight: 64, marginBottom: 12 }}
            />
          )}
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontFamily: titleFont.css,
              color: design.secondaryColor || "#203C42",
            }}
          >
            {menu.menu_title}
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9ca3af" }}>
            {menu.business_name}
          </p>
        </header>

        {/* Categorías */}
        {categories.map((cat, i) => (
          <section key={i} style={{ marginBottom: 28 }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                color: design.categoryTextColor || design.secondaryColor || "#203C42",
                marginBottom: 12,
              }}
            >
              {cat.name}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {cat.recipes.map((recipe, j) => (
                <div key={j}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{recipe.title}</span>
                    {recipe.price !== undefined && (
                      <span style={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap" }}>
                        {formatPrice(recipe.price)}
                      </span>
                    )}
                  </div>
                  {recipe.description && (
                    <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6b7280" }}>
                      {recipe.description}
                    </p>
                  )}
                  {recipe.allergens && recipe.allergens.length > 0 && (
                    <div style={{ display: "flex", gap: 4, marginTop: 5 }}>
                      {recipe.allergens.map((allergen, k) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={k}
                          src={allergen.iconUrl}
                          alt={allergen.name}
                          title={allergen.name}
                          style={{ width: 16, height: 16, objectFit: "contain" }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        <footer style={{ textAlign: "center", marginTop: 40, fontSize: 11, color: "#d1d5db" }}>
          Carta digital — POC
        </footer>
      </div>
    </main>
  );
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
