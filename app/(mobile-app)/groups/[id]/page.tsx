"use client";

import React, { useState, useEffect } from "react";
import { doc, updateDoc, arrayUnion, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, UserPlus } from "lucide-react";
import { useUnion } from "@/app/(components)/union-provider";
import { ChatWindow } from "@/app/(components)/chat-window";

// --- Types ---
interface Group {
  id: string;
  name: string;
  description: string;
  color: string;
  members: string[];
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUnion } = useUnion();
  const groupId = typeof params?.id === "string" ? params.id : "";

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  // 1. Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Group Details (Needed for Title & Permissions)
  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId || !currentUnion) return;
      try {
        const docRef = doc(db, "unions", currentUnion.id, "groups", groupId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setGroup({ id: docSnap.id, ...docSnap.data() } as Group);
          } else {
            setGroup(null);
          }
          setLoading(false);
        });
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching group:", error);
        setLoading(false);
      }
    };
    fetchGroup();
  }, [groupId, currentUnion]);

  // Check Membership
  const isMember = group?.members?.includes(user?.uid || "");

  // Handler: Join Group
  const handleJoinGroup = async () => {
    if (!user || !groupId || !currentUnion) return;
    setJoining(true);
    try {
      await updateDoc(doc(db, "unions", currentUnion.id, "groups", groupId), {
        members: arrayUnion(user.uid),
      });
    } catch (error) {
      console.error("Error joining group", error);
      alert("Failed to join group. Check permissions.");
    } finally {
      setJoining(false);
    }
  };

  if (loading)
    return (
      <div className='flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-950 text-slate-500'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4'></div>
        <p>Loading...</p>
      </div>
    );

  if (!group)
    return (
      <div className='flex flex-col h-screen bg-slate-50 dark:bg-slate-950 p-6 text-slate-900 dark:text-white text-center items-center justify-center'>
        <p>Group not found</p>
        <button
          onClick={() => router.back()}
          className='mt-4 text-blue-500 hover:underline'
        >
          Go Back
        </button>
      </div>
    );

  // --- ACCESS DENIED VIEW (Join Screen) ---
  if (!isMember) {
    return (
      <div className='fixed inset-0 flex flex-col bg-slate-50 dark:bg-slate-950 z-50'>
        {/* Header */}
        <div className='bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-3 flex items-center gap-3 shrink-0'>
          <button
            onClick={() => router.back()}
            className='p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          >
            <ChevronLeft size={24} />
          </button>
          <div className='flex-1 text-center font-bold text-slate-900 dark:text-white'>
            Join Group
          </div>
          <div className='w-10' />
        </div>

        {/* Join Content */}
        <div className='flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6'>
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-2xl ${
              group.color || "bg-blue-600"
            }`}
          >
            {group.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>
              {group.name}
            </h2>
            <p className='text-slate-500 dark:text-slate-400'>
              {group.description}
            </p>
          </div>
          <div className='bg-white dark:bg-slate-900 rounded-xl p-4 w-full border border-slate-200 dark:border-slate-800 shadow-sm'>
            <div className='text-slate-400 dark:text-slate-500 text-sm mb-1'>
              Current Members
            </div>
            <div className='text-slate-900 dark:text-white font-bold text-xl'>
              {group.members.length}
            </div>
          </div>
          <button
            onClick={handleJoinGroup}
            disabled={joining}
            className='w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-500/20'
          >
            {joining ? (
              "Joining..."
            ) : (
              <>
                <UserPlus size={20} /> Join Group
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // --- CHAT VIEW ---
  // We use the ChatWindow component which handles its own layout (flex-1)
  return (
    <div className='fixed inset-0 flex flex-col bg-slate-50 dark:bg-slate-950'>
      {/* Header */}
      <div className='bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-3 flex items-center gap-3 shrink-0 z-10'>
        <button
          onClick={() => router.back()}
          className='p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors'
        >
          <ChevronLeft size={24} />
        </button>
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0 ${
            group.color || "bg-blue-600"
          }`}
        >
          {group.name.substring(0, 2).toUpperCase()}
        </div>
        <div className='flex-1 min-w-0'>
          <h2 className='text-slate-900 dark:text-white font-bold truncate'>
            {group.name}
          </h2>
          <p className='text-xs text-slate-500 dark:text-slate-400 truncate'>
            {group.members?.length || 1} members
          </p>
        </div>
        {/* Placeholder for settings if needed later */}
        <div className='w-10' />
      </div>

      {/* Chat Component */}
      <div className='flex-1 overflow-hidden relative'>
        <ChatWindow
          unionId={currentUnion?.id || ""}
          groupId={groupId}
          currentUserId={user?.uid || ""}
        />
      </div>
    </div>
  );
}
