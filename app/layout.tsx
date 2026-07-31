import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carta Digital by MindChef",
  description: "Carta digital accesible por enlace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
