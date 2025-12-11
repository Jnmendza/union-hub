"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  getCountFromServer,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

import {
  Users,
  MessageSquare,
  FileText,
  Activity,
  Copy,
  Check,
} from "lucide-react";
import { useUnion } from "@/app/(components)/union-provider";

export default function AdminDashboardPage() {
  const { currentUnion } = useUnion();
  const [stats, setStats] = useState({
    users: 0,
    groups: 0,
    resources: 0,
  });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUnion) return;

      try {
        setLoading(true);
        // Scoped to current union
        const unionId = currentUnion.id;

        // Note: For accurate counts in subcollections, you'd query them specifically.
        // For MVP, we can just display placeholder counts or query the collections if they exist.
        // Since we refactored structure, counting might need specific index or just count client side for small data.

        // For now, let's just grab the member count directly from the Union document
        const unionDoc = await getDoc(doc(db, "unions", unionId));
        const memberCount = unionDoc.exists()
          ? unionDoc.data().memberIds.length
          : 0;

        // Fetch counts for subcollections
        const groupColl = collection(db, "unions", unionId, "groups");
        const resColl = collection(db, "resources"); // Resources are still global/root in our last step

        const [groupSnap, resSnap] = await Promise.all([
          getCountFromServer(groupColl),
          getCountFromServer(resColl),
        ]);

        setStats({
          users: memberCount,
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
  }, [currentUnion]);

  const handleCopyCode = () => {
    if (!currentUnion) return;
    navigator.clipboard.writeText(currentUnion.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className='p-8 text-slate-500'>Loading dashboard...</div>;
  }

  return (
    <div className='p-6 w-full'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>
          Dashboard Overview
        </h1>

        {/* INVITE CODE WIDGET */}
        <div className='flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 px-4 py-2 rounded-lg'>
          <div className='text-xs'>
            <span className='block font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider'>
              Invite Code
            </span>
            <span className='font-mono text-blue-600 dark:text-blue-400'>
              {currentUnion?.id}
            </span>
          </div>
          <button
            onClick={handleCopyCode}
            className='p-2 bg-white dark:bg-slate-900 rounded-md shadow-sm hover:scale-105 transition-transform'
            title='Copy Code'
          >
            {copied ? (
              <Check size={16} className='text-green-500' />
            ) : (
              <Copy size={16} className='text-slate-500' />
            )}
          </button>
        </div>
      </div>

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
            Workspace: <strong>{currentUnion?.name}</strong> is active.
          </p>
        </div>
      </div>
    </div>
  );
}
