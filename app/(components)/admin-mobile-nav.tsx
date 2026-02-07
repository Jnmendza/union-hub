"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { adminRoutes } from "./admin-sidebar";

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav className='fixed bottom-0 left-0 z-50 w-full border-t border-slate-200 bg-white pb-safe pt-2 md:hidden dark:border-slate-800 dark:bg-slate-950'>
      <div className='mx-auto flex h-16 items-center justify-around px-2 pb-2'>
        {adminRoutes.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 rounded-xl px-2 py-2 transition-colors duration-200",
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50",
              )}
            >
              <Icon
                size={20}
                className={cn("transition-transform", isActive && "scale-110")}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className='text-[10px] font-medium tracking-wide'>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
