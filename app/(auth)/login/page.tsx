"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-slate-950 flex items-center justify-center p-6'>
      <div className='w-full max-w-sm'>
        <div className='text-center mb-10'>
          <div className='w-20 h-20 bg-blue-600 rounded-full mx-auto flex items-center justify-center mb-4 shadow-xl shadow-blue-900/20'>
            <Lock className='text-white w-10 h-10' />
          </div>
          <h1 className='text-3xl font-bold text-white mb-2'>Welcome Back</h1>
          <p className='text-slate-400'>Sign in to continue</p>
        </div>

        <form onSubmit={handleLogin} className='space-y-4'>
          <div className='bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3'>
            <Mail className='text-slate-500 w-5 h-5' />
            <input
              type='email'
              placeholder='Email address'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='bg-transparent text-white w-full focus:outline-none placeholder-slate-600'
              required
            />
          </div>
          <div className='bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3'>
            <Lock className='text-slate-500 w-5 h-5' />
            <input
              type='password'
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='bg-transparent text-white w-full focus:outline-none placeholder-slate-600'
              required
            />
          </div>

          {/* Forgot Password Link */}
          <div className='flex justify-end'>
            <Link
              href='/forgot-password'
              className='text-xs font-medium text-slate-400 hover:text-blue-400 transition-colors'
            >
              Forgot Password?
            </Link>
          </div>

          {error && <p className='text-red-500 text-sm text-center'>{error}</p>}

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 mt-2'
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className='text-center text-slate-500 text-sm mt-8'>
          Don't have an account?{" "}
          <Link
            href='/register'
            className='text-blue-500 font-bold hover:underline'
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
