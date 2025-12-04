import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Union-Hub App",
  description: "Official app of Frontera SD",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.className} flex min-h-screen justify-center bg-slate-200 text-slate-900 antialiased dark:bg-slate-950`}
    >
      {/* Centered "device" shell to mimic the phone UI without redefining <html>/<body> */}
      <div className='relative w-full max-w-md bg-slate-50 shadow-2xl ring-1 ring-slate-900/5 dark:bg-slate-950 dark:ring-white/10'>
        <main className='pb-24'>{children}</main>
      </div>
    </div>
  );
}
