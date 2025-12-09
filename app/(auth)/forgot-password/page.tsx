"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setStatus("success");
      setMessage("Check your email inbox for password reset instructions.");
    } catch (err: any) {
      setStatus("error");
      // Clean up Firebase error messages for display
      const errorMsg = err.message
        .replace("Firebase: ", "")
        .replace("Error (auth/", "")
        .replace(").", "");
      setMessage(
        errorMsg || "Failed to send reset email. Please check the address."
      );
    }
  };

  return (
    <div className='min-h-screen bg-slate-950 flex items-center justify-center p-6'>
      <div className='w-full max-w-sm'>
        {/* Back Button */}
        <Link
          href='/login'
          className='inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors text-sm font-medium group'
        >
          <ArrowLeft
            size={16}
            className='group-hover:-translate-x-1 transition-transform'
          />
          Back to Login
        </Link>

        <div className='text-center mb-8'>
          <div className='w-20 h-20 bg-slate-800 rounded-full mx-auto flex items-center justify-center mb-4 shadow-xl border border-slate-700'>
            <KeyRound className='text-slate-400 w-10 h-10' />
          </div>
          <h1 className='text-2xl font-bold text-white mb-2'>Reset Password</h1>
          <p className='text-slate-400 text-sm leading-relaxed'>
            Enter the email associated with your account and we'll send you a
            link to reset your password.
          </p>
        </div>

        {status === "success" ? (
          <div className='bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center animate-in fade-in zoom-in-95 duration-300'>
            <p className='text-green-400 font-medium mb-4'>{message}</p>
            <Link
              href='/login'
              className='block w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-lg transition-colors text-sm'
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className='space-y-4'>
            <div className='bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all'>
              <Mail className='text-slate-500 w-5 h-5 shrink-0' />
              <input
                type='email'
                placeholder='Email address'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='bg-transparent text-white w-full focus:outline-none placeholder-slate-600 text-sm'
                required
              />
            </div>

            {status === "error" && (
              <div className='p-3 bg-red-500/10 border border-red-500/20 rounded-lg'>
                <p className='text-red-400 text-xs text-center'>{message}</p>
              </div>
            )}

            <button
              type='submit'
              disabled={status === "loading"}
              className='w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 mt-2'
            >
              {status === "loading" ? "Sending Link..." : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
