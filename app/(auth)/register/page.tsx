"use client";

import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Eye, EyeOff, Check } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validation State
  const [validations, setValidations] = useState({
    minLength: false,
    hasNumber: false,
    hasUpper: false,
    match: false,
  });

  // Run validation on every keystroke
  useEffect(() => {
    setValidations({
      minLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasUpper: /[A-Z]/.test(password),
      match: password.length > 0 && password === confirmPass,
    });
  }, [password, confirmPass]);

  const isFormValid =
    Object.values(validations).every(Boolean) && email.length > 0;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError("");

    try {
      // 1. Create Auth User in Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2. Create User Profile Document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        displayName: "New Member",
        status: "Just joined",
        createdAt: new Date().toISOString(),
      });

      router.push("/");
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(
          err.message
            .replace("Firebase: ", "")
            .replace("Error (auth/", "")
            .replace(").", "")
        );
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-slate-950 flex items-center justify-center p-6'>
      <div className='w-full max-w-sm'>
        <div className='text-center mb-8'>
          <div className='w-16 h-16 bg-purple-600 rounded-full mx-auto flex items-center justify-center mb-4 shadow-xl shadow-purple-900/20'>
            <User className='text-white w-8 h-8' />
          </div>
          <h1 className='text-2xl font-bold text-white mb-2'>Create Account</h1>
          <p className='text-slate-400 text-sm'>Join the community today</p>
        </div>

        <form onSubmit={handleSignup} className='space-y-4'>
          {/* Email Input */}
          <div className='bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all'>
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

          {/* Password Input */}
          <div className='bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all'>
            <Lock className='text-slate-500 w-5 h-5 shrink-0' />
            <input
              type={showPassword ? "text" : "password"}
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='bg-transparent text-white w-full focus:outline-none placeholder-slate-600 text-sm'
              required
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='text-slate-500 hover:text-slate-300 transition-colors'
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm Password Input */}
          <div className='bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all'>
            <Lock className='text-slate-500 w-5 h-5 shrink-0' />
            <input
              type={showConfirm ? "text" : "password"}
              placeholder='Confirm Password'
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className='bg-transparent text-white w-full focus:outline-none placeholder-slate-600 text-sm'
              required
            />
            <button
              type='button'
              onClick={() => setShowConfirm(!showConfirm)}
              className='text-slate-500 hover:text-slate-300 transition-colors'
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Validation Checklist */}
          <div className='bg-slate-900/50 p-4 rounded-xl space-y-2'>
            <p className='text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2'>
              Password Requirements
            </p>

            <ValidationItem
              valid={validations.minLength}
              label='At least 8 characters'
            />
            <ValidationItem
              valid={validations.hasNumber}
              label='Contains a number'
            />
            <ValidationItem
              valid={validations.hasUpper}
              label='Contains an uppercase letter'
            />
            <ValidationItem valid={validations.match} label='Passwords match' />
          </div>

          {error && (
            <div className='p-3 bg-red-500/10 border border-red-500/20 rounded-lg'>
              <p className='text-red-400 text-xs text-center'>{error}</p>
            </div>
          )}

          <button
            type='submit'
            disabled={loading || !isFormValid}
            className='w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20 mt-2'
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className='text-center text-slate-500 text-sm mt-8'>
          Already have an account?{" "}
          <Link
            href='/login'
            className='text-purple-500 font-bold hover:underline'
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

// Helper Component for Checklist
const ValidationItem = ({
  valid,
  label,
}: {
  valid: boolean;
  label: string;
}) => (
  <div className='flex items-center gap-2'>
    <div
      className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${
        valid ? "bg-green-500 border-green-500" : "border-slate-600"
      }`}
    >
      {valid && <Check size={10} className='text-white' />}
    </div>
    <span
      className={`text-xs transition-colors ${
        valid ? "text-green-400" : "text-slate-400"
      }`}
    >
      {label}
    </span>
  </div>
);
