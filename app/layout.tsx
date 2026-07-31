import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carta digital — POC",
  description: "Prueba de concepto: carta digital accesible por enlace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
