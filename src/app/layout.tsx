import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { auth } from "@/auth";
import Providers from "@/components/Providers";
import BottomNav from "@/components/BottomNav";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rad der Schande",
  description: "Wer trägt die Schande? Lass das Rad entscheiden.",
  metadataBase: new URL("https://rad-der-schande.ch"),
  openGraph: {
    title: "Rad der Schande",
    description: "Wer trägt die Schande? Lass das Rad entscheiden.",
    locale: "de_CH",
    type: "website",
  },
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
  appleWebApp: {
    title: "Schande",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#06140D" },
    { media: "(prefers-color-scheme: light)", color: "#E6EFE2" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Auth-Status server-seitig bestimmen → BottomNav erscheint nur für
  // eingeloggte User (ausgeloggt auf der Landing/Legal: gar keine Navbar).
  const session = await auth();
  const authed = !!session?.user;

  return (
    <html lang="de" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-sans">
        <Providers>
          {children}
          <BottomNav authed={authed} />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
