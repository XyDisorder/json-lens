import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "FieldLens — JSON Inspector",
  description: "Paste JSON, explore structure, generate types and schema.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} bg-slate-950 text-slate-100`}>
        {children}
      </body>
    </html>
  );
}
