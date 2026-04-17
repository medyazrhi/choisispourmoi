import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "ChoisisPourMoi – Laisse tes amis décider",
  description:
    "Crée un sondage photo en quelques secondes, partage-le avec tes amis et laisse-les choisir pour toi. Résultats en temps réel.",
  keywords: ["sondage", "vote", "photo", "amis", "décision"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
