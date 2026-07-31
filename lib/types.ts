export interface MenuRecipe {
  title: string;
  description?: string;
  price?: number;
  allergens?: string[];
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
