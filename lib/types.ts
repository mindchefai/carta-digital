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

export interface DigitalMenu {
  id: string;
  slug: string;
  business_name: string;
  menu_title: string;
  design: MenuDesign;
  categories: MenuCategory[];
  updated_at: string;
}
