import { MobileNav } from "../(components)/mobile-nav";

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex h-[100dvh] justify-center bg-slate-200 dark:bg-slate-950 overflow-hidden'>
      <div className='relative flex flex-col w-full max-w-md bg-slate-50 shadow-2xl ring-1 ring-slate-900/5 dark:bg-slate-950 dark:ring-white/10 h-full'>
        <main className='flex-1 overflow-y-auto relative'>{children}</main>

        <MobileNav />
      </div>
    </div>
  );
}
