import type { Metadata } from "next";
import localFont from "next/font/local";
import { SessionProvider } from "@/components/auth/session-provider";
import "./globals.css";

const anthropicSans = localFont({
  src: "./fonts/anthropic-sans.woff2",
  weight: "300 800",
  variable: "--font-anthropic-sans",
  display: "swap",
});

const anthropicSerif = localFont({
  src: "./fonts/anthropic-serif.woff2",
  weight: "300 800",
  variable: "--font-anthropic-serif",
  display: "swap",
});

const anthropicMono = localFont({
  src: "./fonts/anthropic-mono.woff2",
  weight: "300 800",
  variable: "--font-anthropic-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MindFlow | Visual Mindmaps",
  description: "Turn raw documentation into visual mindmaps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${anthropicSans.variable} ${anthropicSerif.variable} ${anthropicMono.variable} antialiased h-screen overflow-hidden bg-background text-foreground`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
