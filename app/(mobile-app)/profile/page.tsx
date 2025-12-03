import { Button } from "@/components/ui/button";
import {
  User,
  Settings,
  Bell,
  LogOut,
  CreditCard,
  ShieldCheck,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MemberCard } from "@/app/(components)/member-card";

interface SettingsRowProps {
  icon: LucideIcon;
  label: string;
  value?: string;
  destructive?: boolean;
}

// Reusable Settings Row Component
function SettingsRow({
  icon: Icon,
  label,
  value,
  destructive,
}: SettingsRowProps) {
  return (
    <button className='flex w-full items-center justify-between px-4 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900'>
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
      {value && <span className='text-xs text-slate-400'>{value}</span>}
    </button>
  );
}

export default function ProfilePage() {
  return (
    <div className='min-h-screen bg-white pb-24 dark:bg-slate-950'>
      {/* Header */}
      <div className='sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/80 px-4 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80'>
        <h1 className='text-xl font-bold text-slate-900 dark:text-white'>
          My ID
        </h1>
        <Button variant='ghost' size='icon' className='text-slate-400'>
          <Settings className='h-5 w-5' />
        </Button>
      </div>

      <div className='p-4'>
        {/* The Digital Card */}
        <div className='mb-8'>
          <MemberCard
            name='JONATHAN MENDOZA'
            memberId='858-001-294'
            tier='Founding Member'
            since='2024'
          />
        </div>

        {/* Account Section */}
        <div className='mb-6'>
          <h2 className='mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400'>
            Account
          </h2>
          <div className='overflow-hidden rounded-xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950'>
            <SettingsRow icon={User} label='Personal Info' />
            <SettingsRow icon={Bell} label='Notifications' value='On' />
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
            <div className='h-px bg-slate-100 dark:bg-slate-800' />{" "}
            {/* Divider */}
            <SettingsRow icon={LogOut} label='Log Out' destructive />
          </div>
        </div>

        {/* Version Info */}
        <div className='text-center'>
          <p className='text-[10px] text-slate-400'>The Union Hub v1.0.2</p>
        </div>
      </div>
    </div>
  );
}
