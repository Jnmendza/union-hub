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
  Home,
  Lock,
  User,
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

// --- Components ---
const BottomNav = ({ activeTab }: { activeTab: string }) => {
  const router = useRouter();
  const navItems = [
    { id: "home", icon: Home, label: "Home", path: "/" },
    { id: "groups", icon: User, label: "Groups", path: "/groups" },
    { id: "vault", icon: Lock, label: "The Vault", path: "/vault" },
    { id: "profile", icon: User, label: "My ID", path: "/profile" },
  ];

  return (
    <div className='fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 pb-safe pt-2 px-6 flex justify-between items-center z-50 h-20'>
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => router.push(item.path)}
          className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
            activeTab === item.id
              ? "text-blue-500"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <item.icon size={24} strokeWidth={activeTab === item.id ? 2.5 : 2} />
          <span className='text-xs font-medium'>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = typeof params?.id === "string" ? params.id : "";
  const bottomRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Group Details
  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId) return;
      try {
        const docRef = doc(db, "groups", groupId);
        // Real-time listener for group details (so we know immediately when we join)
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

  // 3. Real-time Messages Listener (Only runs if user is a member)
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
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, [groupId, isMember]);

  // 4. Action Handlers
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
      const groupRef = doc(db, "groups", groupId);
      await updateDoc(groupRef, {
        members: arrayUnion(user.uid),
      });
      // The onSnapshot in effect #2 will automatically update the UI
    } catch (error) {
      console.error("Error joining group", error);
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center h-screen bg-slate-950 text-slate-500'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4'></div>
        <p>Loading group...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className='flex flex-col h-screen bg-slate-950 p-6'>
        <button
          onClick={() => router.back()}
          className='self-start flex items-center gap-2 text-slate-400 mb-8 hover:text-white'
        >
          <ChevronLeft size={20} /> Back
        </button>
        <div className='flex-1 flex flex-col items-center justify-center text-center'>
          <h2 className='text-xl font-bold text-white mb-2'>Group not found</h2>
        </div>
      </div>
    );
  }

  // --- ACCESS DENIED VIEW ---
  if (!isMember) {
    return (
      <div className='fixed inset-0 flex flex-col bg-slate-950 pb-20'>
        {/* Header */}
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
          <div className='w-10' /> {/* Spacer for balance */}
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
          <div className='bg-slate-900 rounded-xl p-4 w-full border border-slate-800'>
            <div className='text-slate-500 text-sm mb-1'>Current Members</div>
            <div className='text-white font-bold text-xl'>
              {group.members.length}
            </div>
          </div>
          <button
            onClick={handleJoinGroup}
            disabled={joining}
            className='w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50'
          >
            {joining ? (
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
            ) : (
              <>
                <UserPlus size={20} />
                Join Group
              </>
            )}
          </button>
        </div>
        <BottomNav activeTab='groups' />
      </div>
    );
  }

  // --- CHAT VIEW (Only rendered if isMember is true) ---
  return (
    <div className='fixed inset-0 flex flex-col bg-slate-950 pb-20'>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Header */}
      <div className='bg-slate-950 border-b border-slate-800 p-3 flex items-center gap-3 shrink-0'>
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

      {/* Chat Area */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4 overscroll-none no-scrollbar'>
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
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
            >
              {!isMe && (
                <div className='w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center text-xs text-white font-bold'>
                  ?
                </div>
              )}
              <div
                className={`p-3 rounded-2xl text-sm max-w-[80%] break-words ${
                  isMe
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-slate-800 text-slate-200 rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSendMessage}
        className='p-4 bg-slate-900 border-t border-slate-800 shrink-0'
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

      <BottomNav activeTab='groups' />
    </div>
  );
}
