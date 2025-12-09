"use client";

import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import {
  Camera,
  LogOut,
  QrCode,
  Moon,
  Sun,
  Bell,
  ChevronRight,
  Edit2,
  X,
  Copy,
  Lock as LockIcon,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);

  // Data State
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState("");
  const [memberId, setMemberId] = useState("");

  // UI State
  const [isEditing, setIsEditing] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // 1. Auth & Fetch Data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setDisplayName(data.displayName || "");
            setStatus(data.status || "");
            setMemberId(data.memberId || "");
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Save Handler (Only saves Name & Status now)
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSuccessMsg("");

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          displayName: displayName || "Anonymous",
          status: status,
          // We DO NOT save memberId here anymore. It's admin-controlled.
          email: user.email,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setSuccessMsg("Saved!");
      setTimeout(() => setSuccessMsg(""), 3000);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleCopyId = (text: string) => {
    if (!text) return;
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      setSuccessMsg("Copied!");
      setTimeout(() => setSuccessMsg(""), 2000);
    } catch (err) {
      console.error(err);
    }
    document.body.removeChild(textArea);
  };

  if (loading)
    return (
      <div className='h-screen bg-slate-950 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
      </div>
    );

  // --- QR CODE MODAL ---
  if (showQr) {
    return (
      <div className='fixed inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-200 backdrop-blur-sm'>
        <button
          onClick={() => setShowQr(false)}
          className='absolute top-6 right-6 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white border border-slate-700'
        >
          <X size={24} />
        </button>
        <div className='bg-white p-8 rounded-3xl shadow-2xl text-center w-full max-w-sm'>
          <div className='bg-white rounded-xl mb-6 flex items-center justify-center'>
            <QRCode
              value={memberId || user?.uid || ""}
              size={200}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox={`0 0 256 256`}
            />
          </div>
          <h2 className='text-slate-900 font-bold text-2xl mb-1'>
            {displayName || "User"}
          </h2>
          <p className='text-slate-500 font-mono text-xs uppercase tracking-widest mt-2'>
            {memberId ? `UNION ID: ${memberId}` : "ID NOT VERIFIED"}
          </p>
        </div>
        <p className='text-slate-400 mt-8 text-sm font-medium'>
          Scan to verify identity
        </p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen pb-24 transition-colors duration-300 ${
        darkMode ? "bg-slate-950 text-slate-200" : "bg-slate-100 text-slate-900"
      }`}
    >
      <div className='p-6 pt-12 flex justify-between items-center'>
        <h1
          className={`text-2xl font-bold ${
            darkMode ? "text-white" : "text-slate-900"
          }`}
        >
          My ID
        </h1>
        <div className='w-8'></div>
      </div>

      <div className='px-6 mb-8'>
        <div
          className={`${
            darkMode
              ? "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50"
              : "bg-white border-slate-200 shadow-xl"
          } border rounded-3xl p-6 relative overflow-hidden transition-all duration-300`}
        >
          <div className='absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none'></div>

          <div className='flex items-center gap-5 relative z-10'>
            <div className='relative'>
              <div className='w-20 h-20 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg'>
                {displayName ? displayName.substring(0, 2).toUpperCase() : "ID"}
              </div>
              {isEditing && (
                <button className='absolute -bottom-1 -right-1 bg-slate-700 p-1.5 rounded-full border border-slate-600 text-white'>
                  <Camera size={12} />
                </button>
              )}
            </div>

            <div className='flex-1 min-w-0'>
              {isEditing ? (
                <div className='space-y-3'>
                  <input
                    type='text'
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder='Display Name'
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 ${
                      darkMode
                        ? "bg-slate-950/50 border-slate-600 text-white"
                        : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                  <div className='flex gap-2'>
                    <input
                      type='text'
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      placeholder='Status'
                      className={`flex-1 border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 ${
                        darkMode
                          ? "bg-slate-950/50 border-slate-600 text-white"
                          : "bg-slate-50 border-slate-300 text-slate-900"
                      }`}
                    />
                    {/* LOCKED MEMBER ID */}
                    <div className='relative w-1/3 group'>
                      <LockIcon
                        size={12}
                        className='absolute left-2 top-2.5 text-slate-500'
                      />
                      <input
                        type='text'
                        value={memberId || "Pending"}
                        disabled
                        className={`w-full border rounded-lg pl-6 pr-2 py-2 text-xs font-mono opacity-60 cursor-not-allowed ${
                          darkMode
                            ? "bg-slate-950/50 border-slate-600 text-white"
                            : "bg-slate-50 border-slate-300 text-slate-900"
                        }`}
                      />
                      {/* Tooltip for Disabled Input */}
                      <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap'>
                        Contact Admin to Change
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h2
                    className={`text-xl font-bold truncate ${
                      darkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {displayName || "Anonymous"}
                  </h2>
                  <p
                    className={`text-sm truncate ${
                      darkMode ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {status || "No status set"}
                  </p>

                  <button
                    onClick={() => handleCopyId(memberId || user?.uid || "")}
                    className={`mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border transition-colors active:scale-95 ${
                      darkMode
                        ? "bg-slate-950/50 border-slate-700/50 hover:bg-slate-900"
                        : "bg-slate-100 border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    <span className='text-[10px] text-slate-500 font-mono'>
                      {memberId
                        ? `UNION ID: ${memberId}`
                        : `ID: ${user?.uid.substring(0, 8)}...`}
                    </span>
                    <Copy size={10} className='text-slate-500' />
                  </button>
                  {successMsg === "Copied!" && (
                    <span className='ml-2 text-xs text-green-500 font-medium'>
                      Copied!
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          <div className='mt-6'>
            {isEditing ? (
              <div className='flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200'>
                <button
                  onClick={() => setIsEditing(false)}
                  className={`flex-1 border py-2.5 rounded-xl font-medium text-sm ${
                    darkMode
                      ? "border-slate-600/30 text-slate-500 hover:text-slate-300"
                      : "border-slate-300 text-slate-400"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className='flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-500 shadow-lg shadow-blue-500/20'
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            ) : (
              <div className='flex gap-3'>
                <button
                  onClick={() => setShowQr(true)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${
                    darkMode
                      ? "bg-white text-slate-900 hover:bg-slate-200"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  <QrCode size={16} /> Show QR
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className={`flex-1 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 border ${
                    darkMode
                      ? "bg-slate-700/50 text-white border-slate-600/50 hover:bg-slate-700"
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  <Edit2 size={16} /> Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Section (Same as before) */}
      <div className='px-6 space-y-1'>
        <h3 className='text-slate-500 text-xs font-bold uppercase tracking-wider mb-3 ml-2'>
          App Settings
        </h3>
        <div
          className={`${
            darkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200"
          } border rounded-xl p-4 flex items-center justify-between`}
        >
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-purple-500/10 rounded-lg text-purple-400'>
              {darkMode ? (
                <Moon size={20} />
              ) : (
                <Sun size={20} className='text-orange-500' />
              )}
            </div>
            <span
              className={`font-medium ${
                darkMode ? "text-slate-200" : "text-slate-900"
              }`}
            >
              Night Mode
            </span>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-12 h-6 rounded-full relative ${
              darkMode ? "bg-blue-600" : "bg-slate-300"
            }`}
          >
            <div
              className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                darkMode ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
        <div
          className={`${
            darkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200"
          } border rounded-xl p-4 flex items-center justify-between`}
        >
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-orange-500/10 rounded-lg text-orange-400'>
              <Bell size={20} />
            </div>
            <span
              className={`font-medium ${
                darkMode ? "text-slate-200" : "text-slate-900"
              }`}
            >
              Notifications
            </span>
          </div>
          <ChevronRight size={20} className='text-slate-600' />
        </div>
      </div>

      <div className='px-6 mt-8'>
        <button
          onClick={handleSignOut}
          className='w-full p-4 flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-400/5 rounded-xl transition-colors'
        >
          <LogOut size={20} />
          <span className='font-medium'>Sign Out</span>
        </button>
        <p className='text-center text-slate-700 text-xs mt-4'>
          Version 1.0.4 • Chavos SG
        </p>
      </div>
    </div>
  );
}
