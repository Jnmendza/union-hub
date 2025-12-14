import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./(components)/theme-provider";
import AuthProvider from "./(components)/AuthProvider";
import { UnionProvider } from "./(components)/union-provider";
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Union Hub",
  description: "Supporter Operations Platform",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      {/* 1. bg-slate-200: Sets a darker background for the 'desktop' area outside the app
       */}
      <body
        className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950`}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          {/* 2. THE MOBILE CONTAINER 
          - w-full max-w-md: Locks width to ~448px (typical phone size)
          - bg-white: The actual background of your app
          - min-h-screen: Ensures the white background goes to the bottom
          - shadow-2xl: Adds depth so it pops off the desktop background
        */}
          <UnionProvider>
            <AuthProvider>{children}</AuthProvider>
          </UnionProvider>
        </ThemeProvider>
        <GoogleAnalytics
          gaId={process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""}
        />
      </body>
    </html>
  );
}
