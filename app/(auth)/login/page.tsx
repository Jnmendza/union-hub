import { login, signup } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Make sure you have this component
import Link from "next/link";

export default async function LoginPage(
  props: Promise<{ searchParams: Promise<{ message: string }> }>
) {
  const { searchParams } = await props;
  const resolvedSearchParams = await searchParams;

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 dark:bg-slate-950'>
      <div className='w-full max-w-sm space-y-6 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-lg dark:border-slate-800 dark:bg-slate-950'>
        <div className='space-y-2'>
          <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>
            Union Hub
          </h1>
          <p className='text-sm text-slate-500'>Enter your email to sign in.</p>
        </div>

        <form className='space-y-4 text-left'>
          <div className='space-y-2'>
            <label
              className='text-xs font-medium text-slate-500'
              htmlFor='email'
            >
              Email
            </label>
            <Input
              id='email'
              name='email'
              type='email'
              placeholder='member@fronteraunion.com'
              required
              className='text-slate-900 dark:text-white'
            />
          </div>

          <div className='space-y-2'>
            <label
              className='text-xs font-medium text-slate-500'
              htmlFor='password'
            >
              Password
            </label>
            <Input
              id='password'
              name='password'
              type='password'
              required
              className='text-slate-900 dark:text-white'
            />
          </div>

          <div className='flex flex-col gap-2 pt-2'>
            {/* formaction allows us to use two buttons in one form */}
            <Button
              formAction={login}
              className='w-full bg-blue-900 hover:bg-blue-800'
            >
              Sign In
            </Button>
            <Button
              formAction={signup}
              variant='outline'
              className='w-full text-blue-900 dark:border-slate-600 dark:text-white'
            >
              Sign Up
            </Button>
          </div>

          {resolvedSearchParams?.message && (
            <p className='text-center text-xs text-red-500 bg-red-50 p-2 rounded'>
              {resolvedSearchParams.message}
            </p>
          )}
        </form>

        <div className='text-xs text-slate-400'>
          <Link href='/' className='hover:underline'>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
