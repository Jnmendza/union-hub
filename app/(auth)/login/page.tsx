import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 dark:bg-slate-950'>
      <div className='w-full max-w-sm space-y-4 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-lg dark:border-slate-800 dark:bg-slate-950'>
        <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>
          Union Hub
        </h1>
        <p className='text-sm text-slate-500'>
          Log in to access member resources.
        </p>

        {/* Placeholder Form UI */}
        <div className='space-y-2'>
          <Button className='w-full bg-blue-900 hover:bg-blue-800' disabled>
            Login Coming Soon
          </Button>
          <div className='text-xs text-slate-400'>
            <Link href='/' className='hover:underline'>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
