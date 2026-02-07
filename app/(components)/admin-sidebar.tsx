"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Megaphone,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export const adminRoutes = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Members", href: "/admin/users", icon: Users },
  { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { name: "Documents", href: "/admin/documents", icon: FileText },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth); // Firebase native sign out
      router.push("/login"); // Force redirect
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className='hidden md:flex h-screen w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'>
      {/* Header */}
      <div className='flex h-16 items-center border-b border-slate-200 px-6 dark:border-slate-800'>
        <span className='text-lg font-bold text-slate-900 dark:text-white'>
          Union Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className='flex-1 space-y-1 p-4'>
        {adminRoutes.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
              )}
            >
              <Icon className='h-4 w-4' />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className='border-t border-slate-200 p-4 dark:border-slate-800'>
        <button
          onClick={handleSignOut}
          className='flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10'
        >
          <LogOut className='h-4 w-4' />
          Sign Out
        </button>
      </div>
    </div>
  );
}
