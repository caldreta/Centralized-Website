import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isSupabaseConfigured } from "@/lib/pharmalink/source";

import "./globals.css";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "PharmaLink: find medicines near you",
    template: "%s · PharmaLink",
  },
  description:
    "Check which participating pharmacies in Trece Martires, Tanza and General Trias have your medicine in stock before you travel.",
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const demo = !isSupabaseConfigured();
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      {/* pb-16 keeps content clear of the phone tab bar */}
      <body className="flex min-h-full flex-col pb-16 sm:pb-0">
        {demo && (
          <div className="border-b border-amber-200/70 bg-amber-50 px-4 py-1.5 text-center text-xs text-amber-900">
            <strong>Demo data.</strong> Stock levels are samples until the site is connected to
            the PharmaLink database.
          </div>
        )}
        <SiteHeader />
        <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
