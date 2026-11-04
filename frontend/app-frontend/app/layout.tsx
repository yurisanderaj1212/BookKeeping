import type { Metadata, Viewport } from "next";
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
  title: {
    default:  'Chill Numbers — Software de Contabilidad para Pequeñas Empresas',
    template: '%s — Chill Numbers',
  },
  description: 'Gestiona tus finanzas con confianza. Control de ingresos, gastos, empleados y reportes financieros. Prueba gratis 30 días.',
  metadataBase: new URL('https://chillnumbers.com'),
  themeColor: "#0c0e12",
  other: {
    // iOS Safari status bar
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
}

// Viewport separado de metadata — requerido en Next.js 13+
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Previene el zoom automático en iOS Safari al enfocar inputs
  // sin bloquear el zoom manual del usuario (accesibilidad)
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <head>
        {/* Status bar color for iOS Safari and Android Chrome */}
        <meta name="theme-color" content="#0c0e12" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Anti-flash: apply dark class synchronously before first paint */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var p=JSON.parse(localStorage.getItem('bookkeeping_preferences')||'{}');var t=p.theme;if(t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();` }} />
      </head>
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
