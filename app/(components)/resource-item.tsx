import {
  FileText,
  Music,
  Image as ImageIcon,
  Download,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type ResourceType = "pdf" | "audio" | "image";

interface ResourceItemProps {
  title: string;
  description: string;
  type: ResourceType;
  size?: string; // e.g., "2.4 MB"
}

export function ResourceItem({
  title,
  description,
  type,
  size,
}: ResourceItemProps) {
  // 1. Dynamic Icon Logic
  const getIcon = () => {
    switch (type) {
      case "audio":
        return <Music className='h-6 w-6 text-pink-500' />;
      case "image":
        return <ImageIcon className='h-6 w-6 text-purple-500' />;
      case "pdf":
        return <FileText className='h-6 w-6 text-blue-500' />;
      default:
        return <FileText className='h-6 w-6 text-slate-500' />;
    }
  };

  return (
    <div className='flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/50'>
      {/* Left: Icon & Info */}
      <div className='flex items-center gap-4'>
        <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800'>
          {getIcon()}
        </div>

        <div className='flex flex-col'>
          <span className='font-semibold text-slate-900 dark:text-slate-100 line-clamp-1'>
            {title}
          </span>
          <span className='text-xs text-slate-500'>
            {description} {size && `• ${size}`}
          </span>
        </div>
      </div>

      {/* Right: Action Button */}
      <Button
        variant='ghost'
        size='icon'
        className='shrink-0 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
      >
        {type === "audio" ? (
          <Play className='h-5 w-5' />
        ) : (
          <Download className='h-5 w-5' />
        )}
      </Button>
    </div>
  );
}
