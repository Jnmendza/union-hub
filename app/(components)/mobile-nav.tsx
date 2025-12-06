"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, FolderOpen, User } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming you have shadcn installed

const navItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Groups",
    href: "/groups",
    icon: Users,
  },
  {
    name: "The Vault",
    href: "/vault",
    icon: FolderOpen,
  },
  {
    name: "My ID",
    href: "/profile",
    icon: User,
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className='w-full border-t border-slate-200 bg-white pb-safe pt-2 shadow-[0_-1px_3px_rgba(0,0,0,0.05)] dark:border-slate-800 dark:bg-slate-950'>
      {/* 'pb-safe' is a utility for iPhone Home Bar spacing (requires tailwind-safe-area plugin), 
         otherwise use 'pb-4' or 'pb-6' for manual spacing.
      */}
      <div className='mx-auto flex h-16 max-w-md items-center justify-around px-2 pb-2'>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 rounded-xl px-4 py-2 transition-colors duration-200",
                isActive
                  ? "text-blue-900 dark:text-blue-400" // The 'Azul' Active State
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50" // The 'Chrome' Inactive State
              )}
            >
              <Icon
                size={22}
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
