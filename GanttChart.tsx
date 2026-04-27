import type { Metadata } from "next";
import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";

import { SimulationTicker } from "@/components/SimulationTicker";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans"
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono"
});

export const metadata: Metadata = {
  title: "Energy-Efficient CPU Scheduling System",
  description: "Interactive DVFS and thermal-aware CPU scheduling simulation built with Next.js 14."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${ibmPlexSans.variable} ${jetbrainsMono.variable} antialiased`}>
        <SimulationTicker />
        {children}
      </body>
    </html>
  );
}
