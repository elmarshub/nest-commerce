import { Suspense } from "react";
import type { Metadata } from "next";
import { DM_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { ScrollToTop } from "@/components/navigation/scroll-to-top";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Haven",
    template: "%s | Haven",
  },
  description:
    "Handcrafted jewelry blending Nigerian artistry with contemporary elegance.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-light">
        <Suspense fallback={null}>
          <ScrollToTop />
        </Suspense>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
