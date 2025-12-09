"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  limit,
  orderBy,
} from "firebase/firestore";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  Users,
  Bell,
  MessageSquare,
  ChevronRight,
  Activity,
} from "lucide-react";

// --- Types ---
interface ActivityItem {
  id: string;
  type: "message" | "join";
  groupId: string;
  groupName: string;
  groupColor: string;
  content: string;
  timestamp: Date;
  senderName?: string;
}

// Simple date formatter if you don't want to install date-fns
const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activeGroupCount, setActiveGroupCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. Auth & User Profile
  useEffect(() => {
    // Safety timeout: stop loading after 8s if auth doesn't resolve
    const safetyTimer = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          console.warn("Auth listener timed out - force stopping loading");
          return false;
        }
        return prev;
      });
    }, 8000);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      clearTimeout(safetyTimer); // Clear timeout on success
      setUser(currentUser);
      if (currentUser) {
        // Fetch Profile Name
        try {
          const profileSnap = await getDoc(doc(db, "users", currentUser.uid));
          if (profileSnap.exists()) {
            setDisplayName(profileSnap.data().displayName || "Member");
          } else {
            setDisplayName("Member");
          }

          // Trigger data fetch
          fetchHomeData(currentUser.uid);
        } catch (error) {
          console.error("Error fetching profile", error);
        }
      } else {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  // 2. Data Fetching Logic
  const fetchHomeData = async (userId: string) => {
    try {
      // A. Get Groups I belong to
      const q = query(
        collection(db, "groups"),
        where("members", "array-contains", userId)
      );
      const groupSnaps = await getDocs(q);

      setActiveGroupCount(groupSnaps.size);

      // B. For each group, get the last message (This might be read-heavy in large apps, but fine for now)
      const activityPromises = groupSnaps.docs.map(async (groupDoc) => {
        const groupData = groupDoc.data();
        const groupId = groupDoc.id;

        // Query last message
        const msgQuery = query(
          collection(db, "groups", groupId, "messages"),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const msgSnaps = await getDocs(msgQuery);

        if (!msgSnaps.empty) {
          const msg = msgSnaps.docs[0].data();
          // Safety check for timestamp (it might be null if serverTimestamp hasn't processed)
          const timestamp = msg.createdAt?.toDate() || new Date();

          return {
            id: msgSnaps.docs[0].id,
            type: "message",
            groupId: groupId,
            groupName: groupData.name,
            groupColor: groupData.color || "bg-blue-600",
            content: msg.text,
            timestamp: timestamp,
          } as ActivityItem;
        }
        return null;
      });

      // C. Resolve all and sort
      const results = await Promise.all(activityPromises);
      const validActivities = results.filter(
        (item): item is ActivityItem => item !== null
      );

      // Sort: Newest first
      validActivities.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );

      setActivities(validActivities);
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center h-screen bg-slate-950 text-slate-500'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4'></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-950 pb-24 text-slate-200'>
      {/* Header */}
      <div className='p-6 pt-8'>
        <header className='flex justify-between items-center mb-8'>
          <div>
            <h1 className='text-2xl font-bold text-white'>
              {user ? `Hello, ${displayName}` : "Welcome"}
            </h1>
            <p className='text-slate-400 text-sm'>
              Here&apos;s what&apos;s happening
            </p>
          </div>
          <div className='w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 relative'>
            <Bell size={20} className='text-slate-400' />
            {/* Notification Dot (Mock) */}
            <div className='absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full'></div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className='grid grid-cols-2 gap-4 mb-8'>
          <div
            onClick={() => router.push("/groups")}
            className='bg-gradient-to-br from-blue-600 to-blue-800 p-4 rounded-2xl text-white shadow-lg shadow-blue-900/20 active:scale-95 transition-transform cursor-pointer'
          >
            <div className='flex justify-between items-start mb-2'>
              <Users size={24} className='opacity-80' />
              <ChevronRight size={16} className='opacity-50' />
            </div>
            <div className='text-3xl font-bold'>{activeGroupCount}</div>
            <div className='text-sm opacity-80 font-medium'>Active Groups</div>
          </div>

          <div className='bg-gradient-to-br from-purple-600 to-purple-800 p-4 rounded-2xl text-white shadow-lg shadow-purple-900/20'>
            <div className='flex justify-between items-start mb-2'>
              <Activity size={24} className='opacity-80' />
            </div>
            {/* We count activity items for now */}
            <div className='text-3xl font-bold'>{activities.length}</div>
            <div className='text-sm opacity-80 font-medium'>Recent Updates</div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className='bg-slate-900/50 rounded-3xl p-6 border border-slate-800 backdrop-blur-sm'>
          <h3 className='text-white font-bold mb-4 flex items-center gap-2'>
            <MessageSquare size={16} className='text-blue-500' />
            Recent Activity
          </h3>

          <div className='space-y-1'>
            {activities.length === 0 ? (
              <div className='text-center py-8 text-slate-500'>
                <p>No recent activity.</p>
                <button
                  onClick={() => router.push("/groups")}
                  className='text-blue-500 text-sm mt-2 hover:underline'
                >
                  Join a group to get started
                </button>
              </div>
            ) : (
              activities.map((item) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/groups/${item.groupId}`)}
                  className='flex gap-4 items-start p-3 hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer group'
                >
                  {/* Group Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-md ${item.groupColor}`}
                  >
                    {item.groupName.substring(0, 2).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex justify-between items-center mb-0.5'>
                      <span className='text-white text-sm font-bold truncate pr-2 group-hover:text-blue-400 transition-colors'>
                        {item.groupName}
                      </span>
                      <span className='text-slate-500 text-[10px] whitespace-nowrap'>
                        {formatTimeAgo(item.timestamp)}
                      </span>
                    </div>
                    <p className='text-slate-400 text-xs truncate leading-relaxed'>
                      <span className='text-slate-500 font-medium'>
                        Message:{" "}
                      </span>
                      {item.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* <BottomNav activeTab='home' /> */}
    </div>
  );
}
