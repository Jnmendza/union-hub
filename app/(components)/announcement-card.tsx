import { Badge } from "@/components/ui/badge"; // npx shadcn-ui@latest add badge
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Megaphone, AlertCircle, Calendar, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type AnnouncementCategory = "urgent" | "event" | "general" | "merch";

interface AnnouncementCardProps {
  title: string;
  date: string;
  author: string;
  category: AnnouncementCategory;
  content: string;
}

const categoryConfig = {
  urgent: {
    icon: AlertCircle,
    color: "text-red-600 dark:text-red-400",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    label: "Urgent",
  },
  event: {
    icon: Calendar,
    color: "text-blue-600 dark:text-blue-400",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    label: "Event",
  },
  merch: {
    icon: Info,
    color: "text-purple-600 dark:text-purple-400",
    badge:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    label: "Merch",
  },
  general: {
    icon: Megaphone,
    color: "text-slate-600 dark:text-slate-400",
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    label: "Update",
  },
};

export function AnnouncementCard({
  title,
  date,
  author,
  category,
  content,
}: AnnouncementCardProps) {
  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <Card className='mb-4 border-l-4 border-l-slate-200 bg-white shadow-sm transition-all hover:border-l-blue-900 dark:border-slate-800 dark:border-l-slate-800 dark:bg-slate-900 dark:hover:border-l-blue-500'>
      <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
        <div className='flex gap-2'>
          {/* Category Icon */}
          <Icon className={cn("h-5 w-5 mt-0.5", config.color)} />

          <div className='space-y-1'>
            <h3 className='font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-100'>
              {title}
            </h3>
            <p className='text-xs text-slate-500'>
              Posted by{" "}
              <span className='font-medium text-slate-700 dark:text-slate-300'>
                {author}
              </span>{" "}
              • {date}
            </p>
          </div>
        </div>

        {/* Category Badge */}
        <Badge
          variant='secondary'
          className={cn("text-[10px] font-bold", config.badge)}
        >
          {config.label}
        </Badge>
      </CardHeader>

      <CardContent>
        <p className='text-sm text-slate-600 dark:text-slate-300 leading-relaxed'>
          {content}
        </p>
      </CardContent>
    </Card>
  );
}
