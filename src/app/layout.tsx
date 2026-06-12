import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
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
