"use client";

import { useState, useTransition, Suspense } from "react"; // Added Suspense
import { useSearchParams } from "next/navigation";
import { login, signup } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Check, X, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// 1. Rename your existing component to "LoginForm" (not default export)
function LoginForm() {
  const [view, setView] = useState<"login" | "signup">("login");
  const [isPending, startTransition] = useTransition();

  // Form State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    name?: string;
  }>({});

  // This hook causes the build error if not wrapped in Suspense
  const searchParams = useSearchParams();
  const serverError = searchParams.get("message");

  const rules = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "Contains a number", valid: /\d/.test(password) },
    {
      label: "Contains a special character",
      valid: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ];

  const validateForm = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (view === "signup" && !name.trim()) {
      newErrors.name = "Full name is required";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (view === "signup") {
      const allRulesMet = rules.every((r) => r.valid);
      if (!allRulesMet) {
        newErrors.password = "Password does not meet requirements";
        isValid = false;
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (action: "login" | "signup") => {
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    if (view === "signup") formData.append("name", name);

    startTransition(() => {
      if (action === "login") {
        login(formData);
      } else {
        signup(formData);
      }
    });
  };

  const inputStyles =
    "bg-slate-50 text-slate-900 placeholder:text-slate-500/50 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-400/30";

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 dark:bg-slate-950'>
      <div className='w-full max-w-sm space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-950'>
        <div className='space-y-2 text-center'>
          <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>
            Union Hub
          </h1>
          <p className='text-sm text-slate-500'>
            {view === "login"
              ? "Welcome back! Sign in to continue."
              : "Create an account to join."}
          </p>
        </div>

        <form
          className='space-y-4 text-left'
          onSubmit={(e) => e.preventDefault()}
        >
          {view === "signup" && (
            <div className='space-y-1 animate-in fade-in slide-in-from-top-2'>
              <label
                className='text-xs font-medium text-slate-500'
                htmlFor='name'
              >
                Full Name
              </label>
              <Input
                id='name'
                type='text'
                placeholder='Enter full name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={cn(
                  inputStyles,
                  errors.name && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.name && (
                <p className='text-[10px] text-red-500 flex items-center gap-1'>
                  <AlertCircle className='h-3 w-3' /> {errors.name}
                </p>
              )}
            </div>
          )}

          <div className='space-y-1'>
            <label
              className='text-xs font-medium text-slate-500'
              htmlFor='email'
            >
              Email
            </label>
            <Input
              id='email'
              type='email'
              placeholder='member@fronteraunion.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                inputStyles,
                errors.email && "border-red-500 focus-visible:ring-red-500"
              )}
            />
            {errors.email && (
              <p className='text-[10px] text-red-500 flex items-center gap-1'>
                <AlertCircle className='h-3 w-3' /> {errors.email}
              </p>
            )}
          </div>

          <div className='space-y-1'>
            <label
              className='text-xs font-medium text-slate-500'
              htmlFor='password'
            >
              Password
            </label>
            <div className='relative'>
              <Input
                id='password'
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder={showPassword ? "Password" : "••••••••"}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  inputStyles,
                  "pr-10",
                  errors.password && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              >
                {showPassword ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </button>
            </div>
            {errors.password && (
              <p className='text-[10px] text-red-500 flex items-center gap-1'>
                <AlertCircle className='h-3 w-3' /> {errors.password}
              </p>
            )}

            {view === "signup" && (
              <div className='mt-4 space-y-1 animate-in fade-in slide-in-from-top-2'>
                <label
                  className='text-xs font-medium text-slate-500'
                  htmlFor='confirmPassword'
                >
                  Confirm Password
                </label>
                <div className='relative'>
                  <Input
                    id='confirmPassword'
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    placeholder={showConfirmPassword ? "Password" : "••••••••"}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={cn(
                      inputStyles,
                      "pr-10",
                      errors.confirmPassword &&
                        "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  >
                    {showConfirmPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className='text-[10px] text-red-500 flex items-center gap-1'>
                    <AlertCircle className='h-3 w-3' /> {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {view === "signup" && (
              <div className='mt-2 space-y-1 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50'>
                <p className='mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider'>
                  Password Requirements
                </p>
                {rules.map((rule, i) => (
                  <div key={i} className='flex items-center gap-2'>
                    {rule.valid ? (
                      <Check className='h-3 w-3 text-green-500' />
                    ) : (
                      <div className='h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600' />
                    )}
                    <span
                      className={cn(
                        "text-[10px] transition-colors",
                        rule.valid
                          ? "text-green-600 dark:text-green-400"
                          : "text-slate-500"
                      )}
                    >
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className='flex flex-col gap-2 pt-2'>
            {view === "login" ? (
              <Button
                onClick={() => handleSubmit("login")}
                disabled={isPending}
                className='w-full bg-blue-900 hover:bg-blue-800 text-white'
              >
                {isPending ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  "Sign In"
                )}
              </Button>
            ) : (
              <Button
                onClick={() => handleSubmit("signup")}
                disabled={isPending}
                className='w-full bg-blue-900 hover:bg-blue-800 text-white'
              >
                {isPending ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  "Create Account"
                )}
              </Button>
            )}
          </div>

          {serverError && (
            <div className='flex items-center gap-2 rounded-md bg-red-50 p-3 text-red-600 dark:bg-red-900/20 dark:text-red-300'>
              <AlertCircle className='h-4 w-4 shrink-0' />
              <p className='text-xs'>{serverError}</p>
            </div>
          )}
        </form>

        <div className='text-xs text-slate-400'>
          {view === "login" ? (
            <p>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => {
                  setView("signup");
                  setErrors({});
                }}
                className='text-blue-600 hover:underline dark:text-blue-400'
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setView("login");
                  setErrors({});
                }}
                className='text-blue-600 hover:underline dark:text-blue-400'
              >
                Sign in
              </button>
            </p>
          )}
        </div>

        <div className='pt-4 text-xs text-slate-300'>
          <Link href='/' className='hover:text-slate-500'>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

// 2. The Main Page Component wraps the Form in Suspense
export default function LoginPage() {
  return (
    // Fallback doesn't strictly matter as this loads instantly usually, but creates a safe boundary
    <Suspense
      fallback={
        <div className='flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950'>
          <Loader2 className='h-8 w-8 animate-spin text-slate-400' />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
