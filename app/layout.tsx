import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MobileNav } from "./(components)/mobile-nav";
import { ThemeProvider } from "./(components)/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Union Hub",
  description: "Supporter Operations Platform",
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
        className={`${inter.className} flex min-h-screen justify-center bg-slate-200 text-slate-900 antialiased dark:bg-slate-950`}
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
          <div className='relative w-full max-w-md bg-slate-50 shadow-2xl ring-1 ring-slate-900/5 dark:bg-slate-950 dark:ring-white/10'>
            <main className='pb-24'>{children}</main>

            {/* MobileNav sits inside this container now, so it matches the width */}
            <MobileNav />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
