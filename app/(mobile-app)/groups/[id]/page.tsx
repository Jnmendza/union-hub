"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Settings,
  MessageSquare,
  Send,
  UserPlus,
} from "lucide-react";

// --- Types ---
interface Group {
  id: string;
  name: string;
  description: string;
  color: string;
  members: string[];
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: Timestamp;
}

interface UserProfile {
  displayName: string;
  status?: string;
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = typeof params?.id === "string" ? params.id : "";
  const bottomRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [senderProfiles, setSenderProfiles] = useState<
    Record<string, UserProfile>
  >({});
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  // 1. Auth
  useEffect(() => {
    // Safety timeout if auth takes too long
    const timeout = setTimeout(() => {
      setLoading((prev) => (prev ? false : prev));
    }, 8000);

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      clearTimeout(timeout);
    });
    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // 2. Fetch Group
  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId) return;
      try {
        const docRef = doc(db, "groups", groupId);
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
  }, [groupId]);

  // 3. Messages
  const isMember = group?.members?.includes(user?.uid || "");

  useEffect(() => {
    if (!groupId || !isMember) return;
    const q = query(
      collection(db, "groups", groupId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(msgs);
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        100
      );
    });
    return () => unsubscribe();
  }, [groupId, isMember]);

  // 4. Profiles
  useEffect(() => {
    const fetchMissingProfiles = async () => {
      const missingIds = messages
        .map((m) => m.senderId)
        .filter((id) => !senderProfiles[id] && id !== user?.uid);
      const uniqueMissingIds = [...new Set(missingIds)];
      if (uniqueMissingIds.length === 0) return;

      const newProfiles: Record<string, UserProfile> = {};
      await Promise.all(
        uniqueMissingIds.map(async (id) => {
          try {
            const userDoc = await getDoc(doc(db, "users", id));
            if (userDoc.exists())
              newProfiles[id] = userDoc.data() as UserProfile;
            else newProfiles[id] = { displayName: "Unknown" };
          } catch {
            console.error("Failed to fetch profile", id);
          }
        })
      );
      setSenderProfiles((prev) => ({ ...prev, ...newProfiles }));
    };
    if (messages.length > 0) fetchMissingProfiles();
  }, [messages, senderProfiles, user?.uid]);

  // Handlers
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !user || !groupId) return;
    try {
      await addDoc(collection(db, "groups", groupId, "messages"), {
        text: newMessage,
        senderId: user.uid,
        createdAt: serverTimestamp(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleJoinGroup = async () => {
    if (!user || !groupId) return;
    setJoining(true);
    try {
      await updateDoc(doc(db, "groups", groupId), {
        members: arrayUnion(user.uid),
      });
    } catch (error) {
      console.error("Error joining group", error);
    } finally {
      setJoining(false);
    }
  };

  if (loading)
    return (
      <div className='flex flex-col items-center justify-center h-screen bg-slate-950 text-slate-500'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4'></div>
        <p>Loading...</p>
      </div>
    );
  if (!group)
    return (
      <div className='flex flex-col h-screen bg-slate-950 p-6 text-white text-center'>
        <p>Group not found</p>
      </div>
    );

  // --- ACCESS DENIED VIEW ---
  if (!isMember) {
    return (
      // Changed to absolute inset-0 to stay inside the MobileLayout's 'main' area
      <div className='absolute inset-0 flex flex-col bg-slate-950'>
        <div className='bg-slate-950 border-b border-slate-800 p-3 flex items-center gap-3 shrink-0'>
          <button
            onClick={() => router.back()}
            className='p-2 -ml-2 text-slate-400 hover:text-white'
          >
            <ChevronLeft size={24} />
          </button>
          <div className='flex-1 text-center font-bold text-white'>
            Join Group
          </div>
          <div className='w-10' />
        </div>
        <div className='flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6'>
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-2xl ${
              group.color || "bg-blue-600"
            }`}
          >
            {group.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className='text-2xl font-bold text-white mb-2'>{group.name}</h2>
            <p className='text-slate-400'>{group.description}</p>
          </div>
          <button
            onClick={handleJoinGroup}
            disabled={joining}
            className='w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all'
          >
            {joining ? (
              "Joining..."
            ) : (
              <>
                {" "}
                <UserPlus size={20} /> Join Group{" "}
              </>
            )}
          </button>
        </div>
        {/* Removed BottomNav */}
      </div>
    );
  }

  // --- CHAT VIEW (FIXED LAYOUT) ---
  return (
    // Changed to absolute inset-0 to respect the layout boundaries
    <div className='absolute inset-0 flex flex-col bg-slate-950'>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* 1. Header (Static Top) */}
      <div className='bg-slate-950 border-b border-slate-800 p-3 flex items-center gap-3 shrink-0 z-10'>
        <button
          onClick={() => router.back()}
          className='p-2 -ml-2 text-slate-400 hover:text-white'
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
          <h2 className='text-white font-bold truncate'>{group.name}</h2>
          <p className='text-xs text-slate-400 truncate'>
            {group.members?.length || 1} members
          </p>
        </div>
        <button className='p-2 text-slate-400 hover:text-white'>
          <Settings size={20} />
        </button>
      </div>

      {/* 2. Chat Area (Flex Grow - Takes all middle space) */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4 overscroll-none no-scrollbar bg-slate-950'>
        <div className='flex flex-col items-center py-8 text-center'>
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4 ${
              group.color || "bg-blue-600"
            }`}
          >
            {group.name.substring(0, 2).toUpperCase()}
          </div>
          <h3 className='text-white font-bold text-lg'>
            Welcome to {group.name}
          </h3>
          <p className='text-slate-400 text-sm mt-1 max-w-xs'>
            {group.description}
          </p>
        </div>

        {messages.map((msg) => {
          const isMe = user?.uid === msg.senderId;
          const displayName =
            senderProfiles[msg.senderId]?.displayName || "User";
          const initials = displayName.substring(0, 2).toUpperCase();

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
            >
              {!isMe ? (
                <div className='flex flex-col items-center gap-1'>
                  <div
                    className='w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center text-xs text-white font-bold'
                    title={displayName}
                  >
                    {initials}
                  </div>
                </div>
              ) : (
                <div className='w-8' />
              )}

              <div className='flex flex-col max-w-[80%]'>
                {!isMe && (
                  <span className='text-[10px] text-slate-500 ml-1 mb-0.5'>
                    {displayName}
                  </span>
                )}
                <div
                  className={`p-3 rounded-2xl text-sm break-words ${
                    isMe
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-slate-800 text-slate-200 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* 3. Input Area (Static Bottom of content) */}
      <form
        onSubmit={handleSendMessage}
        className='p-4 bg-slate-900 border-t border-slate-800 shrink-0 z-10'
      >
        <div className='flex gap-2'>
          <input
            type='text'
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder='Message...'
            className='flex-1 bg-slate-800 text-white px-4 py-3 rounded-full border border-slate-700 focus:border-blue-500 focus:outline-none'
          />
          <button
            type='submit'
            disabled={!newMessage.trim()}
            className='p-3 text-white bg-blue-600 rounded-full hover:bg-blue-500 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {newMessage.trim() ? (
              <Send size={20} />
            ) : (
              <MessageSquare size={20} />
            )}
          </button>
        </div>
      </form>

      {/* Removed BottomNav */}
    </div>
  );
}
