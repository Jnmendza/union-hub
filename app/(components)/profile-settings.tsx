"use client";

import { useTheme } from "next-themes";
import {
  User,
  Bell,
  CreditCard,
  ShieldCheck,
  LogOut,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "../(auth)/login/actions";

// Interface for the reusable row
interface SettingsRowProps {
  icon: LucideIcon;
  label: string;
  value?: string;
  destructive?: boolean;
  onClick?: () => void;
}

function SettingsRow({
  icon: Icon,
  label,
  value,
  destructive,
  onClick,
}: SettingsRowProps) {
  return (
    <button
      onClick={onClick}
      className='flex w-full items-center justify-between px-4 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900'
    >
      <div className='flex items-center gap-3'>
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800",
            destructive && "bg-red-50 dark:bg-red-900/20"
          )}
        >
          <Icon
            className={cn(
              "h-4 w-4 text-slate-600 dark:text-slate-400",
              destructive && "text-red-600 dark:text-red-400"
            )}
          />
        </div>
        <span
          className={cn(
            "text-sm font-medium text-slate-900 dark:text-slate-100",
            destructive && "text-red-600"
          )}
        >
          {label}
        </span>
      </div>
      {value && (
        <span suppressHydrationWarning className='text-xs text-slate-400'>
          {value}
        </span>
      )}
    </button>
  );
}

export function ProfileSettings() {
  const { setTheme, theme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      {/* Account Section */}
      <div className='mb-6'>
        <h2 className='mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400'>
          Account
        </h2>
        <div className='overflow-hidden rounded-xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950'>
          <SettingsRow icon={User} label='Personal Info' />

          <div onClick={toggleTheme} className='cursor-pointer'>
            <SettingsRow
              icon={Bell}
              label='Appearance'
              value={theme === "dark" ? "Dark Mode" : "Light Mode"}
            />
          </div>

          <SettingsRow
            icon={CreditCard}
            label='Membership Dues'
            value='Active'
          />
        </div>
      </div>

      {/* Security Section */}
      <div className='mb-8'>
        <h2 className='mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400'>
          Security
        </h2>
        <div className='overflow-hidden rounded-xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950'>
          <SettingsRow icon={ShieldCheck} label='Password & Security' />
          <div className='h-px bg-slate-100 dark:bg-slate-800' />
          <SettingsRow
            icon={LogOut}
            label='Log Out'
            destructive
            onClick={() => logout()}
          />
        </div>
      </div>
    </>
  );
}
