import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Tracker } from "@/components/analytics/tracker"
import { MetaPixel } from "@/components/analytics/meta-pixel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Plus_Jakarta_Sans({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Sistema de Ingresos Diarios para Periodistas | José Fiaccini",
  description: "Transforma tu experiencia periodística en un medio digital propio que genera ingresos todos los días.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-black text-white" style={{ fontFamily: 'var(--font-newsreader), sans-serif' }}>
        <MetaPixel />
        <Tracker />
        {children}
      </body>
    </html>
  );
}
