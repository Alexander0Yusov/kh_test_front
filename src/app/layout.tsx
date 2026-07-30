import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

const nunito = Nunito({
  display: "swap",
  subsets: ["latin", "cyrillic"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  description: "Frontend test task",
  title: "Test Task",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  return (
    <html className={nunito.variable} lang="ru">
      <body>{children}</body>
    </html>
  );
}
