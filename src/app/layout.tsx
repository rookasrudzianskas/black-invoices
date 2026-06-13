import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import "@fontsource/noto-sans-mono/latin-ext-400.css";
import "@fontsource/noto-sans-mono/latin-ext-700.css";
import "@fontsource/noto-sans-mono/greek-400.css";
import "@fontsource/noto-sans-mono/greek-700.css";
import "@fontsource/noto-sans-mono/cyrillic-400.css";
import "@fontsource/noto-sans-mono/cyrillic-700.css";
import "@fontsource/noto-sans-armenian/armenian-400.css";
import "@fontsource/noto-sans-armenian/armenian-700.css";
import "@fontsource/noto-sans-georgian/georgian-400.css";
import "@fontsource/noto-sans-georgian/georgian-700.css";
import "../styles.css";

export const metadata: Metadata = {
  title: "Black Invoices",
  description: "A polished Next.js invoice generator for black A4 PDF invoices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistMono.variable}>
      <body>{children}</body>
    </html>
  );
}
