import Link from "next/link";
import { ChevronRight, Lock, Hash, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

export type GroupType = "public" | "private" | "announcement";

interface GroupRowProps {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  type: GroupType;
}

export function GroupRow({
  id,
  name,
  lastMessage,
  timestamp,
  unreadCount,
  type,
}: GroupRowProps) {
  // 1. Visual Logic based on Type
  const getIcon = () => {
    switch (type) {
      case "announcement":
        return <Megaphone className='h-5 w-5 text-blue-600' />;
      case "private":
        return <Lock className='h-5 w-5 text-amber-600' />;
      default:
        return <Hash className='h-5 w-5 text-slate-500' />;
    }
  };

  // 2. Background Logic
  const getBgColor = () => {
    switch (type) {
      case "announcement":
        return "bg-blue-50 dark:bg-blue-900/20";
      case "private":
        return "bg-amber-50 dark:bg-amber-900/20";
      default:
        return "bg-slate-100 dark:bg-slate-800";
    }
  };

  return (
    <Link
      href={`/groups/${id}`} // Dynamic Route (we will build this next)
      className='flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900'
    >
      {/* Avatar / Icon */}
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
          getBgColor()
        )}
      >
        {getIcon()}
      </div>

      {/* Main Content */}
      <div className='flex flex-1 flex-col overflow-hidden'>
        <div className='flex items-center justify-between'>
          <span className='font-semibold text-slate-900 dark:text-slate-100'>
            {name}
          </span>
          <span className='text-[10px] text-slate-400'>{timestamp}</span>
        </div>
        <div className='flex items-center justify-between gap-2'>
          <span
            className={cn(
              "truncate text-sm",
              unreadCount
                ? "font-medium text-slate-900 dark:text-white"
                : "text-slate-500"
            )}
          >
            {lastMessage}
          </span>

          {/* Unread Badge */}
          {unreadCount && unreadCount > 0 && (
            <span className='flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white'>
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Chevron for affordance */}
      <ChevronRight className='h-4 w-4 text-slate-300' />
    </Link>
  );
}
