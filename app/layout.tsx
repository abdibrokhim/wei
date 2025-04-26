import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import LayoutClient from "./layout-client";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wei - AI Agentic Habit Tracker",
  description: "A personalized AI agentic habit tracker that helps you build better habits",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <main className="flex min-h-screen flex-col bg-background">
          <LayoutClient>
            {children}
          </LayoutClient>
          <Toaster position="top-center" theme="dark" />
        </main>
      </body>
    </html>
  );
}
