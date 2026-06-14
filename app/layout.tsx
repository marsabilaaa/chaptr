import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/providers/ThemeProvider";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chaptr — Write chapter by chapter",
  description:
    "A writing tool built for long-form. Navigate between chapters like tabs, track every version, and stay in the zone.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script id="chaptr-theme-init" strategy="beforeInteractive">
          {`(() => {
            try {
              const cached = localStorage.getItem('chaptr:theme')
              const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
              if (cached) {
                const { mode } = JSON.parse(cached)
                if (mode === 'dark') document.documentElement.classList.add('dark')
                else if (mode === 'light') document.documentElement.classList.remove('dark')
                else if (systemDark) document.documentElement.classList.add('dark')
              } else if (systemDark) {
                document.documentElement.classList.add('dark')
              }
            } catch(e) {}
          })()`}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
