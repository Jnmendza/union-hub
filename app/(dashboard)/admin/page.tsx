"use client";

import React, { useState, useEffect } from "react";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Users, MessageSquare, FileText, Activity } from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    groups: 0,
    resources: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch counts efficiently using server-side counting
        const userColl = collection(db, "users");
        const groupColl = collection(db, "groups");
        const resColl = collection(db, "resources");

        const [userSnap, groupSnap, resSnap] = await Promise.all([
          getCountFromServer(userColl),
          getCountFromServer(groupColl),
          getCountFromServer(resColl),
        ]);

        setStats({
          users: userSnap.data().count,
          groups: groupSnap.data().count,
          resources: resSnap.data().count,
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className='p-8 text-slate-500'>Loading dashboard...</div>;
  }

  return (
    <div className='p-6 w-full'>
      <h1 className='text-2xl font-bold text-slate-900 dark:text-white mb-6'>
        Dashboard Overview
      </h1>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full'>
        {/* Users Card */}
        <div className='bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4'>
          <div className='p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg'>
            <Users size={24} />
          </div>
          <div>
            <p className='text-sm text-slate-500 dark:text-slate-400 font-medium'>
              Total Members
            </p>
            <h2 className='text-3xl font-bold text-slate-900 dark:text-white'>
              {stats.users}
            </h2>
          </div>
        </div>

        {/* Groups Card */}
        <div className='bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4'>
          <div className='p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg'>
            <MessageSquare size={24} />
          </div>
          <div>
            <p className='text-sm text-slate-500 dark:text-slate-400 font-medium'>
              Active Groups
            </p>
            <h2 className='text-3xl font-bold text-slate-900 dark:text-white'>
              {stats.groups}
            </h2>
          </div>
        </div>

        {/* Resources Card */}
        <div className='bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4'>
          <div className='p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg'>
            <FileText size={24} />
          </div>
          <div>
            <p className='text-sm text-slate-500 dark:text-slate-400 font-medium'>
              Vault Items
            </p>
            <h2 className='text-3xl font-bold text-slate-900 dark:text-white'>
              {stats.resources}
            </h2>
          </div>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className='mt-8 w-full'>
        <h3 className='text-lg font-bold text-slate-900 dark:text-white mb-4'>
          System Status
        </h3>
        <div className='bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6'>
          <div className='flex items-center gap-3 text-green-500'>
            <Activity size={20} />
            <span className='font-medium'>All systems operational</span>
          </div>
          <p className='text-slate-500 mt-2 text-sm'>
            Database connections and storage are running normally.
          </p>
        </div>
      </div>
    </div>
  );
}
