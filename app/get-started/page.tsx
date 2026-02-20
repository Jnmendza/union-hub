"use client";

import { useState } from "react";
import {
  setDoc,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  Building2,
  ArrowRight,
  LogOut,
  Lock,
  UserPlus,
  Dices,
} from "lucide-react";

export default function GetStartedPage() {
  const router = useRouter();

  // Create State
  const [name, setName] = useState("");
  const [secretCode, setSecretCode] = useState("");

  // Join State
  const [joinCode, setJoinCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper: Generate Random Code
  const generateRandomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSecretCode(`${result.substring(0, 3)}-${result.substring(3)}`);
  };

  // --- 1. CREATE NEW UNION ---
  const handleCreateUnion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !auth.currentUser) return;

    // Ensure code is clean for ID usage
    const cleanId = secretCode
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, "");

    if (cleanId.length < 3) {
      setError("Code must be at least 3 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Check if ID is taken
      const docRef = doc(db, "unions", cleanId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        throw new Error("This Invite Code is already taken. Try another.");
      }

      // Create Union with Custom ID (cleanId)
      await setDoc(docRef, {
        name: name,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser.uid,
        memberIds: [auth.currentUser.uid],
        roles: {
          [auth.currentUser.uid]: "ADMIN",
        },
      });

      localStorage.setItem("last_union_id", cleanId);
      window.location.href = "/";
    } catch (error) {
      console.error("Error creating union:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- 2. JOIN EXISTING UNION ---
  const handleJoinUnion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || !auth.currentUser) return;
    setLoading(true);
    setError("");

    try {
      const cleanJoinId = joinCode.trim().toUpperCase();
      const unionRef = doc(db, "unions", cleanJoinId);
      const unionSnap = await getDoc(unionRef);

      if (!unionSnap.exists()) {
        setError("Workspace not found. Check the Code.");
        setLoading(false);
        return;
      }

      await updateDoc(unionRef, {
        memberIds: arrayUnion(auth.currentUser.uid),
      });

      localStorage.setItem("last_union_id", cleanJoinId);
      window.location.href = "/";
    } catch (error) {
      console.error("Error joining union:", error);
      const err = error as { code?: string };
      if (err.code === "permission-denied") {
        setError("Access Denied. Ask the admin for permission.");
      } else {
        setError("Failed to join. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className='min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white relative'>
      <button
        onClick={handleLogout}
        className='absolute top-6 right-6 text-slate-500 hover:text-white flex items-center gap-2 text-sm transition-colors'
      >
        <LogOut size={16} /> Sign Out
      </button>

      <div className='max-w-md w-full'>
        <div className='text-center mb-8'>
          <div className='w-20 h-20 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-blue-900/20'>
            <Building2 size={40} />
          </div>
          <h1 className='text-3xl font-bold mb-2'>Welcome</h1>
          <p className='text-slate-400'>
            Join your team or create a new workspace.
          </p>
        </div>

        {error && (
          <div className='mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center animate-in fade-in slide-in-from-top-2'>
            {error}
          </div>
        )}

        <div className='space-y-8'>
          {/* JOIN FORM */}
          <form
            onSubmit={handleJoinUnion}
            className='space-y-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl'
          >
            <div className='flex items-center gap-2 mb-2'>
              <UserPlus size={18} className='text-blue-500' />
              <h3 className='text-sm font-bold text-white uppercase tracking-wider'>
                Join Existing
              </h3>
            </div>

            <div className='relative'>
              <input
                type='text'
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder='Enter Invite Code'
                className='w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none placeholder-slate-600 font-mono text-sm tracking-wide uppercase'
              />
            </div>

            <button
              type='submit'
              disabled={loading || !joinCode}
              className='w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700'
            >
              {loading && joinCode ? (
                <span>Joining...</span>
              ) : (
                <span>Join Workspace</span>
              )}
            </button>
          </form>

          {/* DIVIDER */}
          <div className='relative flex items-center justify-center'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-slate-800'></div>
            </div>
            <span className='relative bg-slate-950 px-4 text-xs text-slate-500 uppercase font-bold'>
              OR
            </span>
          </div>

          {/* CREATE FORM */}
          <form
            onSubmit={handleCreateUnion}
            className='space-y-4 opacity-75 hover:opacity-100 transition-opacity'
          >
            <div className='flex items-center gap-2 mb-2'>
              <Building2 size={18} className='text-slate-500' />
              <h3 className='text-sm font-bold text-slate-400 uppercase tracking-wider'>
                Create New
              </h3>
            </div>

            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Union Name'
              className='w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none'
            />

            <div className='relative flex gap-2'>
              <div className='relative flex-1'>
                <Lock
                  className='absolute left-3 top-3.5 text-slate-500'
                  size={16}
                />
                <input
                  type='text'
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value.toUpperCase())}
                  placeholder='Set Invite Code'
                  className='w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-blue-500 focus:outline-none uppercase font-mono tracking-wide'
                />
              </div>
              <button
                type='button'
                onClick={generateRandomCode}
                className='bg-slate-800 hover:bg-slate-700 border border-slate-800 text-slate-400 hover:text-white px-3 rounded-xl transition-colors'
                title='Generate Random Code'
              >
                <Dices size={20} />
              </button>
            </div>

            <button
              type='submit'
              disabled={loading || !name || !secretCode}
              className='w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50'
            >
              {loading && name ? (
                <span>Creating...</span>
              ) : (
                <>
                  <span>Create Workspace</span> <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
