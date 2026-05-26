import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import BossKey from "@/components/BossKey";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Deskwork",
  description: "Productivity dashboard",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen flex flex-col">
        <BossKey />
        <Nav />
        <main className="flex-1 w-full">{children}</main>
        <footer className="border-t border-[var(--border)] py-4 text-center text-xs text-[var(--text-muted)]">
          Press <kbd className="rounded border border-[var(--border-strong)] bg-[var(--bg-elev)] px-1.5 py-0.5 text-[10px]">Esc</kbd> for boss mode · v0.1
        </footer>
      </body>
    </html>
  );
}
