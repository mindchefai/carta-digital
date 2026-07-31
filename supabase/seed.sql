-- Carta de demo — usa la misma paleta por defecto que MindChef Colectividades
-- (#68A5A8 / #203C42) para que el resultado sea visualmente coherente.
-- El slug real que genera la app es el sub de Cognito del usuario; "demo" es
-- solo para probar la página antes de conectar la app.
insert into public.digital_menus (slug, business_name, menu_title, design, categories)
values (
  'demo',
  'Restaurante Demo',
  'Carta',
  '{
    "primaryColor": "#68A5A8",
    "secondaryColor": "#203C42",
    "backgroundColor": "#FFFFFF",
    "bodyTextColor": "#374151",
    "categoryTextColor": "#203C42",
    "fontFamily": "helvetica",
    "titleFontFamily": "helvetica",
    "titleAlignment": "center",
    "logoUrl": null
  }'::jsonb,
  '[
    {
      "name": "Entrantes",
      "recipes": [
        { "title": "Ensalada de burrata", "description": "Tomate de temporada, albahaca y aceite de oliva virgen extra", "price": 9.5, "allergens": ["Lácteos"] },
        { "title": "Croquetas de jamón", "description": "6 unidades, hechas al momento", "price": 8.0, "allergens": ["Gluten", "Lácteos", "Huevo"] }
      ]
    },
    {
      "name": "Principales",
      "recipes": [
        { "title": "Salmón a la brasa", "description": "Con salsa de eneldo y patata confitada", "price": 17.5, "allergens": ["Pescado"] },
        { "title": "Solomillo de ternera", "description": "Punto a elegir, guarnición del día", "price": 21.0, "allergens": [] }
      ]
    },
    {
      "name": "Postres",
      "recipes": [
        { "title": "Tarta de queso", "description": "Receta de la casa", "price": 6.5, "allergens": ["Lácteos", "Huevo"] }
      ]
    }
  ]'::jsonb
)
on conflict (slug) do update set
  business_name = excluded.business_name,
  menu_title    = excluded.menu_title,
  design        = excluded.design,
  categories    = excluded.categories,
  updated_at    = now();
