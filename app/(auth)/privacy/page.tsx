"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { PrivacyContent } from "@/components/legal/privacy-content";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className='min-h-screen bg-slate-950 text-slate-200 p-8'>
      <div className='max-w-2xl mx-auto'>
        <button
          onClick={() => router.back()}
          className='flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors'
        >
          <ChevronLeft size={20} />
          Back
        </button>
        <div className='bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-10 shadow-2xl'>
          <PrivacyContent />
        </div>
      </div>
    </div>
  );
}
