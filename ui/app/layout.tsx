import React from "react"
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider"
import { Grid3D } from "@/components/thegridcn/grid-3d"

import "./globals.css";

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const _jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "ALLMIND // Mainframe",
  description: "Agentic System Controller - Command & Control Dashboard",
};

export const viewport: Viewport = {
  themeColor: "oklch(0.6 0.25 25)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${_inter.variable} ${_jetbrains.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('project-ares-theme') || 'ares';
                  const intensity = localStorage.getItem('project-ares-theme-intensity') || 'medium';
                  document.documentElement.setAttribute('data-theme', theme);
                  if (intensity !== 'none') {
                    document.documentElement.setAttribute('data-tron-intensity', intensity);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="AllMind" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AllMind" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          {/* Fixed 3D Grid Background */}
          <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, opacity: 0.4, width: '100vw', height: '100vh' }}>
            <Grid3D enableParticles={true} enableBeams={true} cameraAnimation={true} />
          </div>

          {/* Main Content */}
          <div className="relative" style={{ zIndex: 10 }}>
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
