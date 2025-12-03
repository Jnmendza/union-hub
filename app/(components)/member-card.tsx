import { QrCode } from "lucide-react";

interface MemberCardProps {
  name: string;
  memberId: string;
  tier: string; // e.g., "Founding Member"
  since: string;
}

export function MemberCard({ name, memberId, tier, since }: MemberCardProps) {
  return (
    <div className='relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-900 via-blue-800 to-slate-900 p-6 text-white shadow-xl'>
      {/* Background Pattern (Optional decorative circles) */}
      <div className='absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/20 blur-2xl' />
      <div className='absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-2xl' />

      {/* Top Row: Union Branding */}
      <div className='relative z-10 flex items-start justify-between'>
        <div className='flex flex-col'>
          <span className='text-xs font-bold uppercase tracking-widest text-blue-200'>
            Frontera Union
          </span>
          <span className='text-lg font-black italic tracking-tighter'>
            OFFICIAL MEMBER
          </span>
        </div>
        {/* Placeholder for Logo */}
        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm'>
          <span className='font-bold'>FU</span>
        </div>
      </div>

      {/* Middle: QR Code Area */}
      <div className='relative z-10 my-6 flex justify-center'>
        <div className='flex h-32 w-32 items-center justify-center rounded-xl bg-white p-2 shadow-lg'>
          {/* In real app, use a QR library. For now, an icon. */}
          <QrCode className='h-24 w-24 text-slate-900' />
        </div>
      </div>

      {/* Bottom Row: User Details */}
      <div className='relative z-10 flex justify-between pt-2'>
        <div className='flex flex-col'>
          <span className='text-[10px] text-blue-300'>NAME</span>
          <span className='font-bold tracking-wide'>{name}</span>
        </div>
        <div className='flex flex-col items-end'>
          <span className='text-[10px] text-blue-300'>ID NUMBER</span>
          <span className='font-mono font-bold tracking-widest'>
            {memberId}
          </span>
        </div>
      </div>

      {/* Footer Tier Info */}
      <div className='mt-4 border-t border-white/10 pt-2 text-center text-[10px] text-blue-200'>
        {tier} • Since {since}
      </div>
    </div>
  );
}
