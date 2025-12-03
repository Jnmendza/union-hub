import { CalendarClock, MapPin, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MatchWidgetProps {
  opponentName: string;
  opponentLogoUrl: string; // URL to image
  matchDate: string; // e.g., "Sat, May 12"
  matchTime: string; // e.g., "7:30 PM"
  venue: string;
  isHome: boolean;
}

export function MatchWidget({
  opponentName,
  opponentLogoUrl,
  matchDate,
  matchTime,
  venue,
  isHome,
}: MatchWidgetProps) {
  return (
    <Card className='w-full overflow-hidden border-slate-200 bg-linear-to-br from-white to-slate-100 shadow-md dark:border-slate-800 dark:from-slate-950 dark:to-slate-900'>
      {/* Header: Status Badge */}
      <div className='flex items-center justify-between px-4 pt-4'>
        <span className='inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-100'>
          Next Match
        </span>
        <span className='text-xs font-medium text-slate-500'>
          MLS Regular Season
        </span>
      </div>

      <CardContent className='p-6'>
        <div className='flex items-center justify-between'>
          {/* Home Team (Us) */}
          <div className='flex flex-col items-center gap-2'>
            <div className='flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 p-2 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700'>
              {/* Replace with actual SDFC Image component */}
              <div className='text-2xl font-bold text-blue-900 dark:text-blue-400'>
                SD
              </div>
            </div>
            <span className='text-sm font-bold text-slate-900 dark:text-slate-100'>
              SDFC
            </span>
          </div>

          {/* VS Divider */}
          <div className='flex flex-col items-center'>
            <span className='text-xl font-black italic tracking-tighter text-slate-300 dark:text-slate-600'>
              VS
            </span>
          </div>

          {/* Away Team (Them) */}
          <div className='flex flex-col items-center gap-2'>
            <div className='flex h-16 w-16 items-center justify-center rounded-full bg-white p-2 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700'>
              {/* In a real app, use <Image src={opponentLogoUrl} ... /> */}
              {/* <Image
                src={opponentLogoUrl}
                alt='opponents-logo'
                width={12}
                height={12}
              /> */}
              <div className='text-xs text-center text-slate-400'>Logo</div>
            </div>
            <span className='text-sm font-bold text-slate-900 dark:text-slate-100 text-center max-w-20 leading-tight'>
              {opponentName}
            </span>
          </div>
        </div>

        {/* Date & Venue Info */}
        <div className='mt-6 flex flex-col items-center gap-1.5 text-center'>
          <div className='flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50'>
            <CalendarClock className='h-4 w-4 text-blue-600' />
            {matchDate} • {matchTime}
          </div>
          <div className='flex items-center gap-1.5 text-sm text-slate-500'>
            <MapPin className='h-3.5 w-3.5' />
            {venue}
          </div>
        </div>
      </CardContent>

      {/* Footer: Action Button */}
      <CardFooter className='bg-slate-50 p-3 dark:bg-slate-900/50'>
        <Button
          className='w-full bg-blue-900 text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500'
          size='lg'
        >
          <Ticket className='mr-2 h-4 w-4' />
          {isHome ? "Get Tickets" : "Away Travel Info"}
        </Button>
      </CardFooter>
    </Card>
  );
}
