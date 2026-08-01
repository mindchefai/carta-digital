export interface MenuAllergen {
  name: string;
  iconUrl: string;
}

export interface MenuRecipe {
  // No se usa para pintar la carta — solo para que la app (al republicar)
  // reconozca el mismo plato entre publicaciones y reutilice traducciones.
  recipeId: string;
  // Título por idioma — solo incluye los idiomas para los que existe
  // traducción (referencia + complementarios configurados en el documento).
  translations: Record<string, string>;
  description?: string;
  price?: number;
  // Foto del plato — al hacer clic en el título se abre en grande.
  photoUrl?: string;
  allergens?: MenuAllergen[];
}

export interface MenuCategory {
  name: string;
  recipes: MenuRecipe[];
}

export interface MenuDesign {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  // URL absoluta (o data: URL) del fondo real de la carta física — null si
  // el fondo es un color sólido.
  backgroundImageUrl?: string | null;
  bodyTextColor: string;
  categoryTextColor: string;
  fontFamily: string;
  titleFontFamily: string;
  titleAlignment: "left" | "center" | "right";
  logoUrl?: string | null;
  // Idiomas disponibles (referencia primero) y cuál se muestra por defecto.
  languages: string[];
  defaultLanguage: string;
}

// Los mismos 6 posibles "cajones" que ofrece la app (ver
// amplify-template/src/hooks/useDigitalMenu.ts, DIGITAL_MENU_SLOTS) —
// mantener ambas listas en sync si se añade o renombra alguno.
export const MENU_SLOT_LABELS: Record<string, string> = {
  carta: "Carta",
  sugerencias: "Sugerencias",
  "menu-dia": "Menú del día",
  "menu-ninos": "Menú de niños",
  bebidas: "Bebidas",
  degustacion: "Menú degustación",
};

export interface DigitalMenu {
  id: string;
  slug: string;
  menu_key: string;
  business_name: string;
  menu_title: string;
  design: MenuDesign;
  categories: MenuCategory[];
  updated_at: string;
}
