import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });
const firaCode = Fira_Code({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "MindFlow | Visual Masterclasses",
  description: "Turn raw documentation into visual masterclasses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${firaCode.variable} antialiased h-screen overflow-hidden bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
