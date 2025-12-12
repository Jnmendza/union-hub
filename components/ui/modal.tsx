"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleOpenChange = () => {
    router.back();
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6'>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200'
        onClick={handleOpenChange}
      />

      {/* Content */}
      <div className='relative z-50 w-full max-w-lg bg-slate-950 border border-slate-800 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col'>
        <div className='flex items-center justify-end p-4 border-b border-slate-800 shrink-0'>
          <button
            onClick={handleOpenChange}
            className='text-slate-400 hover:text-white transition-colors'
          >
            <X size={20} />
            <span className='sr-only'>Close</span>
          </button>
        </div>
        <div className='p-6 overflow-y-auto'>{children}</div>
      </div>
    </div>
  );
}
