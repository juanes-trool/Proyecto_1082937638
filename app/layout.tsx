import type { Metadata } from "next";
import "./globals.css";
import { readData } from "@/lib/db";
import type { HomeData } from "@/lib/types";

const homeData = readData<HomeData>("home.json");

export const metadata: Metadata = {
  title: homeData.meta.title,
  description: homeData.meta.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
