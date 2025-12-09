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
  Timestamp,
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
  Megaphone,
  AlertCircle,
  Calendar,
  Info,
  Check,
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
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: "URGENT" | "EVENT" | "GENERAL";
  createdAt: Timestamp;
}

// --- Components ---

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const AnnouncementCard = ({ item }: { item: Announcement }) => {
  const styles = {
    URGENT: "bg-red-500/10 border-red-500/20 text-red-200",
    EVENT: "bg-purple-500/10 border-purple-500/20 text-purple-200",
    GENERAL: "bg-blue-500/10 border-blue-500/20 text-blue-200",
  };

  const icon = {
    URGENT: <AlertCircle size={18} className='text-red-400' />,
    EVENT: <Calendar size={18} className='text-purple-400' />,
    GENERAL: <Info size={18} className='text-blue-400' />,
  };

  return (
    <div
      className={`p-4 rounded-2xl border mb-3 ${
        styles[item.category] || styles["GENERAL"]
      }`}
    >
      <div className='flex items-start gap-3'>
        <div className='mt-0.5'>{icon[item.category] || icon["GENERAL"]}</div>
        <div className='flex-1 min-w-0'>
          <h4 className='font-bold text-sm mb-1 text-white'>{item.title}</h4>
          <p className='text-xs opacity-90 leading-relaxed whitespace-pre-wrap'>
            {item.content}
          </p>
          <p className='text-[10px] mt-2 opacity-60'>
            {item.createdAt?.toDate
              ? formatTimeAgo(item.createdAt.toDate())
              : ""}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [displayName, setDisplayName] = useState("");

  // Data State
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activeGroupCount, setActiveGroupCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Notification State
  const [unreadCount, setUnreadCount] = useState(0);
  const [justCleared, setJustCleared] = useState(false);

  // 1. Auth & User Profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const profileSnap = await getDoc(doc(db, "users", currentUser.uid));
          if (profileSnap.exists()) {
            setDisplayName(profileSnap.data().displayName || "Member");
          } else {
            setDisplayName("Member");
          }
          fetchHomeData(currentUser.uid);
        } catch (error) {
          console.error("Error fetching profile", error);
        }
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Data
  const fetchHomeData = async (userId: string) => {
    try {
      // A. Fetch Announcements
      const annQuery = query(
        collection(db, "announcements"),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      const annSnaps = await getDocs(annQuery);
      const annList = annSnaps.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Announcement[];
      setAnnouncements(annList);

      // B. Fetch Groups
      const groupQuery = query(
        collection(db, "groups"),
        where("members", "array-contains", userId)
      );
      const groupSnaps = await getDocs(groupQuery);
      setActiveGroupCount(groupSnaps.size);

      // C. Fetch Recent Messages
      const activityPromises = groupSnaps.docs.map(async (groupDoc) => {
        const groupData = groupDoc.data();
        const groupId = groupDoc.id;

        const msgQuery = query(
          collection(db, "groups", groupId, "messages"),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const msgSnaps = await getDocs(msgQuery);

        if (!msgSnaps.empty) {
          const msg = msgSnaps.docs[0].data();
          const timestamp = msg.createdAt?.toDate
            ? msg.createdAt.toDate()
            : new Date();

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

      const results = await Promise.all(activityPromises);
      const validActivities = results.filter(
        (item): item is ActivityItem => item !== null
      );
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

  // 3. Calculate Unread Count
  useEffect(() => {
    if (loading) return;

    // Get the last time the user clicked the bell
    const lastViewedStr = localStorage.getItem("notifications_last_viewed");
    const lastViewed = lastViewedStr ? new Date(lastViewedStr) : new Date(0); // Default to epoch if first time

    let count = 0;

    // Count new announcements
    announcements.forEach((ann) => {
      const annDate = ann.createdAt?.toDate
        ? ann.createdAt.toDate()
        : new Date(0);
      if (annDate > lastViewed) count++;
    });

    // Count new messages/activities
    activities.forEach((act) => {
      if (act.timestamp > lastViewed) count++;
    });

    setUnreadCount(count);
  }, [activities, announcements, loading]);

  // 4. Handle "Mark as Read" (Click Bell)
  const handleClearNotifications = () => {
    if (unreadCount === 0) return;

    const now = new Date();
    localStorage.setItem("notifications_last_viewed", now.toISOString());
    setUnreadCount(0);
    setJustCleared(true);

    // Remove the "Check" icon animation after 2 seconds
    setTimeout(() => setJustCleared(false), 2000);
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
            <p className='text-slate-400 text-sm'>Here's what's happening</p>
          </div>

          {/* UPDATED: Bell Button clears notifications */}
          <button
            onClick={handleClearNotifications}
            className='w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 relative hover:bg-slate-800 transition-colors active:scale-95'
          >
            {justCleared ? (
              <Check size={20} className='text-green-500 animate-in zoom-in' />
            ) : (
              <Bell
                size={20}
                className={unreadCount > 0 ? "text-white" : "text-slate-400"}
              />
            )}

            {/* Red Badge Counter */}
            {unreadCount > 0 && !justCleared && (
              <div className='absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-950 animate-in zoom-in'>
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            )}
          </button>
        </header>

        {/* Announcements Section */}
        {announcements.length > 0 && (
          <div className='mb-8'>
            <h3 className='text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 ml-1 flex items-center gap-2'>
              <Megaphone size={12} /> Union Updates
            </h3>
            {announcements.map((ann) => (
              <AnnouncementCard key={ann.id} item={ann} />
            ))}
          </div>
        )}

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
            {/* Show unread count here too if you like, or just total activity */}
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
    </div>
  );
}
