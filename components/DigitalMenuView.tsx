"use client";

import { useEffect, useState } from "react";
import type { DigitalMenu, MenuRecipe } from "@/lib/types";
import { MENU_SLOT_LABELS } from "@/lib/types";

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

function formatPrice(price?: number): string {
  if (price === undefined || price === null) return "";
  return `${price.toFixed(2)} €`;
}

// Mismo bucket de Supabase Storage donde la app sube fondos/logos/alérgenos.
function flagUrl(lang: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
  return `${base}/storage/v1/object/public/assets/flags/${lang}.png`;
}

// Título de la receta en el idioma seleccionado — si esa receta en concreto
// no tiene traducción a ese idioma, cae siempre a español (es la única que
// existe garantizada para todos los platos) y, en último caso, a cualquier
// traducción disponible.
function titleFor(recipe: MenuRecipe, lang: string): string {
  return (
    recipe.translations[lang] ??
    recipe.translations.es ??
    Object.values(recipe.translations)[0] ??
    ""
  );
}

export function DigitalMenuView({ menus }: { menus: DigitalMenu[] }) {
  const preferredOrder = Object.keys(MENU_SLOT_LABELS);
  const sortedMenus = [...menus].sort(
    (a, b) => preferredOrder.indexOf(a.menu_key) - preferredOrder.indexOf(b.menu_key)
  );
  const defaultMenu = sortedMenus.find(m => m.menu_key === "carta") ?? sortedMenus[0];
  const [selectedMenuKey, setSelectedMenuKey] = useState(defaultMenu.menu_key);
  const menu = sortedMenus.find(m => m.menu_key === selectedMenuKey) ?? defaultMenu;

  const { design, categories } = menu;
  const languages = design.languages && design.languages.length > 0
    ? design.languages
    : [design.defaultLanguage || "es"];
  const [selectedLang, setSelectedLang] = useState(design.defaultLanguage || languages[0]);
  const [openPhotoUrl, setOpenPhotoUrl] = useState<string | null>(null);

  // Al cambiar de menú (Carta → Sugerencias...), vuelve al idioma por
  // defecto de ese menú en vez de arrastrar el seleccionado en el anterior.
  useEffect(() => {
    setSelectedLang(design.defaultLanguage || languages[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMenuKey]);

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

          {sortedMenus.length > 1 && (
            <select
              value={selectedMenuKey}
              onChange={e => setSelectedMenuKey(e.target.value)}
              style={{
                marginTop: 14, padding: "8px 14px", borderRadius: 999,
                border: `1.5px solid ${design.primaryColor || "#68A5A8"}`,
                background: "#fff", color: design.secondaryColor || "#203C42",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              {sortedMenus.map(m => (
                <option key={m.menu_key} value={m.menu_key}>
                  {MENU_SLOT_LABELS[m.menu_key] ?? m.menu_key}
                </option>
              ))}
            </select>
          )}

          {languages.length > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 14 }}>
              {languages.map(lang => (
                <button
                  key={lang}
                  onClick={() => setSelectedLang(lang)}
                  aria-label={lang}
                  style={{
                    padding: 2,
                    borderRadius: "50%",
                    border: `2px solid ${lang === selectedLang ? (design.primaryColor || "#68A5A8") : "transparent"}`,
                    background: "none",
                    cursor: "pointer",
                    opacity: lang === selectedLang ? 1 : 0.55,
                    transition: "opacity 0.15s, border-color 0.15s",
                    lineHeight: 0,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={flagUrl(lang)}
                    alt={lang}
                    style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover" }}
                  />
                </button>
              ))}
            </div>
          )}
        </header>

        {/* Categorías */}
        {categories.map((cat, i) => (
          <section key={i} style={{ marginBottom: 28 }}>
            {cat.name && (
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
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {cat.recipes.map((recipe, j) => (
                <div key={j}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    {recipe.photoUrl ? (
                      <button
                        onClick={() => setOpenPhotoUrl(recipe.photoUrl!)}
                        style={{
                          fontFamily: "inherit", fontWeight: 600, fontSize: 15, textAlign: "left",
                          background: "none", border: "none", padding: 0, margin: 0,
                          color: "inherit", cursor: "pointer", textDecoration: "underline",
                          textDecorationColor: "rgba(0,0,0,0.2)", textUnderlineOffset: 3,
                        }}
                      >
                        {titleFor(recipe, selectedLang)}
                      </button>
                    ) : (
                      <span style={{ fontWeight: 600, fontSize: 15 }}>
                        {titleFor(recipe, selectedLang)}
                      </span>
                    )}
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
          Carta Digital by MindChef
        </footer>
      </div>

      {/* Lightbox: foto del plato al hacer clic en su título */}
      {openPhotoUrl && (
        <div
          onClick={() => setOpenPhotoUrl(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
            cursor: "zoom-out",
          }}
        >
          <button
            onClick={() => setOpenPhotoUrl(null)}
            aria-label="Cerrar"
            style={{
              position: "absolute", top: 16, right: 16,
              width: 36, height: 36, borderRadius: "50%",
              border: "none", background: "rgba(255,255,255,0.15)", color: "#fff",
              fontSize: 20, lineHeight: 1, cursor: "pointer",
            }}
          >
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={openPhotoUrl}
            alt=""
            style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: 8, objectFit: "contain" }}
          />
        </div>
      )}
    </main>
  );
}
