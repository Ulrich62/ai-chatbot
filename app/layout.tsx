import { Toaster } from "sonner";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import HelpButton from "@/components/help-button";

import "@/styles/globals.css";
import { QueryProvider } from "@/providers/QueryProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://bgds-assistant.vercel.app"),
  title: "My Binhas",
  description: "My Binhas - Assistant intelligent pour vos questions",
  icons: {
    icon: "/images/icone.png",
    shortcut: "/images/icone.png",
    apple: "/images/icone.png",
  },
  manifest: "/manifest.json",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "My Binhas",
    "application-name": "My Binhas",
    "msapplication-TileColor": "#000000",
    "msapplication-config": "none",
    "format-detection": "telephone=no",
  },
};

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "hsl(0 0% 100%)" },
    { media: "(prefers-color-scheme: dark)", color: "hsl(240deg 10% 3.92%)" },
  ],
};

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

const LIGHT_THEME_COLOR = "hsl(0 0% 100%)";
const DARK_THEME_COLOR = "hsl(240deg 10% 3.92%)";
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // `next-themes` injects an extra classname to the body element to avoid
      // visual flicker before hydration. Hence the `suppressHydrationWarning`
      // prop is necessary to avoid the React hydration mismatch warning.
      // https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
        {/* Meta tags pour PWA iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="My Binhas" />
        <meta name="apple-mobile-web-app-orientations" content="portrait" />
        <link rel="apple-touch-icon" href="/images/icon-192-192.png" />
        <link
          rel="apple-touch-icon"
          sizes="192x192"
          href="/images/icon-192-192.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="512x512"
          href="/images/icon-512-512.png"
        />
        <link rel="apple-touch-startup-image" href="/images/icon-512-512.png" />

        {/* Meta tags pour PWA Android */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="My Binhas" />

        {/* Meta tags généraux */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#1e3a8a" />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            <Toaster position="top-center" />
            {children}
            <HelpButton />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
