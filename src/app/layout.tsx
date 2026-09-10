import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/layout/theme-provider";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "RYVON",
  description: "Evolução em movimento — painel operacional de evolução física",
  applicationName: "RYVON",
  appleWebApp: {
    capable: true,
    title: "RYVON",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F8FC" },
    { media: "(prefers-color-scheme: dark)", color: "#050A14" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${sans.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("ryvon-theme");document.documentElement.classList.toggle("light",t==="light")}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full font-sans text-foreground">
        <ThemeProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              classNames: {
                toast: "!bg-surface !border-border !text-foreground",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
