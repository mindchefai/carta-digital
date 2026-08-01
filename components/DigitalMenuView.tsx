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

function formatPrice(price?: number | null): string {
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

  // Publicaciones hechas antes de que estos campos existieran no los traen
  // (son un JSONB libre) — mismos valores por defecto que el editor
  // (DEFAULT_CONFIG en usePDFCustomization.ts) para que no se vean "rotas".
  const primaryColor   = design.primaryColor   || "#68A5A8";
  const accentColor    = design.accentColor    || design.primaryColor || "#203C42";
  const lightTextColor = design.lightTextColor || "#6b7280";
  const bodyFontSize   = design.bodyFontSize   || 8;
  const titleFontSize  = design.titleFontSize  || 11;
  const priceFontSize  = design.priceFontSize  || 8;
  const lineSpacing    = design.lineSpacing    ?? 1;
  const useBoldTitles  = design.useBoldTitles  ?? true;
  const logoPosition   = design.logoPosition   || "left";
  const logoScale      = design.logoScale      ?? 1;
  const menuTitleScale = design.menuTitleScale ?? 1;
  const showDivider    = design.showDivider    ?? true;
  const dividerColor   = design.dividerColor   || primaryColor;
  // Solo Carta permite elegir dónde van los comentarios — Menú del día y
  // Degustación siempre los muestran junto al precio (sin esta opción).
  const commentsAtEnd  = design.commentsPosition === "end" && !!menu.comments;

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

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: `${titleFontSize * 1.4 * menuTitleScale}pt`,
    fontWeight: useBoldTitles ? 700 : 600,
    fontFamily: titleFont.css,
    color: design.secondaryColor || "#203C42",
  };

  const logoImg = design.logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={design.logoUrl}
      alt={menu.business_name}
      style={{ height: 36 * logoScale, maxWidth: 60 * logoScale, objectFit: "contain", flexShrink: 0 }}
    />
  ) : null;

  const titleEl = <h1 style={{ ...titleStyle, flex: logoPosition === "center" ? undefined : 1, textAlign: design.titleAlignment || "center" }}>{menu.menu_title}</h1>;

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
            borderBottom: showDivider ? `2px solid ${dividerColor}` : "none",
          }}
        >
          {logoPosition === "center" ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              {logoImg}
              <h1 style={{ ...titleStyle, textAlign: "center" }}>{menu.menu_title}</h1>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexDirection: logoPosition === "right" ? "row-reverse" : "row" }}>
              {logoImg}
              {titleEl}
            </div>
          )}

          {(menu.menu_date || menu.menu_price != null || (menu.comments && !commentsAtEnd)) && (
            <div style={{
              marginTop: 14, padding: "10px", borderRadius: 8,
              background: design.dateBackgroundColor ?? "transparent",
            }}>
              {menu.menu_date && (
                <p style={{ fontSize: 12, color: design.bodyTextColor || "#374151", margin: 0, textTransform: "capitalize" }}>
                  {menu.menu_date}
                </p>
              )}

              {menu.menu_price != null && (
                <div style={{ marginTop: menu.menu_date ? 8 : 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: accentColor }}>
                    {menu.menu_price_label && (
                      <span style={{ fontSize: 12, fontWeight: 600, display: "block", color: design.bodyTextColor || "#374151" }}>
                        {menu.menu_price_label}
                      </span>
                    )}
                    {formatPrice(menu.menu_price)}
                  </div>
                  {menu.half_menu_price != null && (
                    <div style={{ fontSize: 13, color: design.bodyTextColor || "#374151", marginTop: 2 }}>
                      Medio menú: {formatPrice(menu.half_menu_price)}
                    </div>
                  )}
                </div>
              )}

              {menu.comments && !commentsAtEnd && (
                <p style={{ fontSize: 12, fontStyle: "italic", color: design.bodyTextColor || "#374151", margin: (menu.menu_date || menu.menu_price != null) ? "8px 0 0" : 0 }}>
                  {menu.comments}
                </p>
              )}
            </div>
          )}

          {sortedMenus.length > 1 && (
            <select
              value={selectedMenuKey}
              onChange={e => setSelectedMenuKey(e.target.value)}
              style={{
                marginTop: 14, padding: "8px 14px", borderRadius: 999,
                border: `1.5px solid ${primaryColor}`,
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
                    border: `2px solid ${lang === selectedLang ? primaryColor : "transparent"}`,
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
                  fontSize: `${titleFontSize}pt`,
                  fontWeight: useBoldTitles ? 700 : 600,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  textAlign: "center",
                  color: design.categoryTextColor || design.secondaryColor || "#203C42",
                  background: design.categoryBgTransparent === false ? primaryColor : "transparent",
                  padding: "14px",
                  borderRadius: 8,
                  marginBottom: 12,
                }}
              >
                {cat.name}
              </h2>
            )}
            <div>
              {cat.recipes.map((recipe, j) => (
                <div
                  key={j}
                  style={{
                    background: design.itemBackgroundColor ?? "transparent",
                    padding: `${14 * lineSpacing}px`,
                    borderRadius: 8,
                    marginBottom: j === cat.recipes.length - 1 ? 0 : `${10 * lineSpacing}px`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    {recipe.photoUrl ? (
                      <button
                        onClick={() => setOpenPhotoUrl(recipe.photoUrl!)}
                        style={{
                          fontFamily: "inherit", fontWeight: 700, fontSize: `${bodyFontSize}pt`, textAlign: "left",
                          background: "none", border: "none", padding: 0, margin: 0,
                          color: design.bodyTextColor || "inherit", cursor: "pointer", textDecoration: "underline",
                          textDecorationColor: "rgba(0,0,0,0.2)", textUnderlineOffset: 3,
                        }}
                      >
                        {titleFor(recipe, selectedLang)}
                      </button>
                    ) : (
                      <span style={{ fontWeight: 700, fontSize: `${bodyFontSize}pt`, color: design.bodyTextColor || "inherit" }}>
                        {titleFor(recipe, selectedLang)}
                      </span>
                    )}
                    {recipe.price !== undefined && (
                      <span style={{ fontWeight: 700, fontSize: `${priceFontSize}pt`, color: accentColor, whiteSpace: "nowrap" }}>
                        {formatPrice(recipe.price)}
                      </span>
                    )}
                  </div>
                  {recipe.description && (
                    <p style={{ margin: "2px 0 0", fontSize: `${bodyFontSize * 0.82}pt`, color: lightTextColor }}>
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

        {commentsAtEnd && (
          <p style={{
            textAlign: "center", fontSize: 12, fontStyle: "italic", marginTop: 32,
            color: design.bodyTextColor || "#374151",
          }}>
            {menu.comments}
          </p>
        )}

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
