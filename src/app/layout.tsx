import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tupi Digital",
  description: "Aprenda a língua Tupi e conheça a cultura indígena de forma interativa e imersiva.",
};

import { ProvedorAutenticacao } from "@/contexts/ContextoAutenticacao";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ProvedorAutenticacao>{children}</ProvedorAutenticacao>
        </ThemeProvider>
      </body>
    </html>
  );
}
