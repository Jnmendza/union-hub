"use client";

import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Eye, EyeOff, Check, Loader2 } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // New State for Compliance
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [eulaAgreed, setEulaAgreed] = useState(false);

  const [error, setError] = useState("");
  // NEW: Specific error state for DOB
  const [dobError, setDobError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validation - Derived State
  const [validations, setValidations] = useState({
    minLength: false,
    hasNumber: false,
    hasUpper: false,
    match: false,
    age: false,
    eula: false,
  });

  // Age Calculation
  const calculateAge = (dobString: string) => {
    if (!dobString) return 0;
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Run validation on every change
  useEffect(() => {
    const age = calculateAge(dateOfBirth);
    const isAdult = age >= 18;

    // UX Improvement: Show error immediately if date is selected but invalid
    if (dateOfBirth && !isAdult) {
      setDobError("You must be at least 18 years old to join.");
    } else {
      setDobError("");
    }

    setValidations({
      minLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasUpper: /[A-Z]/.test(password),
      match: password.length > 0 && password === confirmPass,
      age: isAdult,
      eula: eulaAgreed,
    });
  }, [password, confirmPass, dateOfBirth, eulaAgreed]);

  const isFormValid =
    Object.values(validations).every(Boolean) && email.length > 0;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        displayName: "New Member",
        status: "Just joined",
        createdAt: new Date().toISOString(),
        dateOfBirth: dateOfBirth,
        eulaAgreed: true,
        isBanned: false,
        blockedUserIds: [],
      });

      router.push("/");
    } catch (err: unknown) {
      console.error(err);
      let errorMessage = "An unknown error occurred";
      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(
        errorMessage
          .replace("Firebase: ", "")
          .replace("Error (auth/", "")
          .replace(").", "")
      );
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

          <div className='space-y-1'>
            <div
              className={`bg-slate-900 border rounded-xl px-4 py-3 flex flex-col gap-1 transition-all ${
                dobError
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-slate-800 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500"
              }`}
            >
              <label
                className={`text-xs ml-1 ${
                  dobError ? "text-red-500" : "text-slate-500"
                }`}
              >
                Date of Birth (Must be 18+)
              </label>
              <input
                type='date'
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className='bg-transparent text-white w-full focus:outline-none placeholder-slate-600 text-sm [color-scheme:dark]'
                required
              />
            </div>
            {/* NEW: Inline Error Message */}
            {dobError && (
              <p className='text-red-400 text-xs px-1 animate-in slide-in-from-top-1'>
                {dobError}
              </p>
            )}
          </div>

          <div className='flex items-start gap-3 px-1'>
            <input
              type='checkbox'
              id='eula'
              checked={eulaAgreed}
              onChange={(e) => setEulaAgreed(e.target.checked)}
              className='mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500'
            />
            <label htmlFor='eula' className='text-sm text-slate-400'>
              I agree to the{" "}
              <Link href='/eula' className='text-purple-400 hover:underline'>
                End User License Agreement (EULA)
              </Link>{" "}
              and the{" "}
              <Link href='/privacy' className='text-purple-400 hover:underline'>
                Privacy Policy
              </Link>
              . I confirm that I am at least 18 years old.
            </label>
          </div>

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
            className='w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20 mt-2 flex items-center justify-center gap-2'
          >
            {loading ? <Loader2 size={20} className='animate-spin' /> : null}
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
