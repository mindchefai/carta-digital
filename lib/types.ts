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
  // Color de precios y destacados.
  accentColor: string;
  backgroundColor: string;
  // URL absoluta (o data: URL) del fondo real de la carta física — null si
  // el fondo es un color sólido.
  backgroundImageUrl?: string | null;
  bodyTextColor: string;
  // Texto secundario: descripciones, alérgenos, detalles.
  lightTextColor: string;
  categoryTextColor: string;
  // Fondo de cada plato/receta — null/undefined si es transparente.
  itemBackgroundColor?: string | null;
  // Fondo de la franja de fecha/precio/comentarios — null/undefined si es transparente.
  dateBackgroundColor?: string | null;
  fontFamily: string;
  titleFontFamily: string;
  useBoldTitles: boolean;
  bodyFontSize: number;
  titleFontSize: number;
  priceFontSize: number;
  lineSpacing: number;
  titleAlignment: "left" | "center" | "right";
  logoUrl?: string | null;
  logoPosition: "left" | "center" | "right";
  logoScale: number;
  menuTitleScale: number;
  showDivider: boolean;
  dividerColor: string;
  // Si el fondo de la "píldora" de cada categoría es transparente — si no,
  // usa primaryColor.
  categoryBgTransparent: boolean;
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
  // Precio único de todo el menú (Menú del día/Degustación) — en Carta el
  // precio va por plato, dentro de "categories", y estos campos van null.
  menu_price: number | null;
  menu_price_label: string | null;
  half_menu_price: number | null;
  comments: string | null;
  // Fecha del menú (Menú del día), ya formateada — null en el resto de tipos.
  menu_date: string | null;
  updated_at: string;
}
