import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export const metadata: Metadata = {
  title: "EnglishCoach — B2 → C1",
  description: "English learning app for remote job preparation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" className="h-full">
      <body className="min-h-full flex">
        <Sidebar />
        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          <div className="max-w-5xl mx-auto p-4 md:p-8">
            {children}
          </div>
        </main>
        <MobileNav />
      </body>
    </html>
  );
}
